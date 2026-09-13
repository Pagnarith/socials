/**
 * Live social metrics fetchers for the Social Ops dashboard.
 * Uses the same env vars as the Telegram media commands / scripts.
 */

import { gunzipSync } from 'node:zlib';

const GRAPH = 'https://graph.facebook.com/v19.0';
const TIMEOUT_MS = 10_000;
const ASC_SALES_TIMEOUT_MS = 30_000;

/** iOS/Mac first-time (re)download product types — exclude updates / IAP. */
const ASC_APP_DOWNLOAD_TYPES = new Set(['1', '1F', '1T', 'F1']);

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data?.error?.message ||
      data?.error?.error_user_msg ||
      data?.error_description ||
      res.statusText;
    throw new Error(message || `HTTP ${res.status}`);
  }
  return data;
}

function youtubeOAuthClient() {
  const clientId = (process.env.YT_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.YT_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET || '').trim();
  return { clientId, clientSecret };
}

async function refreshYouTubeAccessToken(refreshToken) {
  const { clientId, clientSecret } = youtubeOAuthClient();
  if (!clientId || !clientSecret) {
    throw new Error('Missing YT_CLIENT_ID/YT_CLIENT_SECRET (or YOUTUBE_CLIENT_*)');
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  const data = await fetchJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!data.access_token) {
    throw new Error(data.error_description || data.error || 'YouTube token refresh failed');
  }
  return data.access_token;
}

async function youtubeWatchHours(channelId, accessToken) {
  const params = new URLSearchParams({
    ids: `channel==${channelId}`,
    metrics: 'estimatedMinutesWatched',
    startDate: '2006-01-01',
    endDate: todayUtc(),
  });
  const data = await fetchJson(
    `https://youtubeanalytics.googleapis.com/v2/reports?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const minutes = num(data.rows?.[0]?.[0]);
  return Math.round(minutes / 60);
}

async function youtubeMetrics() {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!key || !channelId) {
    return { ok: false, error: 'Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID' };
  }

  const url =
    `https://www.googleapis.com/youtube/v3/channels` +
    `?part=statistics,snippet&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(key)}`;
  const data = await fetchJson(url);
  const ch = data.items?.[0];
  if (!ch) return { ok: false, error: 'YouTube channel not found' };

  const st = ch.statistics || {};
  const result = {
    ok: true,
    title: ch.snippet?.title || null,
    subscribers: num(st.subscriberCount),
    views: num(st.viewCount),
    videos: num(st.videoCount),
    watchHours: null,
  };

  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN?.trim();
  if (!refreshToken) return result;

  try {
    const accessToken = await refreshYouTubeAccessToken(refreshToken);
    result.watchHours = await youtubeWatchHours(channelId, accessToken);
    result.watchHoursSource = 'youtube_analytics';
  } catch (error) {
    result.watchHoursError = error.message || 'YouTube Analytics failed';
  }

  return result;
}

async function resolveFacebookPageToken(pageId, token) {
  // Insights require a Page-scoped token. User/System User tokens can often
  // mint one via GET /{page-id}?fields=access_token.
  try {
    const data = await fetchJson(
      `${GRAPH}/${pageId}?fields=access_token&access_token=${encodeURIComponent(token)}`
    );
    if (data.access_token) return { token: data.access_token, source: 'page_scoped' };
  } catch {
    // Fall through — caller may already have a page token.
  }
  return { token, source: 'env' };
}

async function facebookMetrics() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const envToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !envToken) {
    return { ok: false, error: 'Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN' };
  }

  const fields = 'name,fan_count,followers_count,link';
  const data = await fetchJson(
    `${GRAPH}/${pageId}?fields=${fields}&access_token=${encodeURIComponent(envToken)}`
  );

  const resolved = await resolveFacebookPageToken(pageId, envToken);
  const token = resolved.token;

  let reach = null;
  let minutesViewed = null;
  let insightsError = null;

  async function sumInsightMetric(metric) {
    const since = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
    const insights = await fetchJson(
      `${GRAPH}/${pageId}/insights` +
        `?metric=${encodeURIComponent(metric)}` +
        `&period=day&since=${since}&access_token=${encodeURIComponent(token)}`
    );
    const row = (insights.data || []).find((r) => r.name === metric) || insights.data?.[0];
    return (row?.values || []).reduce((sum, v) => sum + num(v.value), 0);
  }

  // Prefer post-deprecation reach metric; fall back for older tokens/docs.
  const reachCandidates = ['page_total_media_view_unique', 'page_media_view', 'page_impressions_unique'];
  const reachErrors = [];
  for (const metric of reachCandidates) {
    try {
      reach = await sumInsightMetric(metric);
      break;
    } catch (error) {
      reachErrors.push(`${metric}: ${error.message || error}`);
    }
  }

  try {
    // page_video_view_time is milliseconds
    const ms = await sumInsightMetric('page_video_view_time');
    minutesViewed = Math.round(ms / 60000);
  } catch (error) {
    reachErrors.push(`page_video_view_time: ${error.message || error}`);
  }

  if (reach == null && minutesViewed == null && reachErrors.length) {
    insightsError = reachErrors[0];
  } else if (reach == null && reachErrors.length) {
    insightsError = reachErrors[0];
  }

  if (insightsError && /Page Access Token/i.test(insightsError)) {
    insightsError =
      `${insightsError} — store a Page token (Business Manager → System User → Generate Page Token), ` +
      `or run: node scripts/set-facebook-page-token.js`;
  }

  return {
    ok: true,
    name: data.name || null,
    followers: num(data.followers_count ?? data.fan_count),
    fans: num(data.fan_count),
    reach,
    minutesViewed,
    insightsError,
    tokenSource: resolved.source,
  };
}

