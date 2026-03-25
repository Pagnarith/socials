export function registerHandlers(bot) {
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
    `);
  });

  bot.action('menu_rhino3d', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`
🖥️ *Rhino 3D Tutorials*

Learn professional 3D modeling from scratch.

📚 Beginner to Advanced series
📱 Quick tips on TikTok
📺 Full tutorials on YouTube
    `);
  });

  bot.action('menu_latest', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown('📺 Latest videos coming soon! Use /subscribe to get notified.');
  });

  bot.action('menu_links', (ctx) => {
    ctx.answerCbQuery();
    ctx.replyWithMarkdown(`
🔗 *Follow Us:*
📺 YouTube: https://youtube.com/channel/UC3yMwRX2Cz-08IRrS9tIHYg
📘 Facebook: https://www.facebook.com/chakriyanet
📱 TikTok: https://tiktok.com/@iprickypagnarith
📷 Instagram: https://instagram.com/iprickypagnarith
    `);
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

    if (text.includes('minecraft') || text.includes('add-on') || text.includes('addon')) {
      ctx.reply('🎮 Interested in Minecraft? Use /minecraft for all the details!');
    } else if (text.includes('rhino') || text.includes('3d') || text.includes('modeling')) {
      ctx.reply('🖥️ Looking for 3D tutorials? Use /rhino3d for our tutorial series!');
    } else if (text.includes('youtube') || text.includes('video')) {
      ctx.reply('📺 Check out our latest videos with /latest or find our channel with /links');
    } else if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      ctx.reply(`👋 Hey ${ctx.from.first_name}! Use /menu to see what I can help with.`);
    }
  });
}
