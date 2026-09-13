# App Store Connect — Sales Reports (downloads)

Platform Overview **Downloads** come from ASC **Sales Reports** (not iTunes rating count).

## Env

```bash
ASC_ISSUER_ID=...
ASC_KEY_ID=...
ASC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
ASC_BUNDLE_ID=com.pagnarith.homeworkpalette
ASC_VENDOR_NUMBER=12345678   # required for downloads
# Optional: filter Sales TSV rows by SKU
# ASC_SKU=HomeworkPalette
```

**Vendor number:** App Store Connect → **Payments and Financial Reports** (or **Sales and Trends** → Reports) — top-left under your Legal Entity Name (usually an 8-digit number).

```bash
# Probe + set on Vercel
node scripts/set-asc-vendor-number.js --vendor YOUR_NUMBER
vercel deploy --prod --yes
```

## What the API does

`GET /v1/salesReports` with:

- `filter[reportType]=SALES`
- `filter[reportSubType]=SUMMARY`
- `filter[frequency]=YEARLY`
- current year + prior 2 years

Gzip TSV is parsed; **Units** are summed for app download product types `1`, `1F`, `1T`, `F1` (excludes updates / IAP).

Ratings remain from public iTunes lookup (`userRatingCount`). **Pro products** = count of approved `palette.pro*` IAPs (not active subscribers).

## Verify

```bash
curl -sS https://socials-seven-beta.vercel.app/api/analytics/overview \
  | jq .platforms.appStore
```

Expect `downloadsSource: "asc_sales_reports"` and `downloadsNote: null` when vendor number + key are valid.
Without `ASC_VENDOR_NUMBER`, `downloads` is `null` and the amber note asks you to set it.
