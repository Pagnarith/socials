#!/usr/bin/env node
/**
 * Rebrand live social surfaces to "Homework Palette".
 *
 * Updates (API):
 *   - Telegram bot name / short / long description + commands
 *   - Telegram channel title / description
 *   - Facebook Page name / about / description / website
 *   - YouTube channel title / description
 *   - Instagram display name (bio stays manual — Graph API limitation)
 *
 * Manual (printed):
 *   - Instagram bio paste
 *   - TikTok name + bio
 *   - Optional @handle renames
 *
 * Usage:
 *   node scripts/rebrand-socials.js
 *   node scripts/rebrand-socials.js --dry-run
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DRY = process.argv.includes('--dry-run');

const BRAND = 'Homework Palette';
const SITE = 'https://homework.chakriya.net/';
const APP_STORE = 'https://apps.apple.com/app/id6801068446';
const POSTER = 'https://homework.chakriya.net/poster.html';

const YT_DESC = `Homework Palette — grade 1–6 homework for families (Khmer & English).

Free library, print worksheets, builder, offline read-aloud, and lesson recorder.
Palette Pro unlocks in-app quizzes.

Download: ${APP_STORE}
Website: ${SITE}
Poster: ${POSTER}

Publisher: Chakriya · contact@chakriya.net`;

const FB_ABOUT = `${BRAND} — grade 1–6 homework for families (Khmer & English). Free on the App Store. ${SITE}`;

const FB_DESCRIPTION = `${BRAND} is a free iPhone & iPad homework app for grades 1–6.
Built for families — Khmer & English. Browse the library, print packs,
build worksheets, record teaching lessons, and unlock quizzes with Palette Pro.

Download: ${APP_STORE}
Website: ${SITE}
Publisher: Chakriya · contact@chakriya.net`;

const TG_BOT_SHORT = `${BRAND} — grades 1–6 homework for families. Free App Store download, tips & updates.`;

const TG_BOT_LONG = `Official ${BRAND} bot from Chakriya.

• /app — About the app
• /features — Free & Palette Pro
• /download — App Store link
• /links — Social & website

${SITE}
${APP_STORE}`;

const TG_CHANNEL_DESC = `${BRAND} — grade 1–6 homework for families (Khmer & English).
Free on the App Store · ${SITE}`;

const IG_BIO = `📚 ${BRAND}
Grade 1–6 homework for families
Khmer & English • Free on App Store
🔗 homework.chakriya.net`;

const TK_BIO = `📚 ${BRAND}
Grades 1–6 • Khmer & English
Free on the App Store 📱`;

const TG_COMMANDS = [
  { command: 'start', description: 'Welcome message' },
  { command: 'menu', description: 'Open main menu' },
  { command: 'today', description: "Today's content + video tips" },
  { command: 'content', description: 'Alias for /today' },
  { command: 'latest', description: 'Show latest video info' },
  { command: 'app', description: 'About Homework Palette' },
  { command: 'features', description: 'Free features & Palette Pro' },
  { command: 'download', description: 'App Store download link' },
  { command: 'products', description: 'App summary' },
  { command: 'donate', description: 'Support our work' },
  { command: 'links', description: 'Social & website links' },
  { command: 'subscribe', description: 'Subscribe to notifications' },
  { command: 'unsubscribe', description: 'Unsubscribe from notifications' },
  { command: 'help', description: 'Show all commands' },
];

function section(title) {
  console.log(`\n═══ ${title} ═══`);
}

function ok(msg) {
  console.log(`  ✅ ${msg}`);
}

function warn(msg) {
  console.log(`  ⚠️  ${msg}`);
}

function fail(msg) {
  console.log(`  ❌ ${msg}`);
}

async function tgApi(method, body = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN');
  if (DRY) return { ok: true, dry: true, result: true };
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function updateTelegram() {
  section('Telegram bot');
  // Set default + common language overrides (stale lang-specific bios can hide the default).
  const locales = [undefined, 'en', 'km'];
  for (const lang of locales) {
    const label = lang || 'default';
    for (const [method, body, field] of [
      ['setMyName', { name: BRAND }, 'bot name'],
      ['setMyShortDescription', { short_description: TG_BOT_SHORT }, 'short description'],
      ['setMyDescription', { description: TG_BOT_LONG }, 'description'],
    ]) {
      const payload = lang ? { ...body, language_code: lang } : body;
      // setMyName ignores language_code on some clients; still fine to omit for non-default.
      if (method === 'setMyName' && lang) continue;
      const r = await tgApi(method, payload);
      if (r.ok) ok(`${field} [${label}]${DRY ? ' (dry-run)' : ''}`);
      else fail(`${field} [${label}]: ${JSON.stringify(r)}`);
    }
  }

  const cmd = await tgApi('setMyCommands', { commands: TG_COMMANDS });
  if (cmd.ok) ok(`commands${DRY ? ' (dry-run)' : ''}`);
  else fail(`commands: ${JSON.stringify(cmd)}`);

  if (!DRY) {
    const short = await tgApi('getMyShortDescription', {});
    const long = await tgApi('getMyDescription', {});
    const gotShort = short.result?.short_description || '';
    const gotLong = long.result?.description || '';
    if (gotShort === TG_BOT_SHORT) ok('verified short description');
    else warn(`short mismatch after set: ${JSON.stringify(gotShort)}`);
    if (gotLong === TG_BOT_LONG) ok('verified description');
    else warn(`description mismatch after set: ${JSON.stringify(gotLong)}`);
  }

  section('Telegram channel');
  const channelId = process.env.TELEGRAM_CHANNEL_ID?.trim();
  if (!channelId) {
    warn('TELEGRAM_CHANNEL_ID not set — skip channel title/description');
    return;
  }
  for (const [method, body, label] of [
    ['setChatTitle', { chat_id: channelId, title: BRAND }, 'channel title'],
    ['setChatDescription', { chat_id: channelId, description: TG_CHANNEL_DESC }, 'channel description'],
  ]) {
    const r = await tgApi(method, body);
    if (r.ok) ok(`${label}${DRY ? ' (dry-run)' : ''}`);
    else fail(`${label}: ${r.description || JSON.stringify(r)}`);
  }
}

async function fbPageToken() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const sysToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !sysToken) throw new Error('Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN');
  if (DRY) return 'dry-run-token';
  const url = `https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${sysToken}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.access_token) throw new Error('Failed page token: ' + JSON.stringify(data));
  return data.access_token;
}

async function fbUpdate(token, fields) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (DRY) return { success: true };
  const params = new URLSearchParams({ ...fields, access_token: token });
  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}`, {
    method: 'POST',
    body: params,
  });
  return res.json();
}

async function updateFacebook() {
  section('Facebook Page');
  try {
    const token = await fbPageToken();
    // name + about + description + website
    const r = await fbUpdate(token, {
      name: BRAND,
      about: FB_ABOUT,
      description: FB_DESCRIPTION,
      website: SITE,
    });
    if (r.success || DRY) ok(`name/about/description/website → ${BRAND}${DRY ? ' (dry-run)' : ''}`);
    else {
      // Some pages need fields updated one-by-one
      warn('Batch update failed, trying field-by-field: ' + JSON.stringify(r));
      for (const [field, value] of Object.entries({
        name: BRAND,
        about: FB_ABOUT,
        description: FB_DESCRIPTION,
        website: SITE,
      })) {
        const one = await fbUpdate(token, { [field]: value });
        if (one.success) ok(`${field}`);
        else fail(`${field}: ${JSON.stringify(one)}`);
      }
    }
  } catch (e) {
    fail(e.message);
  }
}

async function updateYouTube() {
  section('YouTube');
  const clientId = process.env.YT_CLIENT_ID;
  const clientSecret = process.env.YT_CLIENT_SECRET;
  const redirectUri = process.env.YT_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
  const tokenPath = path.join(ROOT, 'tokens/youtube.json');

  if (!clientId || !clientSecret) {
    warn('Missing YT_CLIENT_ID / YT_CLIENT_SECRET — skip YouTube');
    return;
  }
  if (!fs.existsSync(tokenPath)) {
    warn('No tokens/youtube.json — run: npm run update:youtube (authorize first)');
    return;
  }
  if (DRY) {
    ok(`Would set title="${BRAND}" + description (dry-run)`);
    return;
  }

  const oAuth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oAuth2.setCredentials(JSON.parse(fs.readFileSync(tokenPath, 'utf8')));
  const youtube = google.youtube({ version: 'v3', auth: oAuth2 });

  const list = await youtube.channels.list({
    part: 'id,snippet,brandingSettings',
    mine: true,
  });
  const ch = list.data.items?.[0];
  if (!ch) {
    fail('No YouTube channel for this OAuth token');
    return;
  }

  try {
    await youtube.channels.update({
      part: 'brandingSettings,snippet',
      requestBody: {
        id: ch.id,
        snippet: {
          title: BRAND,
          description: YT_DESC,
        },
        brandingSettings: {
          channel: {
            description: YT_DESC,
          },
        },
      },
    });
    ok(`title + description → ${BRAND}`);
  } catch (e) {
    // Fall back to description-only (title sometimes needs different scope)
    warn(`Full update failed (${e.message}). Trying description only…`);
    try {
      await youtube.channels.update({
        part: 'brandingSettings',
        requestBody: {
          id: ch.id,
          brandingSettings: { channel: { description: YT_DESC } },
        },
      });
      ok('description updated (rename title manually in YouTube Studio if needed)');
    } catch (e2) {
      fail(e2.message);
    }
  }
}

async function updateInstagramName() {
  section('Instagram');
  const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!igId || !token) {
    warn('Missing INSTAGRAM_BUSINESS_ACCOUNT_ID / token — skip API name update');
    warn('Paste bio manually:\n' + IG_BIO);
    return;
  }
  if (DRY) {
    ok(`Would set IG name → ${BRAND} (dry-run)`);
    warn('Bio must be pasted manually (API limitation)');
    return;
  }
  try {
    const params = new URLSearchParams({ name: BRAND, access_token: token });
    const res = await fetch(`https://graph.facebook.com/v19.0/${igId}`, {
      method: 'POST',
      body: params,
    });
    const data = await res.json();
    if (data.success) ok(`display name → ${BRAND}`);
    else fail('name: ' + JSON.stringify(data));
  } catch (e) {
    fail(e.message);
  }
  console.log('\n  📷 Paste this Instagram bio manually (Edit Profile):\n');
  console.log(IG_BIO.split('\n').map((l) => '     ' + l).join('\n'));
}

function printTikTokManual() {
  section('TikTok (manual)');
  warn('TikTok name/bio cannot be updated via this project’s API keys.');
  console.log(`
  1. Open TikTok → Profile → Edit profile
  2. Name: ${BRAND}
  3. Bio:
${TK_BIO.split('\n').map((l) => '     ' + l).join('\n')}
  4. Optional: rename @handle when TikTok allows
`);
}

async function main() {
  console.log(`${DRY ? '[DRY RUN] ' : ''}Rebranding social surfaces → "${BRAND}"`);
  const steps = [
    ['Telegram', updateTelegram],
    ['Facebook', updateFacebook],
    ['YouTube', updateYouTube],
    ['Instagram', updateInstagramName],
  ];
  for (const [label, fn] of steps) {
    try {
      await fn();
    } catch (e) {
      fail(`${label} crashed: ${e.message || e}`);
    }
  }
  printTikTokManual();
  section('Done');
  console.log('  Review each app/page. Instagram: @homework_palette · TikTok: @homeworkpalette');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
