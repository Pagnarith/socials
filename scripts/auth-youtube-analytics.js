#!/usr/bin/env node
/**
 * Authorize YouTube Analytics (watch hours) and print a refresh token.
 *
 * Usage:
 *   node scripts/auth-youtube-analytics.js
 *   node scripts/auth-youtube-analytics.js --print-auth-url
 *
 * Requires in .env:
 *   YT_CLIENT_ID / YT_CLIENT_SECRET (or YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET)
 *   YT_REDIRECT_URI (default http://localhost:3000/oauth2callback)
 *
 * Enable "YouTube Analytics API" in Google Cloud for the same project as the OAuth client.
 */
import dotenv from 'dotenv';
import fs from 'node:fs';
import readline from 'node:readline';
import { google } from 'googleapis';

dotenv.config();

const SCOPES = [
  'https://www.googleapis.com/auth/yt-analytics.readonly',
  'https://www.googleapis.com/auth/youtube.readonly',
];
const TOKEN_PATH = 'tokens/youtube-analytics.json';

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const clientId = (process.env.YT_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.YT_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET || '').trim();
  const redirectUri = (process.env.YT_REDIRECT_URI || 'http://localhost:3000/oauth2callback').trim();

  if (!clientId || !clientSecret) {
    console.error('Missing YT_CLIENT_ID / YT_CLIENT_SECRET (or YOUTUBE_CLIENT_*) in .env');
    process.exit(1);
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  if (fs.existsSync(TOKEN_PATH) && !process.argv.includes('--force')) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    console.log('Loaded existing token from', TOKEN_PATH);
    if (token.refresh_token) {
      console.log('\nRefresh token (already saved):\n');
      console.log(token.refresh_token);
      console.log('\nPush to Vercel:');
      console.log(`  node scripts/set-youtube-analytics-token.js --refresh '${token.refresh_token}'`);
      return;
    }
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\nAuthorize YouTube Analytics by visiting:\n');
  console.log(authUrl);
  console.log('\nAfter allowing access, copy the code param from the redirect URL.');

  if (process.argv.includes('--print-auth-url') || process.env.PRINT_AUTH_URL_ONLY === '1') {
    process.exit(0);
  }

  const code = (await ask('\nEnter the code here: ')).trim();
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.mkdirSync('tokens', { recursive: true });
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('Saved token to', TOKEN_PATH);

  if (!tokens.refresh_token) {
    console.error('No refresh_token returned. Revoke app access in Google Account and retry with --force.');
    process.exit(1);
  }

  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (channelId) {
    try {
      const ytAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oAuth2Client });
      const endDate = new Date().toISOString().slice(0, 10);
      const report = await ytAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate: '2006-01-01',
        endDate,
        metrics: 'estimatedMinutesWatched',
      });
      const minutes = Number(report.data.rows?.[0]?.[0] || 0);
      console.log(`\nProbe OK: ~${Math.round(minutes / 60)} watch hours (estimatedMinutesWatched=${minutes})`);
    } catch (error) {
      console.warn('Probe failed (token may still be valid):', error.message || error);
    }
  }

  console.log('\nRefresh token:\n');
  console.log(tokens.refresh_token);
  console.log('\nPush to Vercel:');
  console.log(`  node scripts/set-youtube-analytics-token.js --refresh '${tokens.refresh_token}'`);
  console.log('  vercel deploy --prod --yes');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
