const milestones = [
  {
    platform: 'YouTube',
    icon: '📺',
    requirements: [
      { label: '1,000 subscribers', current: 0, target: 1000, unit: 'subs' },
      { label: '4,000 watch hours', current: 0, target: 4000, unit: 'hrs' },
    ],
    reward: 'YouTube Partner Program — Ad Revenue Enabled',
    color: 'border-red-300',
  },
  {
    platform: 'Facebook',
    icon: '📘',
    requirements: [
      { label: '10,000 page followers', current: 0, target: 10000, unit: 'followers' },
      { label: '600,000 min viewed (60 days)', current: 0, target: 600000, unit: 'min' },
    ],
    reward: 'Facebook In-Stream Ads — Monetization Enabled',
    color: 'border-blue-300',
  },
  {
    platform: 'Instagram',
    icon: '📸',
    requirements: [
      { label: '10,000 followers', current: 0, target: 10000, unit: 'followers' },
      { label: 'Professional account setup', current: 0, target: 1, unit: 'status' },
    ],
    reward: 'Instagram Reels Bonus & Branded Content',
    color: 'border-pink-300',
  },
  {
    platform: 'TikTok',
    icon: '📱',
    requirements: [
      { label: '10,000 followers', current: 0, target: 10000, unit: 'followers' },
      { label: '100,000 views (30 days)', current: 0, target: 100000, unit: 'views' },
    ],
    reward: 'TikTok Creativity Program — Creator Revenue',
    color: 'border-gray-300',
  },
  {
    platform: 'Minecraft Marketplace',
    icon: '🎮',
    requirements: [
      { label: 'Complete Add-on package', current: 0, target: 1, unit: 'packages' },
      { label: 'Microsoft Partner enrollment', current: 0, target: 1, unit: 'status' },
    ],
    reward: 'Sell Add-ons on Microsoft Minecraft Store',
    color: 'border-green-300',
  },
];

export function MilestoneTracker() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {milestones.map((milestone) => {
        const overallProgress = milestone.requirements.reduce((sum, req) => {
          return sum + Math.min((req.current / req.target) * 100, 100);
        }, 0) / milestone.requirements.length;

        return (
          <div key={milestone.platform} className={`bg-white rounded-xl border-2 ${milestone.color} p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{milestone.icon}</span>
              <h3 className="font-semibold text-gray-800">{milestone.platform}</h3>
              <span className="ml-auto text-sm font-medium text-gray-500">
                {overallProgress.toFixed(0)}%
              </span>
            </div>

            {/* Overall progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            {/* Individual requirements */}
            <div className="space-y-3">
              {milestone.requirements.map((req, i) => {
                const progress = Math.min((req.current / req.target) * 100, 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{req.label}</span>
                      <span>{req.current.toLocaleString()} / {req.target.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-400 h-1.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reward */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                🏆 <span className="font-medium">{milestone.reward}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
