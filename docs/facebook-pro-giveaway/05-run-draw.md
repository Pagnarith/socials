# Run the draw & fulfill winners

Use this after the Event end date. Do **not** skip ASC smoke-test ([01-asc-offer-codes.md](01-asc-offer-codes.md)).

## Day-by-day (from the plan)

| When | Action |
|------|--------|
| T-2 | Generate 25 codes; test 1 spare; lock CSV in `private/` |
| T-0 | Publish Event; pin rules; post launch creative |
| Mid-week | Reminder + Story; answer “library free?” |
| Deadline | Close entries; export comments → `private/entries.csv` |
| +1 day | Run draw → 20 winners + backups |
| +1–2 days | DM unique codes; update `winners.csv` |
| +3 days | Public congrats **without codes** |

## 1. Export comments

From Facebook Event → comments (manual copy or export tool).

Save as `private/entries.csv`:

```csv
fb_name,fb_profile_url,comment_text,comment_time
```

Eligibility checklist (human pass before draw):

- [ ] Follows the page (spot-check where possible)
- [ ] Interested / Going on the Event
- [ ] Comment includes grade **1–6** / **១–៦**
- [ ] One row per Facebook profile (dedupe)

Mark ineligible rows by deleting them or adding a column `eligible=no` and filtering.

## 2. Random draw

From `socials/`:

```bash
cd docs/facebook-pro-giveaway
python3 scripts/draw_winners.py \
  --entries private/entries.csv \
  --winners-out private/draw-result.csv \
  --count 20 \
  --backups 5
```

Add `--seed YYYYMMDD` only if you need a reproducible audit trail; otherwise omit and record the seed printed by the script.

## 3. Assign codes

1. Open `private/winners.csv` (codes already imported).
2. Take 20 rows with `status=available`.
3. Fill `fb_name`, grade/city from `draw-result.csv`.
4. Keep remaining unused as `backup` / `spare`.

## 4. DM winners

Use templates in [04-ops-and-dms.md](04-ops-and-dms.md).

For each send:

- `status` → `sent`
- `dm_date` → today
- Never paste the code into a public post or comment

Ask winners to reply ✅ after redeem → `status=redeemed`.

## 5. Public congrats (no codes)

```
🎉 Congrats to our 20 Homework Palette Pro winners!

We’ve messaged each winner with a unique App Store code via official page DM.
If you think you won but didn’t get a DM within 48h, comment below and we’ll check.

អបអរសាទរ អ្នកឈ្នះ ២០ នាក់!
យើងបានផ្ញើកូដតាម DM ផ្លូវការ។ បើគិតថាឈ្នះតែមិនទាន់បាន DM ក្នុង ៤៨ម៉ោង សូម comment។

Download: https://homework.chakriya.net/
Library stays free — Pro = quizzes + Progress.
```

Optional: @mention first names only (no codes).

## 6. Measure

- Interested / Going count  
- Unique eligible comments  
- Codes sent vs ✅ redeemed  
- App Store downloads / new subs in following 2 weeks  

Save notes at the bottom of `private/winners.csv` or a local `private/learnings.md`.
