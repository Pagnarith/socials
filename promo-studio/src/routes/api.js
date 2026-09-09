import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuid } from 'uuid';
import { requireApiKey } from '../lib/auth.js';
import { saveJob, loadJob, listJobs } from '../lib/jobs.js';
import { probeMedia } from '../lib/media.js';
import { renderTimeline } from '../lib/render.js';
import { UPLOADS_DIR, OUTPUTS_DIR, TEMPLATES_DIR, JOBS_DIR } from '../lib/paths.js';

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 400 * 1024 * 1024 },
});

export const apiRouter = Router();

apiRouter.use(requireApiKey);

function clipAcceptKinds(clip) {
  if (Array.isArray(clip.accept) && clip.accept.length) return clip.accept;
  if (clip.type === 'either') return ['video', 'image'];
  if (clip.type === 'image') return ['image'];
  return ['video'];
}

function clipCandidateNames(clip) {
  if (Array.isArray(clip.assets) && clip.assets.length) {
    return clip.assets.map((name) => path.basename(name));
  }
  const primary = path.basename(clip.asset || 'asset.bin');
  const kinds = clipAcceptKinds(clip);
  if (!(kinds.includes('video') && kinds.includes('image'))) {
    return [primary];
  }
  const base = primary.replace(/\.[^.]+$/, '') || primary;
  return [`${base}.mp4`, `${base}.mov`, `${base}.png`, `${base}.jpg`, `${base}.jpeg`, `${base}.webp`];
}

function clipRequirement(clip) {
  const kinds = clipAcceptKinds(clip);
  const candidates = clipCandidateNames(clip);
  return {
    id: clip.id || clip.asset,
    type: clip.type || 'video',
    accept: kinds,
    expectedName: clip.asset,
    candidates,
    seconds:
      kinds.includes('image') && !kinds.includes('video')
        ? { stillDuration: clip.duration ?? 2 }
        : kinds.includes('video') && !kinds.includes('image')
          ? { maxDuration: clip.maxDuration ?? null }
          : {
              maxDuration: clip.maxDuration ?? null,
              stillDuration: clip.duration ?? clip.maxDuration ?? 3,
            },
  };
}

async function loadTemplate(name) {
  const file = path.join(TEMPLATES_DIR, `${name}.json`);
  const raw = await fs.readFile(file, 'utf8');
  const template = JSON.parse(raw);
  return {
    ...template,
    requirements: (template.clips || []).map(clipRequirement),
  };
}

async function listUploadAssetsDetailed() {
  const names = (await fs.readdir(UPLOADS_DIR)).filter((n) => n !== '.gitkeep');
  return Promise.all(names.map(async (name) => {
    const filePath = path.join(UPLOADS_DIR, name);
    const stat = await fs.stat(filePath);
    try {
      const meta = await probeMedia(filePath);
      return { ...meta, bytes: stat.size, path: filePath };
    } catch {
      return { name, kind: null, duration: null, width: null, height: null, codec: null, bytes: stat.size, path: filePath };
    }
  }));
}

function pickUploadedAsset(clip, uploadByName, assetMap = {}) {
  const candidates = clipCandidateNames(clip);
  const preferred = assetMap[clip.asset] || assetMap[clip.id];
  if (preferred && uploadByName.has(path.basename(preferred))) {
    return uploadByName.get(path.basename(preferred));
  }
  for (const name of candidates) {
    if (uploadByName.has(name)) return uploadByName.get(name);
  }
  return null;
}

