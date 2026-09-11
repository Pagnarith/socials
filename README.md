# Homework Palette — Social Ops Hub

Multi-platform content ops for **Homework Palette**: grades 1–6 homework for families (Khmer & English), free on the App Store. Publisher: **Chakriya**.

## Mission

Grow downloads and Palette Pro awareness across YouTube, Facebook, Instagram, TikTok, and Telegram — while keeping a free homework library for families.

## Project Structure

```
socials/
├── dashboard/           # Next.js ops dashboard (social.chakriya.net)
├── telegram-bot/        # Telegram bot — menus, bios, reminders
├── dataverse/           # Dataverse schema & client
├── docs/                # Content strategy, bios, platform plans
└── scripts/             # YouTube/Facebook/Telegram utilities
```

## Product

| Item | Detail |
|------|--------|
| **App** | Homework Palette (iPhone & iPad) |
| **App Store** | https://apps.apple.com/app/id6801068446 |
| **Site** | https://homework.chakriya.net/ |
| **Poster** | https://homework.chakriya.net/poster.html |
| **Free** | Library, print, builder, read-aloud, lesson recorder |
| **Pro** | In-app quizzes (Palette Pro) |

## Content Pillars

1. App demos (library, builder, recorder)
2. Parent tips (routines, bilingual practice)
3. Khmer + English homework moments
4. Lesson-recorder clips
5. App Store CTAs / poster QR shares

## Platforms

| Platform | Purpose |
|----------|---------|
| **YouTube** | Longer demos & walkthroughs |
| **Facebook** | Family reach + App Store CTAs |
| **Instagram** | Reels & Stories |
| **TikTok** | Short tips & viral clips |
| **Telegram** | Bot menus, reminders, community |

## Tech Stack

- **Frontend:** Next.js 14 dashboard on GitHub Pages ([social.chakriya.net](https://social.chakriya.net))
- **Live metrics API:** Vercel (`/api/analytics/overview`) using YouTube / Meta / Telegram tokens
- **Bot:** Node.js + Telegraf (same Vercel project)
- **Database:** Microsoft Dataverse
- **APIs:** YouTube, Facebook/Instagram Graph, TikTok, Telegram

Dashboard cards refresh from `NEXT_PUBLIC_METRICS_API_BASE` (default `https://socials-seven-beta.vercel.app`) every 5 minutes.

## Getting Started

```bash
npm install
cp .env.example .env

npm run dev:dashboard   # Next on :3000
npm run dev:bot         # Telegram bot
```

## Financial Goals

Apple App Store–first plan (Palette Pro + social acquisition): [docs/financial-plan.md](docs/financial-plan.md).
