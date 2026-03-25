import { Markup } from 'telegraf';
import { SOCIAL_LINKS } from '../config.js';
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
🔹 /rhino3d — Rhino 3D tutorials
🔹 /links — All social media links
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
Coming soon — currently in development!

🛒 *Marketplace:* Our Add-ons will be available on the Microsoft Minecraft Marketplace.

📺 *Tutorials:* Watch our YouTube channel for Add-on demos and development tutorials.

Use /links to find all our channels!
    `, Markup.inlineKeyboard([
      [Markup.button.url('🎬 YouTube Channel', SOCIAL_LINKS.youtube)],
      [Markup.button.callback('🔔 Notify Me on Release', 'notify_minecraft')],
    ]));
  });

  // /rhino3d — Rhino 3D tutorial info
  bot.command('rhino3d', (ctx) => {
    ctx.replyWithMarkdown(`
🖥️ *Rhino 3D Tutorials*

Learn 3D modeling in Rhinoceros from scratch!

📚 *Tutorial Series:*
1. Getting Started with Rhino 3D
2. Curves & Surfaces Basics
3. Product Design Workflows
4. Grasshopper Parametric Design

📺 *Watch on YouTube:* Full-length tutorials
📱 *TikTok:* Quick tips & speed models

Use /links to find all our channels!
    `, Markup.inlineKeyboard([
      [Markup.button.url('🎬 YouTube Tutorials', SOCIAL_LINKS.youtube)],
      [Markup.button.url('📱 TikTok Tips', SOCIAL_LINKS.tiktok)],
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

🛒 Minecraft Marketplace: Coming soon!
    `);
  });

  // /subscribe — Toggle notification subscription
  bot.command('subscribe', (ctx) => {
    const userId = ctx.from.id;
    const userName = ctx.from.first_name;
    // In production, save to Dataverse
    ctx.replyWithMarkdown(`
✅ *Subscribed!* 

Hey ${userName}, you'll receive notifications for:
🔔 New YouTube video uploads
🔔 Minecraft Add-on releases
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
🖥️ /rhino3d — Rhino 3D tutorial info
🔗 /links — Social media links
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
      Markup.button.callback('📺 Latest Video', 'menu_latest'),
      Markup.button.callback('🔗 Social Links', 'menu_links'),
    ],
    [
      Markup.button.callback('🔔 Subscribe', 'menu_subscribe'),
    ],
  ]);
}
