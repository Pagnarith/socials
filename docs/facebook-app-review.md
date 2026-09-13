# Facebook App Review — Page & Instagram insights

## Permissions requested

| Permission | Why |
|------------|-----|
| **`pages_read_engagement`** | Read engagement on Pages we manage |
| **`read_insights`** | Page insights: reach (`page_impressions_unique`), video minutes (`page_video_view_time`) |
| **`instagram_basic`** / **`instagram_manage_insights`** (if prompted) | IG Business profile + reach for the linked account |

Without `read_insights` (and IG insights where applicable), Platform Overview shows followers/posts but **Reach / Minutes Viewed stay `n/a`**, with an amber Graph error under the card.

## App Information

- **App Name:** socials
- **App ID:** 1979247516330911
- **Business Manager ID:** 722062220901361
- **Page ID:** 1110028448851657
- **Page Name:** Chakriya / Homework Palette
- **Dashboard:** https://social.chakriya.net/
- **Privacy Policy:** https://social.chakriya.net/privacy.html
- **Terms:** https://social.chakriya.net/terms.html

## Why We Need This Permission

Our app ("socials") is a multi-platform content management dashboard that helps a single creator track content performance across YouTube, Facebook, Instagram, TikTok, and Telegram. We use the Facebook Graph API to:

1. **Read Page engagement metrics** (post reach, reactions, comments, shares) to display in our internal dashboard at `social.chakriya.net`.
2. **Track monetization milestones** — we need to monitor follower count and minutes viewed to determine when the Page qualifies for Facebook In-Stream Ads (10K followers + 600K minutes viewed in 60 days).
3. **Aggregate cross-platform analytics** — combining Facebook Page insights with YouTube, Instagram, and TikTok data into a single revenue-tracking view.

## How We Use The Data

| Data Point | Usage |
|------------|-------|
| Page follower count | Display on dashboard; milestone tracking toward monetization eligibility |
| Post reach & impressions | Weekly analytics review; content strategy optimization |
| Post engagement (reactions, comments, shares) | Identify best-performing content types |
| Video views & minutes viewed | Track progress toward 600K-minute In-Stream Ads threshold |
| Instagram reach | Same dashboard Platform Overview card |
| Page insights | Monthly growth reports |

## User Experience

1. Creator opens https://social.chakriya.net/ (or `/analytics`).
2. Dashboard calls Graph API with a **System User Page Access Token** (no end-user Facebook Login).
3. Cards show followers, 30-day reach, and minutes viewed vs monetization goals.

### Screenshots to include

- Dashboard home — Platform Overview (Facebook + Instagram cards)
- Analytics page — Facebook engagement metrics
- Milestone Tracker — progress toward 10K / 600K

## Platform Policy Compliance

- We **only** access Pages / IG Business accounts owned by the app administrator (System User with Full Control).
- We do **not** access third-party Pages or consumer user data.
- We do **not** sell or share Facebook/Instagram data.
- Data is shown only on the private dashboard.

## Technical Implementation

```
GET /v19.0/{page-id}?fields=followers_count,fan_count
GET /v19.0/{page-id}/insights?metric=page_total_media_view_unique&period=day
GET /v19.0/{page-id}/insights?metric=page_video_view_time&period=day
GET /v19.0/{ig-user-id}?fields=username,followers_count,media_count
GET /v19.0/{ig-user-id}/insights?metric=reach&period=day&metric_type=total_value
```

Reach uses `page_total_media_view_unique` (replacement for deprecated `page_impressions_unique`).
**Token type:** System User Page Access Token (Business Manager)  
**Scopes after approval:** `pages_read_engagement`, `pages_show_list`, `read_insights` (+ IG insights as required)

## After approval

1. In Business Manager, regenerate / re-assign the System User token **including** `read_insights` (and IG insights if separate).
2. Update Vercel `FACEBOOK_PAGE_ACCESS_TOKEN` (and `INSTAGRAM_ACCESS_TOKEN` if used).
3. Redeploy: `vercel deploy --prod --yes`
4. Probe: `node scripts/validate-creds.js` — Facebook insights line should succeed.
5. Hard-refresh Platform Overview — Reach / Minutes should leave `n/a`.

## App Review Submission Checklist

- [ ] App Description updated in App Dashboard
- [ ] Privacy Policy URL: `https://social.chakriya.net/privacy.html`
- [ ] App Icon uploaded
- [ ] `pages_read_engagement` selected
- [ ] `read_insights` selected
- [ ] Instagram insights permission selected if Meta requires it for IG reach
- [ ] Use-case text pasted from this doc
- [ ] Screen recording / screenshots of dashboard attached
- [ ] Business Verification completed
- [ ] Page + Instagram Business assigned to System User with Full Control
- [ ] After Live: regenerate System User page token with approved scopes → Vercel

## Notes

If the reviewer asks about the production use case: this is a **personal creator tool** for a single content creator managing their own Facebook Page and Instagram Business Account. The app is not distributed to third parties.

Local probe for current token errors:

```bash
node scripts/validate-creds.js
```
