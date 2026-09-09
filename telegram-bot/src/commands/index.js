import { Markup } from 'telegraf';
import { BRAND, SOCIAL_LINKS, PRODUCT_LINKS, DONATE_LINKS } from '../config.js';
import { isAdmin } from '../admin.js';
import { escapeHtml, replyHtml } from '../reply.js';
import { formatTodayContentHtml } from '../todayContent.js';

export function registerCommands(bot) {
  bot.start((ctx) => {
    const welcomeMessage = `
📚 Welcome to <b>${escapeHtml(BRAND.name)} Bot</b>!

${escapeHtml(BRAND.tagline)}

Publisher: ${escapeHtml(BRAND.publisher)}

🔹 /menu — Main menu
🔹 /today — Today's content + video tips
🔹 /latest — Latest video
🔹 /app — About the app
🔹 /features — Free &amp; Palette Pro
🔹 /download — App Store link
🔹 /links — Social &amp; website links
🔹 /donate — Support our work
🔹 /subscribe — Get notified for new content
🔹 /media — Manage social media (admin)
🔹 /help — All commands

App: ${escapeHtml(PRODUCT_LINKS.marketingSite)}
Ops: ${escapeHtml(SOCIAL_LINKS.website)}
    `;
    replyHtml(ctx, welcomeMessage.trim(), mainMenuKeyboard());
  });

  bot.command('menu', (ctx) => {
    ctx.reply('Choose a category:', mainMenuKeyboard());
  });

  bot.command('today', (ctx) => {
    const { text, keyboard } = formatTodayContentHtml();
    replyHtml(ctx, text, keyboard);
  });

  bot.command('content', (ctx) => {
    const { text, keyboard } = formatTodayContentHtml();
    replyHtml(ctx, text, keyboard);
  });

  bot.command('latest', (ctx) => {
    replyHtml(ctx, `
📺 <b>Latest Videos</b>

📚 <b>Homework Palette</b> demos, parent tips, and lesson-recorder clips — coming soon.

Subscribe with /subscribe to get notified when new videos drop!
Get the app: ${escapeHtml(PRODUCT_LINKS.appStore)}
    `.trim());
  });

  bot.command('app', (ctx) => {
    replyHtml(ctx, `
📚 <b>${escapeHtml(BRAND.name)}</b>

Native iPhone &amp; iPad homework app for grades 1–6.
Built for families — Khmer &amp; English.

🆓 <b>Free:</b> library, print, worksheet builder, read-aloud, lesson recorder
⭐ <b>Palette Pro:</b> in-app quizzes with scores &amp; progress

🌐 ${escapeHtml(PRODUCT_LINKS.marketingSite)}
📱 ${escapeHtml(PRODUCT_LINKS.appStore)}
    `.trim(), Markup.inlineKeyboard([
      [Markup.button.url('📱 Download on the App Store', PRODUCT_LINKS.appStore)],
      [Markup.button.url('🌐 homework.chakriya.net', PRODUCT_LINKS.marketingSite)],
      [Markup.button.callback('🔔 Notify Me on Updates', 'notify_app')],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.command('features', (ctx) => {
    replyHtml(ctx, `
✨ <b>${escapeHtml(BRAND.name)} — Features</b>

📚 <b>Free library</b> — 100 exercises per grade, browse &amp; print
🛠️ <b>Builder</b> — photos, voice notes, custom worksheets
🔊 <b>Read-aloud</b> — offline Khmer &amp; English
🎥 <b>Lesson recorder</b> — screen + optional face/mic; finishes in the background
🔔 <b>Video ready</b> — optional notification when export completes
⭐ <b>Palette Pro</b> — in-app quizzes &amp; progress

Poster for sharing: ${escapeHtml(PRODUCT_LINKS.poster)}
    `.trim(), Markup.inlineKeyboard([
      [Markup.button.url('📱 Get the app', PRODUCT_LINKS.appStore)],
      [Markup.button.url('🖼️ Share poster', PRODUCT_LINKS.poster)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.command('download', (ctx) => {
    replyHtml(ctx, `
📱 <b>Download ${escapeHtml(BRAND.name)}</b>

Free on the App Store — grades 1–6 homework for families.

${escapeHtml(PRODUCT_LINKS.appStore)}

Site: ${escapeHtml(PRODUCT_LINKS.marketingSite)}
    `.trim(), Markup.inlineKeyboard([
      [Markup.button.url('📱 App Store', PRODUCT_LINKS.appStore)],
      [Markup.button.url('🌐 Website', PRODUCT_LINKS.marketingSite)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.command('products', (ctx) => {
    replyHtml(ctx, `
🛒 <b>${escapeHtml(BRAND.name)}</b>

📱 Free on the App Store (id 6801068446)
⭐ Palette Pro unlocks in-app quizzes

🌐 ${escapeHtml(PRODUCT_LINKS.marketingSite)}
🖼️ Poster: ${escapeHtml(PRODUCT_LINKS.poster)}

Love the free library? /donate to support development.
    `.trim(), Markup.inlineKeyboard([
      [Markup.button.url('📱 App Store', PRODUCT_LINKS.appStore)],
      [Markup.button.url('🌐 Website', PRODUCT_LINKS.marketingSite)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.command('donate', (ctx) => {
    replyHtml(ctx, `
💝 <b>Support ${escapeHtml(BRAND.name)}</b>

The grade 1–6 library, builder, read-aloud, and lesson recorder stay free.
Your support helps us keep shipping updates for families.

☕ <b>Buy Me a Coffee</b> — One-time support
🎯 <b>GitHub Sponsors</b> — Monthly sponsorship
🎨 <b>Patreon</b> — Exclusive updates &amp; early access
💬 <b>YouTube Super Chat</b> — Support during streams

Thank you for being part of the community! 🙏
    `.trim(), Markup.inlineKeyboard([
      [Markup.button.url('☕ Buy Me a Coffee', DONATE_LINKS.buyMeACoffee)],
      [Markup.button.url('🎯 GitHub Sponsors', DONATE_LINKS.githubSponsors)],
      [Markup.button.url('🎨 Patreon', DONATE_LINKS.patreon)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.command('links', (ctx) => {
    replyHtml(ctx, `
🔗 <b>Links</b>

📺 YouTube: <a href="${SOCIAL_LINKS.youtube}">Subscribe</a>
📘 Facebook: <a href="${SOCIAL_LINKS.facebook}">Follow</a>
📷 Instagram: <a href="${SOCIAL_LINKS.instagram}">@homework_palette</a>
📱 TikTok: <a href="${SOCIAL_LINKS.tiktok}">@homeworkpalette</a>
💬 Telegram: You're already here!

📱 App Store: <a href="${PRODUCT_LINKS.appStore}">Download</a>
🌐 Site: <a href="${PRODUCT_LINKS.marketingSite}">homework.chakriya.net</a>
🖼️ Poster: <a href="${PRODUCT_LINKS.poster}">Share</a>
📊 Ops: <a href="${SOCIAL_LINKS.website}">social.chakriya.net</a>
    `.trim(), Markup.inlineKeyboard([
      [Markup.button.url('📱 App Store', PRODUCT_LINKS.appStore)],
      [Markup.button.url('📷 Instagram', SOCIAL_LINKS.instagram)],
      [Markup.button.url('📱 TikTok', SOCIAL_LINKS.tiktok)],
      [Markup.button.url('💝 Support Us', DONATE_LINKS.buyMeACoffee)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.command('subscribe', (ctx) => {
    const userName = escapeHtml(ctx.from.first_name || '');
    replyHtml(ctx, `
✅ <b>Subscribed!</b>

Hey ${userName}, you'll receive notifications for:
🔔 New YouTube uploads
🔔 ${escapeHtml(BRAND.name)} updates
🔔 Special announcements

To unsubscribe, use /unsubscribe
    `.trim());
  });

  bot.command('unsubscribe', (ctx) => {
    ctx.reply('🔕 You have been unsubscribed from notifications.');
  });

  bot.command('help', (ctx) => {
    let msg = `
📖 <b>Available Commands</b>

🏠 /start — Welcome message
📋 /menu — Interactive menu
📅 /today — Today's content + video tips
📅 /content — Alias for /today
📺 /latest — Latest video uploads
📚 /app — About Homework Palette
✨ /features — Free &amp; Palette Pro
📱 /download — App Store link
🛒 /products — App summary
💝 /donate — Support our work
🔗 /links — Social &amp; website links
🔔 /subscribe — Get notifications
🔕 /unsubscribe — Stop notifications
❓ /help — This help message`;

    if (isAdmin(ctx)) {
      msg += `

🔧 <b>Admin Commands</b>
📡 /media — Media management menu
📺 /yt_info · /yt_desc · /yt_alerts
📘 /fb_info · /fb_about · /fb_desc · /fb_web
💬 /tg_info · /tg_desc · /tg_short
📷 /ig_info · 📱 /tk_info`;
    }

    replyHtml(ctx, msg.trim());
  });
}

function mainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📅 Today\'s Content', 'menu_today'),
      Markup.button.callback('📺 Latest Video', 'menu_latest'),
    ],
    [
      Markup.button.callback('📚 About App', 'menu_app'),
      Markup.button.callback('✨ Features', 'menu_features'),
    ],
    [
      Markup.button.callback('📱 Download', 'menu_download'),
      Markup.button.callback('🔗 Social Links', 'menu_links'),
    ],
    [
      Markup.button.callback('💝 Support Us', 'menu_donate'),
      Markup.button.callback('🔔 Subscribe', 'menu_subscribe'),
    ],
  ]);
}
