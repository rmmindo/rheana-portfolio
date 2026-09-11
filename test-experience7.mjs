import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4173');
  
  // Set skipped
  await page.evaluate(() => {
    localStorage.setItem('hero_skipped', 'true');
    localStorage.setItem('analytics_consent', 'true');
  });
  await page.reload();
  await page.waitForTimeout(3000);
  
  // Force click to make it skip phase0?
  // Wait, if hero_skipped is true, phase is initialized to 3... wait, NO it isn't!
  // I found out it isn't!
  // I need to actually run the sequence or fix the skip logic!
  
  // I will just force the body class to see if it renders!
  await page.evaluate(() => {
    document.body.className = 'is-unlocked hud-ready';
    document.getElementById('experience').scrollIntoView();
  });
  await page.waitForTimeout(1000);
  
  const computed = await page.evaluate(() => {
    const section = document.querySelector('.experience-section');
    const svg = document.querySelector('.circuit-svg');
    return {
      sectionOpacity: window.getComputedStyle(section).opacity,
      sectionDisplay: window.getComputedStyle(section).display,
      sectionHeight: window.getComputedStyle(section).height,
      svgOpacity: svg ? window.getComputedStyle(svg).opacity : 'NO SVG',
      svgDisplay: svg ? window.getComputedStyle(svg).display : 'NO SVG',
      svgHeight: svg ? window.getComputedStyle(svg).height : 'NO SVG'
    };
  });
  console.log(computed);
  
  await browser.close();
})();
