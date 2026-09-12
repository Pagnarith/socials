/**
 * TikTok Login Kit helpers (user OAuth).
 * Docs: https://developers.tiktok.com/doc/login-kit-web
 */

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const TIKTOK_SCOPES = 'user.info.basic,user.info.profile,user.info.stats';
export const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
export const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';

export function tiktokRedirectUri() {
  const base = (
    process.env.TIKTOK_REDIRECT_URI ||
    process.env.TELEGRAM_WEBHOOK_BASE_URL ||
    'https://socials-seven-beta.vercel.app'
  ).replace(/\/$/, '');
  if (base.includes('/api/tiktok/callback')) return base;
  return `${base}/api/tiktok/callback`;
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

export function createOAuthState() {
  const nonce = randomBytes(16).toString('hex');
  const secret = stateSecret();
  if (!secret) return nonce;
  const sig = createHmac('sha256', secret).update(nonce).digest('hex').slice(0, 24);
  return `${nonce}.${sig}`;
}

export function verifyOAuthState(state) {
  if (!state || typeof state !== 'string') return false;
  const secret = stateSecret();
  if (!secret) return true; // best-effort if no secret configured
  const [nonce, sig] = state.split('.');
  if (!nonce || !sig) return false;
  const expected = createHmac('sha256', secret).update(nonce).digest('hex').slice(0, 24);
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function exchangeAuthorizationCode(code) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
  if (!clientKey || !clientSecret) {
    throw new Error('Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET');
  }

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: tiktokRedirectUri(),
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

export async function refreshUserAccessToken(refreshToken) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
  if (!clientKey || !clientSecret) {
    throw new Error('Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET');
  }

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

export function buildAuthorizeUrl(state) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  if (!clientKey) throw new Error('Missing TIKTOK_CLIENT_KEY');

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: TIKTOK_SCOPES,
    response_type: 'code',
    redirect_uri: tiktokRedirectUri(),
    state,
    disable_auto_auth: '1',
  });
  return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}
