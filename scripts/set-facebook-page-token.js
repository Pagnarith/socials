#!/usr/bin/env node
/**
 * Resolve a Facebook Page-scoped access token and push it to Vercel.
 *
 * Insights (reach / minutes) require a Page token — a User token that can
 * read fan_count is not enough.
 *
 * Usage:
 *   node scripts/set-facebook-page-token.js
 *   node scripts/set-facebook-page-token.js --token 'EAA...'
 *   node scripts/set-facebook-page-token.js --dry-run
 *
 * Reads FACEBOOK_PAGE_ID + FACEBOOK_PAGE_ACCESS_TOKEN from .env by default,
 * exchanges via GET /{page-id}?fields=access_token, then upserts
 * FACEBOOK_PAGE_ACCESS_TOKEN on Vercel production.
 */
import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';

dotenv.config();

const GRAPH = 'https://graph.facebook.com/v19.0';

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return '';
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function upsertEnv(name, value) {
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

async function debugToken(inputToken, appId, appSecret) {
  if (!appId || !appSecret) return null;
  const url =
    `https://graph.facebook.com/debug_token` +
    `?input_token=${encodeURIComponent(inputToken)}` +
    `&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  return data.data || null;
}

async function main() {
  const pageId = (arg('page-id') || process.env.FACEBOOK_PAGE_ID || '').trim();
  const envToken = (arg('token') || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '').trim();
  const appId = process.env.FACEBOOK_APP_ID?.trim();
  const appSecret = process.env.FACEBOOK_APP_SECRET?.trim();
  const dryRun = hasFlag('dry-run');

  if (!pageId || !envToken) {
    console.error('Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN (.env or --token)');
    console.error('See docs/facebook-page-token.md');
    process.exit(1);
  }

  console.log('Page ID:', pageId);
  console.log('Input token prefix:', envToken.slice(0, 8) + '…');

  const before = await debugToken(envToken, appId, appSecret);
  if (before) {
    console.log('Input token type:', before.type || '(unknown)');
    console.log('Input scopes:', (before.scopes || []).join(', ') || '(none)');
  }

  const exchangeUrl =
    `${GRAPH}/${pageId}?fields=access_token&access_token=${encodeURIComponent(envToken)}`;
  const exchangeRes = await fetch(exchangeUrl);
  const exchangeData = await exchangeRes.json().catch(() => ({}));

  if (!exchangeData.access_token) {
    console.error('Could not mint Page-scoped token:');
    console.error(JSON.stringify(exchangeData, null, 2));
    console.error('\nFix in Meta Business Suite:');
    console.error('  Business Settings → System Users → your user → Generate token');
    console.error('  Assign Page (Homework Palette) with Full Control');
    console.error('  Include pages_read_engagement + read_insights (after App Review)');
    console.error('  Or: System User → Assign Assets → Page → Generate Page Token');
    console.error('Docs: docs/facebook-page-token.md + docs/facebook-app-review.md');
    process.exit(1);
  }

  const pageToken = exchangeData.access_token;
  console.log('Page token prefix:', pageToken.slice(0, 8) + '…', `(len=${pageToken.length})`);

  const after = await debugToken(pageToken, appId, appSecret);
  if (after) {
    console.log('Page token type:', after.type || '(unknown)');
    console.log('Page scopes:', (after.scopes || []).join(', ') || '(none)');
  }

  // Probe insights
  const since = Math.floor(Date.now() / 1000) - 7 * 24 * 3600;
  const insightsUrl =
    `${GRAPH}/${pageId}/insights` +
    `?metric=page_total_media_view_unique` +
    `&period=day&since=${since}&access_token=${encodeURIComponent(pageToken)}`;
  const insightsRes = await fetch(insightsUrl);
  const insightsData = await insightsRes.json().catch(() => ({}));
  if (!insightsRes.ok) {
    console.warn('Insights probe failed:', insightsData?.error?.message || insightsRes.status);
    console.warn('Token may still be Page-scoped — App Review for read_insights may be required.');
  } else {
    const total = (insightsData.data?.[0]?.values || []).reduce((s, v) => s + Number(v.value || 0), 0);
    console.log('Insights probe OK — page_total_media_view_unique (7d sum) =', total);
  }

  if (dryRun) {
    console.log('\n--dry-run: not writing to Vercel');
    process.exit(0);
  }

  upsertEnv('FACEBOOK_PAGE_ACCESS_TOKEN', pageToken);
  console.log('\nRedeploy so serverless functions pick up env:');
  console.log('  vercel deploy --prod --yes');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
