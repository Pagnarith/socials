# TikTok Developer — App Review form (Login Kit)

Copy these values into the TikTok for Developers app submission form.

## Basic information

| Field | Value |
|-------|--------|
| **App icon** | Upload `docs/tiktok-app-review/app-icon-1024.png` (1024×1024 PNG, Homework Palette icon) |
| **App name** | `Homework Palette` |
| **Category** | Education |
| **Description** (≤120) | see below |
| **Terms of Service URL** | `https://social.chakriya.net/terms.html` |
| **Privacy Policy URL** | `https://social.chakriya.net/privacy.html` |
| **Platforms** | ✅ **Web** (uncheck Desktop/Android/iOS unless you truly ship them) |
| **Web/Desktop URL** | `https://social.chakriya.net/` |

### Description (119 characters)

```
Social Ops for Homework Palette. Admins connect @homeworkpalette via Login Kit to show follower stats on our dashboard.
```

Character count: 119 / 120.

Shorter fallback (98):

```
Homework Palette Social Ops: connect @homeworkpalette with Login Kit to display TikTok stats for our team.
```

---

## Products → Login Kit

| Field | Value |
|-------|--------|
| **Redirect URI** | `https://socials-seven-beta.vercel.app/api/tiktok/callback` |

Add exactly that URI (https, no query, no hash).

### Scopes (keep these three)

- `user.info.basic` — open id, avatar, display name  
- `user.info.profile` — bio, profile links, verified  
- `user.info.stats` — followers, likes, following, video count  

---

## App review — products & scopes explanation (paste)

```
Homework Palette is a free education app for families (grades 1–6 homework,
Khmer & English). Chakriya runs Social Ops at https://social.chakriya.net/ to
manage our official social accounts.

Product: Login Kit
We use Login Kit on the web so an authorized admin can connect our own TikTok
account @homeworkpalette. Flow:

1) Admin opens https://social.chakriya.net/connect-tiktok/
2) Clicks “Connect TikTok” → https://socials-seven-beta.vercel.app/api/tiktok/authorize
3) TikTok login + consent for the scopes below
4) Callback stores tokens for server-side metrics
5) Dashboard Platform Overview / Analytics shows TikTok follower and engagement stats

Scopes:
• user.info.basic — identify the connected account (open_id, display name, avatar)
• user.info.profile — show username/bio context for the official brand account
• user.info.stats — read follower_count, likes_count, following_count, video_count
  for ops KPIs on social.chakriya.net

We do not request posting, messaging, or other users’ data. Login Kit is only
for our official account metrics, not for end-user login inside the iOS homework app.
```

(~980 characters — trim if the form counter differs)

---

## Demo video (required)

Record **≥45–90s** screen capture (mp4). Domain in the video must be **social.chakriya.net**.

### Storyboard

1. **0–5s** — Open Safari → `https://social.chakriya.net/` (show URL bar).  
2. **5–15s** — Go to `https://social.chakriya.net/connect-tiktok/` (full page visible).  
3. **15–25s** — Click **Connect TikTok (@homeworkpalette)**.  
4. **25–50s** — TikTok login / consent screen; approve `user.info.basic`, `user.info.profile`, `user.info.stats`.  
5. **50–70s** — Success/callback page showing connected profile + follower smoke-test.  
6. **70–90s** — Return to `https://social.chakriya.net/` (or Analytics) and show the TikTok card with live stats.

Tips TikTok listed:

- Use sandbox on Developer Portal if the app is not yet approved.  
- Show real UI and clicks.  
- Do not leave unused products/scopes selected.  
- Website URL in the form = `https://social.chakriya.net/` (same domain as the demo).

### Quick capture (macOS)

```bash
# Then edit in CapCut; export mp4 ≤50MB
open 'https://social.chakriya.net/connect-tiktok/'
```

---

## Checklist before Submit

- [ ] Icon uploaded (`app-icon-1024.png`)  
- [ ] Terms/Privacy live on social.chakriya.net (deploy Pages after this pack)  
- [ ] Redirect URI saved on Login Kit  
- [ ] Only **Web** + Login Kit + the three scopes  
- [ ] Review text pasted  
- [ ] Demo video uploaded showing connect → consent → stats  

## After approval

1. Open https://social.chakriya.net/connect-tiktok/  
2. Authorize @homeworkpalette  
3. Run `node scripts/set-tiktok-user-token.js --access … --refresh …`  
4. `vercel deploy --prod --yes`  
5. Confirm Analytics TikTok card shows `"source": "user_token"`
