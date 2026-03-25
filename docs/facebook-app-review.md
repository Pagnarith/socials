# Facebook App Review — pages_read_engagement

## Permission Requested

**`pages_read_engagement`** — Read engagement data on Pages managed by your business.

## App Information

- **App Name:** socials
- **App ID:** 1979247516330911
- **Business Manager ID:** 722062220901361
- **Page ID:** 1110028448851657
- **Page Name:** Chakriya

## Why We Need This Permission

Our app ("socials") is a multi-platform content management dashboard that helps a single creator track content performance across YouTube, Facebook, Instagram, TikTok, and Telegram. We use the Facebook Graph API to:

1. **Read Page engagement metrics** (post reach, reactions, comments, shares) to display in our internal dashboard at `social.chakriya.net`.
2. **Track monetization milestones** — we need to monitor follower count and minutes viewed to determine when the Page qualifies for Facebook In-Stream Ads (10K followers + 600K minutes viewed in 60 days).
3. **Aggregate cross-platform analytics** — combining Facebook Page insights with YouTube, Instagram, and TikTok data into a single revenue-tracking view.

## How We Use the Data

| Data Point | Usage |
|------------|-------|
| Page follower count | Display on dashboard; milestone tracking toward monetization eligibility |
| Post reach & impressions | Weekly analytics review; content strategy optimization |
| Post engagement (reactions, comments, shares) | Identify best-performing content types |
| Video views & minutes viewed | Track progress toward 600K-minute In-Stream Ads threshold |
| Page insights | Monthly revenue and growth reports |

## User Experience

### Step-by-step flow:

1. **Creator logs into the dashboard** at `https://social.chakriya.net/analytics`.
2. The dashboard calls the Facebook Graph API using a **System User Page Access Token** (no user-facing OAuth flow — this is a single-admin tool).
3. API responses are displayed in the **Analytics** section showing:
   - Current follower count vs. 10K goal
   - Minutes viewed vs. 600K goal
   - Post-level engagement breakdown
   - Week-over-week growth trends
4. The same data feeds the **Milestone Tracker** component, showing a progress bar toward Facebook monetization eligibility.

### Screenshots to include in submission:

- Dashboard home page with Platform Overview cards
- Analytics page showing Facebook engagement metrics
- Milestone Tracker showing progress toward monetization goals

## Platform Policy Compliance

- We **only** access Pages owned and managed by the app administrator (System User with Full Control).
- We do **not** access any third-party Pages or user data.
- We do **not** store raw API responses — only aggregated metrics in Microsoft Dataverse.
- We do **not** sell, share, or monetize Facebook data.
- Data is displayed only on the private dashboard (`social.chakriya.net`) accessible to the creator.

## Technical Implementation

```
GET /v19.0/{page-id}?fields=followers_count,fan_count
GET /v19.0/{page-id}/insights?metric=page_impressions,page_engaged_users,page_video_views
GET /v19.0/{page-id}/published_posts?fields=message,created_time,insights{values}
```

**Token type:** System User Page Access Token (non-expiring, managed in Business Manager)
**Scopes:** `pages_read_engagement`, `pages_show_list`, `read_insights`

## Verification Details

- **Business Verification:** Completed in Meta Business Suite (business ID 722062220901361)
- **App uses:** Facebook Login is **not** used — we use a System User token for server-to-server API calls.
- **Data Deletion:** We support data deletion by clearing Dataverse records. No Facebook user data is stored.

## App Review Submission Checklist

- [ ] App Description updated in App Dashboard
- [ ] Privacy Policy URL added (host at `https://social.chakriya.net/privacy`)
- [ ] App Icon uploaded
- [ ] `pages_read_engagement` permission selected
- [ ] Detailed description of use case provided (copy from above)
- [ ] Screen recording / screenshots of dashboard attached
- [ ] Business Verification completed
- [ ] Pages assigned to System User with Full Control

## Notes

If the reviewer asks about the production use case: this is a **personal creator tool** for a single content creator managing their own Facebook Page and Instagram Business Account. The app is not distributed to third parties.
