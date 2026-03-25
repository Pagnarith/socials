import { Telegraf } from 'telegraf';
import { registerCommands } from './commands/index.js';
import { registerMediaCommands } from './commands/media.js';
import { registerHandlers } from './handlers/index.js';

let cachedBot = null;
let scheduledJobsInitialized = false;

export function createBot() {
  if (cachedBot) return cachedBot;

  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN');
  }

  const bot = new Telegraf(token);

  bot.botInfo = { username: 'SocialsCreatorBot' };

  registerCommands(bot);
  registerMediaCommands(bot);
  registerHandlers(bot);

  // Cron jobs only make sense in a long-running process.
  // Lazy-import scheduler to avoid loading node-cron in serverless context.
  if (process.env.ENABLE_TELEGRAM_SCHEDULER === '1' && !scheduledJobsInitialized) {
    scheduledJobsInitialized = true;
    import('./scheduler.js')
      .then(({ scheduledJobs }) => scheduledJobs(bot))
      .catch((err) => console.error('Failed to init scheduler:', err));
  }

  bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
  });

  cachedBot = bot;
  return bot;
}
