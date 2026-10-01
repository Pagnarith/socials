#!/usr/bin/env node
/**
 * Push YouTube Analytics refresh token (+ OAuth client) to Vercel production env.
 *
 * Usage:
 *   node scripts/set-youtube-analytics-token.js --refresh '1//...'
 *   node scripts/set-youtube-analytics-token.js --refresh '1//' --client-id '...' --client-secret '...'
 *
 * Requires: vercel CLI logged in to the socials project.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return '';
}

function upsertEnv(name, value) {
  if (!value) {
    console.log(`skip empty ${name}`);
    return;
  }
  const result = spawnSync('vercel', ['env', 'add', name, 'production', '--force'], {
    input: value,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    throw new Error(`Failed to set ${name}`);
  }
  console.log(`set ${name}`);
}

let refreshToken =
  arg('refresh') ||
  process.env.YOUTUBE_REFRESH_TOKEN ||
  '';
if (!refreshToken && fs.existsSync('tokens/youtube-analytics.json')) {
  try {
    const saved = JSON.parse(fs.readFileSync('tokens/youtube-analytics.json', 'utf8'));
    refreshToken = saved.refresh_token || '';
    if (refreshToken) console.log('Using refresh token from tokens/youtube-analytics.json');
  } catch {
    // ignore
  }
}

const clientId =
  arg('client-id') ||
  process.env.YT_CLIENT_ID ||
  process.env.YOUTUBE_CLIENT_ID ||
  '';
const clientSecret =
  arg('client-secret') ||
  process.env.YT_CLIENT_SECRET ||
  process.env.YOUTUBE_CLIENT_SECRET ||
  '';

if (!refreshToken) {
  console.error('Missing --refresh token. Run:');
  console.error('  node scripts/auth-youtube-analytics.js --force');
  process.exit(1);
}

upsertEnv('YOUTUBE_REFRESH_TOKEN', refreshToken);
if (clientId) upsertEnv('YT_CLIENT_ID', clientId);
if (clientSecret) upsertEnv('YT_CLIENT_SECRET', clientSecret);

console.log('\nRedeploy so serverless functions pick up env:');
console.log('  vercel deploy --prod --yes');
