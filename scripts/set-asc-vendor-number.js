#!/usr/bin/env node
/**
 * Set ASC_VENDOR_NUMBER on Vercel (and optionally probe Sales Reports).
 *
 * Find the number:
 *   App Store Connect → Payments and Financial Reports (or Sales and Trends → Reports)
 *   → top-left under Legal Entity Name → Vendor Number (usually 8 digits)
 *
 * Usage:
 *   node scripts/set-asc-vendor-number.js --vendor 12345678
 *   node scripts/set-asc-vendor-number.js --vendor 12345678 --dry-run
 */
import { spawnSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import dotenv from 'dotenv';

dotenv.config();

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

async function loadAscPrivateKeyPem() {
  const inline = process.env.ASC_PRIVATE_KEY?.replace(/\\n/g, '\n')?.trim();
  if (inline) return inline;
  const keyPath = process.env.ASC_PRIVATE_KEY_PATH?.trim();
  if (!keyPath) return null;
  const { readFile } = await import('node:fs/promises');
  return readFile(keyPath, 'utf8');
}

async function makeAscToken() {
  const issuer = process.env.ASC_ISSUER_ID?.trim();
  const keyId = process.env.ASC_KEY_ID?.trim();
  const pem = await loadAscPrivateKeyPem();
  if (!issuer || !keyId || !pem) {
    throw new Error('Missing ASC_ISSUER_ID, ASC_KEY_ID, or ASC_PRIVATE_KEY(_PATH)');
  }
  const { SignJWT, importPKCS8 } = await import('jose');
  const key = await importPKCS8(pem, 'ES256');
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId, typ: 'JWT' })
    .setIssuer(issuer)
    .setIssuedAt(now)
    .setExpirationTime(now + 20 * 60)
    .setAudience('appstoreconnect-v1')
    .sign(key);
}

async function probeSales(token, vendorNumber) {
  const year = new Date().getUTCFullYear();
  const params = new URLSearchParams({
    'filter[frequency]': 'YEARLY',
    'filter[reportDate]': String(year),
    'filter[reportSubType]': 'SUMMARY',
    'filter[reportType]': 'SALES',
    'filter[vendorNumber]': String(vendorNumber),
  });
  const res = await fetch(`https://api.appstoreconnect.apple.com/v1/salesReports?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/a-gzip',
    },
  });

  if (res.status === 404) {
    // No report for this year yet — vendor number may still be valid.
    return { ok: true, note: `No YEARLY ${year} report yet (404) — vendor accepted or empty year` };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data?.errors?.[0]?.detail || data?.errors?.[0]?.title || res.statusText;
    return { ok: false, note: message || `HTTP ${res.status}` };
  }

  const buf = Buffer.from(await res.arrayBuffer());
  let text;
  try {
    text = gunzipSync(buf).toString('utf8');
  } catch {
    text = buf.toString('utf8');
  }
  const lines = text.trim().split(/\r?\n/);
  const headers = (lines[0] || '').split('\t');
  const unitsIdx = headers.indexOf('Units');
  const typeIdx = headers.indexOf('Product Type Identifier');
  const downloadTypes = new Set(['1', '1F', '1T', 'F1']);
  let downloads = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (typeIdx >= 0 && !downloadTypes.has((cols[typeIdx] || '').trim())) continue;
    if (unitsIdx >= 0) downloads += Number(cols[unitsIdx]) || 0;
  }
  return { ok: true, note: `YEARLY ${year} app download units ≈ ${downloads} (${lines.length - 1} rows)` };
}

async function main() {
  const vendor = (arg('vendor') || process.env.ASC_VENDOR_NUMBER || '').trim();
  const dryRun = hasFlag('dry-run');

  if (!/^\d{5,10}$/.test(vendor)) {
    console.error('Usage: node scripts/set-asc-vendor-number.js --vendor 12345678');
    console.error('\nFind it in App Store Connect:');
    console.error('  Payments and Financial Reports → top-left under Legal Entity → Vendor Number');
    console.error('Docs: docs/asc-sales-reports.md');
    process.exit(1);
  }

  console.log('Probing Sales Reports with vendor', vendor, '…');
  const token = await makeAscToken();
  const probe = await probeSales(token, vendor);
  console.log(probe.ok ? 'OK' : 'FAIL', probe.note);

  if (!probe.ok) {
    console.error('\nFix: confirm Vendor Number in ASC, and that the API key role includes Sales/Finance.');
    process.exit(1);
  }

  if (dryRun) {
    console.log('\n--dry-run: not writing to Vercel');
    process.exit(0);
  }

  upsertEnv('ASC_VENDOR_NUMBER', vendor);
  console.log('\nRedeploy so serverless functions pick up env:');
  console.log('  vercel deploy --prod --yes');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