async function resolveInstagramBusinessId(token, pageId) {
  const configured = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim();
  if (configured) return configured;
  if (!pageId || !token) return null;
  const data = await fetchJson(
    `${GRAPH}/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(token)}`
  );
  return data.instagram_business_account?.id || null;
}

async function instagramMetrics() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!token) {
    return { ok: false, error: 'Missing Instagram/Facebook access token' };
  }

  let igId;
  try {
    igId = await resolveInstagramBusinessId(token, pageId);
  } catch (error) {
    return { ok: false, error: error.message || 'Failed to resolve Instagram business account' };
  }

  if (!igId) {
    return { ok: false, error: 'Missing INSTAGRAM_BUSINESS_ACCOUNT_ID (and none linked on Page)' };
  }

  const data = await fetchJson(
    `${GRAPH}/${igId}?fields=username,name,followers_count,media_count&access_token=${encodeURIComponent(token)}`
  );

  let reach = null;
  let insightsError = null;
  try {
    const insights = await fetchJson(
      `${GRAPH}/${igId}/insights` +
        `?metric=reach&period=day&metric_type=total_value` +
        `&access_token=${encodeURIComponent(token)}`
    );
    reach = num(insights.data?.[0]?.total_value?.value ?? insights.data?.[0]?.values?.[0]?.value);
    if (!insights.data?.length) {
      insightsError = 'Instagram insights returned empty (check instagram_manage_insights / App Review)';
      reach = null;
    }
  } catch (error) {
    insightsError = error.message || 'Instagram insights failed (need App Review scopes)';
  }

  return {
    ok: true,
    username: data.username || null,
    followers: num(data.followers_count),
    posts: num(data.media_count),
    reach: reach,
    engagement: null,
    insightsError,
  };
}

async function telegramMetrics() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID?.trim();
  if (!botToken || !channelId) {
    return { ok: false, error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID' };
  }

  const [chatRes, countRes] = await Promise.all([
    fetchJson(`https://api.telegram.org/bot${botToken}/getChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: channelId }),
    }),
    fetchJson(`https://api.telegram.org/bot${botToken}/getChatMemberCount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: channelId }),
    }),
  ]);

  if (!chatRes.ok) {
    return { ok: false, error: chatRes.description || 'getChat failed' };
  }

  return {
    ok: true,
    title: chatRes.result?.title || chatRes.result?.username || null,
    subscribers: countRes.ok ? num(countRes.result) : 0,
    messages: null,
  };
}

