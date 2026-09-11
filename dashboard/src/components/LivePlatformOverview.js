'use client';

import { useEffect, useState } from 'react';
import { PlatformCard } from './PlatformCard';
import { fetchOverviewMetrics, formatMetric } from '../lib/metrics';

const GOALS = {
  youtube: '1K subs + 4K watch hrs',
  facebook: '10K followers + 600K min',
  instagram: '10K followers + Reels growth',
  tiktok: '10K followers + 100K views',
  telegram: 'Build community',
  appStore: '1K downloads + Palette Pro',
};

function buildCards(platforms = {}) {
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
      color: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
      stats: {
        subscribers: formatMetric(yt.ok ? yt.subscribers : null),
        views: formatMetric(yt.ok ? yt.views : null),
        watchHours: formatMetric(yt.watchHours, yt.ok ? 'n/a' : '—'),
      },
      goal: GOALS.youtube,
      error: yt.ok === false ? yt.error : null,
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
      stats: {
        followers: formatMetric(fb.ok ? fb.followers : null),
        reach: formatMetric(fb.reach, fb.ok ? 'n/a' : '—'),
        minutesViewed: formatMetric(fb.minutesViewed, fb.ok ? 'n/a' : '—'),
      },
      goal: GOALS.facebook,
      error: fb.ok === false ? fb.error : null,
    },
    {
      name: 'Instagram',
      icon: '📸',
      color: 'bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800',
      stats: {
        followers: formatMetric(ig.ok ? ig.followers : null),
        posts: formatMetric(ig.ok ? ig.posts : null),
        reach: formatMetric(ig.reach, ig.ok ? 'n/a' : '—'),
      },
      goal: GOALS.instagram,
      error: ig.ok === false ? ig.error : null,
    },
    {
      name: 'TikTok',
      icon: '📱',
      color: 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600',
      stats: {
        followers: formatMetric(tk.ok ? tk.followers : null),
        views: formatMetric(tk.ok ? tk.views : null),
        status: tk.ok ? 'live' : 'needs OAuth',
      },
      goal: GOALS.tiktok,
      error: tk.ok === false ? tk.error : null,
    },
    {
      name: 'Telegram',
      icon: '💬',
      color: 'bg-sky-50 border-sky-200 dark:bg-sky-950 dark:border-sky-800',
      stats: {
        subscribers: formatMetric(tg.ok ? tg.subscribers : null),
        channel: tg.title || '—',
      },
      goal: GOALS.telegram,
      error: tg.ok === false ? tg.error : null,
    },
    {
      name: 'App Store',
      icon: '📚',
      color: 'bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-800',
      stats: {
        downloads: formatMetric(as.ok ? as.downloads : null),
        proSubs: formatMetric(as.ok ? as.proSubs : null),
        status: as.ok ? 'live' : 'ASC pending',
      },
      goal: GOALS.appStore,
      error: as.ok === false ? as.error : null,
    },
  ];
}

export function LivePlatformOverview() {
  const [cards, setCards] = useState(() => buildCards());
  const [meta, setMeta] = useState({ loading: true, error: null, fetchedAt: null });

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      try {
        setMeta((m) => ({ ...m, loading: true, error: null }));
        const data = await fetchOverviewMetrics({ signal: controller.signal });
        if (cancelled) return;
        setCards(buildCards(data.platforms));
        setMeta({ loading: false, error: null, fetchedAt: data.fetchedAt });
      } catch (error) {
        if (cancelled || error.name === 'AbortError') return;
        setMeta({ loading: false, error: error.message, fetchedAt: null });
      }
    }

    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(id);
    };
  }, []);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Platform Overview</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {meta.loading && 'Refreshing live metrics…'}
          {!meta.loading && meta.fetchedAt && (
            <>Live · updated {new Date(meta.fetchedAt).toLocaleString()}</>
          )}
          {!meta.loading && meta.error && (
            <span className="text-amber-600 dark:text-amber-400">Metrics unavailable: {meta.error}</span>
          )}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div key={card.name} className="space-y-1">
            <PlatformCard
              name={card.name}
              icon={card.icon}
              color={card.color}
              stats={card.stats}
              goal={card.goal}
            />
            {card.error && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 px-1 line-clamp-2" title={card.error}>
                {card.error}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
