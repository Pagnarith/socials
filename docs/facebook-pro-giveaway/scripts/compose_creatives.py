#!/usr/bin/env python3
"""Compose Facebook giveaway creatives from existing Homework Palette promo assets."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "creatives"
EXERCISE_ASSETS = Path("/Users/imphanpagnarith/projects/exercise/docs/assets")
HOOK = EXERCISE_ASSETS / "promo-hook-lost-in-library.png"
POSTER = EXERCISE_ASSETS / "homework-palette-poster-km.png"

KHMER_FONT = "/System/Library/Fonts/Supplemental/Khmer Sangam MN.ttf"
LATIN_FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"
LATIN_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def cover_fit(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    tw, th = size
    scale = max(tw / img.width, th / img.height)
    nw, nh = int(img.width * scale), int(img.height * scale)
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return resized.crop((left, top, left + tw, top + th))


def text_block(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    lines: list[tuple[str, ImageFont.ImageFont, tuple[int, int, int]]],
    gap: int = 10,
) -> None:
    x, y = xy
    for text, fnt, color in lines:
        draw.text((x, y), text, font=fnt, fill=color)
        bbox = draw.textbbox((x, y), text, font=fnt)
        y = bbox[3] + gap


def make_event_cover() -> None:
    w, h = 1920, 1005
    base = cover_fit(Image.open(HOOK).convert("RGB"), (w, h))
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, h - 300, w, h), fill=(18, 42, 66, 220))
    text_block(
        d,
        (64, h - 270),
        [
            ("ឈ្នះ Palette Pro ១ឆ្នាំឥតគិតថ្លៃ", load_font(KHMER_FONT, 48), (255, 255, 255)),
            ("Win 1 Year of Homework Palette Pro", load_font(LATIN_BOLD, 40), (255, 255, 255)),
            ("២០ នាក់ឈ្នះ · Follow + Interested + comment grade 1–6", load_font(KHMER_FONT, 32), (210, 230, 245)),
            ("homework.chakriya.net", load_font(LATIN_FONT, 28), (180, 210, 230)),
        ],
        gap=12,
    )
    Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB").save(
        OUT / "fb-event-cover.jpg", quality=92, optimize=True
    )


def make_feed_square() -> None:
    size = 1080
    base = cover_fit(Image.open(POSTER).convert("RGB"), (size, size))
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, 0, size, 180), fill=(18, 42, 66, 210))
    d.rectangle((0, size - 220, size, size), fill=(18, 42, 66, 230))
    text_block(
        d,
        (40, 28),
        [
            ("FREE Palette Pro · ១ឆ្នាំឥតគិតថ្លៃ", load_font(KHMER_FONT, 36), (255, 255, 255)),
            ("Win 1 year · 20 winners", load_font(LATIN_BOLD, 30), (210, 230, 245)),
        ],
        gap=8,
    )
    text_block(
        d,
        (40, size - 190),
        [
            ("Comment grade 1–6 · Follow + Interested", load_font(LATIN_BOLD, 30), (255, 255, 255)),
            ("Redeem in App Store · Not inside the app", load_font(LATIN_FONT, 26), (200, 220, 235)),
        ],
        gap=10,
    )
    Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB").save(
        OUT / "fb-feed-square.jpg", quality=92, optimize=True
    )


def make_story(name: str, headline_km: str, headline_en: str, detail_en: str, src: Path) -> None:
    w, h = 1080, 1920
    base = cover_fit(Image.open(src).convert("RGB"), (w, h))
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, 0, w, 200), fill=(18, 42, 66, 200))
    d.rectangle((60, 740, w - 60, 1260), fill=(18, 42, 66, 220))
    d.text((72, 70), "Homework Palette", font=load_font(LATIN_BOLD, 34), fill=(200, 220, 235))
    text_block(
        d,
        (100, 800),
        [
            (headline_km, load_font(KHMER_FONT, 44), (255, 255, 255)),
            (headline_en, load_font(LATIN_BOLD, 42), (255, 255, 255)),
            (detail_en, load_font(LATIN_FONT, 32), (210, 230, 245)),
        ],
        gap=20,
    )
    Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB").save(
        OUT / f"{name}.jpg", quality=92, optimize=True
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    if not HOOK.exists() or not POSTER.exists():
        raise SystemExit(f"Missing source assets:\n  {HOOK}\n  {POSTER}")
    make_event_cover()
    make_feed_square()
    make_story(
        "fb-story-how-to-enter",
        "របៀបចូលរួម",
        "How to enter",
        "1 Follow  ·  2 Interested  ·  3 Comment grade 1–6",
        HOOK,
    )
    make_story(
        "fb-story-what-you-win",
        "អ្វីដែលអ្នកឈ្នះ",
        "What you win",
        "1 year Palette Pro · quizzes + Progress\nLibrary stays free",
        POSTER,
    )
    make_story(
        "fb-story-redeem",
        "ប្តូរកូដក្នុង App Store",
        "Redeem in App Store",
        "Account → Redeem Gift Card or Code\n(Not inside Homework Palette)",
        HOOK,
    )
    print(f"Wrote creatives → {OUT}")


if __name__ == "__main__":
    main()
