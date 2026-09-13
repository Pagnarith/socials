export const metadata = {
  title: 'Connect TikTok — Homework Palette Social Ops',
  description: 'Authorize @homeworkpalette with TikTok Login Kit for Social Ops metrics',
};

const BASE = 'https://socials-seven-beta.vercel.app/api/tiktok';

export default function ConnectTikTokPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connect TikTok</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Authorize <strong>@homeworkpalette</strong> so Social Ops can read follower stats.
        While Production is <em>In review</em>, use Sandbox only.
      </p>

      <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700 p-4 text-sm text-amber-900 dark:text-amber-100 space-y-2">
        <p className="font-medium">If TikTok shows “client_key” error</p>
        <p>
          That message is often misleading — usually Sandbox Login Kit is incomplete or the
          redirect URI does not match exactly (TikTok sometimes wants a trailing <code>/</code>).
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Developers → toggle <strong>Sandbox</strong> (not Production)</li>
          <li>Add product <strong>Login Kit</strong> for Web if missing</li>
          <li>Add <strong>both</strong> redirect URIs, then click <strong>Apply changes</strong>:
            <pre className="mt-1 text-xs whitespace-pre-wrap break-all bg-white/70 dark:bg-black/30 p-2 rounded">
{`https://socials-seven-beta.vercel.app/api/tiktok/callback
https://socials-seven-beta.vercel.app/api/tiktok/callback/`}
            </pre>
          </li>
          <li>Sandbox → Target users includes the account you will log in with</li>
          <li>Enable scopes: user.info.basic (then profile + stats)</li>
          <li>Check <a className="underline" href={`${BASE}/status`}>{BASE}/status</a></li>
        </ol>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={`${BASE}/authorize?env=sandbox`}
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 font-medium"
        >
          Connect (Sandbox)
        </a>
        <a
          href={`${BASE}/authorize?env=sandbox&slash=1`}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-3 font-medium"
        >
          Connect (Sandbox + trailing /)
        </a>
        <a
          href={`${BASE}/authorize?env=sandbox&minimal=1`}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-3 font-medium"
        >
          Connect (Sandbox, basic scope only)
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
