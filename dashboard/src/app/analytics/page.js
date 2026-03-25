const platformAnalytics = [
  {
    name: 'YouTube',
    icon: '📺',
    color: 'border-red-300 dark:border-red-700',
    metrics: [
      { label: 'Subscribers', value: 0, target: 1000, unit: 'subs' },
      { label: 'Watch Hours', value: 0, target: 4000, unit: 'hrs' },
      { label: 'Total Views', value: 0, unit: 'views' },
      { label: 'Avg View Duration', value: '0:00', unit: '' },
      { label: 'Videos Published', value: 0, unit: '' },
    ],
  },
  {
    name: 'Facebook',
    icon: '📘',
    color: 'border-blue-300 dark:border-blue-700',
    metrics: [
      { label: 'Page Followers', value: 0, target: 10000, unit: 'followers' },
      { label: 'Page Reach (30d)', value: 0, unit: '' },
      { label: 'Minutes Viewed', value: 0, target: 600000, unit: 'min' },
      { label: 'Engagement Rate', value: '0%', unit: '' },
      { label: 'Posts Published', value: 0, unit: '' },
    ],
  },
  {
    name: 'Instagram',
    icon: '📸',
    color: 'border-pink-300 dark:border-pink-700',
    metrics: [
      { label: 'Followers', value: 8, target: 10000, unit: 'followers' },
      { label: 'Posts', value: 102, unit: '' },
      { label: 'Reels Views', value: 0, unit: 'views' },
      { label: 'Engagement Rate', value: '0%', unit: '' },
      { label: 'Reach (30d)', value: 0, unit: '' },
    ],
  },
  {
    name: 'TikTok',
    icon: '📱',
    color: 'border-gray-300 dark:border-gray-600',
    metrics: [
      { label: 'Followers', value: 0, target: 10000, unit: 'followers' },
      { label: 'Total Views', value: 0, target: 100000, unit: 'views' },
      { label: 'Avg Video Views', value: 0, unit: '' },
      { label: 'Engagement Rate', value: '0%', unit: '' },
      { label: 'Videos Published', value: 0, unit: '' },
    ],
  },
  {
    name: 'Telegram',
    icon: '💬',
    color: 'border-sky-300 dark:border-sky-700',
    metrics: [
      { label: 'Channel Members', value: 0, unit: '' },
      { label: 'Bot Users', value: 0, unit: '' },
      { label: 'Messages Sent (30d)', value: 0, unit: '' },
      { label: 'Active Users (7d)', value: 0, unit: '' },
    ],
  },
];

const weeklyTrends = [
  { week: 'W1', youtube: 0, facebook: 0, instagram: 0, tiktok: 0 },
  { week: 'W2', youtube: 0, facebook: 0, instagram: 0, tiktok: 0 },
  { week: 'W3', youtube: 0, facebook: 0, instagram: 0, tiktok: 0 },
  { week: 'W4', youtube: 0, facebook: 0, instagram: 0, tiktok: 0 },
];

export default function AnalyticsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cross-platform performance metrics and growth tracking</p>
      </div>

      {/* Summary Cards */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Total Followers" value="8" change="+0%" />
          <SummaryCard label="Total Views (30d)" value="0" change="+0%" />
          <SummaryCard label="Content Published" value="102" change="+0%" />
          <SummaryCard label="Total Revenue" value="$0.00" change="+0%" />
        </div>
      </section>

      {/* Platform Analytics */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Platform Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {platformAnalytics.map((platform) => (
            <div key={platform.name} className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${platform.color} p-5`}>
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
                        {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                        {metric.unit ? ` ${metric.unit}` : ''}
                      </span>
                    </div>
                    {metric.target && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min((typeof metric.value === 'number' ? metric.value : 0) / metric.target * 100, 100)}%` }}
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

      {/* Growth Trends (text-based) */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Weekly Growth Trend</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="text-left py-2 pr-4">Week</th>
                <th className="text-right py-2 px-4">📺 YouTube</th>
                <th className="text-right py-2 px-4">📘 Facebook</th>
                <th className="text-right py-2 px-4">📸 Instagram</th>
                <th className="text-right py-2 px-4">📱 TikTok</th>
              </tr>
            </thead>
            <tbody>
              {weeklyTrends.map((week) => (
                <tr key={week.week} className="border-b dark:border-gray-700 last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">{week.week}</td>
                  <td className="py-2 px-4 text-right text-gray-600 dark:text-gray-400">{week.youtube}</td>
                  <td className="py-2 px-4 text-right text-gray-600 dark:text-gray-400">{week.facebook}</td>
                  <td className="py-2 px-4 text-right text-gray-600 dark:text-gray-400">{week.instagram}</td>
                  <td className="py-2 px-4 text-right text-gray-600 dark:text-gray-400">{week.tiktok}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ label, value, change }) {
  const isPositive = change?.startsWith('+');
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {change && (
        <p className={`text-xs mt-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {change} vs last month
        </p>
      )}
    </div>
  );
}
