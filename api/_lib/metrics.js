/**
 * Live social metrics fetchers for the Social Ops dashboard.
 * Uses the same env vars as the Telegram media commands / scripts.
 */

const GRAPH = 'https://graph.facebook.com/v19.0';
const TIMEOUT_MS = 10_000;

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message || data?.error?.error_user_msg || res.statusText;
    throw new Error(message || `HTTP ${res.status}`);
  }
  return data;
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
  return {
    ok: true,
    title: ch.snippet?.title || null,
    subscribers: num(st.subscriberCount),
    views: num(st.viewCount),
    videos: num(st.videoCount),
    // Watch hours require YouTube Analytics OAuth — not available via Data API key alone.
    watchHours: null,
  };
}

async function facebookMetrics() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    return { ok: false, error: 'Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN' };
  }

  const fields = 'name,fan_count,followers_count,link';
  const data = await fetchJson(
    `${GRAPH}/${pageId}?fields=${fields}&access_token=${encodeURIComponent(token)}`
  );

  let reach = null;
  let minutesViewed = null;
  try {
    const since = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;
    const insights = await fetchJson(
      `${GRAPH}/${pageId}/insights` +
        `?metric=page_impressions_unique,page_video_view_time` +
        `&period=day&since=${since}&access_token=${encodeURIComponent(token)}`
    );
    for (const row of insights.data || []) {
      const total = (row.values || []).reduce((sum, v) => sum + num(v.value), 0);
      if (row.name === 'page_impressions_unique') reach = total;
      // page_video_view_time is milliseconds
      if (row.name === 'page_video_view_time') minutesViewed = Math.round(total / 60000);
    }
  } catch {
    // Insights often need extra App Review permissions — fan_count still works.
  }

  return {
    ok: true,
    name: data.name || null,
    followers: num(data.followers_count ?? data.fan_count),
    fans: num(data.fan_count),
    reach,
    minutesViewed,
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
  try {
    const insights = await fetchJson(
      `${GRAPH}/${igId}/insights` +
        `?metric=reach&period=day&metric_type=total_value` +
        `&access_token=${encodeURIComponent(token)}`
    );
    reach = num(insights.data?.[0]?.total_value?.value ?? insights.data?.[0]?.values?.[0]?.value);
  } catch {
    // Optional insights permission.
  }

  return {
    ok: true,
    username: data.username || null,
    followers: num(data.followers_count),
    posts: num(data.media_count),
    reach: reach || null,
    engagement: null,
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

    // Public App Store listing (no private download totals — those need Sales/Analytics reports).
    let ratingCount = null;
    let averageRating = null;
    try {
      const lookup = await fetchJson(
        `https://itunes.apple.com/lookup?bundleId=${encodeURIComponent(bundleId)}`
      );
      const item = lookup.results?.[0];
      if (item) {
        ratingCount = num(item.userRatingCount);
        averageRating = item.averageUserRating ?? null;
      }
    } catch {
      // Optional.
    }

    return {
      ok: true,
      name: app.attributes?.name || 'Homework Palette',
      bundleId,
      version: versionString,
      state,
      downloads: ratingCount, // proxy until Sales Reports vendor number is wired
      downloadsNote: 'Showing App Store rating count (download totals need ASC Sales Reports)',
      proSubs: approvedPro,
      products,
      averageRating,
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

  const [youtube, facebook, instagram, tiktok, telegram, appStore] = settled.map((result, i) => {
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
