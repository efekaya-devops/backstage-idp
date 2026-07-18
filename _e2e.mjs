import { chromium } from 'playwright-core';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SHOT = '/private/tmp/claude-501/-Users-efekaya-repos-IDP/56edf9fa-ecf3-4d8b-99ec-4ca0906585b4/scratchpad';

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('PAGE-ERR:', m.text().slice(0, 160)); });

await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const enter = page.locator('button:has-text("Enter")');
if (await enter.count()) { await enter.first().click(); await page.waitForTimeout(2000); }

// go straight to the template's form
await page.goto('http://localhost:3000/create/templates/default/request-resource-group', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// resource group name
const nameField = page.locator('input#root_resourceGroupName');
await nameField.waitFor({ timeout: 15000 });
await nameField.fill('rg-portal-demo');

// owning team (OwnerPicker autocomplete)
const owner = page.locator('input#root_team');
await owner.click();
await page.waitForTimeout(1200);
await page.keyboard.type('team-alpha');
await page.waitForTimeout(1500);
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await page.waitForTimeout(800);
await page.screenshot({ path: `${SHOT}/e2e-1-form.png` });

// Review
await page.locator('button:has-text("Review")').click();
await page.waitForTimeout(2000);
await page.screenshot({ path: `${SHOT}/e2e-2-review.png` });

// Create
await page.locator('button:has-text("Create")').last().click();
await page.waitForTimeout(15000);
await page.screenshot({ path: `${SHOT}/e2e-3-result.png` });
console.log('URL:', page.url());
const body = await page.locator('body').innerText();
console.log('---PAGE TEXT---');
console.log(body.slice(0, 1500));

await browser.close();
