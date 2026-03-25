#!/usr/bin/env node
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const baseUrl = process.env.TELEGRAM_WEBHOOK_BASE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN');
  process.exit(1);
}

if (!baseUrl) {
  console.error('Missing TELEGRAM_WEBHOOK_BASE_URL or VERCEL_PROJECT_PRODUCTION_URL');
  process.exit(1);
}

const normalizedBaseUrl = /^https?:\/\//.test(baseUrl) ? baseUrl : `https://${baseUrl}`;
const webhookUrl = `${normalizedBaseUrl.replace(/\/$/, '')}/api/telegram-webhook`;

const params = new URLSearchParams({
  url: webhookUrl,
  drop_pending_updates: 'true'
});

if (secret) {
  params.append('secret_token', secret);
}

const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params
});

const data = await response.json();

if (!response.ok || !data.ok) {
  console.error('Failed to set webhook:', JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log('Webhook set successfully:');
console.log(JSON.stringify(data, null, 2));
console.log(`Webhook URL: ${webhookUrl}`);
