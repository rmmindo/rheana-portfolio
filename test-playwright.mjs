import { chromium } from 'playwright';

(async () => {
  console.log("Starting browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log("Navigating to http://localhost:4173...");
  await page.goto('http://localhost:4173');
  
  // Wait for React to mount and the popup to appear
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'screenshot1.png', fullPage: true });
  console.log("Saved screenshot1.png");
  
  // Also let's click accept and wait 5 seconds for the animation
  try {
    await page.click('button:has-text("LOG MY PRESENCE")');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshot2.png', fullPage: true });
    console.log("Saved screenshot2.png");
  } catch(e) {
    console.error(e);
  }

  await browser.close();
})();
