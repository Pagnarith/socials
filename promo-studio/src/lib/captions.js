import fs from 'fs/promises';
import path from 'path';
import { parseSrt } from './srt.js';

const KHMER_FONT = '/System/Library/Fonts/Supplemental/Khmer Sangam MN.ttf';
const LATIN_FONT = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';

let fontsReady = false;
let canvasMod = null;

async function loadCanvas() {
  if (!canvasMod) {
    canvasMod = await import('@napi-rs/canvas');
  }
  return canvasMod;
}

function ensureFonts(GlobalFonts) {
  if (fontsReady) return;
  try {
    GlobalFonts.registerFromPath(KHMER_FONT, 'KhmerSangam');
  } catch {
    // ignore
  }
  try {
    GlobalFonts.registerFromPath(LATIN_FONT, 'ArialUnicode');
  } catch {
    // ignore
  }
  fontsReady = true;
}

function hasKhmer(text) {
  return /[\u1780-\u17FF]/.test(text);
}

export async function renderCuePng(cue, outPath, { width = 1080, height = 1920 } = {}) {
  const { createCanvas, GlobalFonts } = await loadCanvas();
  ensureFonts(GlobalFonts);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  const lines = cue.lines.slice(0, 3);
  const lineHeight = 70;
  const blockTop = height * 0.4 - (lines.length * lineHeight) / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';

  lines.forEach((line, i) => {
    const y = blockTop + i * lineHeight;
    const fontName = hasKhmer(line) ? 'KhmerSangam' : 'ArialUnicode';
    ctx.font = `700 46px "${fontName}", sans-serif`;
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 10;
    ctx.strokeText(line, width / 2, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(line, width / 2, y);
  });

  await fs.writeFile(outPath, await canvas.encode('png'));
  return outPath;
}

export async function prepareCaptionOverlays(srtPath, workDir, size, { onCue } = {}) {
  const text = await fs.readFile(srtPath, 'utf8');
  const cues = parseSrt(text);
  const dir = path.join(workDir, 'captions');
  await fs.mkdir(dir, { recursive: true });
  const overlays = [];
  for (let i = 0; i < cues.length; i += 1) {
    if (typeof onCue === 'function') await onCue(i, cues.length);
    const cue = cues[i];
    const png = path.join(dir, `cue-${String(i).padStart(2, '0')}.png`);
    await renderCuePng(cue, png, size);
    overlays.push({ ...cue, png });
  }
  return overlays;
}
