/**
 * Safe TikTok Login Kit diagnostics (no secrets).
 * GET /api/tiktok/status
 */
import { tiktokRedirectUri } from '../_lib/tiktok-oauth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const prodKey = process.env.TIKTOK_CLIENT_KEY?.trim() || '';
  const sandKey = process.env.TIKTOK_SANDBOX_CLIENT_KEY?.trim() || '';
  const prodSecret = Boolean(process.env.TIKTOK_CLIENT_SECRET?.trim());
  const sandSecret = Boolean(process.env.TIKTOK_SANDBOX_CLIENT_SECRET?.trim());
  const redirect = tiktokRedirectUri();

  return res.status(200).json({
    ok: true,
    redirect_uri: redirect,
    redirect_uri_trailing_slash: redirect.endsWith('/'),
    production: {
      client_key_set: Boolean(prodKey),
      client_key_prefix: prodKey.slice(0, 6) || null,
      client_key_len: prodKey.length,
      client_secret_set: prodSecret,
    },
    sandbox: {
      client_key_set: Boolean(sandKey),
      client_key_prefix: sandKey.slice(0, 6) || null,
      client_key_len: sandKey.length,
      client_secret_set: sandSecret,
    },
    authorize: {
      production: 'https://socials-seven-beta.vercel.app/api/tiktok/authorize',
      sandbox: 'https://socials-seven-beta.vercel.app/api/tiktok/authorize?env=sandbox',
    },
    checklist: [
      'TikTok Developers → toggle Sandbox (not Production)',
      'Sandbox → Apply changes after editing',
      'Sandbox → Products → Login Kit added for Web',
      'Sandbox Login Kit redirect URI must EXACTLY match redirect_uri above (try with and without trailing /)',
      'Sandbox → Target users includes the TikTok account you log in with',
      'Scopes user.info.basic (+ profile/stats) enabled in Sandbox',
    ],
  });
}
