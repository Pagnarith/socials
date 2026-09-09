import fs from 'fs/promises';
import path from 'path';
import { JOBS_DIR } from './paths.js';

export async function saveJob(job) {
  const file = path.join(JOBS_DIR, `${job.id}.json`);
  await fs.writeFile(file, JSON.stringify(job, null, 2), 'utf8');
  return job;
}

export async function loadJob(id) {
  const file = path.join(JOBS_DIR, `${id}.json`);
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw);
}

export async function listJobs(limit = 20) {
  const names = await fs.readdir(JOBS_DIR);
  const jobs = [];
  for (const name of names.filter((n) => n.endsWith('.json')).slice(0, limit)) {
    try {
      jobs.push(JSON.parse(await fs.readFile(path.join(JOBS_DIR, name), 'utf8')));
    } catch {
      // skip bad
    }
  }
  return jobs.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

/** Mark in-flight jobs as failed after a process restart (background work is gone). */
export async function failOrphanedJobs() {
  const names = await fs.readdir(JOBS_DIR);
  for (const name of names.filter((n) => n.endsWith('.json'))) {
    const file = path.join(JOBS_DIR, name);
    try {
      const job = JSON.parse(await fs.readFile(file, 'utf8'));
      if (job.status === 'queued' || job.status === 'rendering') {
        job.status = 'failed';
        job.error = 'Render interrupted (server restarted). Press Render again.';
        job.finishedAt = new Date().toISOString();
        job.progress = {
          step: 'failed',
          message: job.error,
          percent: job.progress?.percent || 0,
        };
        await fs.writeFile(file, JSON.stringify(job, null, 2), 'utf8');
      }
    } catch {
      // skip
    }
  }
}
