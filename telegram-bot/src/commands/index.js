import { Markup } from 'telegraf';
import { SOCIAL_LINKS, PRODUCT_LINKS, DONATE_LINKS } from '../config.js';
import { isAdmin } from '../admin.js';

export function registerCommands(bot) {
  // /start — Welcome message
  bot.start((ctx) => {
    const welcomeMessage = `
🎮 Welcome to *iPricky Pagnarith Bot*!

I'm your creative assistant for Minecraft Add-ons & Rhino 3D content.

🔹 /menu — Main menu
🔹 /latest — Latest video
🔹 /minecraft — Minecraft Add-on info
🔹 /rhino3d — Rhino 3D plugins & tutorials
🔹 /products — Our products & plugins
🔹 /links — All social media links
🔹 /donate — Support our work
🔹 /subscribe — Get notified for new content
🔹 /media — 📡 Manage all social media (admin)
🔹 /help — All commands

Visit: ${SOCIAL_LINKS.website}
Handle: @PagnarithImphan

Stay creative! 🎨
    `;
    ctx.replyWithMarkdown(welcomeMessage.trim(), mainMenuKeyboard());
  });

  // /menu — Interactive main menu
  bot.command('menu', (ctx) => {
    ctx.reply('Choose a category:', mainMenuKeyboard());
  });

  // /latest — Latest video info
  bot.command('latest', (ctx) => {
    ctx.replyWithMarkdown(`
📺 *Latest Videos*

🎮 *Minecraft:* Coming soon — stay tuned!
🖥️ *Rhino 3D:* Coming soon — stay tuned!

Subscribe with /subscribe to get notified when new videos drop!
    `);
  });

  // /minecraft — Minecraft Add-on info
  bot.command('minecraft', (ctx) => {
    ctx.replyWithMarkdown(`
🎮 *Minecraft Add-ons*

We create custom Add-ons for Minecraft Bedrock Edition!

📦 *Available Add-ons:*
• YuttTools — Helper Robot companion (craftable, tameable, dig/build modes)

🛒 *Marketplace:* Coming soon to the Microsoft Minecraft Marketplace.
🆓 *Free:* All Minecraft Add-ons are free for the community!

📺 *Tutorials:* Watch our YouTube channel for Add-on demos and development tutorials.

Use /products to see all our products!
    `, Markup.inlineKeyboard([
      [Markup.button.url('🎬 YouTube Channel', SOCIAL_LINKS.youtube)],
      [Markup.button.callback('🔔 Notify Me on Release', 'notify_minecraft')],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  // /rhino3d — Rhino 3D plugins & tutorials
  bot.command('rhino3d', (ctx) => {
    ctx.replyWithMarkdown(`
🖥️ *Rhino 3D — Plugins & Tutorials*

Professional plugins and tutorials for Rhinoceros 3D!

🔌 *Our Plugins (for sale):*
Enterprise-quality Rhino plugins built with clean architecture:
• Event-driven automation
• Geometry tools & surface operations
• Block management & navigation
• And more — see /products for the full catalog

📚 *Tutorial Series:*
1. Getting Started with Rhino 3D
2. Curves & Surfaces Basics
3. Product Design Workflows
4. Grasshopper Parametric Design
5. Plugin Development with C#

Browse plugins: ${PRODUCT_LINKS.rhinoStore}
    `, Markup.inlineKeyboard([
      [Markup.button.url('🛒 Browse Plugins', PRODUCT_LINKS.rhinoStore)],
      [Markup.button.url('🎬 YouTube Tutorials', SOCIAL_LINKS.youtube)],
      [Markup.button.url('📱 TikTok Tips', SOCIAL_LINKS.tiktok)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  // /products — All products & plugins
  bot.command('products', (ctx) => {
    ctx.replyWithMarkdown(`
🛒 *Our Products*

We build tools for creators and designers.

━━━ *FREE Products* ━━━
🎮 *Minecraft Add-ons*
• YuttTools — Helper Robot companion
• More add-ons coming soon
📥 Free on Microsoft Marketplace

━━━ *PAID Products* ━━━
🖥️ *Rhino 3D Plugins*
Professional-grade plugins for Rhinoceros 3D:
• Geometry & surface tools
• Block management suite
• Automation & workflow plugins
• Plugin bundle available
💰 Starting from $19

━━━ *Where to Buy* ━━━
🔗 food4Rhino: Official Rhino marketplace
🔗 Gumroad: Direct digital download
🔗 Website: ${PRODUCT_LINKS.productsPage}

Love our free content? /donate to support us! 💝
    `, Markup.inlineKeyboard([
      [Markup.button.url('🦏 food4Rhino Store', PRODUCT_LINKS.rhinoStore)],
      [Markup.button.url('🛍️ Gumroad Store', PRODUCT_LINKS.gumroad)],
      [Markup.button.url('🌐 Products Page', PRODUCT_LINKS.productsPage)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  // /donate — Support & donation links
  bot.command('donate', (ctx) => {
    ctx.replyWithMarkdown(`
💝 *Support Our Work*

Our Minecraft Add-ons and tutorials are free for everyone. Your support helps us keep creating!

☕ *Buy Me a Coffee* — One-time support
🎯 *GitHub Sponsors* — Monthly sponsorship
🎨 *Patreon* — Exclusive content & early access
💬 *YouTube Super Chat* — Support during live streams

Every contribution helps us:
• Build more free Minecraft Add-ons
• Create better Rhino 3D tutorials
• Keep our tools free & updated

Thank you for being part of the community! 🙏
    `, Markup.inlineKeyboard([
      [Markup.button.url('☕ Buy Me a Coffee', DONATE_LINKS.buyMeACoffee)],
      [Markup.button.url('🎯 GitHub Sponsors', DONATE_LINKS.githubSponsors)],
      [Markup.button.url('🎨 Patreon', DONATE_LINKS.patreon)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  // /links — All social media links
  bot.command('links', (ctx) => {
    ctx.replyWithMarkdown(`
🔗 *Our Social Media*

📺 YouTube: [Subscribe here](${SOCIAL_LINKS.youtube})
📘 Facebook: [Follow our page](${SOCIAL_LINKS.facebook})
📷 Instagram: [Follow us](${SOCIAL_LINKS.instagram})
📱 TikTok: [Follow us](${SOCIAL_LINKS.tiktok})
💬 Telegram: You're already here! 🎉

🛒 *Shop:*
🦏 Rhino Plugins: [food4Rhino](${PRODUCT_LINKS.rhinoStore})
🛍️ Digital Store: [Gumroad](${PRODUCT_LINKS.gumroad})
🌐 Website: [chakriya.net](${PRODUCT_LINKS.productsPage})
    `, Markup.inlineKeyboard([
      [Markup.button.url('🛒 Products', PRODUCT_LINKS.productsPage)],
      [Markup.button.url('💝 Support Us', DONATE_LINKS.buyMeACoffee)],
      [Markup.button.callback('🔙 Back to Menu', 'back_menu')],
    ]));
  });

  // /subscribe — Toggle notification subscription
  bot.command('subscribe', (ctx) => {
    const userName = ctx.from.first_name;
    ctx.replyWithMarkdown(`
✅ *Subscribed!* 

Hey ${userName}, you'll receive notifications for:
🔔 New YouTube video uploads
🔔 Minecraft Add-on releases
🔔 Rhino plugin updates
🔔 Special announcements

To unsubscribe, use /unsubscribe
    `);
  });

  // /unsubscribe
  bot.command('unsubscribe', (ctx) => {
    ctx.replyWithMarkdown('🔕 You have been unsubscribed from notifications.');
  });

  // /help — All available commands
  bot.command('help', (ctx) => {
    let msg = `
📖 *Available Commands*

🏠 /start — Welcome message
📋 /menu — Interactive menu
📺 /latest — Latest video uploads
🎮 /minecraft — Minecraft Add-on info
🖥️ /rhino3d — Rhino 3D plugins & tutorials
🛒 /products — Our products catalog
💝 /donate — Support our work
🔗 /links — Social media & store links
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
  ]);
}
