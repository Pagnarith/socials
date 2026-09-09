import { spawn } from 'child_process';
import path from 'path';

const IMAGE_CODECS = new Set([
  'png', 'mjpeg', 'jpeg', 'jpg', 'bmp', 'gif', 'webp', 'tiff', 'svg', 'pam', 'ppm', 'pgm', 'pbm',
]);
const IMAGE_FORMATS = new Set([
  'png_pipe', 'image2', 'image2pipe', 'jpeg_pipe', 'gif', 'webp_pipe', 'tiff_pipe', 'bmp_pipe',
]);
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tif', '.tiff']);

function ffprobeJson(filePath) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffprobe', [
      '-v', 'error',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath,
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => { stdout += c; });
    child.stderr.on('data', (c) => { stderr += c; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout || '{}'));
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(stderr || `ffprobe exited ${code}`));
      }
    });
  });
}

function isStillImage({ formatName, codecName, fileName }) {
  const ext = path.extname(fileName).toLowerCase();
  if (IMAGE_EXTS.has(ext)) return true;
  if (codecName && IMAGE_CODECS.has(String(codecName).toLowerCase())) return true;
  if (formatName) {
    const names = String(formatName).toLowerCase().split(',');
    if (names.some((n) => IMAGE_FORMATS.has(n.trim()))) return true;
  }
  return false;
}

export async function probeMedia(filePath) {
  const data = await ffprobeJson(filePath);
  const format = data.format || {};
  const streams = Array.isArray(data.streams) ? data.streams : [];
  const visual = streams.find((s) => s.codec_type === 'video') || null;
  const duration = Number.parseFloat(format.duration);
  const fileName = path.basename(filePath);
  const codecName = visual?.codec_name || null;
  const formatName = format.format_name || null;
  const kind = isStillImage({ formatName, codecName, fileName })
    ? 'image'
    : (visual ? 'video' : 'image');

  return {
    name: fileName,
    kind,
    duration: kind === 'image' ? null : (Number.isFinite(duration) ? duration : null),
    width: Number.isFinite(visual?.width) ? visual.width : null,
    height: Number.isFinite(visual?.height) ? visual.height : null,
    codec: codecName,
  };
}
