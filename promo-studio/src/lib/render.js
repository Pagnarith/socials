import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { ffmpegBin, UPLOADS_DIR, OUTPUTS_DIR, TEMPLATES_DIR } from './paths.js';

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve({ stderr });
      else reject(new Error(`${cmd} exited ${code}\n${stderr.slice(-4000)}`));
    });
  });
}

async function report(onProgress, progress) {
  if (typeof onProgress === 'function') {
    await onProgress(progress);
  }
}

async function probeDuration(filePath) {
  try {
    const out = await new Promise((resolve, reject) => {
      const child = spawn(
        'ffprobe',
        ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filePath],
        { stdio: ['ignore', 'pipe', 'pipe'] },
      );
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (c) => { stdout += c; });
      child.stderr.on('data', (c) => { stderr += c; });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) resolve(stdout.trim());
        else reject(new Error(stderr));
      });
    });
    const n = Number.parseFloat(out);
    if (Number.isFinite(n) && n > 0) return n;
  } catch {
    // ignore
  }
  return null;
}

async function findAsset(name, workDir) {
  const candidates = [
    path.join(workDir, name),
    path.join(UPLOADS_DIR, name),
    path.join(TEMPLATES_DIR, name),
  ];
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }
  throw new Error(`Asset not found: ${name}`);
}

