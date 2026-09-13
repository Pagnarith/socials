/**
 * TikTok Login Kit helpers (user OAuth).
 * Docs: https://developers.tiktok.com/doc/login-kit-web
 *
 * Sandbox vs Production: TikTok issues a **different** client_key/secret in Sandbox.
 * While Production is "In review", use sandbox credentials + target users.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const TIKTOK_SCOPES = 'user.info.basic,user.info.profile,user.info.stats';
export const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
export const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';

export function tiktokRedirectUri(options = {}) {
  const configured = process.env.TIKTOK_REDIRECT_URI?.trim();
  let uri;
  if (configured) {
    uri = configured.replace(/\/$/, '');
    if (configured.includes('/api/tiktok/callback')) {
      uri = configured.split('?')[0].replace(/\/$/, '');
    }
  } else {
    const base = (
      process.env.TELEGRAM_WEBHOOK_BASE_URL ||
      'https://socials-seven-beta.vercel.app'
    ).replace(/\/$/, '');
    uri = base.includes('/api/tiktok/callback')
      ? base.split('?')[0].replace(/\/$/, '')
      : `${base}/api/tiktok/callback`;
  }
  if (options.trailingSlash) return `${uri}/`;
  return uri;
}

export function resolveTikTokEnv(raw) {
  const v = String(raw || '').toLowerCase();
  return v === 'sandbox' || v === '1' || v === 'true' ? 'sandbox' : 'production';
}

export function getTikTokCredentials(env = 'production') {
  const sandbox = env === 'sandbox';
  const clientKey = (
    sandbox ? process.env.TIKTOK_SANDBOX_CLIENT_KEY : process.env.TIKTOK_CLIENT_KEY
  )?.trim();
  const clientSecret = (
    sandbox ? process.env.TIKTOK_SANDBOX_CLIENT_SECRET : process.env.TIKTOK_CLIENT_SECRET
  )?.trim();

  if (!clientKey || !clientSecret) {
    throw new Error(
      sandbox
        ? 'Missing TIKTOK_SANDBOX_CLIENT_KEY / TIKTOK_SANDBOX_CLIENT_SECRET. Open TikTok Developers → Sandbox → Credentials (not Production), copy key+secret to Vercel, then redeploy.'
        : 'Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET'
    );
  }

  return { clientKey, clientSecret, env: sandbox ? 'sandbox' : 'production' };
}

function stateSecret() {
  return (
    process.env.TIKTOK_OAUTH_STATE_SECRET ||
    process.env.TELEGRAM_WEBHOOK_SECRET ||
    process.env.CRON_SECRET ||
    process.env.TIKTOK_CLIENT_SECRET ||
    ''
  );
}

export function createOAuthState(env = 'production') {
  const mode = resolveTikTokEnv(env);
  const nonce = randomBytes(16).toString('hex');
  const payload = `${mode}.${nonce}`;
  const secret = stateSecret();
  if (!secret) return payload;
  const sig = createHmac('sha256', secret).update(payload).digest('hex').slice(0, 24);
  return `${payload}.${sig}`;
}

export function parseOAuthState(state) {
  if (!state || typeof state !== 'string') return { ok: false };
  const parts = state.split('.');
  // mode.nonce.sig  OR legacy nonce.sig
  if (parts.length === 3) {
    const [mode, nonce, sig] = parts;
    const secret = stateSecret();
    if (!secret) return { ok: true, env: resolveTikTokEnv(mode) };
    const expected = createHmac('sha256', secret)
      .update(`${mode}.${nonce}`)
      .digest('hex')
      .slice(0, 24);
    try {
      if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return { ok: false };
    } catch {
      return { ok: false };
    }
    return { ok: true, env: resolveTikTokEnv(mode) };
  }
  if (parts.length === 2) {
    // Legacy production-only state
    if (!verifyOAuthStateLegacy(state)) return { ok: false };
    return { ok: true, env: 'production' };
  }
  return { ok: false };
}

function verifyOAuthStateLegacy(state) {
  const secret = stateSecret();
  if (!secret) return true;
  const [nonce, sig] = state.split('.');
  if (!nonce || !sig) return false;
  const expected = createHmac('sha256', secret).update(nonce).digest('hex').slice(0, 24);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** @deprecated use parseOAuthState */
export function verifyOAuthState(state) {
  return parseOAuthState(state).ok;
}

export async function exchangeAuthorizationCode(code, env = 'production', options = {}) {
  const { clientKey, clientSecret } = getTikTokCredentials(env);

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: tiktokRedirectUri({ trailingSlash: Boolean(options.trailingSlash) }),
  });

  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body,
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error || !data.access_token) {
    throw new Error(
      data.error_description || data.error || data.message || `Token exchange HTTP ${res.status}`
    );
  }
  return data;
}

export async function refreshUserAccessToken(refreshToken, env = 'production') {
  const { clientKey, clientSecret } = getTikTokCredentials(env);

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body,
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error || !data.access_token) {
    throw new Error(
      data.error_description || data.error || data.message || `Refresh HTTP ${res.status}`
    );
  }
  return data;
}

export function buildAuthorizeUrl(state, env = 'production', options = {}) {
  const { clientKey } = getTikTokCredentials(env);
  const redirectUri = tiktokRedirectUri({ trailingSlash: Boolean(options.trailingSlash) });

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: options.scope || TIKTOK_SCOPES,
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
    disable_auto_auth: '1',
  });
  return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}
