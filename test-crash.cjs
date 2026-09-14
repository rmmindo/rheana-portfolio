const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('BROWSER ERROR:', msg.text());
    }
  });
  page.on('pageerror', exception => {
    console.error('BROWSER UNCAUGHT EXCEPTION:', exception);
  });
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(3000);
  await browser.close();
})();