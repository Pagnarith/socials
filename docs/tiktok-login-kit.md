# TikTok Login Kit — @homeworkpalette

Authorize the Homework Palette TikTok account so [social.chakriya.net](https://social.chakriya.net) can read follower / likes / video counts via `user.info.stats`.

## One-time setup in TikTok Developers

1. Open [TikTok for Developers](https://developers.tiktok.com/) → your app (client key `awmtw3g0q45qx3fk`).
2. Add / enable **Login Kit** (Web).
3. Register this **exact** redirect URI (https, no query, no hash):

```text
https://socials-seven-beta.vercel.app/api/tiktok/callback
```

4. Request scopes:
   - `user.info.basic`
   - `user.info.profile`
   - `user.info.stats`
5. Save. Wait until Login Kit shows as active (may need app review for some scopes depending on TikTok’s current rules).

## Authorize @homeworkpalette

1. Open (incognito OK):

   [https://socials-seven-beta.vercel.app/api/tiktok/authorize](https://socials-seven-beta.vercel.app/api/tiktok/authorize)

2. Log in as **@homeworkpalette** and approve the scopes.
3. On the success page, copy the env block **or** run the printed `set-tiktok-user-token.js` command.
4. Redeploy Vercel production so the metrics API picks up the new env vars.

```bash
cd socials
node scripts/set-tiktok-user-token.js --access 'act....' --refresh 'rft....'
vercel deploy --prod --yes
```

5. Verify:

```bash
curl -sS https://socials-seven-beta.vercel.app/api/analytics/overview | jq .platforms.tiktok
```

Expect `"source": "user_token"` and numeric `followers`.

## Token lifetime

| Token | Lifetime |
|-------|----------|
| `TIKTOK_ACCESS_TOKEN` | ~24 hours |
| `TIKTOK_REFRESH_TOKEN` | ~365 days |

- Metrics API will try a one-request refresh if access fails and `TIKTOK_REFRESH_TOKEN` is set (cannot persist new values into Vercel env from the function).
- Cron `/api/cron/tiktok-refresh` (every 12h) returns fresh tokens for an admin to push with `set-tiktok-user-token.js`.

## Endpoints

| URL | Purpose |
|-----|---------|
| `/api/tiktok/authorize` | Start Login Kit |
| `/api/tiktok/callback` | Exchange code → show tokens |
| `/api/cron/tiktok-refresh` | Refresh (cron-auth protected) |

## Research API?

Not required for own-account stats. See [tiktok-research-application.md](./tiktok-research-application.md).
