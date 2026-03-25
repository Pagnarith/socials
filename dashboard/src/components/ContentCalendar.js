const weekSchedule = [
  {
    day: 'Monday',
    items: [
      { platform: 'Facebook', type: 'Minecraft tip post', category: 'minecraft' },
      { platform: 'Instagram', type: 'Rhino 3D Reel', category: 'rhino3d' },
      { platform: 'TikTok', type: 'Rhino 3D speed model (60s)', category: 'rhino3d' },
    ],
  },
  {
    day: 'Tuesday',
    items: [
      { platform: 'YouTube', type: 'Minecraft Add-on video', category: 'minecraft' },
      { platform: 'Facebook', type: 'Share YouTube video', category: 'minecraft' },
      { platform: 'Instagram', type: 'Minecraft carousel', category: 'minecraft' },
      { platform: 'TikTok', type: 'Minecraft gameplay clip', category: 'minecraft' },
    ],
  },
  {
    day: 'Wednesday',
    items: [
      { platform: 'Facebook', type: 'Rhino 3D tutorial post', category: 'rhino3d' },
      { platform: 'Instagram', type: 'Story: tip of the day', category: 'rhino3d' },
      { platform: 'TikTok', type: 'Quick tip (30s)', category: 'rhino3d' },
    ],
  },
  {
    day: 'Thursday',
    items: [
      { platform: 'YouTube', type: 'Rhino 3D tutorial', category: 'rhino3d' },
      { platform: 'Facebook', type: 'Share YouTube video', category: 'rhino3d' },
      { platform: 'Instagram', type: 'Rhino 3D Reel', category: 'rhino3d' },
      { platform: 'TikTok', type: 'Behind-the-scenes', category: 'general' },
    ],
  },
  {
    day: 'Friday',
    items: [
      { platform: 'Facebook', type: 'Community engagement', category: 'general' },
      { platform: 'Instagram', type: 'Q&A Story', category: 'general' },
      { platform: 'TikTok', type: 'Trending content remix', category: 'general' },
    ],
  },
  {
    day: 'Saturday',
    items: [
      { platform: 'YouTube', type: 'Minecraft dev stream', category: 'minecraft' },
      { platform: 'Facebook', type: 'Highlight reel', category: 'general' },
      { platform: 'Instagram', type: 'Best moments Reel', category: 'general' },
      { platform: 'TikTok', type: 'Best moments (60s)', category: 'general' },
    ],
  },
  {
    day: 'Sunday',
    items: [
      { platform: 'Facebook', type: 'Week recap post', category: 'general' },
      { platform: 'Instagram', type: 'Week recap carousel', category: 'general' },
    ],
  },
];

const platformColors = {
  YouTube: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
  Facebook: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  Instagram: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
  TikTok: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
};

const categoryIcons = {
  minecraft: '🎮',
  rhino3d: '🖥️',
  general: '📋',
};

export function ContentCalendar() {
  const today = new Date().getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[today];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
      {/* Desktop: 7-column grid */}
      <div className="hidden lg:grid grid-cols-7 divide-x dark:divide-gray-700">
        {weekSchedule.map((day) => (
          <div
            key={day.day}
            className={`p-3 min-h-[180px] ${day.day === todayName ? 'bg-yellow-50 dark:bg-yellow-950' : ''}`}
          >
            <h4 className={`text-xs font-semibold mb-2 ${day.day === todayName ? 'text-yellow-700 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {day.day}
              {day.day === todayName && ' (Today)'}
            </h4>
            <div className="space-y-2">
              {day.items.map((item, i) => (
                <div key={i} className={`text-xs px-2 py-1.5 rounded ${platformColors[item.platform]}`}>
                  <span>{categoryIcons[item.category]} </span>
                  <span className="font-medium">{item.platform}</span>
                  <p className="mt-0.5 opacity-80">{item.type}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: stacked list */}
      <div className="lg:hidden divide-y dark:divide-gray-700">
        {weekSchedule.map((day) => (
          <div
            key={day.day}
            className={`p-4 ${day.day === todayName ? 'bg-yellow-50 dark:bg-yellow-950' : ''}`}
          >
            <h4 className={`text-sm font-semibold mb-2 ${day.day === todayName ? 'text-yellow-700 dark:text-yellow-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {day.day}
              {day.day === todayName && ' (Today)'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {day.items.map((item, i) => (
                <div key={i} className={`text-xs px-2 py-1.5 rounded ${platformColors[item.platform]}`}>
                  {categoryIcons[item.category]} <span className="font-medium">{item.platform}</span> — {item.type}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
