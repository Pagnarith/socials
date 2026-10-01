#!/usr/bin/env python3
"""Random draw of Facebook giveaway winners from an entries CSV."""

from __future__ import annotations

import argparse
import csv
import random
import re
import sys
from pathlib import Path


GRADE_RE = re.compile(
    r"(?:grade|ថ្នាក់)\s*([1-6១២៣៤៥៦])|(?<!\d)([1-6])(?!\d)|([១២៣៤៥៦])",
    re.IGNORECASE,
)

KHMER_DIGITS = str.maketrans("១២៣៤៥៦", "123456")


def normalize_grade(text: str) -> str | None:
    m = GRADE_RE.search(text or "")
    if not m:
        return None
    raw = next(g for g in m.groups() if g)
    return raw.translate(KHMER_DIGITS)


def load_entries(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        raise SystemExit(f"No rows in {path}")
    required = {"fb_name", "comment_text"}
    missing = required - set(rows[0].keys())
    if missing:
        raise SystemExit(f"entries CSV missing columns: {sorted(missing)}")

    by_name: dict[str, dict[str, str]] = {}
    skipped = 0
    for row in rows:
        if (row.get("eligible") or "yes").strip().lower() in {"no", "false", "0"}:
            skipped += 1
            continue
        name = (row.get("fb_name") or "").strip()
        comment = (row.get("comment_text") or "").strip()
        if not name or not comment:
            skipped += 1
            continue
        grade = normalize_grade(comment)
        if not grade:
            skipped += 1
            continue
        # One entry per profile name (last comment wins)
        by_name[name.casefold()] = {
            "fb_name": name,
            "fb_profile_url": (row.get("fb_profile_url") or "").strip(),
            "comment_text": comment,
            "comment_time": (row.get("comment_time") or "").strip(),
            "grade": grade,
        }
    eligible = list(by_name.values())
    print(f"Eligible unique profiles: {len(eligible)} (skipped rows: {skipped})", file=sys.stderr)
    return eligible


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--entries", type=Path, required=True)
    p.add_argument("--winners-out", type=Path, required=True)
    p.add_argument("--count", type=int, default=20)
    p.add_argument("--backups", type=int, default=5)
    p.add_argument("--seed", type=int, default=None)
    args = p.parse_args()

    eligible = load_entries(args.entries)
    need = args.count + args.backups
    if len(eligible) < args.count:
        raise SystemExit(
            f"Only {len(eligible)} eligible entries; need at least {args.count} winners."
        )

    seed = args.seed if args.seed is not None else random.SystemRandom().randint(0, 2**31 - 1)
    rng = random.Random(seed)
    print(f"Draw seed: {seed}", file=sys.stderr)

    picked = rng.sample(eligible, k=min(need, len(eligible)))
    winners = picked[: args.count]
    backups = picked[args.count :]

    args.winners_out.parent.mkdir(parents=True, exist_ok=True)
    fields = ["rank", "role", "fb_name", "fb_profile_url", "grade", "comment_text", "comment_time"]
    with args.winners_out.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for i, row in enumerate(winners, start=1):
            w.writerow({"rank": i, "role": "winner", **row})
        for i, row in enumerate(backups, start=1):
            w.writerow({"rank": i, "role": "backup", **row})

    print(f"Wrote {len(winners)} winners + {len(backups)} backups → {args.winners_out}")


if __name__ == "__main__":
    main()
