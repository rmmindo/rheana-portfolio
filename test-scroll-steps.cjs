const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log(msg.text()));
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
  
  // Scroll partially
  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight + 50);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot-scroll-50.png' });
  
  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight + 150);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot-scroll-150.png' });

  await page.evaluate(() => {
    window.scrollTo(0, window.innerHeight + 400);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot-scroll-400.png' });

  await browser.close();
})();
