import { authorizeCronRequest } from '../_lib/cron-auth.js';
import { refreshUserAccessToken } from '../_lib/tiktok-oauth.js';

/**
 * Refresh TikTok user access token before 24h expiry.
 * Note: Vercel env vars are not writable from runtime — this endpoint
 * returns the new tokens so an admin/script can update Vercel env.
 *
 * For fully automatic refresh, store tokens in a writable secret store.
 */
export default async function handler(req, res) {
  if (!authorizeCronRequest(req, res)) return;

  const refresh = process.env.TIKTOK_REFRESH_TOKEN?.trim();
  if (!refresh) {
    return res.status(200).json({ ok: false, error: 'Missing TIKTOK_REFRESH_TOKEN' });
  }

  try {
    const token = await refreshUserAccessToken(refresh);
    return res.status(200).json({
      ok: true,
      message:
        'New tokens issued. Run scripts/set-tiktok-user-token.js with these values (runtime cannot mutate Vercel env).',
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_in: token.expires_in,
      refresh_expires_in: token.refresh_expires_in,
      scope: token.scope,
      open_id: token.open_id,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
