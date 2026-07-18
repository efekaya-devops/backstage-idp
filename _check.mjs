import { chromium } from 'playwright-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const enter = page.locator('button:has-text("Enter")');
if (await enter.count()) { await enter.first().click(); await page.waitForTimeout(2000); }
await page.goto('http://localhost:3000/create', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
const titles = await page.locator('h4, h3, h2').allInnerTexts();
console.log('CARDS:', JSON.stringify(titles.filter(t => t.trim())));
await page.screenshot({ path: '/Users/efekaya/repos/IDP/devex_platform/platform-docs/assets/backstage-create.png' });
console.log('screenshot updated');
await browser.close();