async function validateTemplateAssets(template, assetMap = {}) {
  const uploads = await listUploadAssetsDetailed();
  const uploadByName = new Map(uploads.map((asset) => [asset.name, asset]));
  const requirements = [];
  const errors = [];

  for (const clip of template.clips || []) {
    const expectedName = clip.asset;
    const kinds = clipAcceptKinds(clip);
    const candidates = clipCandidateNames(clip);
    const asset = pickUploadedAsset(clip, uploadByName, assetMap);
    const chosenName = asset?.name || candidates[0];
    const req = {
      id: clip.id || expectedName,
      type: clip.type || (kinds.length > 1 ? 'either' : kinds[0]),
      accept: kinds,
      expectedName,
      candidates,
      selectedName: chosenName,
      exists: Boolean(asset),
      valid: true,
      issues: [],
      requiredSeconds: kinds.includes('video') && !kinds.includes('image')
        ? (clip.maxDuration ?? null)
        : kinds.includes('image') && !kinds.includes('video')
          ? (clip.duration ?? 2)
          : (clip.maxDuration ?? clip.duration ?? null),
      stillDuration: kinds.includes('image') ? (clip.duration ?? clip.maxDuration ?? 3) : null,
      asset,
    };

    if (!asset) {
      req.valid = false;
      req.issues.push(`Missing upload: need one of ${candidates.join(', ')}`);
    } else if (!kinds.includes(asset.kind)) {
      req.valid = false;
      req.issues.push(`Expected ${kinds.join(' or ')}, got ${asset.kind || 'unknown file'}`);
    } else if (asset.kind === 'video') {
      if (clip.maxDuration != null && asset.duration != null && asset.duration > clip.maxDuration + 0.05) {
        req.valid = false;
        req.issues.push(`Too long: ${asset.duration.toFixed(2)}s > ${clip.maxDuration}s`);
      }
    }

    if (!req.valid) {
      errors.push(...req.issues.map((issue) => `${clip.id || expectedName}: ${issue}`));
    }
    requirements.push(req);
  }

  return {
    ok: errors.length === 0,
    template: template.name || null,
    assetMap: Object.fromEntries(
      requirements
        .filter((r) => r.selectedName)
        .map((r) => [r.expectedName, r.selectedName]),
    ),
    requirements,
    errors,
  };
}

apiRouter.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'promo-studio',
    purpose: 'Remote timeline render API for Homework Palette promos (agent-collaborative)',
  });
});

apiRouter.get('/templates', async (_req, res) => {
  const names = await fs.readdir(TEMPLATES_DIR);
  const templates = await Promise.all(
    names
      .filter((n) => n.endsWith('.json'))
      .map(async (n) => {
        const template = await loadTemplate(path.basename(n, '.json'));
        return {
          name: template.name || path.basename(n, '.json'),
          width: template.width ?? null,
          height: template.height ?? null,
          fps: template.fps ?? null,
          subtitles: template.subtitles || null,
          notes: template.notes || '',
          requirements: template.requirements,
        };
      }),
  );
  res.json({
    templates,
    assets: names.filter((n) => !n.endsWith('.json')),
  });
});

apiRouter.get('/templates/:name', async (req, res) => {
  try {
    res.json(await loadTemplate(req.params.name));
  } catch {
    res.status(404).json({ error: 'Template not found' });
  }
});

apiRouter.post('/assets', upload.array('file', 20), async (req, res) => {
  const files = req.files || [];
  if (!files.length) {
    return res.status(400).json({ error: 'multipart field "file" required (one or more)' });
  }

  const rename =
    files.length === 1 && typeof req.body.name === 'string' && req.body.name.trim()
      ? req.body.name.trim()
      : null;

  const assets = [];
  for (const file of files) {
    const original = rename || file.originalname || file.filename;
    const safe = path.basename(original).replace(/[^\w.\-()+]/g, '_');
    const dest = path.join(UPLOADS_DIR, safe);
    await fs.rename(file.path, dest);
    assets.push({ name: safe, bytes: file.size, path: dest });
  }

  // Keep single-file shape for older clients; always include `assets`.
  const body = { assets };
  if (assets.length === 1) {
    Object.assign(body, assets[0]);
  }
  res.status(201).json(body);
});

apiRouter.get('/assets', async (_req, res) => {
  res.json({
    assets: await listUploadAssetsDetailed(),
  });
});

apiRouter.delete('/assets/:name', async (req, res) => {
  const safe = path.basename(req.params.name).replace(/[^\w.\-()+]/g, '_');
  if (!safe || safe === '.gitkeep') {
    return res.status(400).json({ error: 'Invalid asset name' });
  }
  const dest = path.join(UPLOADS_DIR, safe);
  try {
    await fs.unlink(dest);
    return res.json({ deleted: safe });
  } catch {
    return res.status(404).json({ error: 'Asset not found' });
  }
});

apiRouter.post('/validate', async (req, res) => {
  const templateName = req.body?.template;
  if (!templateName) {
    return res.status(400).json({ error: 'template is required' });
  }
  try {
    const template = await loadTemplate(templateName);
    const result = await validateTemplateAssets(template, req.body?.assetMap || {});
    return res.status(result.ok ? 200 : 422).json(result);
  } catch {
    return res.status(404).json({ error: `Template not found: ${templateName}` });
  }
});

apiRouter.get('/jobs', async (_req, res) => {
  res.json({ jobs: await listJobs() });
});

