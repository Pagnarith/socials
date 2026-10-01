# Phase 1 — App Store Connect Offer Codes

You must do this in **App Store Connect** (API creation of offer-code batches is limited / UI is the reliable path).

## Create codes

1. Open [App Store Connect](https://appstoreconnect.apple.com) → **Homework Palette**.
2. **Monetization → Subscriptions** → group **Palette Pro** → product **`palette.pro.yearly`**.
3. Open **Subscription Offer Codes** (or **Offer Codes**).
4. Create a new campaign:
   - **Reference name:** `FB-Followers-2026-Q3`
   - **Offer type:** one-time use codes (customer redeemable)
   - **Duration / free period:** **1 year** (align with yearly Pro access)
   - **Number of codes:** **25** (20 winners + 5 spare)
   - **Territories:** all countries where Homework Palette is sold (include **Cambodia**)
   - **Expiration (optional):** set a redeem-by date ~30 days after winner DMs (note it in DMs)
5. Generate → **Download CSV**.
6. Move the CSV to:

```text
socials/docs/facebook-pro-giveaway/private/offer-codes.csv
```

(This path is gitignored.)

## CSV hygiene

Expected columns (Apple’s export may vary slightly):

| code | status | notes |
|------|--------|-------|
| XXXX-XXXX-XXXX | spare / available / sent / redeemed / failed | |

Copy codes into [private/winners.example.csv](private/winners.example.csv) → save as `private/winners.csv`.

Mark **5 rows** as `spare` immediately. Use one spare for the smoke test.

## Smoke-test (required before announcing)

1. Take **1 spare** code.
2. On a device / Apple ID you control (production or Sandbox as appropriate):
   - **App Store → account → Redeem Gift Card or Code**
   - Paste the code → confirm
3. Open **Homework Palette** → Settings or Start Quiz:
   - Pro unlocked (quizzes + Progress)
   - **Restore Purchases** still works
4. Mark that code `status=redeemed` / `notes=smoke-test` in `winners.csv`.
5. Remaining spare count should be **4**.

## Checklist

- [ ] Campaign `FB-Followers-2026-Q3` created for `palette.pro.yearly`
- [ ] 25 one-time codes downloaded
- [ ] CSV stored only under `private/`
- [ ] 1 spare redeemed successfully; Pro confirmed in-app
- [ ] Winner DM templates ready ([04-ops-and-dms.md](04-ops-and-dms.md))

## Notes

- Codes grant subscription via **Apple ID**. After the free year, Apple may prompt to renew unless the user cancels in Settings → Apple ID → Subscriptions.
- Family Sharing follows your Palette Pro group settings.
- Never ask winners for Apple ID passwords.
