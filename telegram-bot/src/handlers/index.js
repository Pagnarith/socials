import { Markup } from 'telegraf';
import { SOCIAL_LINKS } from '../config.js';

const backButton = Markup.inlineKeyboard([
  [Markup.button.callback('🔙 Back to Menu', 'back_menu')]
]);

export function registerHandlers(bot) {
  // Back to menu handler
  bot.action('back_menu', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('Choose a category:', Markup.inlineKeyboard([
      [
        Markup.button.callback('🎮 Minecraft', 'menu_minecraft'),
        Markup.button.callback('🖥️ Rhino 3D', 'menu_rhino3d'),
      ],
      [
        Markup.button.callback('📺 Latest Video', 'menu_latest'),
        Markup.button.callback('🔗 Social Links', 'menu_links'),
      ],
      [
        Markup.button.callback('🔔 Subscribe', 'menu_subscribe'),
      ],
    ]));
  });

  // Handle inline button callbacks from main menu
  bot.action('menu_minecraft', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`
🎮 *Minecraft Add-ons*

We build custom Bedrock Edition Add-ons!

📦 Available: Coming soon
📺 Demos on YouTube
🛒 Microsoft Marketplace

What would you like to know?
    `, backButton);
  });

  bot.action('menu_rhino3d', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`
🖥️ *Rhino 3D Tutorials*

Learn professional 3D modeling from scratch.

📚 Beginner to Advanced series
📱 Quick tips on TikTok
📺 Full tutorials on YouTube
    `, backButton);
  });

  bot.action('menu_latest', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown('📺 Latest videos coming soon! Use /subscribe to get notified.', backButton);
  });

  bot.action('menu_links', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`
🔗 *Follow Us:*
📺 YouTube: ${SOCIAL_LINKS.youtube}
📘 Facebook: ${SOCIAL_LINKS.facebook}
📱 TikTok: ${SOCIAL_LINKS.tiktok}
📷 Instagram: ${SOCIAL_LINKS.instagram}
    `, backButton);
  });

  bot.action('menu_subscribe', (ctx) => {
    ctx.answerCbQuery('Subscribed! 🔔');
    ctx.replyWithMarkdown(`✅ You're now subscribed to notifications, ${ctx.from.first_name}!`);
  });

  bot.action('notify_minecraft', (ctx) => {
    ctx.answerCbQuery('You\'ll be notified on Add-on release! 🎮');
    ctx.reply('🔔 You\'ll get a notification when new Minecraft Add-ons are released!');
  });

  // Handle text messages — Auto-reply for common keywords
  bot.on('text', (ctx) => {
    const raw = ctx.message.text;
    if (!raw || raw.startsWith('/')) return; // commands handled by their own middleware
    const text = raw.toLowerCase();
    const match = (pattern) => pattern.test(text);

    if (match(/\b(?:minecraft|add-?on|addon)\b/)) {
      ctx.reply('🎮 Interested in Minecraft? Use /minecraft for all the details!');
    } else if (match(/\b(?:rhino|3d|modeling)\b/)) {
      ctx.reply('🖥️ Looking for 3D tutorials? Use /rhino3d for our tutorial series!');
    } else if (match(/\b(?:youtube|video)\b/)) {
      ctx.reply('📺 Check out our latest videos with /latest or find our channel with /links');
    } else if (match(/\b(?:hello|hi|hey)\b/)) {
      ctx.reply(`👋 Hey ${ctx.from.first_name}! Use /menu to see what I can help with.`);
    }
  });
}
