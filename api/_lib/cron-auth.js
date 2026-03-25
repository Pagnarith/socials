import { timingSafeEqual } from 'crypto';

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function authorizeCronRequest(req, res) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  const authHeader = req.headers.authorization || '';
  const expected = `Bearer ${secret}`;

  if (authHeader.length === expected.length && safeEqual(authHeader, expected)) {
    return true;
  }

  res.status(401).json({ error: 'Unauthorized cron request' });
  return false;
}
