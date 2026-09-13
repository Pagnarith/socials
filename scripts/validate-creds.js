#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

const results = [];
const GRAPH = 'https://graph.facebook.com/v19.0';

function ok(name, msg) { results.push({ name, ok: true, msg }); }
function fail(name, msg) { results.push({ name, ok: false, msg }); }

async function checkYouTube() {
  const key = process.env.YOUTUBE_API_KEY;
  const chan = process.env.YOUTUBE_CHANNEL_ID;
  const name = 'YouTube';
  if (!key || !chan) { fail(name, 'Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID'); return; }
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=id&id=${chan}&key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok && data.items && data.items.length > 0) ok(name, `Channel ${chan} found`);
    else fail(name, `API key or channel invalid (status ${res.status})`);
  } catch (e) { fail(name, String(e)); }
}

async function checkYouTubeAnalytics() {
  const name = 'YouTube Analytics';
  const refresh = process.env.YOUTUBE_REFRESH_TOKEN?.trim();
  const clientId = (process.env.YT_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.YT_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET || '').trim();
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!refresh) { fail(name, 'Missing YOUTUBE_REFRESH_TOKEN (run scripts/auth-youtube-analytics.js)'); return; }
  if (!clientId || !clientSecret) { fail(name, 'Missing YT_CLIENT_ID / YT_CLIENT_SECRET'); return; }
  if (!channelId) { fail(name, 'Missing YOUTUBE_CHANNEL_ID'); return; }
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refresh,
        grant_type: 'refresh_token',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      fail(name, `Token refresh failed: ${tokenData.error_description || JSON.stringify(tokenData)}`);
      return;
    }
    const endDate = new Date().toISOString().slice(0, 10);
    const params = new URLSearchParams({
      ids: `channel==${channelId}`,
      metrics: 'estimatedMinutesWatched',
      startDate: '2006-01-01',
      endDate,
    });
    const reportRes = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${params}`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const report = await reportRes.json();
    if (!reportRes.ok) {
      fail(name, report.error?.message || JSON.stringify(report));
      return;
    }
    const minutes = Number(report.rows?.[0]?.[0] || 0);
    ok(name, `~${Math.round(minutes / 60)} watch hours (${minutes} minutes)`);
  } catch (e) { fail(name, String(e)); }
}

async function checkTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const name = 'Telegram';
  if (!token) { fail(name, 'Missing TELEGRAM_BOT_TOKEN'); return; }
  try {
    const url = `https://api.telegram.org/bot${token}/getMe`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok && data.ok) ok(name, `Bot: ${data.result.username || data.result.first_name}`);
    else fail(name, `Invalid bot token: ${JSON.stringify(data)}`);
  } catch (e) { fail(name, String(e)); }
}

async function checkFacebook() {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const name = 'Facebook/Instagram';
  if (!appId || !appSecret || !pageToken) { fail(name, 'Missing FACEBOOK_APP_ID, APP_SECRET, or PAGE_ACCESS_TOKEN'); return; }
  try {
    const appToken = `${appId}|${appSecret}`;
    const url = `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(pageToken)}&access_token=${encodeURIComponent(appToken)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.data && data.data.is_valid) ok(name, `Token valid, app_id=${data.data.app_id}`);
    else fail(name, `Invalid Facebook token: ${JSON.stringify(data)}`);
  } catch (e) { fail(name, String(e)); }
}

async function checkFacebookInsights() {
  const name = 'Facebook insights';
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) { fail(name, 'Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN'); return; }
  try {
    const since = Math.floor(Date.now() / 1000) - 7 * 24 * 3600;
    const url =
      `${GRAPH}/${pageId}/insights` +
      `?metric=page_total_media_view_unique` +
      `&period=day&since=${since}&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      fail(
        name,
        data?.error?.message ||
          `HTTP ${res.status} — submit App Review for read_insights (see docs/facebook-app-review.md)`
      );
      return;
    }
    const names = (data.data || []).map((r) => r.name).join(', ') || '(empty data)';
    ok(name, `OK: ${names}`);
  } catch (e) { fail(name, String(e)); }
}

