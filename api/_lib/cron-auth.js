export function authorizeCronRequest(req, res) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  const authHeader = req.headers.authorization || '';

  if (authHeader === `Bearer ${secret}`) {
    return true;
  }

  res.status(401).json({ error: 'Unauthorized cron request' });
  return false;
}
