import {
  exchangeAuthorizationCode,
  parseOAuthState,
  tiktokRedirectUri,
} from '../_lib/tiktok-oauth.js';

/**
 * TikTok Login Kit callback.
 * GET /api/tiktok/callback?code=...&state=...
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  const { code, state, error, error_description: errorDescription, scopes } = req.query || {};

  if (error) {
    return res.status(400).send(
      htmlPage(
        'TikTok authorization denied',
        `<p>${escapeHtml(errorDescription || error)}</p>
         <p>If you saw <code>client_key</code> while Production is In review, use Sandbox credentials:
         <a href="/api/tiktok/authorize?env=sandbox">Authorize (Sandbox)</a></p>`
      )
    );
  }

  if (!code) {
    return res.status(400).send(
      htmlPage(
        'Missing authorization code',
        `<p>Register this exact redirect URI in TikTok Login Kit (Production <em>and</em> Sandbox):</p>
         <pre>${escapeHtml(tiktokRedirectUri())}</pre>
         <p><a href="/api/tiktok/authorize?env=sandbox">Start Login Kit (Sandbox)</a>
         · <a href="/api/tiktok/authorize">Production</a></p>`
      )
    );
  }

  const cookieHeader = req.headers.cookie || '';
  const cookies = parseCookie(cookieHeader);
  const cookieState = cookies.tiktok_oauth_state;
  const parsed = parseOAuthState(String(state || ''));
  const stateOk = parsed.ok && (!cookieState || cookieState === String(state));
  const env = parsed.env || cookies.tiktok_oauth_env || 'production';
  const trailingSlash = cookies.tiktok_oauth_slash === '1';

  if (!stateOk) {
    return res.status(400).send(
      htmlPage(
        'Invalid OAuth state',
        `<p>CSRF check failed. Close other tabs and
         <a href="/api/tiktok/authorize?env=sandbox">start again (Sandbox)</a>.</p>`
      )
    );
  }

  try {
    const token = await exchangeAuthorizationCode(String(code), env, { trailingSlash });
    const accessToken = token.access_token;
    const refreshToken = token.refresh_token;
    const openId = token.open_id;
    const scope = token.scope || scopes || '';
    const expiresIn = token.expires_in;

    let profile = null;
    let profileError = null;
    try {
      const fields = 'display_name,username,follower_count,likes_count,video_count';
      const infoRes = await fetch(
        `https://open.tiktokapis.com/v2/user/info/?fields=${fields}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(10000),
        }
      );
      const info = await infoRes.json();
      if (!infoRes.ok || info.error?.code) {
        profileError = info.error?.message || `user.info HTTP ${infoRes.status}`;
      } else {
        profile = info.data?.user || info.data || {};
      }
    } catch (e) {
      profileError = e.message;
    }

    const profileBlock = profile
      ? `<p><strong>@${escapeHtml(profile.username || 'homeworkpalette')}</strong> ·
           followers ${Number(profile.follower_count || 0).toLocaleString()} ·
           likes ${Number(profile.likes_count || 0).toLocaleString()} ·
           videos ${Number(profile.video_count || 0).toLocaleString()}</p>`
      : `<p class="warn">Token received but user.info failed: ${escapeHtml(profileError || 'unknown')}</p>
         <p>Ensure Login Kit scopes include <code>user.info.stats</code>.</p>`;

    return res.status(200).send(
      htmlPage(
        `TikTok Login Kit OK (${env})`,
        `
        <p>Signed in via <strong>${escapeHtml(env)}</strong>. Copy tokens into Vercel production env.</p>
        ${profileBlock}
        <p>Scopes: <code>${escapeHtml(scope)}</code> · open_id: <code>${escapeHtml(openId || '')}</code>
           · access expires in ${escapeHtml(String(expiresIn || ''))}s</p>

        <h2>1. Env block</h2>
        <pre id="envblock">TIKTOK_ACCESS_TOKEN=${escapeHtml(accessToken)}
TIKTOK_REFRESH_TOKEN=${escapeHtml(refreshToken || '')}
TIKTOK_OPEN_ID=${escapeHtml(openId || '')}
TIKTOK_TOKEN_ENV=${escapeHtml(env)}</pre>
        <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('envblock').innerText)">Copy env block</button>

        <h2>2. Push to Vercel</h2>
        <pre>cd socials
node scripts/set-tiktok-user-token.js --access '${escapeHtml(accessToken)}' --refresh '${escapeHtml(refreshToken || '')}'
vercel deploy --prod --yes</pre>

        <h2>3. Verify</h2>
        <pre>curl -sS https://socials-seven-beta.vercel.app/api/analytics/overview | jq .platforms.tiktok</pre>
        <p><a href="https://social.chakriya.net/">Open Social Ops dashboard</a></p>
        `
      )
    );
  } catch (error) {
    return res.status(500).send(
      htmlPage(
        'Token exchange failed',
        `<p>${escapeHtml(error.message)}</p>
         <p>Mode: <code>${escapeHtml(env)}</code> · Redirect URI: <code>${escapeHtml(tiktokRedirectUri())}</code></p>
         <p>Sandbox must use <strong>Sandbox</strong> client key/secret (different from Production).</p>
         <p><a href="/api/tiktok/authorize?env=sandbox">Try Sandbox again</a></p>`
      )
    );
  }
}

function parseCookie(header) {
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = decodeURIComponent(part.slice(idx + 1).trim());
    out[k] = v;
  }
  return out;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function htmlPage(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body{font-family:ui-sans-serif,system-ui;max-width:820px;margin:40px auto;padding:0 16px;line-height:1.5;color:#111}
    pre{background:#0f172a;color:#e2e8f0;padding:12px;border-radius:8px;overflow:auto;font-size:12px}
    code{background:#f4f4f5;padding:2px 6px;border-radius:4px}
    button{margin:8px 0 16px;padding:8px 12px;border-radius:8px;border:1px solid #cbd5e1;background:#fff;cursor:pointer}
    .warn{color:#b45309}
    a{color:#1d4ed8}
  </style></head>
  <body><h1>${escapeHtml(title)}</h1>${body}</body></html>`;
}
