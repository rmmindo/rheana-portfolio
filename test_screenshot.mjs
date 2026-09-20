import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  
  console.log("Navigating to localhost...");
  await page.goto('http://localhost:4173');
  
  console.log("Waiting for app to load...");
  await page.waitForTimeout(2000);
  
  // Click remain invisible
  try {
    const remainInvisibleBtn = await page.$('button:has-text("REMAIN INVISIBLE")');
    if (remainInvisibleBtn) await remainInvisibleBtn.click();
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log("No consent banner");
  }
  
  // Click telescope button
  try {
    const telescopeBtn = await page.$('button:has-text("See what\'s beyond the horizon")');
    if (telescopeBtn) await telescopeBtn.click();
    await page.waitForTimeout(3000); // Wait for zoom out animation
  } catch (e) {
    console.log("No telescope button");
  }

  // Scroll to unlock the mask
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(2000);

  // Take screenshot at top (Hero)
  await page.screenshot({ path: 'screenshot_hero.png' });
  console.log("Saved screenshot_hero.png");

  // Scroll down by 0.05
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'screenshot_scroll_1.png' });
  console.log("Saved screenshot_scroll_1.png");

  // Scroll to PCB fully visible
  await page.mouse.wheel(0, 1000);
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'screenshot_pcb.png' });
  console.log("Saved screenshot_pcb.png");

  await browser.close();
})();
