import { PlatformCard } from '../components/PlatformCard';
import { RevenueOverview } from '../components/RevenueOverview';
import { ContentCalendar } from '../components/ContentCalendar';
import { MilestoneTracker } from '../components/MilestoneTracker';

export default function Dashboard() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Platform Overview */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <PlatformCard
            name="YouTube"
            icon="📺"
            color="bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
            stats={{ subscribers: 0, views: 0, watchHours: 0 }}
            goal="1K subs + 4K watch hrs"
          />
          <PlatformCard
            name="Facebook"
            icon="📘"
            color="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
            stats={{ followers: 0, reach: 0, minutesViewed: 0 }}
            goal="10K followers + 600K min"
          />
          <PlatformCard
            name="Instagram"
            icon="📸"
            color="bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800"
            stats={{ followers: 8, reach: 0, engagement: '0%' }}
            goal="10K followers + Reels growth"
          />
          <PlatformCard
            name="TikTok"
            icon="📱"
            color="bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-600"
            stats={{ followers: 0, views: 0, engagement: '0%' }}
            goal="10K followers + 100K views"
          />
          <PlatformCard
            name="Telegram"
            icon="💬"
            color="bg-sky-50 border-sky-200 dark:bg-sky-950 dark:border-sky-800"
            stats={{ subscribers: 0, messages: 0 }}
            goal="Build community"
          />
          <PlatformCard
            name="App Store"
            icon="📚"
            color="bg-violet-50 border-violet-200 dark:bg-violet-950 dark:border-violet-800"
            stats={{ downloads: 0, proSubs: 0 }}
            goal="1K downloads + Palette Pro"
          />
        </div>
      </section>

      {/* Revenue Overview */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Revenue Overview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
          Apple App Store (Palette Pro) is the primary product stream; social funds acquisition.
        </p>
        <RevenueOverview />
      </section>

      {/* Content Calendar */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">This Week&apos;s Content</h2>
        <ContentCalendar />
      </section>

      {/* Milestone Tracker */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Growth & Monetization Milestones</h2>
        <MilestoneTracker />
      </section>
    </main>
  );
}
