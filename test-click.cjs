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
  await page.evaluate(() => {
    window.dispatchEvent(new Event('skipIntro'));
  });
  await page.waitForTimeout(1000);
  
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Scroll to dock
  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight + 150);
  });
  await page.waitForTimeout(1000);
  
  // Click "Voluntary Experience"
  await page.click('text="Voluntary Experience"');
  await page.waitForTimeout(100); // 100ms so poof is active
  
  await page.screenshot({ path: 'screenshot-poof.png' });
  await browser.close();
})();
