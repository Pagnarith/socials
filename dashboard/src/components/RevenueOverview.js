const revenueStreams = [
  { platform: 'YouTube', source: 'Ad Revenue', current: 0, target: 100, currency: 'USD' },
  { platform: 'YouTube', source: 'Memberships', current: 0, target: 50, currency: 'USD' },
  { platform: 'Facebook', source: 'In-Stream Ads', current: 0, target: 50, currency: 'USD' },
  { platform: 'Instagram', source: 'Reels Bonus & Branded', current: 0, target: 40, currency: 'USD' },
  { platform: 'TikTok', source: 'Creator Fund', current: 0, target: 30, currency: 'USD' },
  { platform: 'Minecraft', source: 'Marketplace Sales', current: 0, target: 200, currency: 'USD' },
];

export function RevenueOverview() {
  const totalCurrent = revenueStreams.reduce((sum, r) => sum + r.current, 0);
  const totalTarget = revenueStreams.reduce((sum, r) => sum + r.target, 0);

  return (
    <div className="bg-white rounded-xl border p-6">
      {/* Total Revenue */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Total Monthly Revenue</p>
          <p className="text-3xl font-bold text-gray-900">${totalCurrent.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Monthly Target</p>
          <p className="text-xl font-semibold text-green-600">${totalTarget.toFixed(2)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
        <div
          className="bg-green-500 h-3 rounded-full transition-all"
          style={{ width: `${Math.min((totalCurrent / totalTarget) * 100, 100)}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        {revenueStreams.map((stream, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-gray-600">{stream.platform} — {stream.source}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium">${stream.current}</span>
              <span className="text-gray-400">/ ${stream.target}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
