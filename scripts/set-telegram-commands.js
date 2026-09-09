import 'dotenv/config';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is not set');
  process.exit(1);
}

const COMMANDS = [
  { command: 'start', description: 'Welcome message' },
  { command: 'menu', description: 'Open main menu' },
  { command: 'today', description: "Today's content + video tips" },
  { command: 'content', description: 'Alias for /today' },
  { command: 'latest', description: 'Show latest video info' },
  { command: 'app', description: 'About Homework Palette' },
  { command: 'features', description: 'Free features & Palette Pro' },
  { command: 'download', description: 'App Store download link' },
  { command: 'products', description: 'App summary' },
  { command: 'donate', description: 'Support our work' },
  { command: 'links', description: 'Social & website links' },
  { command: 'subscribe', description: 'Subscribe to notifications' },
  { command: 'unsubscribe', description: 'Unsubscribe from notifications' },
  { command: 'help', description: 'Show all commands' },
];

async function callApi(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function main() {
  console.log('Setting bot commands...');
  const cmdRes = await callApi('setMyCommands', { commands: COMMANDS });
  console.log('setMyCommands:', cmdRes.ok ? 'OK' : cmdRes);

  console.log('Setting menu button to commands...');
  const menuRes = await callApi('setChatMenuButton', {
    menu_button: { type: 'commands' },
  });
  console.log('setChatMenuButton:', menuRes.ok ? 'OK' : menuRes);

  console.log('Done.');
}

main();
