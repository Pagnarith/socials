/**
 * Media Admin Commands — manage all social media details from Telegram.
 *
 * Commands:
 *   /media          — Show media management menu
 *   /yt_desc <text> — Update YouTube channel description
 *   /yt_info        — Show current YouTube channel info
 *   /yt_alerts      — Show recently alerted YouTube uploads
 *   /fb_about <t>   — Update Facebook Page "about"
 *   /fb_desc <text> — Update Facebook Page "description"
 *   /fb_web <url>   — Update Facebook Page website
 *   /fb_info        — Show current Facebook Page info
 *   /tg_desc <text> — Update Telegram bot description
 *   /tg_short <t>   — Update Telegram bot short description
 *   /tg_info        — Show current Telegram channel info
 *   /ig_info        — Show Instagram bio (manual-update only)
 *   /tk_info        — Show TikTok bio (manual-update only)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isAdmin, adminOnly } from '../admin.js';
import { SOCIAL_LINKS } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN_PATH = path.resolve(__dirname, '../../../tokens/youtube.json');

function extractArgs(ctx) {
  const text = ctx.message?.text || '';
  const idx = text.indexOf(' ');
  return idx > 0 ? text.slice(idx + 1).trim() : '';
}

// ─── YouTube helpers ────────────────────────────────────────
async function getYouTubeClient() {
  const { google } = await import('googleapis');
  const clientId = process.env.YT_CLIENT_ID;
  const clientSecret = process.env.YT_CLIENT_SECRET;
  const redirectUri = process.env.YT_REDIRECT_URI || 'http://localhost:3000/oauth2callback';
  if (!clientId || !clientSecret) throw new Error('Missing YT_CLIENT_ID or YT_CLIENT_SECRET');
  if (!fs.existsSync(TOKEN_PATH)) throw new Error('No YouTube token found — run `node scripts/update-youtube-channel.js` first to authorize.');
  const oAuth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oAuth2.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')));
  return google.youtube({ version: 'v3', auth: oAuth2 });
}

// ─── Facebook helpers ───────────────────────────────────────
let _fbTokenCache = null;
let _fbTokenExpiry = 0;

async function fbPageToken() {
  if (_fbTokenCache && Date.now() < _fbTokenExpiry) return _fbTokenCache;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const sysToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !sysToken) throw new Error('Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN');
  const url = `https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${sysToken}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const data = await res.json();
  if (data?.access_token) {
    _fbTokenCache = data.access_token;
    _fbTokenExpiry = Date.now() + 5 * 60 * 1000; // cache 5 min
    return _fbTokenCache;
  }
  throw new Error('Failed to get page token: ' + JSON.stringify(data));
}

async function fbUpdate(field, value) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = await fbPageToken();
  const params = new URLSearchParams();
  params.append(field, value);
  params.append('access_token', token);
  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}`, { method: 'POST', body: params, signal: AbortSignal.timeout(8000) });
  return res.json();
}

async function fbInfo() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) throw new Error('Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN');
  const fields = 'name,about,description,website,category,fan_count';
  const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=${fields}&access_token=${token}`, { signal: AbortSignal.timeout(8000) });
  return res.json();
}

// ─── Telegram Bot API helpers ───────────────────────────────
async function tgApiCall(method, body = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000)
  });
  return res.json();
}

// ─── Bios for platforms that can't auto-update ──────────────
const IG_BIO = `🎮 Minecraft Add-ons | 🏗️ Rhino 3D
Building for Microsoft Marketplace
Tutorials • Tips • Creations
🔗 social.chakriya.net`;

const TK_BIO = `🎮 Minecraft Add-ons • 🏗️ Rhino 3D
Tutorials & creations ⚡`;

// ═════════════════════════════════════════════════════════════
//  Register all /media commands
// ═════════════════════════════════════════════════════════════
export function registerMediaCommands(bot) {

  // ── /media — overview menu ────────────────────────────────
  bot.command('media', (ctx) => {
    if (!adminOnly(ctx)) return;
    ctx.reply(
`📡 Media Management

YouTube:
/yt_info — View channel info
/yt_desc <text> — Update channel description
/yt_alerts — View recent alerted uploads

Facebook:
/fb_info — View page info
/fb_about <text> — Update page about
/fb_desc <text> — Update page description
/fb_web <url> — Update page website

Telegram:
/tg_info — View channel info
/tg_desc <text> — Update bot description
/tg_short <text> — Update bot short description

Instagram (manual):
/ig_info — Show bio to copy/paste

TikTok (manual):
/tk_info — Show bio to copy/paste`
    );
  });

  // ── YouTube ───────────────────────────────────────────────
  bot.command('yt_info', async (ctx) => {
    if (!adminOnly(ctx)) return;
    try {
      await ctx.sendChatAction('typing');
      const yt = await getYouTubeClient();
      const res = await yt.channels.list({ part: 'snippet,statistics,brandingSettings', mine: true });
      const ch = res.data.items?.[0];
      if (!ch) return ctx.reply('No channel found.');
      const s = ch.snippet;
      const st = ch.statistics;
      const b = ch.brandingSettings?.channel;
      ctx.replyWithMarkdown(`
📺 *YouTube Channel*
*Title:* ${s.title}
*Subscribers:* ${st.subscriberCount}
*Videos:* ${st.videoCount}
*Views:* ${st.viewCount}

*Description:*
\`\`\`
${b?.description || s.description || '(empty)'}
\`\`\`
      `);
    } catch (e) {
      ctx.reply('❌ ' + e.message);
    }
  });

  bot.command('yt_desc', async (ctx) => {
    if (!adminOnly(ctx)) return;
    const desc = extractArgs(ctx);
    if (!desc) return ctx.reply('Usage: /yt_desc <new description>');
    try {
      await ctx.sendChatAction('typing');
      const yt = await getYouTubeClient();
      const list = await yt.channels.list({ part: 'brandingSettings', mine: true });
      const ch = list.data.items?.[0];
      if (!ch) return ctx.reply('No channel found.');
      await yt.channels.update({
        part: 'brandingSettings',
        requestBody: { id: ch.id, brandingSettings: { channel: { description: desc } } },
      });
      ctx.replyWithMarkdown('✅ YouTube description updated.');
    } catch (e) {
      ctx.reply('❌ ' + e.message);
    }
  });

  bot.command('yt_alerts', async (ctx) => {
    if (!adminOnly(ctx)) return;

    try {
      await ctx.sendChatAction('typing');
      const { loadAlertState } = await import('../../../scripts/lib/youtube-alert-state.js');
      const state = await loadAlertState();
      const videos = state.videos.slice(0, 5);

      if (videos.length === 0) {
        return ctx.replyWithMarkdown('📺 No YouTube alert state recorded yet.');
      }

      const body = videos
        .map((video, index) => {
          const title = video.title || '(untitled)';
          const videoId = video.videoId || '(missing)';
          const hash = video.dedupeKey ? `${video.dedupeKey.slice(0, 12)}...` : '(missing)';
          const publishedAt = video.publishedAt || '(unknown)';
          const alertedAt = video.alertedAt || '(unknown)';

          return `${index + 1}. *${title}*\nID: \`${videoId}\`\nHash: \`${hash}\`\nPublished: ${publishedAt}\nAlerted: ${alertedAt}`;
        })
        .join('\n\n');

      return ctx.replyWithMarkdown(`📺 *Recent YouTube Alerts*\n\n${body}`);
    } catch (error) {
      return ctx.reply(`❌ ${error.message}`);
    }
  });

  // ── Facebook ──────────────────────────────────────────────
  bot.command('fb_info', async (ctx) => {
    if (!adminOnly(ctx)) return;
    try {
      await ctx.sendChatAction('typing');
      const info = await fbInfo();
      ctx.replyWithMarkdown(`
📘 *Facebook Page*
*Name:* ${info.name || '?'}
*Category:* ${info.category || '?'}
*Fans:* ${info.fan_count ?? '?'}
*Website:* ${info.website || '(none)'}

*About:*
\`\`\`
${info.about || '(empty)'}
\`\`\`

*Description:*
\`\`\`
${info.description || '(empty)'}
\`\`\`
      `);
    } catch (e) {
      ctx.reply('❌ ' + e.message);
    }
  });

  bot.command('fb_about', async (ctx) => {
    if (!adminOnly(ctx)) return;
    const val = extractArgs(ctx);
    if (!val) return ctx.reply('Usage: /fb_about <new about text>');
    try {
      const r = await fbUpdate('about', val);
      ctx.reply(r.success ? '✅ Facebook about updated.' : '❌ ' + JSON.stringify(r));
    } catch (e) { ctx.reply('❌ ' + e.message); }
  });

  bot.command('fb_desc', async (ctx) => {
    if (!adminOnly(ctx)) return;
    const val = extractArgs(ctx);
    if (!val) return ctx.reply('Usage: /fb_desc <new description>');
    try {
      const r = await fbUpdate('description', val);
      ctx.reply(r.success ? '✅ Facebook description updated.' : '❌ ' + JSON.stringify(r));
    } catch (e) { ctx.reply('❌ ' + e.message); }
  });

  bot.command('fb_web', async (ctx) => {
    if (!adminOnly(ctx)) return;
    const val = extractArgs(ctx);
    if (!val) return ctx.reply('Usage: /fb_web <url>');
    try {
      const r = await fbUpdate('website', val);
      ctx.reply(r.success ? '✅ Facebook website updated.' : '❌ ' + JSON.stringify(r));
    } catch (e) { ctx.reply('❌ ' + e.message); }
  });

  // ── Telegram ──────────────────────────────────────────────
  bot.command('tg_info', async (ctx) => {
    if (!adminOnly(ctx)) return;

    const channelId = process.env.TELEGRAM_CHANNEL_ID;

    try {
      await ctx.sendChatAction('typing');

      if (!channelId) {
        return ctx.reply('❌ TELEGRAM_CHANNEL_ID is not configured.');
      }

      const [chatRes, countRes] = await Promise.all([
        tgApiCall('getChat', { chat_id: channelId }),
        tgApiCall('getChatMemberCount', { chat_id: channelId })
      ]);

      if (!chatRes?.ok || !chatRes.result) {
        return ctx.reply(`❌ Failed to load Telegram channel info: ${chatRes?.description || 'unknown error'}`);
      }

      const chat = chatRes.result;
      const memberCount = countRes?.ok ? countRes.result : '(unavailable)';

      return ctx.replyWithMarkdown(`
💬 *Telegram Channel*
*Title:* ${chat.title || chat.username || '(unknown)'}
*Type:* ${chat.type || '(unknown)'}
*Username:* ${chat.username ? '@' + chat.username : '(none)'}
*ID:* \`${chat.id}\`
*Members:* ${memberCount}

*Description:*
\`\`\`
${chat.description || '(empty)'}
\`\`\`

*Invite link:* ${chat.invite_link || '(none)'}
      `);
    } catch (e) { ctx.reply('❌ ' + e.message); }
  });

  bot.command('tg_desc', async (ctx) => {
    if (!adminOnly(ctx)) return;
    const val = extractArgs(ctx);
    if (!val) return ctx.reply('Usage: /tg_desc <new bot description>');
    try {
      const r = await tgApiCall('setMyDescription', { description: val });
      ctx.reply(r.ok ? '✅ Telegram bot description updated.' : '❌ ' + JSON.stringify(r));
    } catch (e) { ctx.reply('❌ ' + e.message); }
  });

  bot.command('tg_short', async (ctx) => {
    if (!adminOnly(ctx)) return;
    const val = extractArgs(ctx);
    if (!val) return ctx.reply('Usage: /tg_short <new short description>');
    try {
      const r = await tgApiCall('setMyShortDescription', { short_description: val });
      ctx.reply(r.ok ? '✅ Telegram short description updated.' : '❌ ' + JSON.stringify(r));
    } catch (e) { ctx.reply('❌ ' + e.message); }
  });

  // ── Instagram (manual — API doesn't support bio update) ───
  bot.command('ig_info', (ctx) => {
    if (!adminOnly(ctx)) return;
    ctx.replyWithMarkdown(`
📷 *Instagram* — *Manual update required*

Open Instagram → Edit Profile → Bio, then paste:

\`\`\`
${IG_BIO}
\`\`\`

🔗 ${SOCIAL_LINKS.instagram}
    `);
  });

  // ── TikTok (manual — API doesn't support bio update) ─────
  bot.command('tk_info', (ctx) => {
    if (!adminOnly(ctx)) return;
    ctx.replyWithMarkdown(`
📱 *TikTok* — *Manual update required*

Open TikTok → Edit Profile → Bio, then paste:

\`\`\`
${TK_BIO}
\`\`\`

🔗 ${SOCIAL_LINKS.tiktok}
    `);
  });
}
