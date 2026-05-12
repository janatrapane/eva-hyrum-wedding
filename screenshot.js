const { chromium, devices } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const iPhone = devices['iPhone 14 Pro'];
  const context = await browser.newContext({ ...iPhone });
  const page = await context.newPage();

  const url = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  await page.screenshot({ path: 'shot-hero.png', fullPage: false });

  await page.evaluate(() => document.getElementById('schedule').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shot-schedule.png', fullPage: false });

  await page.evaluate(() => document.querySelector('.welcome').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shot-welcome.png', fullPage: false });

  await page.evaluate(() => document.getElementById('rsvp').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shot-rsvp.png', fullPage: false });

  // Switch to Latvian and shoot welcome again
  await page.click('[data-lang-btn="lv"]');
  await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('.welcome').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shot-welcome-lv.png', fullPage: false });

  await page.evaluate(() => document.getElementById('schedule').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'shot-schedule-lv.png', fullPage: false });

  await browser.close();
  console.log('Screenshots saved.');
})();
