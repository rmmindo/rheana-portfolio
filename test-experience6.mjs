import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:4173');
  
  // 1. Accept consent
  await page.click('button:has-text("LOG MY PRESENCE")', { force: true });
  await page.waitForTimeout(1000);
  
  // 2. Click the glasses to open VisionGate
  await page.click('button:has-text("Put them on")', { force: true });
  await page.waitForTimeout(3500);
  
  // 3. Move mouse to trigger phase 2 (laser)
  await page.mouse.move(500, 500);
  await page.waitForTimeout(3500);
  
  // 4. Click the telescope button to go to phase 3
  await page.click('.horizon-btn', { force: true });
  await page.waitForTimeout(3000); // Wait for unlock
  
  await page.setViewportSize({ width: 1280, height: 2000 });
  await page.evaluate(() => {
    document.getElementById('experience').scrollIntoView();
  });
  await page.waitForTimeout(1000);
  
  await browser.close();
})();
