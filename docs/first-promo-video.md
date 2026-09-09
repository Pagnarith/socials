# First Promo Video — Homework Palette

Ready-to-film **30–45s** vertical promo (hard stop under 60s).  
One master cut → TikTok + Instagram Reels → Facebook same day.

| Spec | Value |
|------|--------|
| Ratio | 9:16 |
| Export | 1080×1920 |
| Story | Problem → grade pick → one exercise → CTA |
| Handles | TikTok [@homeworkpalette](https://www.tiktok.com/@homeworkpalette) · IG [@homework_palette](https://www.instagram.com/homework_palette/) |
| App Store | https://apps.apple.com/app/id6801068446 |
| Site | https://homework.chakriya.net/ |
| Poster page | https://homework.chakriya.net/poster.html |

End-card stills (pick one):

- Khmer: `exercise/docs/assets/homework-palette-poster-km.png` (or square-km)
- English: `exercise/docs/assets/homework-palette-poster.png`

---

## Setup before you hit record

1. Phone on **Do Not Disturb**; brightness up; portrait orientation.
2. Open **Homework Palette**; pick a clean grade (e.g. Grade 3) you know well.
3. Control Center → **Screen Recording** (add Microphone if you will narrate live).
4. Optional: film a 3s face/desk hook separately, then cut to screen in CapCut/iMovie.
5. Clear the home screen path: Home → Homework Palette → grade list ready.

---

## Shot list (timed)

| Time | What you film | Taps in app | On-screen text (large, center-safe) |
|------|---------------|-------------|--------------------------------------|
| **0–3s** | Face to camera **or** homework desk (books + phone) | — | KM: `ធ្វើកិច្ចការផ្ទះលំបាក?` · EN under: `Stuck on homework?` |
| **3–12s** | Screen record: launch app → grade picker | Open app → tap **one grade** | KM: `ជ្រើសថ្នាក់របស់អ្នក` · EN: `Tap your grade` |
| **12–25s** | Open **one** library exercise; slow scroll 2–3s | Open exercise → scroll once | `Free library · Khmer & English` |
| **25–35s** *(optional, trim if long)* | Builder **or** read-aloud 3–5s | Open builder **or** tap read-aloud | `Print · build · read aloud` |
| **35–45s** | End card: poster still (QR visible) **or** App Store product page screenshot | — | `Free on the App Store` · `homework.chakriya.net` |

If you skip 25–35s, jump straight from the exercise to the end card around **25–35s** total.

---

## Spoken script

Record **one** language out loud; put the other language on-screen.

### Khmer (voice)

> ធ្វើកិច្ចការផ្ទះលំបាកមែនទែន?  
> សាកល្បង Homework Palette — មានលំហាត់ថ្នាក់ទី ១ ដល់ទី ៦ ជាភាសាខ្មែរ និងអង់គ្លេស។  
> ជ្រើសថ្នាក់… មើលលំហាត់… ឥតគិតថ្លៃនៅ App Store។

### English (voice)

> Stuck on homework?  
> Try Homework Palette — ready exercises for grades 1 to 6, in Khmer and English.  
> Pick your grade… open a worksheet… free on the App Store.

### Bilingual hybrid (recommended)

- **0–3s voice (KM):** `ធ្វើកិច្ចការផ្ទះលំបាក?`  
- **3–35s voice (EN):** short version of the English script while screen rolls  
- **End (KM or EN):** `ទាញយកឥតគិតថ្លៃ` / `Download free`

---

## CapCut Pro — project setup (do this next)

Use **CapCut Pro** (phone or desktop). Goal: one master 9:16 file under 45s.

**Prefer agent-assisted render?** Run Promo Studio (`promo-studio/`) — remote API that concatenates your clips + burns KM/EN captions. See [`../promo-studio/README.md`](../promo-studio/README.md). CapCut remains great for music/polish.

**Config pack (SRT + TTS text):** [`docs/capcut/`](capcut/README.md) — CapCut cannot be configured remotely; import these files instead.

### Fast path (Desktop / Web)

1. New project → **9:16** → name `HomeworkPalette-first-promo`.
2. Import screen recording + optional hook + poster; trim to 30–45s.
3. **Captions → Import** → [`capcut/first-promo.srt`](capcut/first-promo.srt).
4. Style captions once (large, white + stroke, middle of frame).
5. Optional: TTS paste from [`capcut/first-promo-tts-en.txt`](capcut/first-promo-tts-en.txt).
6. Export 1080p / 30fps / no watermark.

Full CapCut prefs + mobile workaround: [`capcut/README.md`](capcut/README.md).

### 1. Create the project

1. New project → ratio **9:16** (TikTok / Reels).
2. Name it `HomeworkPalette-first-promo`.
3. Import:
   - Screen recording (grade → exercise)
   - Optional 3s face/desk hook clip
   - Poster still: Khmer or EN from the end-card list above (AirDrop / Files / Photos)
4. Drop clips on the timeline in order: **hook → screen → poster** (1.5–2s).

### 2. Trim to the spine

| Beat | Target length |
|------|----------------|
| Hook | ≤ 3s |
| Screen demo | ~20–28s |
| Poster end | 1.5–2s |
| **Total** | **30–45s** |

Cut any loading spinners, notification banners, or long pauses. Keep the **first readable UI** in the first second of the screen block.

### 3. Captions (Pro)

**Option A — manual (best for Khmer):**  
Text → add overlays from the shot list. Font: bold sans; size large; white fill + dark stroke/shadow. Place in the **middle third** (avoid top status bar and bottom CapCut/TikTok UI).

Suggested layers per beat:

| Beat | Line 1 (KM) | Line 2 (EN) |
|------|-------------|-------------|
| Hook | `ធ្វើកិច្ចការផ្ទះលំបាក?` | `Stuck on homework?` |
| Grade | `ជ្រើសថ្នាក់របស់អ្នក` | `Tap your grade` |
| Library | `បណ្ណាល័យឥតគិតថ្លៃ` | `Free library · Khmer & English` |
| End | `ទាញយកឥតគិតថ្លៃ` | `Free on the App Store` |

**Option B — Auto Captions (EN voice):**  
Captions → Auto captions → English. Then **fix** Khmer lines by hand (auto-Khmer is often weak). Delete wrong words; keep max ~8 words on screen.

### 4. Voice (pick one)

- **You recorded mic on screen recording:** Volume → duck music under voice; noise reduce if available (Pro).
- **No voice yet:** Text-to-speech → English script from above for the screen section; keep KM hook as on-screen text only (or record KM yourself in Voiceover).
- Do **not** rely on AI TTS for long Khmer until you preview quality.

### 5. Music / AI extras (keep light)

1. Sounds → low-key upbeat track (education / soft pop).
2. Set music to about **−12 to −18 dB** under voice (Pro volume keyframes help).
3. Skip heavy AI “text-to-video” for the app UI — use your real screen only.
4. Optional Pro only on the **hook**: mild auto enhance / stabilize face clip. Do not beautify the screen recording (UI must stay sharp).

### 6. Brand end card

1. Poster image full frame, scale so **QR stays readable**.
2. Hold **1.5–2s**.
3. Optional small text: `homework.chakriya.net` above the safe bottom margin.

### 7. Export (Pro)

| Setting | Value |
|---------|--------|
| Resolution | **1080p** (or 4K if you want; platforms re-encode) |
| Frame rate | **30 fps** |
| Format | MP4 |
| Bitrate | Recommended / High |
| Watermark | Off (Pro) |

Save to Photos / Files as `HomeworkPalette-first-promo.mp4`.

### 8. Publish from CapCut (optional)

CapCut → Share → TikTok / Instagram if linked; or export then upload in each app with the captions in this doc. Prefer posting from TikTok/IG apps so bio links and pin comments work cleanly.

---

## CapCut / iMovie edit checklist

1. Trim dead air; keep first hook under **3 seconds**.
2. Add on-screen text from the shot table (high contrast; avoid bottom UI safe zone ~15%).
3. Optional light trending audio under narration (duck music −12 to −18 dB).
4. Last frame = poster still for **1.5–2s** (QR readable).
5. Export **1080×1920**, H.264, no watermark.

---

## Captions to paste when posting

### TikTok / Instagram Reel

```
Stuck on homework? Grades 1–6 help for families — Khmer & English.

Homework Palette is free on the App Store.
📱 https://apps.apple.com/app/id6801068446
🌐 https://homework.chakriya.net/

ធ្វើកិច្ចការផ្ទះលំបាក? សាកល្បង Homework Palette — ឥតគិតថ្លៃ!

#HomeworkPalette #FamilyHomework #Grade1to6 #Khmer #Cambodia #ParentTips #EdTech #iOSApps #AppStore #BilingualKids #LearnOnTikTok
```

### Facebook (same video)

```
Homework help for grades 1–6 — free library in Khmer & English.

Download Homework Palette:
https://apps.apple.com/app/id6801068446

Website: https://homework.chakriya.net/
Poster: https://homework.chakriya.net/poster.html

Which grade are you helping with this week?
```

### Pin comment (TikTok + IG)

```
Free download → https://apps.apple.com/app/id6801068446
Site → https://homework.chakriya.net/
```

---

## Post checklist

- [ ] Bio link points to https://homework.chakriya.net/ (or App Store)
- [ ] Post TikTok `@homeworkpalette` first
- [ ] Post same file as Instagram Reel `@homework_palette`
- [ ] Share to Facebook Page same day with FB caption above
- [ ] Pin comment with App Store + site on TikTok and IG
- [ ] Save the master `.mp4` for “best moments” / week recap later
- [ ] Optional: Telegram `/today` still guides daily posts; this brief is the **first promo** master

---

## After this video

Reuse the screen take as cuts:

- 15s **grade pick only** (Wed TikTok tip)
- Still + 3 bullets (FB feature highlight)
- Story frames: tip → grade → CTA (IG)

Weekly calendar: see `docs/content-strategy.md` and Telegram `/today`.