apiRouter.get('/jobs/:id', async (req, res) => {
  try {
    res.json(await loadJob(req.params.id));
  } catch {
    res.status(404).json({ error: 'Job not found' });
  }
});

apiRouter.get('/jobs/:id/download', async (req, res) => {
  const file = path.join(OUTPUTS_DIR, `${req.params.id}.mp4`);
  try {
    await fs.access(file);
    res.download(file, `promo-${req.params.id}.mp4`);
  } catch {
    res.status(404).json({ error: 'Output not ready' });
  }
});

/**
 * Body:
 * {
 *   "template": "first-promo",          // optional
 *   "timeline": { ... },                // optional if template set
 *   "assetMap": { "hook.mp4": "my.mp4" } // optional rename map
 * }
 *
 * Returns 202 immediately and renders in the background.
 * Poll GET /v1/jobs/:id for progress / result.
 */
apiRouter.post('/render', async (req, res) => {
  const jobId = uuid();
  const workDir = path.join(JOBS_DIR, jobId);
  await fs.mkdir(workDir, { recursive: true });

  let timeline = req.body?.timeline;
  if (!timeline && req.body?.template) {
    try {
      timeline = await loadTemplate(req.body.template);
    } catch {
      return res.status(404).json({ error: `Template not found: ${req.body.template}` });
    }
  }
  if (!timeline) {
    return res.status(400).json({ error: 'Provide timeline or template' });
  }

  const validation = await validateTemplateAssets(timeline, req.body?.assetMap || {});
  if (!validation.ok) {
    return res.status(422).json(validation);
  }

  // Resolve each clip to the uploaded file + media kind (hook may be mp4 or png).
  const resolvedClips = [];
  for (const clip of timeline.clips || []) {
    const selected = validation.requirements.find((r) => r.expectedName === clip.asset);
    const selectedName = selected?.selectedName || clip.asset;
    const kind = selected?.asset?.kind || (clip.type === 'image' ? 'image' : 'video');
    const workName = selectedName;
    try {
      await fs.copyFile(path.join(UPLOADS_DIR, path.basename(selectedName)), path.join(workDir, workName));
    } catch {
      // may resolve from templates later
    }
    resolvedClips.push({
      ...clip,
      asset: workName,
      type: kind === 'image' ? 'image' : 'video',
      duration: kind === 'image' ? (clip.duration ?? clip.maxDuration ?? 3) : clip.duration,
      maxDuration: kind === 'video' ? clip.maxDuration : undefined,
    });
  }
  timeline = { ...timeline, clips: resolvedClips };

  if (timeline.subtitles) {
    try {
      await fs.copyFile(
        path.join(TEMPLATES_DIR, path.basename(timeline.subtitles)),
        path.join(workDir, timeline.subtitles),
      );
    } catch {
      // optional
    }
  }

  const job = {
    id: jobId,
    status: 'queued',
    progress: { step: 'queued', message: 'Queued…', percent: 0 },
    createdAt: new Date().toISOString(),
    template: req.body?.template || null,
    timeline,
  };
  await saveJob(job);

  res.status(202).json({
    id: jobId,
    status: job.status,
    progress: job.progress,
    pollUrl: `/v1/jobs/${jobId}`,
    downloadUrl: `/v1/jobs/${jobId}/download`,
  });

  setImmediate(() => {
    runRenderJob(job, workDir).catch(async (error) => {
      console.error(`[promo-studio] job ${jobId} failed`, error);
      job.status = 'failed';
      job.error = String(error.message || error);
      job.finishedAt = new Date().toISOString();
      job.progress = { step: 'failed', message: job.error, percent: job.progress?.percent || 0 };
      try {
        await saveJob(job);
      } catch (saveErr) {
        console.error(`[promo-studio] could not save failed job ${jobId}`, saveErr);
      }
    });
  });
});

async function runRenderJob(job, workDir) {
  job.status = 'rendering';
  job.progress = { step: 'start', message: 'Starting render…', percent: 1 };
  await saveJob(job);

  const result = await renderTimeline(job.timeline, job.id, workDir, {
    onProgress: async (progress) => {
      job.progress = progress;
      job.status = 'rendering';
      await saveJob(job);
    },
  });

  job.status = 'done';
  job.finishedAt = new Date().toISOString();
  job.result = result;
  job.progress = { step: 'done', message: 'Render complete', percent: 100 };
  await saveJob(job);
}
