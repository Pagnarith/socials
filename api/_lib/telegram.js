/**
 * Lightweight Telegram sender using raw fetch.
 * Used by cron endpoints to avoid loading the full Telegraf framework.
 */
export async function sendChannelMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN');
  if (!chatId) throw new Error('Missing TELEGRAM_CHANNEL_ID');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error: ${err}`);
  }

  return res.json();
}
