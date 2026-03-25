#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

const results = [];

function ok(name, msg) { results.push({name, ok: true, msg}); }
function fail(name, msg) { results.push({name, ok: false, msg}); }

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
  await Promise.all([checkYouTube(), checkTelegram(), checkFacebook(), checkTikTok(), checkDataverse()]);

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
