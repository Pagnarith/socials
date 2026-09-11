const DEFAULT_API_BASE = 'https://socials-seven-beta.vercel.app';

export function metricsApiBase() {
  return (process.env.NEXT_PUBLIC_METRICS_API_BASE || DEFAULT_API_BASE).replace(/\/$/, '');
}

export async function fetchOverviewMetrics({ signal } = {}) {
  const url = `${metricsApiBase()}/api/analytics/overview`;
  const res = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Metrics API HTTP ${res.status}`);
  }
  return data;
}

export function formatMetric(value, fallback = '—') {
  if (value == null || Number.isNaN(value)) return fallback;
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}
