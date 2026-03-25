import { createBot } from '../telegram-bot/src/createBot.js';

const bot = createBot();
const callback = bot.webhookCallback('/api/telegram-webhook', {
  secretToken: process.env.TELEGRAM_WEBHOOK_SECRET
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, service: 'telegram-webhook' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    return await callback(req, res);
  } catch (error) {
    console.error('Webhook handler error:', error);
    if (!res.headersSent) {
      return res.status(200).json({ ok: true });
    }
  }
}
