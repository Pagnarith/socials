# YouTube Analytics OAuth — watch hours

Platform Overview **Watch Hours** needs the [YouTube Analytics API](https://developers.google.com/youtube/analytics), which requires OAuth (not the Data API key alone).

## One-time Google Cloud setup

1. Open the Google Cloud project that owns `YOUTUBE_API_KEY`.
2. Enable **YouTube Analytics API** and **YouTube Data API v3**.
3. APIs & Services → Credentials → OAuth 2.0 Client (Web application).
4. Add authorized redirect URI: `http://localhost:3000/oauth2callback` (or set `YT_REDIRECT_URI`).
5. Put client id/secret in `.env`:

```bash
YT_CLIENT_ID=....apps.googleusercontent.com
YT_CLIENT_SECRET=...
# aliases also accepted:
# YOUTUBE_CLIENT_ID=
# YOUTUBE_CLIENT_SECRET=
YOUTUBE_CHANNEL_ID=UC...
YT_REDIRECT_URI=http://localhost:3000/oauth2callback
```

If the OAuth app is in **Testing**, add your Google account as a test user.

## Authorize and push to Vercel

```bash
cd socials
node scripts/auth-youtube-analytics.js
# copy the printed refresh token, then:
node scripts/set-youtube-analytics-token.js --refresh '1//...'
vercel env add YT_CLIENT_ID production --force   # if not already set
vercel env add YT_CLIENT_SECRET production --force
vercel deploy --prod --yes
```

## Verify

```bash
curl -sS https://socials-seven-beta.vercel.app/api/analytics/overview \
  | jq .platforms.youtube
```

Expect `watchHours` as a number and `watchHoursSource: "youtube_analytics"`.
If OAuth is missing, `watchHours` stays `null` (dashboard shows `n/a`).

## Notes

- Refresh tokens last until revoked; no daily cron required (access tokens are refreshed per request).
- Scope used: `yt-analytics.readonly` + `youtube.readonly`.
- Token file (local only, gitignored via `tokens/`): `tokens/youtube-analytics.json`.
