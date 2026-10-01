# Facebook giveaway — Free Palette Pro (1 year)

Kit for the Facebook Event that gives **20** followers a free year of **Homework Palette Pro** via Apple **Subscription Offer Codes** (`palette.pro.yearly`).

## Folder map

| Path | Purpose |
|------|---------|
| [01-asc-offer-codes.md](01-asc-offer-codes.md) | Create + test codes in App Store Connect |
| [02-facebook-event-copy.md](02-facebook-event-copy.md) | Event title, description, pinned rules (EN+KM) |
| [03-creatives.md](03-creatives.md) | Cover / feed / Story assets |
| [creatives/](creatives/) | Ready-to-upload images |
| [04-ops-and-dms.md](04-ops-and-dms.md) | Tracking sheet + winner DM templates |
| [05-run-draw.md](05-run-draw.md) | Close event, draw, fulfill, congrats post |
| [private/](private/) | **Gitignored** — real CSV codes + winner sheet |
| [scripts/draw_winners.py](scripts/draw_winners.py) | Random draw from comments CSV |

## Flow

1. Generate **25** one-time offer codes in ASC (20 prizes + 5 spare) → save CSV under `private/` (not git).
2. Test **1 spare** redeem → confirm Pro unlocks.
3. Publish Facebook Event using copy in `02-…` + creatives.
4. After deadline: export comments → `draw_winners.py` → DM codes from templates.
5. Public congrats **without** posting codes.

## Do not

- Post codes on the event wall or in comments
- Invent app-side “subscription codes” (StoreKit has no redeem field)
- Commit `private/*.csv` or winner names to git