async function tiktokClientToken() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
  if (!clientKey || !clientSecret) {
    throw new Error('Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET');
  }

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });
  const data = await fetchJson('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
    body,
  });
  const token = data.access_token;
  if (!token) {
    throw new Error(data.error_description || data.error || 'TikTok client token failed');
  }
  return token;
}

async function tiktokMetrics() {
  const username = (process.env.TIKTOK_USERNAME || 'homeworkpalette').replace(/^@/, '');
  let userAccessToken = process.env.TIKTOK_ACCESS_TOKEN?.trim();
  const refreshToken = process.env.TIKTOK_REFRESH_TOKEN?.trim();

  async function fetchUserInfo(accessToken) {
    const url =
      'https://open.tiktokapis.com/v2/user/info/' +
      '?fields=display_name,username,follower_count,likes_count,video_count';
    const data = await fetchJson(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = data.data?.user || data.data || {};
    return {
      ok: true,
      username: user.username || username,
      followers: num(user.follower_count),
      views: num(user.likes_count),
      videos: num(user.video_count),
      source: 'user_token',
    };
  }

  // Preferred: user OAuth token with user.info.stats (Login Kit)
  if (userAccessToken) {
    try {
      return await fetchUserInfo(userAccessToken);
    } catch (error) {
      if (refreshToken) {
        try {
          const { refreshUserAccessToken } = await import('./tiktok-oauth.js');
          const refreshed = await refreshUserAccessToken(refreshToken);
          if (refreshed.access_token) {
            // Runtime cannot persist to Vercel env; still use refreshed token for this request.
            return {
              ...(await fetchUserInfo(refreshed.access_token)),
              note: 'Access token refreshed for this request — update TIKTOK_ACCESS_TOKEN / TIKTOK_REFRESH_TOKEN on Vercel via /api/cron/tiktok-refresh',
            };
          }
        } catch {
          // fall through
        }
      }
      if (!process.env.TIKTOK_CLIENT_KEY) {
        return { ok: false, error: error.message || 'TikTok user token failed' };
      }
    }
  }

  if (!process.env.TIKTOK_CLIENT_KEY) {
    return { ok: false, error: 'Missing TIKTOK_CLIENT_KEY' };
  }

  try {
    const clientToken = await tiktokClientToken();

    // Research API (requires research.data.basic on the TikTok app).
    const research = await fetch('https://open.tiktokapis.com/v2/research/user/info/?fields=display_name,follower_count,likes_count,video_count', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${clientToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const researchData = await research.json().catch(() => ({}));
    if (research.ok && !researchData.error?.code) {
      const user = researchData.data || {};
      return {
        ok: true,
        username,
        followers: num(user.follower_count),
        views: num(user.likes_count),
        videos: num(user.video_count),
        source: 'research_api',
      };
    }

    const researchErr =
      researchData.error?.message ||
      researchData.error?.code ||
      `Research API HTTP ${research.status}`;

    // Client credentials validated — follower counts still need Research scope or user OAuth.
    return {
      ok: true,
      username,
      followers: null,
      views: null,
      videos: null,
      source: 'client_credentials',
      note: `Client key OK; stats need Research API or TIKTOK_ACCESS_TOKEN (${researchErr})`,
    };
  } catch (error) {
    return { ok: false, error: error.message || 'TikTok metrics failed' };
  }
}

async function loadAscPrivateKeyPem() {
  const inline = process.env.ASC_PRIVATE_KEY?.replace(/\\n/g, '\n')?.trim();
  if (inline) return inline;

  const keyPath = process.env.ASC_PRIVATE_KEY_PATH?.trim();
  if (!keyPath) return null;

  const { readFile } = await import('node:fs/promises');
  return readFile(keyPath, 'utf8');
}

async function makeAscToken() {
  const issuer = process.env.ASC_ISSUER_ID?.trim();
  const keyId = process.env.ASC_KEY_ID?.trim() || '4QC42LKSR9';
  const pem = await loadAscPrivateKeyPem();
  if (!issuer) throw new Error('Missing ASC_ISSUER_ID');
  if (!pem) throw new Error('Missing ASC_PRIVATE_KEY or ASC_PRIVATE_KEY_PATH');

  const { SignJWT, importPKCS8 } = await import('jose');
  const key = await importPKCS8(pem, 'ES256');
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId, typ: 'JWT' })
    .setIssuer(issuer)
    .setIssuedAt(now)
    .setExpirationTime(now + 20 * 60)
    .setAudience('appstoreconnect-v1')
    .sign(key);
}

async function ascGet(path, token) {
  const res = await fetch(`https://api.appstoreconnect.apple.com/v1/${path.replace(/^\//, '')}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.errors?.[0]?.detail || data?.errors?.[0]?.title || res.statusText;
    throw new Error(message || `ASC HTTP ${res.status}`);
  }
  return data;
}

function parseAscSalesTsv(tsvText, { skuFilter } = {}) {
  const lines = tsvText.trim().split(/\r?\n/);
  if (lines.length < 2) return 0;

  const headers = lines[0].split('\t');
  const idx = (name) => headers.indexOf(name);
  const unitsIdx = idx('Units');
  const typeIdx = idx('Product Type Identifier');
  const skuIdx = idx('SKU');
  if (unitsIdx < 0 || typeIdx < 0) return 0;

  const skuWant = (skuFilter || '').trim().toLowerCase();

  let total = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const productType = (cols[typeIdx] || '').trim();
    if (!ASC_APP_DOWNLOAD_TYPES.has(productType)) continue;

    if (skuWant) {
      const sku = ((skuIdx >= 0 ? cols[skuIdx] : '') || '').toLowerCase();
      if (sku !== skuWant && !sku.includes(skuWant)) continue;
    }

    total += num(cols[unitsIdx]);
  }
  return total;
}

async function fetchAscSalesReport(token, vendorNumber, { frequency, reportDate }, opts) {
  const params = new URLSearchParams({
    'filter[frequency]': frequency,
    'filter[reportDate]': String(reportDate),
    'filter[reportSubType]': 'SUMMARY',
    'filter[reportType]': 'SALES',
    'filter[vendorNumber]': String(vendorNumber),
  });

  const res = await fetch(`https://api.appstoreconnect.apple.com/v1/salesReports?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/a-gzip',
    },
    signal: AbortSignal.timeout(ASC_SALES_TIMEOUT_MS),
  });

  if (res.status === 404) {
    // No report for that period yet.
    return 0;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data?.errors?.[0]?.detail || data?.errors?.[0]?.title || res.statusText;
    throw new Error(message || `ASC Sales HTTP ${res.status}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  let text;
  try {
    text = gunzipSync(buf).toString('utf8');
  } catch {
    text = buf.toString('utf8');
  }
  return parseAscSalesTsv(text, opts);
}

async function ascDownloadTotals(token, bundleId) {
  const vendorNumber = process.env.ASC_VENDOR_NUMBER?.trim();
  if (!vendorNumber) {
    return {
      downloads: null,
      downloadsNote: 'Set ASC_VENDOR_NUMBER for Sales Reports download totals',
      downloadsSource: null,
    };
  }

  const skuFilter = process.env.ASC_SKU?.trim() || '';
  const opts = { skuFilter, bundleId };
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1; // 1-12
  let downloads = 0;
  const errors = [];

  // Prior full years (YEARLY).
  for (const y of [year - 1, year - 2]) {
    try {
      downloads += await fetchAscSalesReport(
        token,
        vendorNumber,
        { frequency: 'YEARLY', reportDate: String(y) },
        opts
      );
    } catch (error) {
      errors.push(`YEARLY ${y}: ${error.message || error}`);
    }
  }

  // Current year: prefer YEARLY; if empty/404, sum MONTHLY Jan…current month
  // (mid-year apps often have no YEARLY file yet).
  let currentYear = 0;
  try {
    currentYear = await fetchAscSalesReport(
      token,
      vendorNumber,
      { frequency: 'YEARLY', reportDate: String(year) },
      opts
    );
  } catch (error) {
    errors.push(`YEARLY ${year}: ${error.message || error}`);
  }

  if (currentYear === 0) {
    for (let m = 1; m <= month; m++) {
      const reportDate = `${year}-${String(m).padStart(2, '0')}`;
      try {
        currentYear += await fetchAscSalesReport(
          token,
          vendorNumber,
          { frequency: 'MONTHLY', reportDate },
          opts
        );
      } catch (error) {
        errors.push(`MONTHLY ${reportDate}: ${error.message || error}`);
      }
    }
  }

  downloads += currentYear;

  // Only fail hard if every request errored (not mere empty/404 → 0).
  if (downloads === 0 && errors.length > 0 && errors.length >= 2 + month) {
    return {
      downloads: null,
      downloadsNote: `ASC Sales Reports failed (${errors[0]})`,
      downloadsSource: null,
    };
  }

  return {
    downloads,
    downloadsNote: null,
    downloadsSource: 'asc_sales_reports',
  };
}

async function appStoreMetrics() {
  try {
    const token = await makeAscToken();
    const bundleId = process.env.ASC_BUNDLE_ID?.trim() || 'com.pagnarith.homeworkpalette';
    const apps = await ascGet(`apps?filter[bundleId]=${encodeURIComponent(bundleId)}&limit=1`, token);
    const app = apps.data?.[0];
    if (!app) return { ok: false, error: `No ASC app for ${bundleId}` };

    const appId = app.id;
    const versions = await ascGet(
      `apps/${appId}/appStoreVersions?filter[platform]=IOS&limit=3`,
      token
    );
    const latest = versions.data?.[0];
    const versionString = latest?.attributes?.versionString || null;
    const state = latest?.attributes?.appStoreState || null;

    const products = {};
    let approvedPro = 0;
    const groups = await ascGet(`apps/${appId}/subscriptionGroups?limit=10`, token);
    for (const group of groups.data || []) {
      const subs = await ascGet(`subscriptionGroups/${group.id}/subscriptions?limit=20`, token);
      for (const sub of subs.data || []) {
        const productId = sub.attributes?.productId;
        const subState = sub.attributes?.state;
        if (productId) {
          products[productId] = subState;
          if (String(productId).startsWith('palette.pro') && subState === 'APPROVED') {
            approvedPro += 1;
          }
        }
      }
    }

    let ratings = null;
    let averageRating = null;
    try {
      const lookup = await fetchJson(
        `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId)}`
      );
      const item = lookup.results?.[0];
      if (item) {
        ratings = num(item.userRatingCount);
        averageRating = item.averageUserRating ?? null;
      }
    } catch {
      // Optional.
    }

    const sales = await ascDownloadTotals(token, bundleId);

    return {
      ok: true,
      name: app.attributes?.name || 'Homework Palette',
      bundleId,
      version: versionString,
      state,
      downloads: sales.downloads,
      downloadsNote: sales.downloadsNote,
      downloadsSource: sales.downloadsSource,
      ratings,
      averageRating,
      proSubs: approvedPro,
      products,
      source: 'app_store_connect',
    };
  } catch (error) {
    return { ok: false, error: error.message || 'App Store Connect metrics failed' };
  }
}

export async function collectOverviewMetrics() {
  const settled = await Promise.allSettled([
    youtubeMetrics(),
    facebookMetrics(),
    instagramMetrics(),
    tiktokMetrics(),
    telegramMetrics(),
    appStoreMetrics(),
  ]);

  const [youtube, facebook, instagram, tiktok, telegram, appStore] = settled.map((result) => {
    if (result.status === 'fulfilled') return result.value;
    return { ok: false, error: result.reason?.message || String(result.reason) };
  });

  const totalFollowers =
    num(youtube.ok && youtube.subscribers) +
    num(facebook.ok && facebook.followers) +
    num(instagram.ok && instagram.followers) +
    num(tiktok.ok && tiktok.followers) +
    num(telegram.ok && telegram.subscribers);

  return {
    fetchedAt: new Date().toISOString(),
    totalFollowers,
    platforms: {
      youtube,
      facebook,
      instagram,
      tiktok,
      telegram,
      appStore,
    },
  };
}
