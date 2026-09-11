import { LivePlatformOverview } from '../components/LivePlatformOverview';
import { RevenueOverview } from '../components/RevenueOverview';
import { ContentCalendar } from '../components/ContentCalendar';
import { MilestoneTracker } from '../components/MilestoneTracker';

export default function Dashboard() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <LivePlatformOverview />

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Revenue Overview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
          Apple App Store (Palette Pro) is the primary product stream; social funds acquisition.
        </p>
        <RevenueOverview />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">This Week&apos;s Content</h2>
        <ContentCalendar />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Growth & Monetization Milestones</h2>
        <MilestoneTracker />
      </section>
    </main>
  );
}
