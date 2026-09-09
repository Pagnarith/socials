/** Minimal SRT parser → cues with start/end seconds and lines */

function parseTimestamp(ts) {
  const m = ts.trim().match(/(\d+):(\d+):(\d+),(\d+)/);
  if (!m) return 0;
  const [, hh, mm, ss, ms] = m;
  return (
    Number(hh) * 3600 +
    Number(mm) * 60 +
    Number(ss) +
    Number(ms) / 1000
  );
}

export function parseSrt(text) {
  const blocks = text.replace(/\r\n/g, '\n').trim().split(/\n\n+/);
  const cues = [];
  for (const block of blocks) {
    const lines = block.split('\n').filter(Boolean);
    if (lines.length < 2) continue;
    const timeLine = lines[0].includes('-->') ? lines[0] : lines[1];
    if (!timeLine?.includes('-->')) continue;
    const [startRaw, endRaw] = timeLine.split('-->').map((s) => s.trim());
    const textLines = lines[0].includes('-->') ? lines.slice(1) : lines.slice(2);
    cues.push({
      start: parseTimestamp(startRaw),
      end: parseTimestamp(endRaw),
      lines: textLines,
    });
  }
  return cues;
}
