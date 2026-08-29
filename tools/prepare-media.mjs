// prepare-media.mjs
// Converts the source artwork and photography into the web assets the site
// serves: WebP at the sizes actually used, plus the favicon set.
//
// Source files live outside the repo and are not committed. The generated files
// ARE committed, so a CI build needs no image toolchain.
//
// Run: node tools/prepare-media.mjs
//
// Names are descriptive on purpose: a file called
// rheana-mindo-ai-developer-hero.webp is worth more in image search than
// hero.webp, and alt text is written per use site in the components.

import sharp from 'sharp';
import { mkdir, copyFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '../apps/web/public');
const downloads = join(homedir(), 'Downloads');
const photos = join(homedir(), 'Pictures', '_to-sort-later');

const src = {
  // Branding and video, from Downloads.
  poster: join(downloads, 'thumbnail.jpg'),
  monogram: join(downloads, 'rm.png'),
  video: join(downloads, 'Rheana_Mindo_Video_Resume.mp4'),

  // Photography. RM_Linkedin_Photo.jpg is deliberately no longer used.
  portrait: join(photos, 'Olive Studio Graduation', '938 MINDO RHEAN OS_75002 8R FRAME.jpg'),
  atWork: join(photos, 'Rheana and Jet', 'Rhea&Jet_Pictures_Couple_Graduation_Creative_UPLB_2025-110.jpg'),
  sablay: join(photos, 'Rheana_s Family', 'Rheana_Family_Graduation_UPLB_Photoshoot-8.jpg'),
  oblation: join(photos, 'Rheana_s Family', 'Rheana_Family_Graduation_UPLB_Photoshoot-32.jpg'),
};

await mkdir(join(publicDir, 'media'), { recursive: true });
await mkdir(join(publicDir, 'img'), { recursive: true });

const kb = n => `${(n / 1024).toFixed(0)} kB`;
const report = async (label, path) => {
  const { size } = await stat(path);
  console.log(`  ${label.padEnd(52)} ${kb(size).padStart(9)}`);
};

const missing = Object.entries(src).filter(([, p]) => !existsSync(p));
if (missing.length) {
  console.error('Missing source files:');
  for (const [name, p] of missing) console.error(`  ${name}: ${p}`);
  process.exit(1);
}

// sharp's "attention" crop keeps the most visually salient region, which on a
// portrait is reliably the face. Cropping 2:3 originals to a square from the
// centre would cut heads off.
const SMART = { fit: 'cover', position: sharp.strategy.attention };

console.log('media');

const posterOut = join(publicDir, 'media/rheana-mindo-video-resume-poster.webp');
await sharp(src.poster).resize(1280, 720, { fit: 'cover' })
  .webp({ quality: 72, effort: 6 }).toFile(posterOut);
await report('rheana-mindo-video-resume-poster.webp', posterOut);

const videoOut = join(publicDir, 'media/rheana-mindo-video-resume.mp4');
await copyFile(src.video, videoOut);
await report('rheana-mindo-video-resume.mp4', videoOut);

console.log('photography');

// Hero portrait: studio headshot in Filipiniana with the UP sablay. Square,
// because the hero renders it in an organic rounded shape.
for (const w of [320, 640]) {
  const out = join(publicDir, `img/rheana-mindo-ai-developer-portrait-${w}.webp`);
  await sharp(src.portrait).resize(w, w, SMART).webp({ quality: 78, effort: 6 }).toFile(out);
  await report(`rheana-mindo-ai-developer-portrait-${w}.webp`, out);
}

// At-work band: writing code by the light of the keyboard, in a barong and the
// sablay. The single most on-message photograph in the set for a developer
// portfolio, so it gets a wide crop and a full-width band.
for (const w of [960, 1600]) {
  const out = join(publicDir, `img/rheana-mindo-developer-at-work-${w}.webp`);
  await sharp(src.atWork).resize(w, Math.round(w * 0.5), SMART)
    .webp({ quality: 74, effort: 6 }).toFile(out);
  await report(`rheana-mindo-developer-at-work-${w}.webp`, out);
}

// The sablay and the cake both carry Baybayin script, which is why this one
// sits in the Baybayin section rather than with the other graduation photos.
for (const w of [480, 960]) {
  const out = join(publicDir, `img/rheana-mindo-sablay-baybayin-${w}.webp`);
  await sharp(src.sablay).resize(w, Math.round(w * 1.25), SMART)
    .webp({ quality: 76, effort: 6 }).toFile(out);
  await report(`rheana-mindo-sablay-baybayin-${w}.webp`, out);
}

// UPLB Oblation, for the education section.
for (const w of [480, 960]) {
  const out = join(publicDir, `img/rheana-mindo-uplb-graduation-${w}.webp`);
  await sharp(src.oblation).resize(w, Math.round(w * 1.25), SMART)
    .webp({ quality: 76, effort: 6 }).toFile(out);
  await report(`rheana-mindo-uplb-graduation-${w}.webp`, out);
}

const markOut = join(publicDir, 'img/rheana-mindo-rm-monogram.webp');
await sharp(src.monogram).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 80, effort: 6 }).toFile(markOut);
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

console.log('\nDone. Generated files are committed; sources stay outside the repo.');
