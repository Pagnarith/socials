import { ContentCalendar } from '../../components/ContentCalendar';

const contentSeries = [
  {
    title: 'Homework Palette App Demos',
    platform: 'YouTube',
    icon: '📱',
    category: 'app',
    episodes: [
      { name: 'Ep 1: Tour of the free grade library', status: 'planned' },
      { name: 'Ep 2: Build a worksheet in minutes', status: 'planned' },
      { name: 'Ep 3: Lesson recorder + background finish', status: 'planned' },
      { name: 'Ep 4: Palette Pro quizzes walkthrough', status: 'planned' },
    ],
  },
  {
    title: 'Parent Tips (Khmer + English)',
    platform: 'YouTube / Reels',
    icon: '👨‍👩‍👧',
    category: 'parenting',
    episodes: [
      { name: 'Ep 1: 10-minute homework routine', status: 'planned' },
      { name: 'Ep 2: Using read-aloud for bilingual kids', status: 'planned' },
      { name: 'Ep 3: Printing packs for offline practice', status: 'planned' },
      { name: 'Ep 4: Sharing teaching videos with family', status: 'planned' },
    ],
  },
  {
    title: 'Quick Tips (Shorts)',
    platform: 'TikTok / Instagram Reels',
    icon: '📱',
    category: 'homework',
    episodes: [
      { name: 'Pick a grade in 15 seconds', status: 'planned' },
      { name: 'Unlock quizzes with Palette Pro', status: 'planned' },
      { name: 'Record a lesson without losing the export', status: 'planned' },
      { name: 'Scan the App Store poster QR', status: 'planned' },
    ],
  },
];

const statusColors = {
  planned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  recorded: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function ContentPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Plan Homework Palette demos, parent tips, and App Store CTAs across platforms
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Content Series</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contentSeries.map((series) => (
            <div key={series.title} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{series.icon}</span>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{series.title}</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{series.platform}</p>

              <div className="space-y-2">
                {series.episodes.map((ep, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{ep.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusColors[ep.status]}`}>
                      {ep.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t dark:border-gray-700">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{series.episodes.filter((e) => e.status === 'published').length}/{series.episodes.length} published</span>
                  <span>{Math.round((series.episodes.filter((e) => e.status === 'published').length / series.episodes.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-violet-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${(series.episodes.filter((e) => e.status === 'published').length / series.episodes.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">This Week&apos;s Schedule</h2>
        <ContentCalendar />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Content Ideas Backlog</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">📱 App & Product</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• App Store download CTA with poster QR</li>
                <li>• Free vs Palette Pro comparison</li>
                <li>• Lesson recorder background-finish demo</li>
                <li>• Offline Khmer & English read-aloud</li>
                <li>• iPad vs iPhone homework session</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">👨‍👩‍👧 Families & Homework</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• 10-minute after-school routine</li>
                <li>• Print packs for grandparents</li>
                <li>• Bilingual practice tips</li>
                <li>• Share a teaching video to Messages</li>
                <li>• Grade 1–6 library tour highlights</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
