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
  
  const html = await page.evaluate(() => {
    const el = document.getElementById('experience');
    return el ? el.outerHTML : 'NOT FOUND';
  });
  console.log(html.substring(0, 500));
  
  await browser.close();
})();
