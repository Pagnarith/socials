# Promo Studio — Homework Palette

Remote **video assemble API** so you and the Cursor agent can build CapCut-style promos together.

This is **not** a CapCut clone (no timeline GUI editor). It is a local/remote service that:

1. Accepts your real screen recordings + poster
2. Applies a JSON timeline (hook → screen → end card)
3. Burns in bilingual SRT captions
4. Returns a 9:16 MP4 the agent can iterate on via HTTP

## Quick start

```bash
cd promo-studio
cp .env.example .env   # set PROMO_STUDIO_API_KEY for shared use
npm install
npm run dev
```

Open http://localhost:8787 — or call the API below.

Requires **ffmpeg** (+ **ffprobe**) on PATH (`brew install ffmpeg`).

## Agent workflow (how we work together)

1. You film `hook.mp4` + `screen.mp4` (see `docs/first-promo-video.md`).
2. Upload poster (or we copy from exercise assets).
3. Agent calls `POST /v1/render` with template `first-promo`.
4. You download the MP4, review, ask for timing/caption tweaks; agent updates SRT/timeline and re-renders.

```bash
# Upload
curl -s -X POST http://localhost:8787/v1/assets \
  -H "Authorization: Bearer $PROMO_STUDIO_API_KEY" \
  -F file=@screen.mp4 -F name=screen.mp4

# Render (returns 202 immediately — poll job for progress)
JOB=$(curl -s -X POST http://localhost:8787/v1/render \
  -H "Authorization: Bearer $PROMO_STUDIO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"template":"first-promo"}')
echo "$JOB"
ID=$(echo "$JOB" | python3 -c 'import sys,json; print(json.load(sys.stdin)["id"])')

# Poll until done / failed
curl -s http://localhost:8787/v1/jobs/$ID \
  -H "Authorization: Bearer $PROMO_STUDIO_API_KEY"

# Download
curl -L -o out.mp4 http://localhost:8787/v1/jobs/$ID/download \
  -H "Authorization: Bearer $PROMO_STUDIO_API_KEY"
```

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/health` | Liveness |
| GET | `/v1/templates` | List templates |
| GET | `/v1/templates/:name` | Template JSON |
| POST | `/v1/assets` | Upload file (`multipart file` + optional `name`) |
| GET | `/v1/assets` | List uploads |
| POST | `/v1/render` | Queue render (`202` + `id`); poll job for progress |
| GET | `/v1/jobs/:id` | Job status / `progress` / result |
| GET | `/v1/jobs/:id/download` | MP4 |

Auth: `Authorization: Bearer <PROMO_STUDIO_API_KEY>` or `x-api-key`.  
If the key is unset / still the example value, the API stays open for local dev.

## Timeline schema

```json
{
  "width": 1080,
  "height": 1920,
  "fps": 30,
  "clips": [
    { "id": "hook", "type": "video", "asset": "hook.mp4", "maxDuration": 3 },
    { "id": "screen", "type": "video", "asset": "screen.mp4", "maxDuration": 28 },
    { "id": "endcard", "type": "image", "asset": "poster.png", "duration": 2 }
  ],
  "subtitles": "first-promo.srt"
}
```

Default template: [`templates/first-promo.json`](templates/first-promo.json)  
Captions: [`templates/first-promo.srt`](templates/first-promo.srt)

## What comes later (not in MVP)

- Cloud host (Fly/Railway) — Vercel is a poor fit for long ffmpeg jobs
- Music / TTS mix
- Full visual editor UI

Render is already async: `POST /v1/render` returns `202` and progress lives on `GET /v1/jobs/:id`.

For now: **you film, agent renders & iterates via this API.**

## iOS automation companion

Promo recording uses the **HP Promo** clone (full copy of the app):

- Project: `exercise/ios/HomeworkPalettePromo`
- Bundle ID: `com.pagnarith.homeworkpalette.promo`
- Docs: `exercise/ios/HomeworkPalettePromo/PROMO_TOUR.md`

Production App Store app stays at `exercise/ios/HomeworkPalette`.
