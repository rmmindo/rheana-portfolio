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
  await page.waitForTimeout(3000);
  
  const bodyClasses = await page.evaluate(() => document.body.className);
  console.log("Body classes:", bodyClasses);
  
  await browser.close();
})();
