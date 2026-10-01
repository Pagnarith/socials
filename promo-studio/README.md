# Promo Studio — Homework Palette

Remote **video assemble API** so you and the Cursor agent can build CapCut-style promos together.

This is **not** a CapCut clone (no timeline GUI editor). It is a local/remote service that:

1. Accepts HP Promo exports (`hook.png`/`hook.mp4`, `screen.mp4`, `poster.png`/`poster.mp4`) + optional voice
2. Applies a JSON timeline (hook → screen → end card)
3. Burns bilingual SRT captions
4. Mixes EN and/or KM voice-over
5. Returns a 9:16 MP4

## Quick start

```bash
cd promo-studio
cp .env.example .env   # set PROMO_STUDIO_API_KEY for shared use
npm install
npm run dev
```

Open http://localhost:8787 — or call the API below.

Requires **ffmpeg** (+ **ffprobe**) on PATH (`brew install ffmpeg`).

## HP Promo → Promo Studio

Film assets in **HP Promo** (`exercise/ios/HomeworkPalettePromo`), then upload here.

| HP Promo flow | Export | Promo Studio template |
|---------------|--------|------------------------|
| Screen · Library tour | `screen.mp4` (+ optional mic/reaction) | `library-tour` |
| Screen · Grade focus | `screen.mp4` (+ optional mic/reaction) | `grade-focus` |
| Screen · Open a pack | `screen.mp4` (+ optional mic/reaction) | `open-pack` |
| Screen · Print & practice | `screen.mp4` (+ optional mic/reaction) | `print-practice` |
| Screen · Bilingual night | `screen.mp4` (+ optional mic/reaction) | `bilingual-night` |
| Hook · Lost in library | `hook.png` or `hook.mp4` | preferred hook for `library-tour` |
| Hook · Home greeting | `hook.png` or `hook.mp4` | preferred hook for `open-pack` / `print-practice` / `bilingual-night` |
| Poster · App Store / Khmer card | `poster.png` or `poster.mp4` | every template (endcard) |

In HP Promo, **Add to export** = None / Voice (mic) / Reaction (camera) / Both. Stills become MP4 when not None.

Every template expects:

| Slot | File | Notes |
|------|------|--------|
| hook | `hook.png` **or** `hook.mp4` | Still ~3s, or short reaction/voice clip |
| screen | `screen.mp4` | UI tour (± mic / camera PiP) |
| endcard | `poster.png` **or** `poster.mp4` | Still ~2s, or short reaction/voice clip |
| voice-en | `voice-en.mp3` | Optional — script in `templates/*-tts-en.txt` |
| voice-km | `voice-km.mp3` | Optional — script in `templates/*-tts-km.txt` |

Generate voice offline (CapCut / system TTS / Gemini) from the `*-tts-*.txt` scripts, then upload.

## Templates

| Name | Screen tour | Captions / scripts |
|------|-------------|--------------------|
| `first-promo` | Generic / first cut | `first-promo.srt`, `first-promo-tts-en.txt`, `first-promo-tts-km.txt` |
| `library-tour` | Library tour (opens on Lost in library hook) | `library-tour.srt`, `library-tour-tts-*.txt` |
| `grade-focus` | Grade focus | `grade-focus.srt`, `grade-focus-tts-*.txt` |
| `open-pack` | Open a pack (Home greeting hook) | `open-pack.srt`, `open-pack-tts-*.txt` |
| `print-practice` | Print & practice | `print-practice.srt`, `print-practice-tts-*.txt` |
| `bilingual-night` | Bilingual night (EN → KM) | `bilingual-night.srt`, `bilingual-night-tts-*.txt` |

## Agent workflow

1. Run HP Promo → export `screen.mp4`, hook + poster as PNG or MP4.
2. Upload assets (+ optional `voice-en.mp3` / `voice-km.mp3`).
3. Render with template `library-tour`, `grade-focus`, `open-pack`, `print-practice`, or `bilingual-night` and `voiceLanguage`.
4. Download MP4, tweak SRT/scripts, re-render.

```bash
# Upload
curl -s -X POST http://localhost:8787/v1/assets \
  -H "Authorization: Bearer $PROMO_STUDIO_API_KEY" \
  -F file=@screen.mp4 -F name=screen.mp4

# Render (returns 202 — poll job)
JOB=$(curl -s -X POST http://localhost:8787/v1/render \
  -H "Authorization: Bearer $PROMO_STUDIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"template":"library-tour","voiceLanguage":"en"}')
echo "$JOB"
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/health` | Liveness |
| GET | `/v1/templates` | List templates (+ requirements) |
| GET | `/v1/templates/:name` | Template JSON |
| POST | `/v1/assets` | Upload file (`multipart file` + optional `name`) |
| GET | `/v1/assets` | List uploads |
| POST | `/v1/validate` | Check uploads vs template |
| POST | `/v1/render` | Queue render (`202` + `id`); body may include `voiceLanguage`: `en` \| `km` \| `both` |
| GET | `/v1/jobs/:id` | Job status / progress / result |
| GET | `/v1/jobs/:id/download` | MP4 |

Auth: `Authorization: Bearer <PROMO_STUDIO_API_KEY>` or `x-api-key`.  
If the key is unset / still the example value, the API stays open for local dev.

## Timeline schema

```json
{
  "name": "library-tour",
  "width": 1080,
  "height": 1920,
  "fps": 30,
  "voiceLanguage": "en",
  "clips": [
    { "id": "hook", "type": "either", "asset": "hook.png", "assets": ["hook.mp4", "hook.png"], "duration": 3, "maxDuration": 8 },
    { "id": "screen", "type": "video", "asset": "screen.mp4", "maxDuration": 45 },
    { "id": "endcard", "type": "either", "asset": "poster.png", "assets": ["poster.mp4", "poster.png"], "duration": 2, "maxDuration": 8 }
  ],
  "audio": [
    { "id": "voice-en", "type": "audio", "asset": "voice-en.mp3", "language": "en", "required": false },
    { "id": "voice-km", "type": "audio", "asset": "voice-km.mp3", "language": "km", "required": false }
  ],
  "subtitles": "library-tour.srt"
}
```

`voiceLanguage: "both"` concatenates EN then KM under the video (`-shortest`).

## What comes later

- Cloud host (Fly/Railway) — Vercel is a poor fit for long ffmpeg jobs
- Built-in TTS synthesis
- Music bed + ducking under voice
- Full visual editor UI

## iOS automation companion

- Project: `exercise/ios/HomeworkPalettePromo`
- Bundle ID: `com.pagnarith.homeworkpalette.promo`
- Docs: `exercise/ios/HomeworkPalettePromo/PROMO_TOUR.md`
