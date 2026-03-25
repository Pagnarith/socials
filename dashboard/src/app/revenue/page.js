const revenueStreams = [
  { platform: 'YouTube', source: 'Ad Revenue', current: 0, target: 100 },
  { platform: 'YouTube', source: 'Memberships', current: 0, target: 50 },
  { platform: 'YouTube', source: 'Sponsorships', current: 0, target: 100 },
  { platform: 'Facebook', source: 'In-Stream Ads', current: 0, target: 50 },
  { platform: 'Facebook', source: 'Branded Content', current: 0, target: 30 },
  { platform: 'Instagram', source: 'Reels Bonus', current: 0, target: 20 },
  { platform: 'Instagram', source: 'Branded Content', current: 0, target: 20 },
  { platform: 'TikTok', source: 'Creativity Program', current: 0, target: 30 },
  { platform: 'TikTok', source: 'Brand Deals', current: 0, target: 50 },
  { platform: 'Minecraft', source: 'Marketplace Sales', current: 0, target: 200 },
];

const phases = [
  { name: 'Phase 1 (M1-3)', label: 'Foundation', revenue: '$0', description: 'Build audience, set up all platforms, create initial content library.' },
  { name: 'Phase 2 (M3-6)', label: 'Early Growth', revenue: '$25–50/mo', description: 'TikTok monetization, first affiliate income, growing subscriber base.' },
  { name: 'Phase 3 (M6-12)', label: 'Monetization', revenue: '$145–480/mo', description: 'YouTube Partner Program, Facebook In-Stream Ads, Instagram Reels bonus.' },
  { name: 'Phase 4 (M12-18)', label: 'Scale', revenue: '$530–1,950/mo', description: 'Brand deals, Minecraft Marketplace sales, sponsorship income.' },
  { name: 'Phase 5 (M18-24)', label: 'Authority', revenue: '$1,700–5,000/mo', description: 'Full monetization across all platforms, premium content, community products.' },
];

const monthlyLog = [
  { month: 'Mar 2026', youtube: 0, facebook: 0, instagram: 0, tiktok: 0, minecraft: 0, total: 0 },
];

export default function RevenuePage() {
  const totalCurrent = revenueStreams.reduce((s, r) => s + r.current, 0);
  const totalTarget = revenueStreams.reduce((s, r) => s + r.target, 0);

  const platformTotals = revenueStreams.reduce((acc, r) => {
    acc[r.platform] = (acc[r.platform] || 0) + r.current;
    return acc;
  }, {});

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Financial tracking and monetization roadmap</p>
      </div>

      {/* Revenue Summary */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Monthly Revenue</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">${totalCurrent.toFixed(2)}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Target</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">${totalTarget.toFixed(2)}</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div
            className="bg-green-500 h-4 rounded-full transition-all flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${Math.max(Math.min((totalCurrent / totalTarget) * 100, 100), 0)}%` }}
          >
            {totalTarget > 0 ? `${((totalCurrent / totalTarget) * 100).toFixed(0)}%` : ''}
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">${totalCurrent} of ${totalTarget} monthly target</p>
      </section>

      {/* Revenue Streams Breakdown */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Revenue Streams</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="text-left py-3 px-4">Platform</th>
                <th className="text-left py-3 px-4">Source</th>
                <th className="text-right py-3 px-4">Current</th>
                <th className="text-right py-3 px-4">Target</th>
                <th className="text-right py-3 px-4 hidden sm:table-cell">Progress</th>
              </tr>
            </thead>
            <tbody>
              {revenueStreams.map((stream, i) => {
                const pct = stream.target > 0 ? Math.min((stream.current / stream.target) * 100, 100) : 0;
                return (
                  <tr key={i} className="border-b dark:border-gray-700 last:border-0">
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{stream.platform}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{stream.source}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-800 dark:text-gray-200">${stream.current}</td>
                    <td className="py-3 px-4 text-right text-gray-500 dark:text-gray-400">${stream.target}</td>
                    <td className="py-3 px-4 text-right hidden sm:table-cell">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 ml-auto">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 dark:bg-gray-750 font-semibold">
                <td className="py-3 px-4 text-gray-800 dark:text-gray-200" colSpan={2}>Total</td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-white">${totalCurrent}</td>
                <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">${totalTarget}</td>
                <td className="py-3 px-4 hidden sm:table-cell" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* Financial Roadmap */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Financial Roadmap</h2>
        <div className="space-y-4">
          {phases.map((phase, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5 flex flex-col sm:flex-row gap-4">
              <div className="sm:w-48 flex-shrink-0">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{phase.name}</span>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{phase.label}</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">{phase.revenue}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">{phase.description}</p>
              </div>
              <div className="flex-shrink-0 self-center">
                {i === 0 ? (
                  <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-medium">Current Phase</span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 font-medium">Upcoming</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Monthly Revenue Log */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Monthly Revenue Log</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="text-left py-2 pr-4">Month</th>
                <th className="text-right py-2 px-3">YouTube</th>
                <th className="text-right py-2 px-3">Facebook</th>
                <th className="text-right py-2 px-3">Instagram</th>
                <th className="text-right py-2 px-3">TikTok</th>
                <th className="text-right py-2 px-3">Minecraft</th>
                <th className="text-right py-2 pl-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {monthlyLog.map((row) => (
                <tr key={row.month} className="border-b dark:border-gray-700 last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">{row.month}</td>
                  <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">${row.youtube}</td>
                  <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">${row.facebook}</td>
                  <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">${row.instagram}</td>
                  <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">${row.tiktok}</td>
                  <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">${row.minecraft}</td>
                  <td className="py-2 pl-3 text-right font-semibold text-gray-800 dark:text-gray-200">${row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
