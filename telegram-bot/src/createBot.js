import { Telegraf } from 'telegraf';
import { registerCommands } from './commands/index.js';
import { registerMediaCommands } from './commands/media.js';
import { registerHandlers } from './handlers/index.js';

let cachedBot = null;
let scheduledJobsInitialized = false;
let botInfoPromise = null;

export function createBot() {
  if (cachedBot) return cachedBot;

  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN');
  }

  const bot = new Telegraf(token);

  // Do NOT hardcode botInfo — wrong username breaks /cmd@real_bot matching.
  registerCommands(bot);
  registerMediaCommands(bot);
  registerHandlers(bot);

  if (process.env.ENABLE_TELEGRAM_SCHEDULER === '1' && !scheduledJobsInitialized) {
    scheduledJobsInitialized = true;
    import('./scheduler.js')
      .then(({ scheduledJobs }) => scheduledJobs(bot))
      .catch((err) => console.error('Failed to init scheduler:', err));
  }

  bot.catch(async (err, ctx) => {
    console.error(`Error for ${ctx?.updateType}:`, err);
    try {
      if (ctx?.reply) {
        await ctx.reply('Sorry — that command failed. Try /menu or /help.');
      }
    } catch {
      // ignore secondary reply failures
    }
  });

  cachedBot = bot;
  return bot;
}

/** Ensure botInfo is loaded once (needed for reliable command matching in webhook mode). */
export async function ensureBotInfo(bot = createBot()) {
  if (bot.botInfo?.username) return bot.botInfo;
  if (!botInfoPromise) {
    botInfoPromise = bot.telegram.getMe().then((info) => {
      bot.botInfo = info;
      return info;
    }).catch((err) => {
      botInfoPromise = null;
      throw err;
    });
  }
  return botInfoPromise;
}
