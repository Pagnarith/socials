'use client';

import { useEffect, useState } from 'react';
import { fetchOverviewMetrics } from '../lib/metrics';

const BASE = [
  {
    platform: 'YouTube',
    icon: '📺',
    key: 'youtube',
    requirements: [
      { label: '1,000 subscribers', field: 'subscribers', target: 1000, unit: 'subs' },
      { label: '4,000 watch hours', field: 'watchHours', target: 4000, unit: 'hrs' },
    ],
    reward: 'YouTube Partner Program — Ad Revenue Enabled',
    color: 'border-red-300 dark:border-red-700',
  },
  {
    platform: 'Facebook',
    icon: '📘',
    key: 'facebook',
    requirements: [
      { label: '10,000 page followers', field: 'followers', target: 10000, unit: 'followers' },
      { label: '600,000 min viewed (60 days)', field: 'minutesViewed', target: 600000, unit: 'min' },
    ],
    reward: 'Facebook In-Stream Ads — Monetization Enabled',
    color: 'border-blue-300 dark:border-blue-700',
  },
  {
    platform: 'Instagram',
    icon: '📸',
    key: 'instagram',
    requirements: [
      { label: '10,000 followers', field: 'followers', target: 10000, unit: 'followers' },
      { label: 'Professional account setup', field: 'professional', target: 1, unit: 'status' },
    ],
    reward: 'Instagram Reels Bonus & Branded Content',
    color: 'border-pink-300 dark:border-pink-700',
  },
  {
    platform: 'TikTok',
    icon: '📱',
    key: 'tiktok',
    requirements: [
      { label: '10,000 followers', field: 'followers', target: 10000, unit: 'followers' },
      { label: '100,000 views (30 days)', field: 'views', target: 100000, unit: 'views' },
    ],
    reward: 'TikTok Creativity Program — Creator Revenue',
    color: 'border-gray-300 dark:border-gray-600',
  },
  {
    platform: 'App Store',
    icon: '📚',
    key: 'appStore',
    requirements: [
      { label: 'Homework Palette downloads', field: 'downloads', target: 1000, unit: 'downloads' },
      { label: 'Palette Pro products approved', field: 'proSubs', target: 2, unit: 'products' },
    ],
    reward: 'Sustainable App Store growth for free library + Pro quizzes',
    color: 'border-violet-300 dark:border-violet-700',
  },
];

function currentFor(platform, field) {
  if (!platform?.ok) {
    if (field === 'professional' && platform?.ok === false) return 0;
    return 0;
  }
  if (field === 'professional') return 1;
  const value = platform[field];
  return typeof value === 'number' ? value : 0;
}

export function MilestoneTracker() {
  const [platforms, setPlatforms] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    fetchOverviewMetrics({ signal: controller.signal })
      .then((data) => setPlatforms(data.platforms || {}))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {BASE.map((milestone) => {
        const live = platforms[milestone.key] || {};
        const requirements = milestone.requirements.map((req) => ({
          ...req,
          current: currentFor(live, req.field),
        }));

        const overallProgress =
          requirements.reduce((sum, req) => {
            return sum + Math.min((req.current / req.target) * 100, 100);
          }, 0) / requirements.length;

        return (
          <div key={milestone.platform} className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${milestone.color} p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{milestone.icon}</span>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{milestone.platform}</h3>
              <span className="ml-auto text-sm font-medium text-gray-500 dark:text-gray-400">
                {overallProgress.toFixed(0)}%
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-violet-500 h-2 rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            <div className="space-y-3">
              {requirements.map((req, i) => {
                const progress = Math.min((req.current / req.target) * 100, 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>{req.label}</span>
                      <span>
                        {req.current.toLocaleString()} / {req.target.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="bg-violet-400 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                🏆 <span className="font-medium">{milestone.reward}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
