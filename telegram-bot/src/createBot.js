import { Telegraf } from 'telegraf';
import { registerCommands } from './commands/index.js';
import { registerMediaCommands } from './commands/media.js';
import { registerHandlers } from './handlers/index.js';

let cachedBot = null;
let scheduledJobsInitialized = false;
let commandMenuConfigured = false;

const DEFAULT_BOT_COMMANDS = [
  { command: 'start', description: 'Welcome message' },
  { command: 'menu', description: 'Open main menu' },
  { command: 'latest', description: 'Show latest video info' },
  { command: 'minecraft', description: 'Minecraft add-on info' },
  { command: 'rhino3d', description: 'Rhino 3D tutorial info' },
  { command: 'links', description: 'Social media links' },
  { command: 'subscribe', description: 'Subscribe to notifications' },
  { command: 'unsubscribe', description: 'Unsubscribe from notifications' },
  { command: 'help', description: 'Show all commands' }
];

async function configureTelegramCommandMenu(bot) {
  if (commandMenuConfigured) return;

  try {
    await bot.telegram.callApi('setMyCommands', {
      commands: DEFAULT_BOT_COMMANDS
    });

    await bot.telegram.callApi('setChatMenuButton', {
      menu_button: { type: 'commands' }
    });

    commandMenuConfigured = true;
  } catch (error) {
    console.error('Failed to configure Telegram command menu:', error);
  }
}

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

  void configureTelegramCommandMenu(bot);

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
