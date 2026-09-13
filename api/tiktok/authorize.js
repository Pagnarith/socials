import {
  buildAuthorizeUrl,
  createOAuthState,
  resolveTikTokEnv,
  tiktokRedirectUri,
} from '../_lib/tiktok-oauth.js';

/**
 * Start TikTok Login Kit for @homeworkpalette.
 * GET /api/tiktok/authorize?env=sandbox
 * Optional: &slash=1 (trailing slash on redirect_uri) &minimal=1 (user.info.basic only)
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const env = resolveTikTokEnv(req.query?.env || req.query?.sandbox);
  const trailingSlash =
    req.query?.slash === '1' ||
    req.query?.slash === 'true' ||
    process.env.TIKTOK_REDIRECT_TRAILING_SLASH === '1';
  const minimal = req.query?.minimal === '1' || req.query?.minimal === 'true';
  const scope = minimal ? 'user.info.basic' : undefined;

  try {
    const state = createOAuthState(env);
    const url = buildAuthorizeUrl(state, env, { trailingSlash, scope });
    res.setHeader(
      'Set-Cookie',
      [
        `tiktok_oauth_state=${encodeURIComponent(state)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        `tiktok_oauth_env=${env}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        `tiktok_oauth_slash=${trailingSlash ? '1' : '0'}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      ]
    );
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, url);
  } catch (error) {
    return res.status(500).send(htmlPage('TikTok authorize failed', `
      <p>${escapeHtml(error.message)}</p>
      <p>Mode: <code>${escapeHtml(env)}</code></p>
      <p>Register <strong>both</strong> redirect URIs in Sandbox Login Kit:</p>
      <pre>${escapeHtml(tiktokRedirectUri())}
${escapeHtml(tiktokRedirectUri({ trailingSlash: true }))}</pre>
      <p>Then <strong>Apply changes</strong> in Sandbox. Checklist:
      <a href="/api/tiktok/status">/api/tiktok/status</a></p>
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
  code,pre{background:#f4f4f5;padding:2px 6px;border-radius:4px} pre{padding:12px;overflow:auto}</style></head>
  <body><h1>${escapeHtml(title)}</h1>${body}</body></html>`;
}
