import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  
  console.log("Navigating to localhost...");
  await page.goto('http://localhost:5173');
  
  console.log("Waiting for app to load...");
  await page.waitForTimeout(3000); // give time for effects to settle
  
  // Take screenshot of the initial state
  await page.screenshot({ path: 'screenshot_initial.png' });
  console.log("Saved screenshot_initial.png");

  await browser.close();
})();
