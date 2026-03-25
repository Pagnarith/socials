import Link from 'next/link';
import { PlatformCard } from '../components/PlatformCard';
import { RevenueOverview } from '../components/RevenueOverview';
import { ContentCalendar } from '../components/ContentCalendar';
import { MilestoneTracker } from '../components/MilestoneTracker';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🎮 Socials Dashboard
            </h1>
            <p className="text-sm text-gray-500">Digital Financial Plan — Minecraft & Rhino 3D</p>
          </div>
          <nav className="flex gap-4">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900">Dashboard</Link>
            <Link href="/content" className="text-sm font-medium text-gray-500 hover:text-gray-900">Content</Link>
            <Link href="/analytics" className="text-sm font-medium text-gray-500 hover:text-gray-900">Analytics</Link>
            <Link href="/revenue" className="text-sm font-medium text-gray-500 hover:text-gray-900">Revenue</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Platform Overview */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <PlatformCard
              name="YouTube"
              icon="📺"
              color="bg-red-50 border-red-200"
              stats={{ subscribers: 0, views: 0, watchHours: 0 }}
              goal="1K subs + 4K watch hrs"
            />
            <PlatformCard
              name="Facebook"
              icon="📘"
              color="bg-blue-50 border-blue-200"
              stats={{ followers: 0, reach: 0, minutesViewed: 0 }}
              goal="10K followers + 600K min"
            />
            <PlatformCard
              name="Instagram"
              icon="📸"
              color="bg-pink-50 border-pink-200"
              stats={{ followers: 0, reach: 0, engagement: '0%' }}
              goal="10K followers + Reels growth"
            />
            <PlatformCard
              name="TikTok"
              icon="📱"
              color="bg-gray-50 border-gray-300"
              stats={{ followers: 0, views: 0, engagement: '0%' }}
              goal="10K followers + 100K views"
            />
            <PlatformCard
              name="Telegram"
              icon="💬"
              color="bg-sky-50 border-sky-200"
              stats={{ subscribers: 0, messages: 0 }}
              goal="Build community"
            />
          </div>
        </section>

        {/* Revenue Overview */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Overview</h2>
          <RevenueOverview />
        </section>

        {/* Content Calendar */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">This Week&apos;s Content</h2>
          <ContentCalendar />
        </section>

        {/* Milestone Tracker */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Monetization Milestones</h2>
          <MilestoneTracker />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          Socials Dashboard — Digital Financial Plan &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
