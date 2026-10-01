# Phase 4–5 ops — tracking sheet + winner DMs

## Private files (gitignored)

| File | Role |
|------|------|
| `private/offer-codes.csv` | Raw ASC download |
| `private/winners.csv` | Working sheet (copy from example) |
| `private/entries.csv` | Exported / cleaned comments for the draw |

Never commit real codes or Facebook names.

## winners.csv columns

```csv
code,status,fb_name,fb_profile_url,grade,city,dm_date,notes
```

Statuses: `spare` | `available` | `sent` | `redeemed` | `failed` | `backup`

Suggested setup after ASC download:

1. Import all 25 codes as `available`
2. Set first 5 to `spare` (one used for smoke-test → `redeemed`)
3. After draw: fill `fb_name` / grade / city for 20 winners; keep 4 unused spares as `backup` pool if DMs fail

## DM template — English

```
Congrats! You won 1 year of Homework Palette Pro 🎉

Your one-time App Store offer code:
{{CODE}}

How to redeem:
1. Open the App Store app
2. Tap your profile photo (top right)
3. Tap “Redeem Gift Card or Code”
4. Enter the code above → Redeem
5. Open Homework Palette → if needed, tap Restore Purchases in Settings

Notes:
• This code works once. Don’t share it.
• Pro unlocks quizzes + Progress. Library & print stay free.
• After the free year, Apple may offer renewal — cancel anytime in Apple ID → Subscriptions.
{{EXPIRY_LINE}}

Reply with ✅ after you’ve redeemed so we can mark it complete. Thanks for following Homework Palette!
```

If ASC set a redeem-by date, set:

`{{EXPIRY_LINE}}` → `• Please redeem by YYYY-MM-DD.`

Otherwise delete that line.

## DM template — Khmer

```
អបអរសាទរ! អ្នកឈ្នះ Homework Palette Pro ១ឆ្នាំ 🎉

កូដ App Store (ប្រើបានម្តង):
{{CODE}}

របៀបប្តូរ៖
១. បើក App Store
២. ចុចរូបគណនី (ជ្រុងខាងស្តាំខាងលើ)
៣. ចុច “Redeem Gift Card or Code”
៤. បញ្ចូលកូដខាងលើ → Redeem
៥. បើក Homework Palette → បើចាំបាច់ ចុច Restore Purchases ក្នុង Settings

ចំណាំ៖
• កូដនេះប្រើបានម្តង — កុំចែករំលែក
• Pro = quizzes + Progress · បណ្ណាល័យនៅតែឥតគិតថ្លៃ
• បន្ទាប់ពី១ឆ្នាំ Apple អាចសួរបន្ត — បោះបង់បានក្នុង Apple ID → Subscriptions
{{EXPIRY_LINE}}

ឆ្លើយតប ✅ បន្ទាប់ពីប្តូររួច។ អរគុណដែល Follow Homework Palette!
```

## If DM fails

1. Mark row `failed` + note (e.g. “messages blocked”)
2. Pick next `backup` from draw list
3. DM that person; do **not** reuse the same code if the first person might still redeem — only reassign unused codes

## Support dos / don’ts

- Do: link privacy page https://homework.chakriya.net/
- Do: say redeem happens in **App Store**
- Don’t: ask for Apple ID / password
- Don’t: post codes on the wall
- Don’t: imply Homework Palette has an in-app “enter gift code” field
