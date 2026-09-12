import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173');
  
  // Set skipped
  await page.evaluate(() => {
    localStorage.setItem('hero_skipped', 'true');
    localStorage.setItem('analytics_consent', 'true');
  });
  await page.reload();
  await page.waitForTimeout(1000);
  
  // Force body classes so HUD shows
  await page.evaluate(() => {
    document.body.classList.add('is-unlocked', 'hud-ready');
  });
  await page.waitForTimeout(1000);
  
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Screenshot the bottom right corner
  const btn = await page.$('.bottom-right-hud');
  if (btn) {
    await btn.screenshot({ path: 'screenshot-hud.png' });
  }
  
  // Also screenshot the legal modal
  await page.evaluate(() => {
    document.querySelector('.social-tokens button').click();
  });
  await page.waitForTimeout(500);
  const modal = await page.$('.legal-specific');
  if (modal) {
    await modal.screenshot({ path: 'screenshot-modal.png' });
  }

  await browser.close();
})();
