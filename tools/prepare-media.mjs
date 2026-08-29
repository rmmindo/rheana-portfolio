// prepare-media.mjs
// Converts the source artwork and photography into the web assets the site
// serves: WebP at the sizes actually used, plus the favicon set.
//
// Source files live outside the repo (in Downloads) and are not committed. The
// generated files ARE committed, so a CI build needs no image toolchain.
//
// Run: node tools/prepare-media.mjs
// Names are descriptive on purpose: a file called
// rheana-mindo-ai-developer-hero.webp is worth more in image search than hero.webp.

import sharp from 'sharp';
import { mkdir, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '../apps/web/public');
const downloads = join(homedir(), 'Downloads');

const src = {
  poster: join(downloads, 'thumbnail.jpg'),
  headshot: join(downloads, 'RM_Linkedin_Photo.jpg'),
  monogram: join(downloads, 'rm.png'),
  video: join(downloads, 'Rheana_Mindo_Video_Resume.mp4'),
};

await mkdir(join(publicDir, 'media'), { recursive: true });
await mkdir(join(publicDir, 'img'), { recursive: true });

const kb = n => `${(n / 1024).toFixed(0)} kB`;
const report = async (label, path) => {
  const { size } = await stat(path);
  console.log(`  ${label.padEnd(46)} ${kb(size).padStart(9)}`);
};

const missing = [];
for (const [name, path] of Object.entries(src)) {
  if (!existsSync(path)) missing.push(`${name}: ${path}`);
}
if (missing.length) {
  console.error('Missing source files:\n  ' + missing.join('\n  '));
  process.exit(1);
}

console.log('media');

// Video poster. 1280x720 is the largest size the player is ever shown at.
const posterOut = join(publicDir, 'media/rheana-mindo-video-resume-poster.webp');
await sharp(src.poster).resize(1280, 720, { fit: 'cover' }).webp({ quality: 78 }).toFile(posterOut);
await report('rheana-mindo-video-resume-poster.webp', posterOut);

const videoOut = join(publicDir, 'media/rheana-mindo-video-resume.mp4');
await copyFile(src.video, videoOut);
await report('rheana-mindo-video-resume.mp4', videoOut);

console.log('img');

// Headshot at two widths for a responsive srcset. 2x covers retina at 320 CSS px.
for (const w of [320, 640]) {
  const out = join(publicDir, `img/rheana-mindo-ai-developer-portrait-${w}.webp`);
  await sharp(src.headshot).resize(w, w, { fit: 'cover' }).webp({ quality: 82 }).toFile(out);
  await report(`rheana-mindo-ai-developer-portrait-${w}.webp`, out);
}

// Monogram, used as the social share image and the large tab icon.
const markOut = join(publicDir, 'img/rheana-mindo-rm-monogram.webp');
await sharp(src.monogram).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 90 }).toFile(markOut);
await report('rheana-mindo-rm-monogram.webp', markOut);

console.log('icons');
for (const size of [32, 180, 192, 512]) {
  const out = join(publicDir, `icon-${size}.png`);
  await sharp(src.monogram)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 253, b: 250, alpha: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(out);
  await report(`icon-${size}.png`, out);
}

console.log('\nDone. Generated files are committed; sources stay in Downloads.');
