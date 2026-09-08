/** Safe Telegram replies — prefer HTML to avoid Markdown `_` URL parse failures. */

export function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function replyHtml(ctx, html, extra = {}) {
  return ctx.reply(html, { parse_mode: 'HTML', ...extra });
}
