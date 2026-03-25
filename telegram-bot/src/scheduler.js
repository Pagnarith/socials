// node-cron loaded lazily inside scheduledJobs() to avoid penalising serverless cold starts
const CAMBODIA_TIMEZONE = 'Asia/Phnom_Penh';

function getCambodiaDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CAMBODIA_TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );

  return parts;
}

function requireChannelId() {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!channelId) {
    throw new Error('No TELEGRAM_CHANNEL_ID set');
  }

  return channelId;
}

function dailyScheduleMessage() {
  const weekday = getCambodiaDateParts().weekday;
  const scheduleMap = {
    Sun: '📅 Sunday: Rest day — plan next week\'s content!',
    Mon: '📅 Monday: Post a Minecraft screenshot tip on Facebook & TikTok Rhino 3D speed model',
    Tue: '📅 Tuesday: Upload Minecraft Add-on video to YouTube!',
    Wed: '📅 Wednesday: Post Rhino 3D tutorial on Facebook & quick TikTok tip',
    Thu: '📅 Thursday: Upload Rhino 3D tutorial to YouTube!',
    Fri: '📅 Friday: Engagement posts on Facebook & trending TikTok',
    Sat: '📅 Saturday: Minecraft dev stream + highlight reel',
  };
  const dateParts = getCambodiaDateParts();
  const cambodiaDateLabel = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;

  return `
🔔 *Daily Content Reminder*

Cambodia date: ${cambodiaDateLabel} (${weekday})

${scheduleMap[weekday]}

Stay consistent, stay creative! 💪
    `;
}

function weeklyReviewMessage() {
  return `
📊 *Weekly Review Time!*

Check your analytics:
📺 YouTube Studio
📘 Facebook Insights
📱 TikTok Analytics

Questions to answer:
✅ Which video performed best?
✅ What content got most engagement?
✅ Are you on track for monetization goals?

Keep pushing forward! 🚀
    `;
}

function monthlyMilestoneMessage() {
  return `
🏆 *Monthly Milestone Check*

Review your progress:
📺 YouTube: Subscribers? Watch hours?
📘 Facebook: Page followers? Minutes viewed?
📱 TikTok: Followers? Avg views?
💰 Revenue: Any earnings this month?

Update your financial tracker in the dashboard!
    `;
}

async function sendScheduledMessage(bot, message) {
  const channelId = requireChannelId();
  return bot.telegram.sendMessage(channelId, message, { parse_mode: 'Markdown' });
}

function inferVideoPlatform(title = '') {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes('rhino') || normalizedTitle.includes('3d')) {
    return 'rhino';
  }

  if (normalizedTitle.includes('minecraft') || normalizedTitle.includes('add-on') || normalizedTitle.includes('addon')) {
    return 'minecraft';
  }

  return 'youtube';
}

export async function sendNewVideoAlert(bot, title, url, platform = 'youtube') {
  const emoji = platform === 'minecraft' ? '🎮' : platform === 'rhino' ? '🖥️' : '📺';
  const message = `
🔔 *New Video Alert!*

${emoji} *${title}*

▶️ Watch now: ${url}

Don't forget to like, comment & share! 🙌
    `;

  return sendScheduledMessage(bot, message);
}

export async function fetchLatestYouTubeUploads() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const lookbackMinutes = Number(process.env.YOUTUBE_ALERT_WINDOW_MINUTES || '70');

  if (!apiKey || !channelId) {
    throw new Error('Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID');
  }

  const publishedAfter = new Date(Date.now() - lookbackMinutes * 60 * 1000).toISOString();
  const searchParams = new URLSearchParams({
    key: apiKey,
    channelId,
    part: 'snippet',
    eventType: 'completed',
    maxResults: '5',
    order: 'date',
    publishedAfter,
    type: 'video'
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`YouTube API error: ${JSON.stringify(data)}`);
  }

  const items = Array.isArray(data.items) ? data.items : [];

  return items
    .filter((item) => item.id?.videoId && item.snippet?.title)
    .sort((left, right) => new Date(left.snippet.publishedAt) - new Date(right.snippet.publishedAt));
}

export async function checkAndSendLatestYouTubeAlert(bot, options = {}) {
  const { isAlreadyAlerted, markAlertSent } = options;
  const uploads = await fetchLatestYouTubeUploads();

  if (uploads.length === 0) {
    return { sent: false, count: 0 };
  }

  let sentCount = 0;

  for (const item of uploads) {
    const videoId = item.id.videoId;
    const pendingAlert = {
      videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${videoId}`
    };

    if (isAlreadyAlerted && (await isAlreadyAlerted(pendingAlert))) {
      continue;
    }

    const title = pendingAlert.title;
    const url = pendingAlert.url;
    await sendNewVideoAlert(bot, title, url, inferVideoPlatform(title));

    if (markAlertSent) {
      await markAlertSent(pendingAlert);
    }

    sentCount += 1;
  }

  return { sent: sentCount > 0, count: sentCount, found: uploads.length };
}

export async function sendDailyContentReminder(bot) {
  return sendScheduledMessage(bot, dailyScheduleMessage());
}

export async function sendWeeklyReviewReminder(bot) {
  return sendScheduledMessage(bot, weeklyReviewMessage());
}

export async function sendMonthlyMilestoneReminder(bot) {
  return sendScheduledMessage(bot, monthlyMilestoneMessage());
}

// Lightweight message generators for cron endpoints (no bot/telegraf needed)
export function getDailyContentMessage() { return dailyScheduleMessage(); }
export function getWeeklyReviewMessage() { return weeklyReviewMessage(); }
export function getMonthlyMilestoneMessage() { return monthlyMilestoneMessage(); }

export function scheduledJobs(bot) {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  try {
    requireChannelId();
  } catch {
    console.log('⚠️  No TELEGRAM_CHANNEL_ID set — scheduled posts disabled');
    return;
  }

  // Lazy-load node-cron — only needed in the long-running bot process
  import('node-cron').then(({ default: cron }) => {
    // Daily content reminder — every day at 9:00 AM
    cron.schedule('0 9 * * *', () => {
      sendDailyContentReminder(bot).catch((error) => {
        console.error('Failed to send daily content reminder:', error);
      });
    }, { timezone: CAMBODIA_TIMEZONE });

    // Weekly analytics reminder — every Monday at 10:00 AM
    cron.schedule('0 10 * * 1', () => {
      sendWeeklyReviewReminder(bot).catch((error) => {
        console.error('Failed to send weekly review reminder:', error);
      });
    }, { timezone: CAMBODIA_TIMEZONE });

    // Monthly milestone check — 1st of every month at 10:00 AM
    cron.schedule('0 10 1 * *', () => {
      sendMonthlyMilestoneReminder(bot).catch((error) => {
        console.error('Failed to send monthly milestone reminder:', error);
      });
    }, { timezone: CAMBODIA_TIMEZONE });

    // Hourly YouTube upload check
    cron.schedule('5 * * * *', () => {
      checkAndSendLatestYouTubeAlert(bot).catch((error) => {
        console.error('Failed to check latest YouTube uploads:', error);
      });
    }, { timezone: CAMBODIA_TIMEZONE });

    console.log('⏰ Scheduled jobs initialized');
  }).catch((err) => {
    console.error('Failed to load node-cron:', err);
  });
}
