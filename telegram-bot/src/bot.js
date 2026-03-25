import dotenv from 'dotenv';
import { createBot } from './createBot.js';

dotenv.config({ path: '../.env' });

process.env.ENABLE_TELEGRAM_SCHEDULER = process.env.ENABLE_TELEGRAM_SCHEDULER || '1';

const bot = createBot();

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Launch bot
bot.launch()
  .then(() => console.log('🤖 Telegram bot is running...'))
  .catch((err) => console.error('Failed to start bot:', err));
