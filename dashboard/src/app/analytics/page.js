'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchOverviewMetrics, formatMetric } from '../../lib/metrics';

function buildPlatformAnalytics(platforms = {}) {
  const yt = platforms.youtube || {};
  const fb = platforms.facebook || {};
  const ig = platforms.instagram || {};
  const tk = platforms.tiktok || {};
  const tg = platforms.telegram || {};
  const as = platforms.appStore || {};

  return [
    {
      name: 'YouTube',
      icon: '📺',
      color: 'border-red-300 dark:border-red-700',
      metrics: [
        { label: 'Subscribers', value: yt.ok ? yt.subscribers : 0, target: 1000, unit: 'subs' },
        { label: 'Watch Hours', value: yt.watchHours ?? 0, target: 4000, unit: 'hrs' },
        { label: 'Total Views', value: yt.ok ? yt.views : 0, unit: 'views' },
        { label: 'Videos Published', value: yt.ok ? yt.videos : 0, unit: '' },
      ],
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'border-blue-300 dark:border-blue-700',
      metrics: [
        { label: 'Page Followers', value: fb.ok ? fb.followers : 0, target: 10000, unit: 'followers' },
        { label: 'Page Reach (30d)', value: fb.reach ?? 0, unit: '' },
        { label: 'Minutes Viewed', value: fb.minutesViewed ?? 0, target: 600000, unit: 'min' },
      ],
    },
    {
      name: 'Instagram',
      icon: '📸',
      color: 'border-pink-300 dark:border-pink-700',
      metrics: [
        { label: 'Followers', value: ig.ok ? ig.followers : 0, target: 10000, unit: 'followers' },
        { label: 'Posts', value: ig.ok ? ig.posts : 0, unit: '' },
        { label: 'Reach (30d)', value: ig.reach ?? 0, unit: '' },
      ],
    },
    {
      name: 'TikTok',
      icon: '📱',
      color: 'border-gray-300 dark:border-gray-600',
      metrics: [
        { label: 'Followers', value: tk.ok ? tk.followers : 0, target: 10000, unit: 'followers' },
        { label: 'Total Views', value: tk.ok ? tk.views : 0, target: 100000, unit: 'views' },
      ],
    },
    {
      name: 'Telegram',
      icon: '💬',
      color: 'border-sky-300 dark:border-sky-700',
      metrics: [
        { label: 'Channel Members', value: tg.ok ? tg.subscribers : 0, unit: '' },
        { label: 'Channel', value: tg.title || '—', unit: '' },
      ],
    },
    {
      name: 'App Store',
      icon: '📚',
      color: 'border-violet-300 dark:border-violet-700',
      metrics: [
        { label: 'Downloads (all time)', value: as.ok && as.downloads != null ? as.downloads : 0, target: 1000, unit: 'units' },
        { label: 'Ratings', value: as.ok ? as.ratings ?? 0 : 0, unit: '' },
        { label: 'Pro products approved', value: as.ok ? as.proSubs : 0, target: 2, unit: '' },
      ],
    },
  ];
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchOverviewMetrics({ signal: controller.signal })
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const platformAnalytics = useMemo(
    () => buildPlatformAnalytics(data?.platforms),
    [data]
  );

  const totalFollowers = data?.totalFollowers ?? 0;
  const totalViews =
    (data?.platforms?.youtube?.views || 0) +
    (data?.platforms?.tiktok?.views || 0);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Live social reach from connected accounts
          {data?.fetchedAt ? ` · ${new Date(data.fetchedAt).toLocaleString()}` : ''}
          {loading ? ' · loading…' : ''}
          {error ? ` · ${error}` : ''}
        </p>
      </div>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Total Followers" value={formatMetric(totalFollowers, '0')} />
          <SummaryCard label="YouTube + TikTok Views" value={formatMetric(totalViews, '0')} />
          <SummaryCard
            label="Instagram Followers"
            value={formatMetric(data?.platforms?.instagram?.followers, '0')}
          />
          <SummaryCard
            label="Facebook Followers"
            value={formatMetric(data?.platforms?.facebook?.followers, '0')}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Platform Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {platformAnalytics.map((platform) => (
            <div
              key={platform.name}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${platform.color} p-5`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{platform.icon}</span>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{platform.name}</h3>
              </div>

              <div className="space-y-3">
                {platform.metrics.map((metric, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {typeof metric.value === 'number'
                          ? metric.value.toLocaleString()
                          : metric.value}
                        {metric.unit ? ` ${metric.unit}` : ''}
                      </span>
                    </div>
                    {metric.target && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              ((typeof metric.value === 'number' ? metric.value : 0) /
                                metric.target) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
