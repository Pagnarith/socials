import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(__dirname, '../..');
export const UPLOADS_DIR = path.join(ROOT, 'data/uploads');
export const OUTPUTS_DIR = path.join(ROOT, 'data/outputs');
export const JOBS_DIR = path.join(ROOT, 'data/jobs');
export const TEMPLATES_DIR = path.join(ROOT, 'templates');

export function ffmpegBin() {
  return process.env.FFMPEG_PATH?.trim() || 'ffmpeg';
}
