import { ContentCalendar } from '../../components/ContentCalendar';

const contentSeries = [
  {
    title: 'Minecraft Add-on Showcase',
    platform: 'YouTube',
    icon: '🎮',
    category: 'minecraft',
    episodes: [
      { name: 'Ep 1: Introduction to Add-on Development', status: 'planned' },
      { name: 'Ep 2: Building Your First Add-on', status: 'planned' },
      { name: 'Ep 3: Custom Entities & Behaviors', status: 'planned' },
      { name: 'Ep 4: Marketplace Submission Guide', status: 'planned' },
    ],
  },
  {
    title: 'Rhino 3D From Scratch',
    platform: 'YouTube',
    icon: '🖥️',
    category: 'rhino3d',
    episodes: [
      { name: 'Ep 1: Getting Started with Rhino', status: 'planned' },
      { name: 'Ep 2: Curves & Surfaces Basics', status: 'planned' },
      { name: 'Ep 3: Product Design Workflow', status: 'planned' },
      { name: 'Ep 4: Grasshopper Parametric Design', status: 'planned' },
    ],
  },
  {
    title: 'Quick Tips (Shorts)',
    platform: 'TikTok / Instagram Reels',
    icon: '📱',
    category: 'general',
    episodes: [
      { name: 'Rhino 3D: 5 shortcuts you need to know', status: 'planned' },
      { name: 'Minecraft: How to test your Add-on locally', status: 'planned' },
      { name: 'Rhino 3D: Speed modeling a product', status: 'planned' },
      { name: 'Minecraft: Custom texture walkthrough', status: 'planned' },
    ],
  },
];

const statusColors = {
  planned: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  recorded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function ContentPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Plan, track, and manage your content across all platforms</p>
      </div>

      {/* Content Series */}
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
                    className="bg-green-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${(series.episodes.filter((e) => e.status === 'published').length / series.episodes.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Calendar */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">This Week&apos;s Schedule</h2>
        <ContentCalendar />
      </section>

      {/* Content Ideas */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Content Ideas Backlog</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">🎮 Minecraft</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Add-on development timelapse</li>
                <li>• Custom biome showcase</li>
                <li>• Marketplace submission walkthrough</li>
                <li>• Bedrock vs Java Add-on differences</li>
                <li>• Community add-on reviews</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">🖥️ Rhino 3D</h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• 60-second speed modeling challenges</li>
                <li>• Grasshopper parametric patterns</li>
                <li>• Product rendering tips</li>
                <li>• Architecture concept modeling</li>
                <li>• Plugin recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
