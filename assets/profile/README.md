# Social Media Profiles — Homework Palette

> Brand: **Homework Palette** · Publisher: **Chakriya**  
> Product: Grade 1–6 homework for families (Khmer & English)  
> Display name on all platforms: **Homework Palette**

```bash
# Push live names/bios where APIs allow
npm run rebrand:socials
```

Handles may still be `@iprickypagnarith` / `chakriyanet` until renamed in each app.

---

## Profile Images

SVGs in `assets/profile/` (800×800), purple Homework Palette book mark + platform accent.

| Platform  | File                      | Accent              |
|-----------|---------------------------|---------------------|
| YouTube   | `youtube-profile.svg`     | Red                 |
| Facebook  | `facebook-profile.svg`    | Blue                |
| Instagram | `instagram-profile.svg`   | IG gradient tones   |
| TikTok    | `tiktok-profile.svg`      | Cyan + Pink         |
| Telegram  | `telegram-profile.svg`    | Telegram blue       |
| App Store | `appstore-profile.svg`    | Palette purple      |
| BMC       | `buymeacoffee-profile.svg`| Yellow              |

**Export PNG:**
```bash
# Using rsvg-convert (brew install librsvg)
for f in assets/profile/*.svg assets/banner/*.svg; do
  rsvg-convert -w 800 -h 800 "$f" -o "${f%.svg}.png" 2>/dev/null || true
done
```

Banners: `assets/banner/youtube-banner.svg`, `facebook-cover.svg`, `youtube-watermark.svg`.

---

## Bios

Canonical paste-ready copy lives in [`docs/platform-bios.md`](../../docs/platform-bios.md).

**Primary links**

| Link | URL |
|------|-----|
| App Store | https://apps.apple.com/app/id6801068446 |
| Site | https://homework.chakriya.net/ |
| Poster | https://homework.chakriya.net/poster.html |
| Ops dashboard | https://social.chakriya.net |

**Hashtags**

```
#HomeworkPalette #FamilyHomework #Grade1to6 #Khmer #Cambodia #ParentTips #EdTech #iOSApps #AppStore #BilingualKids
```

---

## Cross-Platform Accounts (current)

| Platform  | URL |
|-----------|-----|
| YouTube   | https://youtube.com/channel/UC3yMwRX2Cz-08IRrS9tIHYg |
| Facebook  | https://www.facebook.com/chakriyanet |
| Instagram | https://instagram.com/iprickypagnarith |
| TikTok    | https://tiktok.com/@iprickypagnarith |
| Dashboard | https://social.chakriya.net |
