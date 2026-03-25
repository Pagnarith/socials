// Reusable admin guard for Telegram bot commands.

const ADMIN_IDS = [
  process.env.TELEGRAM_ADMIN_ID || '',
  process.env.TELEGRAM_ADMIN_IDS || ''
]
  .join(',')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

export function isAdmin(ctx) {
  const userId = String(ctx.from?.id);
  if (ADMIN_IDS.length === 0) return true; // no list → open (dev mode)
  return ADMIN_IDS.includes(userId);
}

export function adminOnly(ctx) {
  if (!isAdmin(ctx)) {
    ctx.reply('⛔ Admin-only command.');
    return false;
  }
  return true;
}
