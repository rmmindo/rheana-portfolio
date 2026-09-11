import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173');
  
  await page.evaluate(() => {
    document.body.className = 'is-unlocked hud-ready';
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await page.waitForTimeout(500);
  
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.evaluate(() => {
    document.getElementById('experience').scrollIntoView();
  });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'screenshot-experience-force.png' });
  await browser.close();
})();
