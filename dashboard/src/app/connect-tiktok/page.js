export const metadata = {
  title: 'Connect TikTok — Homework Palette Social Ops',
  description: 'Authorize @homeworkpalette with TikTok Login Kit for Social Ops metrics',
};

const AUTHORIZE = 'https://socials-seven-beta.vercel.app/api/tiktok/authorize';

export default function ConnectTikTokPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connect TikTok</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Homework Palette Social Ops uses TikTok Login Kit so an admin can authorize the official
        <strong> @homeworkpalette </strong>
        account. We request profile and public stats scopes to show follower counts on this dashboard.
      </p>
      <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-200">
        <li>Click Connect TikTok below.</li>
        <li>Log in as <code className="text-sm">@homeworkpalette</code> on TikTok.</li>
        <li>Approve <code className="text-sm">user.info.basic</code>, <code className="text-sm">user.info.profile</code>, and <code className="text-sm">user.info.stats</code>.</li>
        <li>Return here and open Analytics / Home to see live TikTok metrics.</li>
      </ol>
      <a
        href={AUTHORIZE}
        className="inline-flex items-center justify-center rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 font-medium"
      >
        Connect TikTok (@homeworkpalette)
      </a>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Privacy: <a className="underline" href="/privacy.html">/privacy.html</a>
        {' · '}
        Terms: <a className="underline" href="/terms.html">/terms.html</a>
      </p>
    </main>
  );
}
