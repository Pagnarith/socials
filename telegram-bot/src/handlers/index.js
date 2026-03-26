import { Markup } from 'telegraf';
import { SOCIAL_LINKS, PRODUCT_LINKS, DONATE_LINKS } from '../config.js';

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
        Markup.button.callback('🛒 Products', 'menu_products'),
        Markup.button.callback('📺 Latest Video', 'menu_latest'),
      ],
      [
        Markup.button.callback('🔗 Social Links', 'menu_links'),
        Markup.button.callback('💝 Support Us', 'menu_donate'),
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

📦 *YuttTools* — Helper Robot companion
🆓 Free for everyone
🛒 Coming to Microsoft Marketplace

What would you like to know?
    `, Markup.inlineKeyboard([
      [Markup.button.url('🎬 YouTube', SOCIAL_LINKS.youtube)],
      [Markup.button.callback('🔔 Notify Me', 'notify_minecraft')],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.action('menu_rhino3d', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`
🖥️ *Rhino 3D — Plugins & Tutorials*

Professional plugins and tutorials for Rhinoceros 3D.

🔌 *Plugins for sale* — Starting from $19
📚 Beginner to Advanced tutorials
📱 Quick tips on TikTok
📺 Full tutorials on YouTube
    `, Markup.inlineKeyboard([
      [Markup.button.url('🛒 Browse Plugins', PRODUCT_LINKS.rhinoStore)],
      [Markup.button.url('🎬 YouTube', SOCIAL_LINKS.youtube)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.action('menu_products', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`
🛒 *Our Products*

🎮 *Minecraft* — Free Add-ons for Bedrock Edition
🖥️ *Rhino Plugins* — Professional tools ($19-$149)
📦 *Bundle* — All plugins at discount ($199-$299)

Use /products for full details!
    `, Markup.inlineKeyboard([
      [Markup.button.url('🦏 food4Rhino', PRODUCT_LINKS.rhinoStore)],
      [Markup.button.url('🛍️ Gumroad', PRODUCT_LINKS.gumroad)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  bot.action('menu_donate', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`
💝 *Support Our Work*

Our free content takes time & effort to create.
Every contribution helps us keep going!

Use /donate for all support options.
    `, Markup.inlineKeyboard([
      [Markup.button.url('☕ Buy Me a Coffee', DONATE_LINKS.buyMeACoffee)],
      [Markup.button.url('🎯 GitHub Sponsors', DONATE_LINKS.githubSponsors)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
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
🛒 Shop: ${PRODUCT_LINKS.productsPage}
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
    if (!raw || raw.startsWith('/')) return;
    const text = raw.toLowerCase();
    const match = (pattern) => pattern.test(text);

    if (match(/\b(?:buy|purchase|price|pricing|store|shop)\b/)) {
      ctx.reply('🛒 Check out our products with /products — Rhino plugins starting from $19!');
    } else if (match(/\b(?:donate|support|sponsor|coffee|patreon)\b/)) {
      ctx.reply('💝 Thank you for wanting to support us! Use /donate to see all options.');
    } else if (match(/\b(?:plugin|rhino|3d|modeling)\b/)) {
      ctx.reply('🖥️ Interested in Rhino 3D? Use /rhino3d for plugins & tutorials!');
    } else if (match(/\b(?:minecraft|add-?on|addon)\b/)) {
      ctx.reply('🎮 Interested in Minecraft? Use /minecraft for all the details!');
    } else if (match(/\b(?:youtube|video)\b/)) {
      ctx.reply('📺 Check out our latest videos with /latest or find our channel with /links');
    } else if (match(/\b(?:hello|hi|hey)\b/)) {
      ctx.reply(`👋 Hey ${ctx.from.first_name}! Use /menu to see what I can help with.`);
    }
  });
}