async function checkInstagramInsights() {
  const name = 'Instagram insights';
  const token = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!token) { fail(name, 'Missing Instagram/Facebook access token'); return; }
  try {
    let igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim();
    if (!igId && pageId) {
      const pageRes = await fetch(
        `${GRAPH}/${pageId}?fields=instagram_business_account&access_token=${encodeURIComponent(token)}`
      );
      const pageData = await pageRes.json();
      igId = pageData.instagram_business_account?.id;
    }
    if (!igId) { fail(name, 'No INSTAGRAM_BUSINESS_ACCOUNT_ID / linked IG account'); return; }

    const url =
      `${GRAPH}/${igId}/insights` +
      `?metric=reach&period=day&metric_type=total_value` +
      `&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
      fail(
        name,
        data?.error?.message ||
          `HTTP ${res.status} — need Instagram insights App Review / token scopes`
      );
      return;
    }
    const value = data.data?.[0]?.total_value?.value ?? data.data?.[0]?.values?.[0]?.value;
    ok(name, `reach=${value ?? 'empty'}`);
  } catch (e) { fail(name, String(e)); }
}

async function checkTikTok() {
  const key = process.env.TIKTOK_CLIENT_KEY;
  const secret = process.env.TIKTOK_CLIENT_SECRET;
  const name = 'TikTok';
  if (!key || !secret) { fail(name, 'Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET'); return; }
  try {
    const url = `https://open-api.tiktok.com/oauth/client_token/?client_key=${encodeURIComponent(key)}&client_secret=${encodeURIComponent(secret)}&grant_type=client_credential`;
    const res = await fetch(url);
    const data = await res.json();
    if (res.ok && (data.data && data.data.access_token || data.access_token)) ok(name, 'Client credentials accepted');
    else fail(name, `TikTok validation failed: ${JSON.stringify(data)}`);
  } catch (e) { fail(name, String(e)); }
}

async function checkAscSales() {
  const name = 'ASC Sales Reports';
  const vendor = process.env.ASC_VENDOR_NUMBER?.trim();
  if (!vendor) {
    fail(name, 'Missing ASC_VENDOR_NUMBER (see docs/asc-sales-reports.md)');
    return;
  }
  ok(name, `ASC_VENDOR_NUMBER set (${vendor.slice(0, 2)}…)`);
}

async function checkDataverse() {
  const url = process.env.DATAVERSE_URL;
  const clientId = process.env.DATAVERSE_CLIENT_ID;
  const clientSecret = process.env.DATAVERSE_CLIENT_SECRET;
  const tenant = process.env.DATAVERSE_TENANT_ID;
  const name = 'Dataverse (Azure AD)';
  if (!url || !clientId || !clientSecret || !tenant) { fail(name, 'Missing DATAVERSE_URL/CLIENT_ID/CLIENT_SECRET/TENANT_ID'); return; }
  try {
    const base = url.split('/api')[0];
    const tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: `${base}/.default`
    });
    const res = await fetch(tokenUrl, { method: 'POST', body });
    const data = await res.json();
    if (res.ok && data.access_token) ok(name, 'Client credentials valid (token acquired)');
    else fail(name, `Token request failed: ${JSON.stringify(data)}`);
  } catch (e) { fail(name, String(e)); }
}

async function run() {
  console.log('Validating credentials (reading from .env)...\n');
  await Promise.all([
    checkYouTube(),
    checkYouTubeAnalytics(),
    checkTelegram(),
    checkFacebook(),
    checkFacebookInsights(),
    checkInstagramInsights(),
    checkTikTok(),
    checkAscSales(),
    checkDataverse(),
  ]);

  console.log('\nSummary:');
  results.forEach(r => {
    const mark = r.ok ? '✅' : '❌';
    console.log(`${mark} ${r.name}: ${r.msg}`);
  });

  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) process.exit(2);
  process.exit(0);
}

run();
