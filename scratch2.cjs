const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4173');
  const html = await page.content();
  console.log('Includes experience section:', html.includes('id="experience"'));
  if (html.includes('id="experience"')) {
     console.log('Great');
  } else {
     console.log('HTML length:', html.length);
  }
  await browser.close();
})();
