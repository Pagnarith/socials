#!/usr/bin/env node
/**
 * Push TikTok user OAuth tokens to Vercel production env.
 *
 * Usage:
 *   node scripts/set-tiktok-user-token.js --access 'act...' --refresh 'rft...'
 *   # or read from env / stdin file after Login Kit callback
 *
 * Requires: vercel CLI logged in to the socials project.
 */
import { spawnSync } from 'node:child_process';
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

const access = arg('access') || process.env.TIKTOK_ACCESS_TOKEN || '';
const refresh = arg('refresh') || process.env.TIKTOK_REFRESH_TOKEN || '';
const openId = arg('open-id') || process.env.TIKTOK_OPEN_ID || '';
const tokenEnv = arg('env') || process.env.TIKTOK_TOKEN_ENV || 'sandbox';

if (!access) {
  console.error('Missing --access token. Complete Login Kit first:');
  console.error('  https://socials-seven-beta.vercel.app/api/tiktok/authorize?env=sandbox');
  process.exit(1);
}

upsertEnv('TIKTOK_ACCESS_TOKEN', access);
upsertEnv('TIKTOK_REFRESH_TOKEN', refresh);
if (openId) upsertEnv('TIKTOK_OPEN_ID', openId);
upsertEnv('TIKTOK_TOKEN_ENV', tokenEnv);

console.log('\nRedeploy so serverless functions pick up env:');
console.log('  vercel deploy --prod --yes');
