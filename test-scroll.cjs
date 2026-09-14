const { chromium } = require('playwright');
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
  
  await page.setViewportSize({ width: 1280, height: 2000 });
  
  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight * 0.2);
  });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'screenshot-scroll-0.2.png' });
  
  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight * 0.4);
  });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'screenshot-scroll-0.4.png' });
  
  await browser.close();
})();
