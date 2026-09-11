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

async function tiktokMetrics() {
  // Client key/secret alone cannot read follower counts without a user access token.
  if (!process.env.TIKTOK_CLIENT_KEY) {
    return { ok: false, error: 'Missing TIKTOK_CLIENT_KEY' };
  }
  return {
    ok: false,
    error: 'TikTok user OAuth not configured — follower metrics unavailable',
    followers: null,
    views: null,
  };
}

async function appStoreMetrics() {
  // App Store Connect analytics need ASC API keys (not in socials .env today).
  return {
    ok: false,
    error: 'App Store Connect API not configured in socials project',
    downloads: null,
    proSubs: null,
  };
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
