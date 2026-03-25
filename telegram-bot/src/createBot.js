import { Telegraf } from 'telegraf';
import { registerCommands } from './commands/index.js';
import { registerMediaCommands } from './commands/media.js';
import { registerHandlers } from './handlers/index.js';
import { scheduledJobs } from './scheduler.js';

let scheduledJobsInitialized = false;

export function createBot() {
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
  if (process.env.ENABLE_TELEGRAM_SCHEDULER === '1' && !scheduledJobsInitialized) {
    scheduledJobs(bot);
    scheduledJobsInitialized = true;
  }

  bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}:`, err);
  });

  return bot;
}
