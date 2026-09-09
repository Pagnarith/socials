import { Markup } from 'telegraf';
import { BRAND, SOCIAL_LINKS, PRODUCT_LINKS, DONATE_LINKS } from '../config.js';
import { escapeHtml, replyHtml } from '../reply.js';
import { formatTodayContentHtml } from '../todayContent.js';

const backButton = Markup.inlineKeyboard([
  [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
]);

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

export function registerHandlers(bot) {
  bot.action('back_menu', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Choose a category:', mainMenuKeyboard());
  });

  bot.action('menu_today', (ctx) => {
    ctx.answerCbQuery();
    const { text, keyboard } = formatTodayContentHtml();
    replyHtml(ctx, text, keyboard);
  });

  bot.action('menu_app', (ctx) => {
    ctx.answerCbQuery();
    replyHtml(ctx, `
📚 <b>${escapeHtml(BRAND.name)}</b>

${escapeHtml(BRAND.tagline)}

🆓 Free library, print, builder, read-aloud, lesson recorder
⭐ Palette Pro — in-app quizzes

Publisher: ${escapeHtml(BRAND.publisher)}
    `.trim(), Markup.inlineKeyboard([
      [Markup.button.url('📱 App Store', PRODUCT_LINKS.appStore)],
      [Markup.button.url('🌐 Website', PRODUCT_LINKS.marketingSite)],
      [Markup.button.callback('🔔 Notify Me', 'notify_app')],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.action('menu_features', (ctx) => {
    ctx.answerCbQuery();
    replyHtml(ctx, `
✨ <b>Features</b>

📚 Free grades 1–6 library
🛠️ Worksheet builder
🔊 Khmer &amp; English read-aloud
🎥 Lesson recorder with background finish
⭐ Palette Pro quizzes

Use /features for the full list.
    `.trim(), Markup.inlineKeyboard([
      [Markup.button.url('📱 Get the app', PRODUCT_LINKS.appStore)],
      [Markup.button.url('🖼️ Poster', PRODUCT_LINKS.poster)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.action('menu_download', (ctx) => {
    ctx.answerCbQuery();
    replyHtml(ctx, `
📱 <b>Download ${escapeHtml(BRAND.name)}</b>

Free on the App Store for iPhone &amp; iPad.

${escapeHtml(PRODUCT_LINKS.appStore)}
    `.trim(), Markup.inlineKeyboard([
      [Markup.button.url('📱 App Store', PRODUCT_LINKS.appStore)],
      [Markup.button.url('🌐 Website', PRODUCT_LINKS.marketingSite)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.action('menu_donate', (ctx) => {
    ctx.answerCbQuery();
    replyHtml(ctx, `
💝 <b>Support Our Work</b>

${escapeHtml(BRAND.name)} keeps the homework library free for families.
Every contribution helps us ship updates.

Use /donate for all support options.
    `.trim(), Markup.inlineKeyboard([
      [Markup.button.url('☕ Buy Me a Coffee', DONATE_LINKS.buyMeACoffee)],
      [Markup.button.url('🎯 GitHub Sponsors', DONATE_LINKS.githubSponsors)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.action('menu_latest', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('📺 Latest videos coming soon! Use /subscribe to get notified.', backButton);
  });

  bot.action('menu_links', (ctx) => {
    ctx.answerCbQuery();
    replyHtml(ctx, `
🔗 <b>Follow Us:</b>
📺 YouTube: <a href="${SOCIAL_LINKS.youtube}">Subscribe</a>
📘 Facebook: <a href="${SOCIAL_LINKS.facebook}">Follow</a>
📱 TikTok: <a href="${SOCIAL_LINKS.tiktok}">@homeworkpalette</a>
📷 Instagram: <a href="${SOCIAL_LINKS.instagram}">@homework_palette</a>
📱 App: <a href="${PRODUCT_LINKS.appStore}">App Store</a>
🌐 Site: <a href="${PRODUCT_LINKS.marketingSite}">homework.chakriya.net</a>
    `.trim(), backButton);
  });

  bot.action('menu_subscribe', (ctx) => {
    ctx.answerCbQuery('Subscribed! 🔔');
    ctx.reply(`✅ You're now subscribed to notifications, ${ctx.from.first_name}!`);
  });

  bot.action('notify_app', (ctx) => {
    ctx.answerCbQuery("You'll be notified on app updates! 📚");
    ctx.reply(`🔔 You'll get a notification when ${BRAND.name} has news or new videos!`);
  });

  bot.on('text', (ctx) => {
    const raw = ctx.message.text;
    if (!raw || raw.startsWith('/')) return;
    const text = raw.toLowerCase();
    const match = (pattern) => pattern.test(text);

    if (match(/\b(?:buy|purchase|price|pricing|store|shop|download|app\s*store)\b/)) {
      ctx.reply(`📱 Get ${BRAND.name} free on the App Store — use /download`);
    } else if (match(/\b(?:donate|support|sponsor|coffee|patreon)\b/)) {
      ctx.reply('💝 Thank you for wanting to support us! Use /donate to see all options.');
    } else if (match(/\b(?:today|content|schedule|calendar)\b/)) {
      const { text, keyboard } = formatTodayContentHtml();
      replyHtml(ctx, text, keyboard);
    } else if (match(/\b(?:feature|quiz|pro|recorder|library|homework|palette)\b/)) {
      ctx.reply(`📚 Interested in ${BRAND.name}? Use /app or /features.`);
    } else if (match(/\b(?:youtube|video)\b/)) {
      ctx.reply('📺 Check out our latest videos with /latest or find our channel with /links');
    } else if (match(/\b(?:hello|hi|hey)\b/)) {
      ctx.reply(`👋 Hey ${ctx.from.first_name}! Use /menu to see what I can help with.`);
    }
  });
}
