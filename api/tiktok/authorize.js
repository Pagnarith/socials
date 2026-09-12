import { buildAuthorizeUrl, createOAuthState, tiktokRedirectUri } from '../_lib/tiktok-oauth.js';

/**
 * Start TikTok Login Kit for @homeworkpalette.
 * GET /api/tiktok/authorize
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const state = createOAuthState();
    const url = buildAuthorizeUrl(state);
    res.setHeader(
      'Set-Cookie',
      `tiktok_oauth_state=${encodeURIComponent(state)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    );
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, url);
  } catch (error) {
    return res.status(500).send(htmlPage('TikTok authorize failed', `
      <p>${escapeHtml(error.message)}</p>
      <p>Redirect URI that must be registered in Login Kit:</p>
      <code>${escapeHtml(tiktokRedirectUri())}</code>
    `));
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function htmlPage(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
  <style>body{font-family:system-ui;max-width:720px;margin:40px auto;padding:0 16px;line-height:1.5}
  code{background:#f4f4f5;padding:2px 6px;border-radius:4px}</style></head>
  <body><h1>${escapeHtml(title)}</h1>${body}</body></html>`;
}