async function normalizeClip({ input, output, width, height, fps, maxDuration, duration, type }) {
  const vf = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps}`;

  if (type === 'image') {
    await run(ffmpegBin(), [
      '-y',
      '-loop', '1',
      '-t', String(duration ?? 2),
      '-i', input,
      '-vf', vf,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-an',
      output,
    ]);
    return;
  }

  const args = ['-y', '-i', input];
  if (maxDuration) args.push('-t', String(maxDuration));
  args.push('-vf', vf, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-an', output);
  await run(ffmpegBin(), args);
}

async function concatClips(clipPaths, outPath) {
  const listFile = `${outPath}.txt`;
  const body = clipPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
  await fs.writeFile(listFile, body, 'utf8');
  await run(ffmpegBin(), [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', listFile,
    '-c', 'copy',
    outPath,
  ]);
}

/** Burn captions by overlaying PNG cues (works without libass/drawtext). */
async function burnCaptionsWithOverlays(videoPath, srtPath, outPath, workDir, size, onProgress) {
  await report(onProgress, {
    step: 'captions-prepare',
    message: 'Preparing caption overlays…',
    percent: null,
  });
  const { prepareCaptionOverlays } = await import('./captions.js');
  const overlays = await prepareCaptionOverlays(srtPath, workDir, size, {
    onCue: async (i, total) => {
      await report(onProgress, {
        step: 'captions-prepare',
        message: `Preparing captions (${i + 1}/${total})…`,
        cueIndex: i,
        cueCount: total,
        percent: null,
      });
    },
  });
  if (!overlays.length) {
    await fs.copyFile(videoPath, outPath);
    return { method: 'none' };
  }

  await report(onProgress, {
    step: 'captions-burn',
    message: `Burning ${overlays.length} caption overlays…`,
    percent: null,
  });

  const args = ['-y', '-i', videoPath];
  for (const o of overlays) {
    args.push('-i', o.png);
  }

  // [0][1]overlay=enable=...[v1];[v1][2]overlay=...
  const filters = [];
  let last = '[0:v]';
  overlays.forEach((o, i) => {
    const inputIdx = i + 1;
    const outLabel = i === overlays.length - 1 ? '[vout]' : `[v${i}]`;
    const enable = `between(t\\,${o.start.toFixed(3)}\\,${o.end.toFixed(3)})`;
    filters.push(
      `${last}[${inputIdx}:v]overlay=0:0:enable='${enable}'${outLabel}`,
    );
    last = outLabel;
  });

  args.push(
    '-filter_complex', filters.join(';'),
    '-map', '[vout]',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-an',
    outPath,
  );
  await run(ffmpegBin(), args);
  return { method: 'png-overlay', cues: overlays.length };
}

export async function renderTimeline(timeline, jobId, workDir, { onProgress } = {}) {
  const width = timeline.width ?? 1080;
  const height = timeline.height ?? 1920;
  const fps = timeline.fps ?? 30;
  const clips = timeline.clips ?? [];
  if (!clips.length) throw new Error('timeline.clips is required');

  const normDir = path.join(workDir, 'normalized');
  await fs.mkdir(normDir, { recursive: true });

  const normalized = [];
  for (let i = 0; i < clips.length; i += 1) {
    const clip = clips[i];
    const label = clip.asset || clip.id || `clip ${i + 1}`;
    await report(onProgress, {
      step: 'normalize',
      message: `Normalizing ${label} (${i + 1}/${clips.length})…`,
      percent: Math.max(2, Math.round(((i + 0.5) / (clips.length + 3)) * 100)),
      clipIndex: i,
      clipCount: clips.length,
    });
    const assetPath = await findAsset(clip.asset, workDir);
    const out = path.join(normDir, `${String(i).padStart(2, '0')}-${clip.id || 'clip'}.mp4`);
    await normalizeClip({
      input: assetPath,
      output: out,
      width,
      height,
      fps,
      maxDuration: clip.maxDuration,
      duration: clip.duration,
      type: clip.type || 'video',
    });
    normalized.push(out);
  }

  await report(onProgress, {
    step: 'concat',
    message: 'Concatenating clips…',
    percent: Math.round((clips.length / (clips.length + 3)) * 100),
  });
  const concatPath = path.join(workDir, 'concat.mp4');
  await concatClips(normalized, concatPath);

  const finalPath = path.join(OUTPUTS_DIR, `${jobId}.mp4`);
  let captions = { method: 'skipped' };
  if (timeline.subtitles) {
    const captionBase = Math.round(((clips.length + 1) / (clips.length + 3)) * 100);
    const captionSpan = Math.max(8, Math.round(100 / (clips.length + 3)));
    await report(onProgress, {
      step: 'captions',
      message: 'Burning captions…',
      percent: captionBase,
    });
    const srtPath = await findAsset(timeline.subtitles, workDir);
    const burned = path.join(workDir, 'with-subs.mp4');
    captions = await burnCaptionsWithOverlays(
      concatPath,
      srtPath,
      burned,
      workDir,
      { width, height },
      async (p) => {
        let pct = captionBase;
        if (p.step === 'captions-prepare' && p.cueCount) {
          pct = captionBase + Math.round((captionSpan * 0.7 * ((p.cueIndex || 0) + 1)) / p.cueCount);
        } else if (p.step === 'captions-burn') {
          pct = captionBase + Math.round(captionSpan * 0.85);
        } else if (p.percent != null) {
          pct = p.percent;
        }
        await report(onProgress, { ...p, percent: Math.min(captionBase + captionSpan - 1, pct) });
      },
    );
    await report(onProgress, {
      step: 'finalize',
      message: 'Writing final MP4…',
      percent: Math.round(((clips.length + 2) / (clips.length + 3)) * 100),
    });
    await fs.copyFile(burned, finalPath);
  } else {
    await report(onProgress, {
      step: 'finalize',
      message: 'Writing final MP4…',
      percent: Math.round(((clips.length + 2) / (clips.length + 3)) * 100),
    });
    await fs.copyFile(concatPath, finalPath);
  }

  await report(onProgress, {
    step: 'probe',
    message: 'Probing output…',
    percent: 98,
  });
  const duration = await probeDuration(finalPath);
  await report(onProgress, {
    step: 'done',
    message: 'Render complete',
    percent: 100,
  });
  return {
    outputPath: finalPath,
    outputFile: `${jobId}.mp4`,
    duration,
    width,
    height,
    fps,
    captions,
  };
}
