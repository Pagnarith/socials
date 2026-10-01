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

- Refresh tokens last until revoked **when the Google OAuth app is In production**.
- If the OAuth consent screen is still in **Testing**, Google expires refresh tokens after **~7 days** → dashboard shows `watchHoursError: "Token has been expired or revoked."` Re-run auth below, or publish the OAuth app to Production (only your Google account as channel owner still needed).
- Access tokens are refreshed per request from `YOUTUBE_REFRESH_TOKEN`.
- Scope used: `yt-analytics.readonly` + `youtube.readonly`.
- Token file (local only, gitignored via `tokens/`): `tokens/youtube-analytics.json`.

## Re-auth after expiry

```bash
cd /Users/imphanpagnarith/projects/socials
rm -f tokens/youtube-analytics.json
node scripts/auth-youtube-analytics.js --force
# paste the code from the localhost URL immediately
node scripts/set-youtube-analytics-token.js   # reads tokens/youtube-analytics.json
vercel deploy --prod --yes
curl -sS https://socials-seven-beta.vercel.app/api/analytics/overview | jq .platforms.youtube
```
