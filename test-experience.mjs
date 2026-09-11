import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4173');
  
  await page.evaluate(() => {
    localStorage.setItem('hero_skipped', 'true');
    localStorage.setItem('analytics_consent', 'true');
  });
  await page.reload();
  await page.waitForTimeout(2000);
  
  // Set a large viewport so we can see the whole circuit board
  await page.setViewportSize({ width: 1280, height: 2000 });
  
  await page.evaluate(() => {
    document.getElementById('experience').scrollIntoView();
  });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'screenshot-experience.png' });
  await browser.close();
})();
