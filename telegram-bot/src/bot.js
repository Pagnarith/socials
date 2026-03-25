import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { registerCommands } from './commands/index.js';
import { registerHandlers } from './handlers/index.js';
import { scheduledJobs } from './scheduler.js';

dotenv.config({ path: '../.env' });

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Bot info
bot.botInfo = { username: 'SocialsCreatorBot' };

// Register all commands
registerCommands(bot);

// Register message handlers
registerHandlers(bot);

// Setup scheduled messages
scheduledJobs(bot);

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Launch bot
bot.launch()
  .then(() => console.log('🤖 Telegram bot is running...'))
  .catch((err) => console.error('Failed to start bot:', err));
