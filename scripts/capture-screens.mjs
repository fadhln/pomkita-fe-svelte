// Capture screenshots of all main screens against the live compose stack (FE :3100, BE :8180)
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = 'http://localhost:3100';
const outDir = 'screenshots';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

async function shot(name, waitSelector) {
  if (waitSelector) await page.getByText(waitSelector, { exact: false }).first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  console.log('captured', name, page.url());
}

// login
await page.goto(`${BASE}/masuk`);
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/01-masuk.png` });
console.log('captured masuk');

await page.getByLabel('Email').fill('supervisor@demo.pomkita.test');
await page.getByLabel('Kata Sandi').fill('demo-password');
await page.getByRole('button', { name: /masuk/i }).click();
await page.waitForURL(/\/$/u, { timeout: 20000 });
await shot('02-beranda');

for (const [path, name] of [
  ['/shift', '03-shift-list'],
  ['/laporan', '05-laporan'],
  ['/governance', '06-governance'],
  ['/anomali', '07-anomali'],
  ['/audit', '08-audit'],
  ['/kebijakan', '09-kebijakan'],
  ['/pengaturan', '10-pengaturan'],
]) {
  await page.goto(`${BASE}${path}`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  console.log('captured', name, page.url());
}

// shift entry detail: open the first shift if a detail link exists
await page.goto(`${BASE}/shift`);
await page.waitForTimeout(1000);
const detailLink = page.getByRole('link', { name: /input|detail|buka/i }).first();
if (await detailLink.count()) {
  await detailLink.click().catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/04-shift-entry.png`, fullPage: true });
  console.log('captured shift-entry', page.url());
}

await browser.close();
console.log('done');
