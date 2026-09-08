import { Markup } from 'telegraf';
import { BRAND, SOCIAL_LINKS, PRODUCT_LINKS, DONATE_LINKS } from '../config.js';
import { isAdmin } from '../admin.js';

export function registerCommands(bot) {
  bot.start((ctx) => {
    const welcomeMessage = `
📚 Welcome to *${BRAND.name} Bot*!

${BRAND.tagline}

Publisher: ${BRAND.publisher}

🔹 /menu — Main menu
🔹 /latest — Latest video
🔹 /app — About the app
🔹 /features — Free & Palette Pro
🔹 /download — App Store link
🔹 /links — Social & website links
🔹 /donate — Support our work
🔹 /subscribe — Get notified for new content
🔹 /media — Manage social media (admin)
🔹 /help — All commands

App: ${PRODUCT_LINKS.marketingSite}
Ops: ${SOCIAL_LINKS.website}
    `;
    ctx.replyWithMarkdown(welcomeMessage.trim(), mainMenuKeyboard());
  });

  bot.command('menu', (ctx) => {
    ctx.reply('Choose a category:', mainMenuKeyboard());
  });

  bot.command('latest', (ctx) => {
    ctx.replyWithMarkdown(`
📺 *Latest Videos*

📚 *Homework Palette* demos, parent tips, and lesson-recorder clips — coming soon.

Subscribe with /subscribe to get notified when new videos drop!
Get the app: ${PRODUCT_LINKS.appStore}
    `);
  });

  bot.command('app', (ctx) => {
    ctx.replyWithMarkdown(`
📚 *${BRAND.name}*

Native iPhone & iPad homework app for grades 1–6.
Built for families — Khmer & English.

🆓 *Free:* library, print, worksheet builder, read-aloud, lesson recorder
⭐ *Palette Pro:* in-app quizzes with scores & progress

🌐 ${PRODUCT_LINKS.marketingSite}
📱 ${PRODUCT_LINKS.appStore}
    `, Markup.inlineKeyboard([
      [Markup.button.url('📱 Download on the App Store', PRODUCT_LINKS.appStore)],
      [Markup.button.url('🌐 homework.chakriya.net', PRODUCT_LINKS.marketingSite)],
      [Markup.button.callback('🔔 Notify Me on Updates', 'notify_app')],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.command('features', (ctx) => {
    ctx.replyWithMarkdown(`
✨ *${BRAND.name} — Features*

📚 *Free library* — 100 exercises per grade, browse & print
🛠️ *Builder* — photos, voice notes, custom worksheets
🔊 *Read-aloud* — offline Khmer & English
🎥 *Lesson recorder* — screen + optional face/mic; finishes in the background
🔔 *Video ready* — optional notification when export completes
⭐ *Palette Pro* — in-app quizzes & progress

Poster for sharing: ${PRODUCT_LINKS.poster}
    `, Markup.inlineKeyboard([
      [Markup.button.url('📱 Get the app', PRODUCT_LINKS.appStore)],
      [Markup.button.url('🖼️ Share poster', PRODUCT_LINKS.poster)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.command('download', (ctx) => {
    ctx.replyWithMarkdown(`
📱 *Download ${BRAND.name}*

Free on the App Store — grades 1–6 homework for families.

${PRODUCT_LINKS.appStore}

Site: ${PRODUCT_LINKS.marketingSite}
    `, Markup.inlineKeyboard([
      [Markup.button.url('📱 App Store', PRODUCT_LINKS.appStore)],
      [Markup.button.url('🌐 Website', PRODUCT_LINKS.marketingSite)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  // Keep /products as alias → download/app summary
  bot.command('products', (ctx) => {
    ctx.replyWithMarkdown(`
🛒 *${BRAND.name}*

📱 Free on the App Store (id 6801068446)
⭐ Palette Pro unlocks in-app quizzes

🌐 ${PRODUCT_LINKS.marketingSite}
🖼️ Poster: ${PRODUCT_LINKS.poster}

Love the free library? /donate to support development.
    `, Markup.inlineKeyboard([
      [Markup.button.url('📱 App Store', PRODUCT_LINKS.appStore)],
      [Markup.button.url('🌐 Website', PRODUCT_LINKS.marketingSite)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.command('donate', (ctx) => {
    ctx.replyWithMarkdown(`
💝 *Support ${BRAND.name}*

The grade 1–6 library, builder, read-aloud, and lesson recorder stay free.
Your support helps us keep shipping updates for families.

☕ *Buy Me a Coffee* — One-time support
🎯 *GitHub Sponsors* — Monthly sponsorship
🎨 *Patreon* — Exclusive updates & early access
💬 *YouTube Super Chat* — Support during streams

Thank you for being part of the community! 🙏
    `, Markup.inlineKeyboard([
      [Markup.button.url('☕ Buy Me a Coffee', DONATE_LINKS.buyMeACoffee)],
      [Markup.button.url('🎯 GitHub Sponsors', DONATE_LINKS.githubSponsors)],
      [Markup.button.url('🎨 Patreon', DONATE_LINKS.patreon)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.command('links', (ctx) => {
    ctx.replyWithMarkdown(`
🔗 *Links*

📺 YouTube: [Subscribe](${SOCIAL_LINKS.youtube})
📘 Facebook: [Follow](${SOCIAL_LINKS.facebook})
📷 Instagram: [Follow](${SOCIAL_LINKS.instagram})
📱 TikTok: [Follow](${SOCIAL_LINKS.tiktok})
💬 Telegram: You're already here!

📱 App Store: [Download](${PRODUCT_LINKS.appStore})
🌐 Site: [homework.chakriya.net](${PRODUCT_LINKS.marketingSite})
🖼️ Poster: [Share](${PRODUCT_LINKS.poster})
📊 Ops: [social.chakriya.net](${SOCIAL_LINKS.website})
    `, Markup.inlineKeyboard([
      [Markup.button.url('📱 App Store', PRODUCT_LINKS.appStore)],
      [Markup.button.url('💝 Support Us', DONATE_LINKS.buyMeACoffee)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.command('subscribe', (ctx) => {
    const userName = ctx.from.first_name;
    ctx.replyWithMarkdown(`
✅ *Subscribed!*

Hey ${userName}, you'll receive notifications for:
🔔 New YouTube uploads
🔔 ${BRAND.name} updates
🔔 Special announcements

To unsubscribe, use /unsubscribe
    `);
  });

  bot.command('unsubscribe', (ctx) => {
    ctx.replyWithMarkdown('🔕 You have been unsubscribed from notifications.');
  });

  bot.command('help', (ctx) => {
    let msg = `
📖 *Available Commands*

🏠 /start — Welcome message
📋 /menu — Interactive menu
📺 /latest — Latest video uploads
📚 /app — About Homework Palette
✨ /features — Free & Palette Pro
📱 /download — App Store link
🛒 /products — App summary
💝 /donate — Support our work
🔗 /links — Social & website links
🔔 /subscribe — Get notifications
🔕 /unsubscribe — Stop notifications
❓ /help — This help message`;

    if (isAdmin(ctx)) {
      msg += `

🔧 *Admin Commands*
📡 /media — Media management menu
📺 /yt\\_info · /yt\\_desc · /yt\\_alerts
📘 /fb\\_info · /fb\\_about · /fb\\_desc · /fb\\_web
💬 /tg\\_info · /tg\\_desc · /tg\\_short
📷 /ig\\_info · 📱 /tk\\_info`;
    }

    ctx.replyWithMarkdown(msg.trim());
  });
}

function mainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📚 About App', 'menu_app'),
      Markup.button.callback('✨ Features', 'menu_features'),
    ],
    [
      Markup.button.callback('📱 Download', 'menu_download'),
      Markup.button.callback('📺 Latest Video', 'menu_latest'),
    ],
    [
      Markup.button.callback('🔗 Social Links', 'menu_links'),
      Markup.button.callback('💝 Support Us', 'menu_donate'),
    ],
    [
      Markup.button.callback('🔔 Subscribe', 'menu_subscribe'),
    ],
  ]);
}
