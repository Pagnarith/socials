export const metadata = {
  title: 'Connect TikTok — Homework Palette Social Ops',
  description: 'Authorize @homeworkpalette with TikTok Login Kit for Social Ops metrics',
};

const AUTHORIZE = 'https://socials-seven-beta.vercel.app/api/tiktok/authorize';
const AUTHORIZE_SANDBOX = `${AUTHORIZE}?env=sandbox`;

export default function ConnectTikTokPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connect TikTok</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Homework Palette Social Ops uses TikTok Login Kit so an admin can authorize the official
        <strong> @homeworkpalette </strong>
        account. We request profile and public stats scopes to show follower counts on this dashboard.
      </p>

      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700 p-4 text-sm text-amber-900 dark:text-amber-100 space-y-2">
        <p className="font-medium">While Production is In review</p>
        <p>
          Use <strong>Sandbox</strong>. TikTok gives Sandbox a <em>different</em> client key/secret.
          Using the Production key causes: “correct the following… client_key”.
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>TikTok Developers → toggle app to <strong>Sandbox</strong></li>
          <li>Copy Sandbox <strong>Client key</strong> + <strong>Client secret</strong></li>
          <li>Login Kit (Sandbox): redirect URI = <code className="text-xs">https://socials-seven-beta.vercel.app/api/tiktok/callback</code></li>
          <li>Add target user, then set Vercel env <code className="text-xs">TIKTOK_SANDBOX_CLIENT_KEY</code> / <code className="text-xs">TIKTOK_SANDBOX_CLIENT_SECRET</code> and redeploy</li>
          <li>Click <strong>Connect (Sandbox)</strong> below as that target user</li>
        </ol>
      </div>

      <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-200">
        <li>Click Connect below (Sandbox while waiting for review).</li>
        <li>Log in as the Sandbox target user / <code className="text-sm">@homeworkpalette</code>.</li>
        <li>Approve <code className="text-sm">user.info.basic</code>, <code className="text-sm">user.info.profile</code>, and <code className="text-sm">user.info.stats</code>.</li>
        <li>Copy tokens → <code className="text-sm">node scripts/set-tiktok-user-token.js</code> → redeploy.</li>
      </ol>

      <div className="flex flex-wrap gap-3">
        <a
          href={AUTHORIZE_SANDBOX}
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 font-medium"
        >
          Connect TikTok (Sandbox)
        </a>
        <a
          href={AUTHORIZE}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-3 font-medium text-gray-800 dark:text-gray-100"
        >
          Connect (Production — after approval)
        </a>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Privacy: <a className="underline" href="/privacy.html">/privacy.html</a>
        {' · '}
        Terms: <a className="underline" href="/terms.html">/terms.html</a>
      </p>
    </main>
  );
}
