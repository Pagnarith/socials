import { createBot, ensureBotInfo } from '../telegram-bot/src/createBot.js';

const bot = createBot();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, service: 'telegram-webhook' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await ensureBotInfo(bot);

    const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
    const callback = bot.webhookCallback('/api/telegram-webhook', {
      // Only enforce when configured — avoids silent 401s if env drifts.
      ...(secret ? { secretToken: secret } : {}),
    });

    return await callback(req, res);
  } catch (error) {
    console.error('Webhook handler error:', error);
    if (!res.headersSent) {
      // Still 200 so Telegram does not hammer retries on app bugs.
      return res.status(200).json({ ok: true });
    }
  }
}
