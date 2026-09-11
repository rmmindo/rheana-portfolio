import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(2000);
  
  const clipPath = await page.evaluate(() => {
    const el = document.querySelector('.circle-mask-layer');
    return window.getComputedStyle(el).clipPath;
  });
  console.log("Computed clip-path:", clipPath);
  
  const theme = await page.evaluate(() => {
    return document.documentElement.getAttribute('data-theme');
  });
  console.log("HTML data-theme:", theme);

  await browser.close();
})();
