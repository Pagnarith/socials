import {
  WEEK_SCHEDULE,
  CATEGORY_ICONS,
  getCambodiaDateParts,
} from '../../../shared/content-calendar.js';

const platformColors = {
  YouTube: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
  Facebook: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  Instagram: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
  TikTok: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
};

export function ContentCalendar() {
  const todayName = getCambodiaDateParts().weekday;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
      <div className="hidden lg:grid grid-cols-7 divide-x dark:divide-gray-700">
        {WEEK_SCHEDULE.map((day) => (
          <div
            key={day.day}
            className={`p-3 min-h-[180px] ${day.day === todayName ? 'bg-violet-50 dark:bg-violet-950' : ''}`}
          >
            <h4 className={`text-xs font-semibold mb-2 ${day.day === todayName ? 'text-violet-700 dark:text-violet-300' : 'text-gray-500 dark:text-gray-400'}`}>
              {day.day}
              {day.day === todayName && ' (Today)'}
            </h4>
            <div className="space-y-2">
              {day.items.map((item, i) => (
                <div key={i} className={`text-xs px-2 py-1.5 rounded ${platformColors[item.platform]}`}>
                  <span>{CATEGORY_ICONS[item.category]} </span>
                  <span className="font-medium">{item.platform}</span>
                  <p className="mt-0.5 opacity-80">{item.type}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="lg:hidden divide-y dark:divide-gray-700">
        {WEEK_SCHEDULE.map((day) => (
          <div
            key={day.day}
            className={`p-4 ${day.day === todayName ? 'bg-violet-50 dark:bg-violet-950' : ''}`}
          >
            <h4 className={`text-sm font-semibold mb-2 ${day.day === todayName ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300'}`}>
              {day.day}
              {day.day === todayName && ' (Today)'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {day.items.map((item, i) => (
                <div key={i} className={`text-xs px-2 py-1.5 rounded ${platformColors[item.platform]}`}>
                  {CATEGORY_ICONS[item.category]} <span className="font-medium">{item.platform}</span> — {item.type}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
