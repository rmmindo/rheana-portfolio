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
  await page.waitForTimeout(1000);
  
  await page.evaluate(() => {
    document.body.classList.add('is-unlocked', 'hud-ready');
  });
  await page.waitForTimeout(1000);
  
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Click the Legal button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const legalBtn = btns.find(b => b.textContent.includes('Legal'));
    if (legalBtn) legalBtn.click();
  });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'screenshot-full.png', fullPage: true });

  await browser.close();
})();
