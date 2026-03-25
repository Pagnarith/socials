#!/usr/bin/env node
/**
 * Fetch Instagram Business Account ID from a Facebook Page
 * 
 * Usage:
 *   node scripts/get-instagram-id.js
 * 
 * Requires FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN in .env
 */
import dotenv from 'dotenv';
dotenv.config();

const pageId = process.env.FACEBOOK_PAGE_ID;
const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

if (!pageId || !token) {
  console.error('Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN in .env');
  process.exit(1);
}

async function main() {
  console.log(`Querying page ${pageId} for Instagram Business Account...\n`);

  // Step 1: Get Instagram Business Account from Page
  const url = `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account,name&access_token=${token}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error('Error:', data.error.message);
    console.error('\nIf you see "does not exist" or "missing permissions":');
    console.error('1. Go to business.facebook.com → Settings → Pages');
    console.error(`2. Find page ${pageId} and assign the System User`);
    console.error('3. Grant full control permissions');
    console.error('4. Run this script again\n');
    process.exit(1);
  }

  console.log(`Page: ${data.name} (${data.id})`);

  if (!data.instagram_business_account) {
    console.error('\nNo Instagram Business Account linked to this page.');
    console.error('Go to Instagram → Settings → Account → Switch to Professional Account');
    console.error('Then link it to your Facebook Page in Facebook Page Settings → Instagram\n');
    process.exit(1);
  }

  const igId = data.instagram_business_account.id;
  console.log(`Instagram Business Account ID: ${igId}\n`);

  // Step 2: Get Instagram account details
  const igUrl = `https://graph.facebook.com/v19.0/${igId}?fields=id,username,name,followers_count,media_count&access_token=${token}`;
  const igRes = await fetch(igUrl);
  const igData = await igRes.json();

  if (igData.error) {
    console.log(`Instagram ID found: ${igId}`);
    console.log('(Could not fetch details — but the ID is valid)\n');
  } else {
    console.log('Instagram Account Details:');
    console.log(`  Username: @${igData.username || 'N/A'}`);
    console.log(`  Name: ${igData.name || 'N/A'}`);
    console.log(`  Followers: ${igData.followers_count || 0}`);
    console.log(`  Posts: ${igData.media_count || 0}\n`);
  }

  // Step 3: Print env values to add
  console.log('Add these to your .env file:');
  console.log('─'.repeat(50));
  console.log(`INSTAGRAM_BUSINESS_ACCOUNT_ID=${igId}`);
  console.log(`INSTAGRAM_ACCESS_TOKEN=${token}`);
  console.log('─'.repeat(50));
  console.log('\n(Instagram uses the same Page Access Token as Facebook)');
}

main();
