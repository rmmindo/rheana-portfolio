// shots.mjs
// Screenshots the live site so design decisions are made by looking rather than
// by imagining. Writes full-page and per-section captures at three widths.
//
// Run: node tools/shots.mjs [url] [outDir]

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const url = process.argv[2] ?? 'https://rheanamindo.me';
const outDir = process.argv[3] ?? './shots';

const VIEWPORTS = [
  { name: 'wide', width: 1600, height: 1000 },
  { name: 'laptop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 844 },
];

const SECTIONS = ['video', 'experience', 'projects', 'volunteering', 'baybayin', 'proof', 'skills', 'education'];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

  // Scroll the whole page once so every lazy image loads and every reveal has
  // fired. A screenshot taken before that shows a half-built page and leads to
  // fixing problems that do not exist.
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let y = 0;
      const step = () => {
        y += window.innerHeight * 0.8;
        window.scrollTo(0, y);
        if (y < document.body.scrollHeight) setTimeout(step, 120);
        else setTimeout(resolve, 600);
      };
      step();
    });
  });
  await page.waitForTimeout(800);

  // Hero, from the top.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(outDir, `${vp.name}-hero.png`) });

  if (vp.name === 'wide') {
    for (const id of SECTIONS) {
      const el = await page.$(`#${id}`);
      if (!el) continue;
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(450);
      await page.screenshot({ path: join(outDir, `section-${id}.png`) });
    }

    // Dark theme, hero only.
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(outDir, 'wide-hero-dark.png') });
    await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  }

  console.log(`${vp.name}: ${vp.width}x${vp.height} captured`);
  await page.close();
}

await browser.close();
console.log(`\nwrote to ${outDir}`);
