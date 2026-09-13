#!/usr/bin/env node
/**
 * Copy TikTok URL-prefix signature file(s) into dashboard/public
 * so GitHub Pages serves them at https://social.chakriya.net/<filename>
 *
 * 1. Download the signature file from TikTok URL properties
 * 2. Save it under docs/tiktok-app-review/verification/
 * 3. Run: node scripts/place-tiktok-url-verification.js
 * 4. Commit + push dashboard/public/<file>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'docs/tiktok-app-review/verification');
const destDir = path.join(root, 'dashboard/public');

fs.mkdirSync(srcDir, { recursive: true });
fs.mkdirSync(destDir, { recursive: true });

const files = fs
  .readdirSync(srcDir)
  .filter((name) => !name.startsWith('.') && name !== 'README.md');

if (files.length === 0) {
  console.error(`No verification files found in ${srcDir}`);
  console.error('Download the signature file from TikTok → URL properties → URL prefix,');
  console.error('save it there, then re-run this script.');
  process.exit(1);
}

for (const name of files) {
  const from = path.join(srcDir, name);
  const to = path.join(destDir, name);
  fs.copyFileSync(from, to);
  console.log(`Copied → dashboard/public/${name}`);
  console.log(`  Live URL after Pages deploy: https://social.chakriya.net/${name}`);
}

console.log('\nNext: commit dashboard/public/<files>, push, wait for Pages, then Verify in TikTok.');
