// prerender.mjs
// Writes real markup into dist/index.html at build time.
//
// Why this exists: a client-rendered React shell makes LCP wait on the JS
// bundle, which costs Lighthouse Performance and hands crawlers an empty page.
// Rendering to a string here means the browser paints the hero from HTML alone,
// and React hydrates afterwards. Also inlines the stylesheet, removing the last
// render-blocking request.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, '..');
const dist = join(webRoot, 'dist');
const ssrDist = join(webRoot, 'dist-ssr');

const ssrEntry = (await readdir(ssrDist)).find(f => f.startsWith('entry-server') && f.endsWith('.js'));
if (!ssrEntry) throw new Error(`no entry-server bundle found in ${ssrDist}`);

const { render } = await import(pathToFileURL(join(ssrDist, ssrEntry)).href);
const appHtml = render();

let html = await readFile(join(dist, 'index.html'), 'utf8');

if (!html.includes('<div id="root"></div>')) {
  throw new Error('prerender: #root placeholder not found; index.html changed shape');
}
html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

// Inline the stylesheet. The whole sheet is small enough that one inline block
// beats a second round trip, and it removes the render-blocking <link>.
const cssFiles = (await readdir(join(dist, 'assets'))).filter(f => f.endsWith('.css'));
for (const css of cssFiles) {
  const linkRe = new RegExp(`<link[^>]*href="[^"]*${css}"[^>]*>`, 'g');
  if (linkRe.test(html)) {
    const cssText = await readFile(join(dist, 'assets', css), 'utf8');
    html = html.replace(linkRe, `<style>${cssText}</style>`);
  }
}

await writeFile(join(dist, 'index.html'), html);

const kb = n => `${(n / 1024).toFixed(1)} kB`;
console.log(`prerendered ${kb(Buffer.byteLength(appHtml))} of markup into dist/index.html`);
console.log(`inlined ${cssFiles.length} stylesheet(s); final index.html ${kb(Buffer.byteLength(html))}`);
