import cron from 'node-cron';

export function scheduledJobs(bot) {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!channelId) {
    console.log('⚠️  No TELEGRAM_CHANNEL_ID set — scheduled posts disabled');
    return;
  }

  // Daily content reminder — every day at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    const dayOfWeek = new Date().getDay();
    const scheduleMap = {
      0: '📅 Sunday: Rest day — plan next week\'s content!',
      1: '📅 Monday: Post a Minecraft screenshot tip on Facebook & TikTok Rhino 3D speed model',
      2: '📅 Tuesday: Upload Minecraft Add-on video to YouTube!',
      3: '📅 Wednesday: Post Rhino 3D tutorial on Facebook & quick TikTok tip',
      4: '📅 Thursday: Upload Rhino 3D tutorial to YouTube!',
      5: '📅 Friday: Engagement posts on Facebook & trending TikTok',
      6: '📅 Saturday: Minecraft dev stream + highlight reel',
    };

    bot.telegram.sendMessage(channelId, `
🔔 **Daily Content Reminder**

${scheduleMap[dayOfWeek]}

Stay consistent, stay creative! 💪
    `, { parse_mode: 'Markdown' });
  });

  // Weekly analytics reminder — every Monday at 10:00 AM
  cron.schedule('0 10 * * 1', () => {
    bot.telegram.sendMessage(channelId, `
📊 **Weekly Review Time!**

Check your analytics:
📺 YouTube Studio
📘 Facebook Insights
📱 TikTok Analytics

Questions to answer:
✅ Which video performed best?
✅ What content got most engagement?
✅ Are you on track for monetization goals?

Keep pushing forward! 🚀
    `, { parse_mode: 'Markdown' });
  });

  // Monthly milestone check — 1st of every month at 10:00 AM
  cron.schedule('0 10 1 * *', () => {
    bot.telegram.sendMessage(channelId, `
🏆 **Monthly Milestone Check**

Review your progress:
📺 YouTube: Subscribers? Watch hours?
📘 Facebook: Page followers? Minutes viewed?
📱 TikTok: Followers? Avg views?
💰 Revenue: Any earnings this month?

Update your financial tracker in the dashboard!
    `, { parse_mode: 'Markdown' });
  });

  // New video notification helper
  bot.newVideoNotification = (platform, title, url) => {
    const emoji = platform === 'minecraft' ? '🎮' : '🖥️';
    bot.telegram.sendMessage(channelId, `
🔔 **New Video Alert!**

${emoji} *${title}*

▶️ Watch now: ${url}

Don't forget to like, comment & share! 🙌
    `, { parse_mode: 'Markdown' });
  };

  console.log('⏰ Scheduled jobs initialized');
}
