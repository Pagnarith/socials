# App Store Connect — downloads (Analytics vs Sales)

App Store Connect **Analytics → Acquisition** (first-time downloads / redownloads) is **not** the same feed as **Sales and Trends / Sales Reports**.

| Source | What it counts | Our use |
|--------|----------------|---------|
| **Analytics Reports API** (`App Downloads Standard`) | First-time downloads + redownloads (matches Analytics UI) | **Preferred** for Platform Overview Downloads |
| **Sales Reports** (`SALES` SUMMARY) | Paid units / commerce rows | Fallback only — free apps often show **0** here |

## Why you saw 3 downloads in Analytics but 0 on the dashboard

Homework Palette is free. Analytics correctly shows acquisition (e.g. 3 first-time + 3 redownloads). Sales Reports had no paid “sales” rows for those days → API returned 404 / 0.

## Setup

1. Vendor number (Sales fallback): `ASC_VENDOR_NUMBER` — already set (`93766104`).
2. Analytics request (preferred):

```bash
# Created automatically on first metrics call, or set explicitly:
ASC_ANALYTICS_REQUEST_ID=258668ea-18c8-45e7-9add-de1dcc862c99
```

Apple needs **~24–48 hours** after the first `ONGOING` / `ONE_TIME_SNAPSHOT` request before `App Downloads Standard` instances appear.

```bash
node scripts/set-asc-vendor-number.js --vendor 93766104   # already done
vercel env add ASC_ANALYTICS_REQUEST_ID production --force
# paste: 258668ea-18c8-45e7-9add-de1dcc862c99
vercel deploy --prod --yes
```

## Verify

```bash
curl -sS https://socials-seven-beta.vercel.app/api/analytics/overview \
  | jq .platforms.appStore
```

Until instances exist:

- `downloadsNote` mentions Analytics requested / waiting 24–48h  
- `downloads` may be `null` or Sales `0`

When ready:

- `downloadsSource: "asc_analytics_downloads"`
- `downloads` ≈ first-time downloads (Acquisition)
- `firstTimeDownloads` / `redownloads` also returned

## API key role

Admin (or Sales) key that can create analytics report requests and download reports.
