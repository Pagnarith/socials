export function requireApiKey(req, res, next) {
  const expected = process.env.PROMO_STUDIO_API_KEY?.trim();
  if (!expected || expected === 'change-me-to-a-long-random-string') {
    // Dev convenience: allow if unset, but warn via header
    res.setHeader('X-Promo-Studio-Auth', 'open-dev');
    return next();
  }

  const header = req.get('authorization') || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const key = bearer || req.get('x-api-key') || '';

  if (key !== expected) {
    return res.status(401).json({ error: 'Unauthorized — set Authorization: Bearer <PROMO_STUDIO_API_KEY>' });
  }
  return next();
}
