#!/usr/bin/env node
import fs from 'fs';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const SYSTEM_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN; // system user token
const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;

if (!PAGE_ID || !SYSTEM_TOKEN) {
  console.error('Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN in environment');
  process.exit(2);
}

function readFacebookBioFromDocs() {
  try {
    const md = fs.readFileSync('docs/platform-bios.md', 'utf8');
    // Extract the Facebook section between '## Facebook — About (Long)' and the next '---'
    const match = md.match(/## Facebook[\s\S]*?---/);
    if (match) {
      // remove heading and trailing ---
      const section = match[0].replace(/## Facebook[\s\S]*?\n/, '').replace(/---\s*$/, '').trim();
      return section;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function getPageScopedToken() {
  const url = `https://graph.facebook.com/v19.0/${PAGE_ID}?fields=access_token&access_token=${SYSTEM_TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.access_token) return data.access_token;
  throw new Error('Failed to obtain page-scoped token: ' + JSON.stringify(data));
}

async function updateField(pageToken, field, value) {
  const params = new URLSearchParams();
  params.append(field, value);
  params.append('access_token', pageToken);
  const res = await fetch(`https://graph.facebook.com/v19.0/${PAGE_ID}`, {
    method: 'POST',
    body: params,
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  console.log('Reading inputs...');
  const about = process.env.FACEBOOK_PAGE_ABOUT || 'iPricky Pagnarith — Minecraft Add-ons & Rhino 3D tutorials. Website: https://social.chakriya.net';
  const description = process.env.FACEBOOK_PAGE_DESCRIPTION || readFacebookBioFromDocs() || about;
  const website = process.env.FACEBOOK_PAGE_WEBSITE || 'https://social.chakriya.net';

  try {
    console.log('Requesting page-scoped token...');
    const pageToken = await getPageScopedToken();
    console.log('Got page-scoped token (masked):', pageToken.slice(0, 8) + '...');

    console.log('Updating about...');
    let r = await updateField(pageToken, 'about', about);
    console.log('about ->', r.status, r.data);

    console.log('Updating description...');
    r = await updateField(pageToken, 'description', description);
    console.log('description ->', r.status, r.data);

    console.log('Updating website...');
    r = await updateField(pageToken, 'website', website);
    console.log('website ->', r.status, r.data);

    console.log('\nDone. If any request failed, check token scopes and Business Manager page token generation.');
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('update-facebook-page.js')) {
  main();
}
