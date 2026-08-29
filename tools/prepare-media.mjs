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

  // Decorative shapes from the sticker set. Only these five are used: they are
  // on-brand (the hydrangea cluster is Rheana's own motif, the star matches the
  // one at the centre of her logo) and they do a job. The rest of the set is
  // fruit and confectionery, which would turn a developer portfolio into a
  // scrapbook, so it is deliberately left out.
  hydrangeaCluster: join(downloads, 'Untitled design (3).png'),

  // Garden markers. One per stage of the page's growth narrative, plus the
  // fruit for the gallery strip. The theme is not decoration for its own sake:
  // Rheana's video resume opens with "I'm a cultivator of stories".
  gardenLeaf: join(downloads, 'Untitled design (1).png'),
  gardenClover: join(downloads, 'Untitled design (2).png'),
  gardenFlower: join(downloads, 'Untitled design.png'),
  gardenLavender: join(downloads, 'Untitled design (5).png'),
  gardenLeafSmall: join(downloads, 'Untitled design (19).png'),
  fruitLemon: join(downloads, 'Untitled design (8).png'),
  fruitMango: join(downloads, 'Untitled design (10).png'),
  fruitStrawberry: join(downloads, 'Untitled design (11).png'),
  fruitApple: join(downloads, 'Untitled design (13).png'),
  fruitCherry: join(downloads, 'Untitled design (14).png'),
  fruitWatermelon: join(downloads, 'Untitled design (15).png'),
  scallopBlob: join(downloads, 'Untitled design (23).png'),
  scallopFrame: join(downloads, 'Untitled design (22).png'),
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
// A 2:3 original cropped to 2:1 throws away two thirds of the frame. Cropping
// with the attention strategy on top of that zoomed into her hands and lost the
// whole composition. Instead: take a gentle 3:2 crop from the upper-middle of
// the frame, where she and the laptop are, and render it larger so the band can
// be tall without upscaling.
// An explicit window, not a gravity guess. The frame is 4000x6000; she sits
// between roughly y=1900 and y=4570, so a 4000x2667 extract from y=1900 holds
// her face, the sablay and both hands on the keyboard. Cropping from the top
// gave the ceiling and the crown of her head; the attention strategy zoomed
// into her hands. Naming the rectangle is the only thing that reliably works.
//
// modulate lifts the exposure a little: the original is a deliberately dark
// frame, and it sits on a light page.
for (const w of [1200, 1800]) {
  const out = join(publicDir, `img/rheana-mindo-developer-at-work-${w}.webp`);
  await sharp(src.atWork)
    .extract({ left: 0, top: 1900, width: 4000, height: 2667 })
    .resize(w, Math.round(w * 0.667))
    .modulate({ brightness: 1.12 })
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

console.log('ornament');

// trim() crops the transparent margin so the shape sits flush in its box.
const ornaments = [
  ['hydrangea-cluster', src.hydrangeaCluster, 320],
  ['scallop-blob', src.scallopBlob, 640],
  ['scallop-frame', src.scallopFrame, 640],
  ['garden-leaf', src.gardenLeaf, 200],
  ['garden-clover', src.gardenClover, 200],
  ['garden-flower', src.gardenFlower, 200],
  ['garden-lavender', src.gardenLavender, 200],
  ['garden-sprout', src.gardenLeafSmall, 200],
  ['fruit-lemon', src.fruitLemon, 180],
  ['fruit-mango', src.fruitMango, 180],
  ['fruit-strawberry', src.fruitStrawberry, 180],
  ['fruit-apple', src.fruitApple, 180],
  ['fruit-cherry', src.fruitCherry, 180],
  ['fruit-watermelon', src.fruitWatermelon, 180],
];
for (const [name, file, size] of ornaments) {
  const out = join(publicDir, `img/${name}.webp`);
  await sharp(file).trim().resize(size, size, { fit: 'inside' })
    .webp({ quality: 82, effort: 6, alphaQuality: 100 }).toFile(out);
  await report(`${name}.webp`, out);
}

// 512 for the social share card, 96 for the nav bar. Serving the 512 into a
// 36px slot would be 34 kB to draw a thumbnail.
for (const size of [96, 512]) {
  const out = join(publicDir, `img/rheana-mindo-rm-monogram-${size}.webp`);
  await sharp(src.monogram).trim()
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 84, effort: 6, alphaQuality: 100 }).toFile(out);
  await report(`rheana-mindo-rm-monogram-${size}.webp`, out);
}

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
