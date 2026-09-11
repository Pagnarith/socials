import { collectOverviewMetrics } from '../_lib/metrics.js';

const ALLOWED_ORIGINS = new Set([
  'https://social.chakriya.net',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow non-browser clients (curl, server) without CORS.
    res.setHeader('Access-Control-Allow-Origin', 'https://social.chakriya.net');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const overview = await collectOverviewMetrics();
    return res.status(200).json({ ok: true, ...overview });
  } catch (error) {
    console.error('analytics/overview failed:', error);
    return res.status(500).json({ ok: false, error: error.message || 'Failed to load metrics' });
  }
}
