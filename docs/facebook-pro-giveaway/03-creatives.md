# Creatives — Facebook Event / feed / Stories

Generated from existing promo assets (Lost-in-library hook + mother/son poster):

| File | Use | Size |
|------|-----|------|
| [creatives/fb-event-cover.jpg](creatives/fb-event-cover.jpg) | Event cover | 1920×1005 |
| [creatives/fb-feed-square.jpg](creatives/fb-feed-square.jpg) | Feed launch post | 1080×1080 |
| [creatives/fb-story-how-to-enter.jpg](creatives/fb-story-how-to-enter.jpg) | Story | 1080×1920 |
| [creatives/fb-story-what-you-win.jpg](creatives/fb-story-what-you-win.jpg) | Story | 1080×1920 |
| [creatives/fb-story-redeem.jpg](creatives/fb-story-redeem.jpg) | Story | 1080×1920 |

## Source assets

- `exercise/docs/assets/promo-hook-lost-in-library.png`
- `exercise/docs/assets/homework-palette-poster-km.png`

## Regenerate

```bash
cd socials/docs/facebook-pro-giveaway
python3 -m venv .venv && .venv/bin/pip install pillow
.venv/bin/python scripts/compose_creatives.py
```

## Optional video

Promo Studio `library-tour` render can be attached as a short Event or feed clip (no codes on-screen).

## Character rule

Keep mother/son look consistent with `exercise/.cursor/rules/promo-characters.mdc` — do not invent new hero faces for this giveaway.
