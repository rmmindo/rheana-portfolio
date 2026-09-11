import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'screenshot3.png', fullPage: true });
  
  // Let's forcibly inject the clip-path none and see if it changes
  await page.evaluate(() => {
    const el = document.querySelector('.circle-mask-layer');
    if(el) {
      el.style.clipPath = 'none';
      el.style.webkitClipPath = 'none';
    }
  });
  
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot4.png', fullPage: true });

  await browser.close();
})();
