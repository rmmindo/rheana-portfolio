// recognize.js
// Handwriting recognition for Baybayin, by template matching.
//
// This is the inverse of transliterate(): you draw a glyph, it tells you which
// character you drew. It is the browser-sized version of the Baybayin Detector
// (2024), which did the same job from a live webcam using OpenCV optical flow
// and a GRU recurrent network.
//
// WHY TEMPLATE MATCHING AND NOT A NEURAL NETWORK
// A trained model for 20 classes would be more accurate on messy input. It
// would also mean shipping weights, a runtime, and a several-hundred-kilobyte
// download to every visitor, for a toy on a portfolio page. Template matching
// needs no download at all: the glyph templates are rendered from a font the
// page has already loaded. It is deterministic, it runs in about a millisecond,
// and when it is wrong it is wrong in a way you can explain by looking at the
// pictures. Choosing the cheaper method that fits the constraint is the same
// judgement the rest of this site argues for.
//
// The pipeline, all pure functions so it is testable without a canvas:
//   1. crop to the ink's bounding box       - position stops mattering
//   2. scale to a fixed grid                - size stops mattering
//   3. blur                                 - stroke thickness and wobble stop
//                                             mattering, and near-misses score
//                                             gracefully instead of falling off
//                                             a cliff
//   4. cosine similarity against each template

// A finer grid than the 24 used for base glyphs alone. A kudlit is a small mark
// relative to the letter it sits on, and at 24x24 with a blur it smeared into
// the body of the consonant, which is why the first version could only tell
// base letters apart.
export const GRID = 32;

/** The 17 base consonant and vowel signs of the U+1700 block. */
export const BASE = [
  { char: 'ᜀ', latin: 'a' },   { char: 'ᜁ', latin: 'i/e' },  { char: 'ᜂ', latin: 'u/o' },
  { char: 'ᜃ', latin: 'ka' },  { char: 'ᜄ', latin: 'ga' },   { char: 'ᜅ', latin: 'nga' },
  { char: 'ᜆ', latin: 'ta' },  { char: 'ᜇ', latin: 'da/ra' },{ char: 'ᜈ', latin: 'na' },
  { char: 'ᜉ', latin: 'pa' },  { char: 'ᜊ', latin: 'ba' },   { char: 'ᜋ', latin: 'ma' },
  { char: 'ᜌ', latin: 'ya' },  { char: 'ᜎ', latin: 'la' },   { char: 'ᜏ', latin: 'wa' },
  { char: 'ᜐ', latin: 'sa' },  { char: 'ᜑ', latin: 'ha' },
];

const KUDLIT_I = 'ᜒ';
const KUDLIT_U = 'ᜓ';
const VIRAMA = '᜔';

/** The three independent vowels take no marks. */
const VOWEL_CHARS = new Set(['ᜀ', 'ᜁ', 'ᜂ']);

/**
 * Every form a learner can actually draw: the bare consonant (inherent "a"),
 * the same consonant with the kudlit above for i/e, with the kudlit below for
 * u/o, and with the virama cancelling the vowel.
 *
 * 17 consonants x 4 forms, minus the three vowels which take no marks, plus
 * those three on their own.
 */
export const GLYPHS = BASE.flatMap(g => {
  if (VOWEL_CHARS.has(g.char)) return [{ ...g, form: 'vowel', reading: g.latin }];
  // "ka" -> "k", "nga" -> "ng", "da/ra" -> "d". The consonant stem is what the
  // kudlit forms are built on, so it is derived once here rather than listed.
  const consonant = g.latin.split('/')[0].replace(/a$/, '');
  return [
    { char: g.char, latin: g.latin, form: 'a', reading: g.latin },
    { char: g.char + KUDLIT_I, latin: `${consonant}i`, form: 'i', reading: `${consonant}i / ${consonant}e` },
    { char: g.char + KUDLIT_U, latin: `${consonant}u`, form: 'u', reading: `${consonant}u / ${consonant}o` },
    { char: g.char + VIRAMA, latin: consonant, form: 'virama', reading: `${consonant} (no vowel)` },
  ];
});

/**
 * Smallest rectangle containing any ink. Returns null when the grid is empty,
 * which is how "nothing was drawn" is represented rather than by guessing.
 */
export function boundingBox(data, width, height, threshold = 0.08) {
  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[y * width + x] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * Crops to `box` and resamples into a size x size grid.
 *
 * The aspect ratio is preserved and the result is centred, because squashing a
 * tall glyph into a square would make it look like a different glyph.
 */
export function cropAndScale(data, width, height, box, size = GRID) {
  const out = new Float32Array(size * size);
  if (!box) return out;

  const scale = Math.max(box.width, box.height);
  const offsetX = (scale - box.width) / 2;
  const offsetY = (scale - box.height) / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = Math.floor(box.x + ((x + 0.5) / size) * scale - offsetX);
      const sy = Math.floor(box.y + ((y + 0.5) / size) * scale - offsetY);
      if (sx < 0 || sy < 0 || sx >= width || sy >= height) continue;
      out[y * size + x] = data[sy * width + sx];
    }
  }
  return out;
}

/** Separable box blur. Forgives wobble and stroke width. */
export function blur(data, size = GRID, radius = 1) {
  const pass = (src, horizontal) => {
    const dst = new Float32Array(src.length);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let sum = 0;
        let n = 0;
        for (let d = -radius; d <= radius; d++) {
          const nx = horizontal ? x + d : x;
          const ny = horizontal ? y : y + d;
          if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
          sum += src[ny * size + nx];
          n++;
        }
        dst[y * size + x] = sum / n;
      }
    }
    return dst;
  };
  return pass(pass(data, true), false);
}

/** Cosine similarity in [0, 1] for non-negative vectors. */
export function similarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / Math.sqrt(na * nb);
}

/** Full normalisation pipeline: raw grid in, comparable feature vector out. */
export function normalise(data, width, height, size = GRID) {
  const box = boundingBox(data, width, height);
  if (!box) return null;
  return blur(cropAndScale(data, width, height, box, size), size, 1);
}

/**
 * Ranks templates against a normalised sample.
 *
 * Returns [] for an empty drawing rather than a list of meaningless guesses:
 * a recogniser that confidently names a character for a blank canvas is worse
 * than one that says nothing.
 */
export function classify(sample, templates, limit = 3) {
  if (!sample) return [];
  return templates
    .map(t => ({ ...t, score: similarity(sample, t.features) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
