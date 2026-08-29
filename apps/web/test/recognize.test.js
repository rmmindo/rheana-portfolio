import { describe, it, expect } from 'vitest';
import {
  GRID, GLYPHS, BASE, boundingBox, cropAndScale, blur, similarity, normalise, classify,
} from '../src/lib/recognize.js';

// Builds a raw grid from an ASCII picture, so the tests read as the shapes they
// are about rather than as arrays of numbers.
function grid(rows) {
  const height = rows.length;
  const width = rows[0].length;
  const data = new Float32Array(width * height);
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => { data[y * width + x] = ch === '#' ? 1 : 0; });
  });
  return { data, width, height };
}

describe('boundingBox', () => {
  it('finds the ink', () => {
    const g = grid([
      '.....',
      '.##..',
      '.##..',
      '.....',
    ]);
    expect(boundingBox(g.data, g.width, g.height)).toEqual({ x: 1, y: 1, width: 2, height: 2 });
  });

  it('returns null for an empty grid, rather than a degenerate box', () => {
    const g = grid(['....', '....']);
    expect(boundingBox(g.data, g.width, g.height)).toBeNull();
  });
});

describe('cropAndScale', () => {
  it('makes position irrelevant', () => {
    const left = grid(['##..', '##..', '....', '....']);
    const right = grid(['....', '....', '..##', '..##']);
    const a = normalise(left.data, left.width, left.height);
    const b = normalise(right.data, right.width, right.height);
    expect(similarity(a, b)).toBeGreaterThan(0.99);
  });

  it('makes size irrelevant', () => {
    const small = grid(['.##.', '.##.', '....', '....']);
    // Same square shape, four times the size. Aspect ratio must match, because
    // cropAndScale preserves it on purpose.
    const big = grid([
      '####....',
      '####....',
      '####....',
      '####....',
      '........',
      '........',
      '........',
      '........',
    ]);
    const a = normalise(small.data, small.width, small.height);
    const b = normalise(big.data, big.width, big.height);
    expect(similarity(a, b)).toBeGreaterThan(0.95);
  });

  it('preserves aspect ratio, so a tall shape does not become a square', () => {
    const tall = grid(['#.', '#.', '#.', '#.']);
    const square = grid(['##', '##']);
    const a = normalise(tall.data, tall.width, tall.height);
    const b = normalise(square.data, square.width, square.height);
    expect(similarity(a, b)).toBeLessThan(0.9);
  });

  it('returns an empty grid for a null box', () => {
    const out = cropAndScale(new Float32Array(16), 4, 4, null);
    expect(out.every(v => v === 0)).toBe(true);
    expect(out).toHaveLength(GRID * GRID);
  });
});

describe('blur', () => {
  it('spreads ink into neighbouring cells', () => {
    const data = new Float32Array(GRID * GRID);
    const centre = Math.floor(GRID / 2) * GRID + Math.floor(GRID / 2);
    data[centre] = 1;
    const out = blur(data, GRID, 1);
    expect(out[centre]).toBeLessThan(1);
    expect(out[centre + 1]).toBeGreaterThan(0);
  });

  it('preserves an empty grid', () => {
    const out = blur(new Float32Array(GRID * GRID), GRID, 1);
    expect(out.every(v => v === 0)).toBe(true);
  });
});

describe('similarity', () => {
  it('is 1 for identical vectors', () => {
    const a = Float32Array.from([1, 0, 1, 0]);
    expect(similarity(a, a)).toBeCloseTo(1);
  });

  it('is 0 for disjoint vectors', () => {
    expect(similarity(Float32Array.from([1, 0]), Float32Array.from([0, 1]))).toBe(0);
  });

  it('is 0 when either side is empty, instead of dividing by zero', () => {
    expect(similarity(Float32Array.from([0, 0]), Float32Array.from([1, 1]))).toBe(0);
  });

  it('ignores overall scale, so a heavier stroke is not a different glyph', () => {
    const light = Float32Array.from([0.2, 0.4, 0.2]);
    const heavy = Float32Array.from([1, 2, 1]);
    expect(similarity(light, heavy)).toBeCloseTo(1);
  });
});

describe('classify', () => {
  const templates = [
    { char: 'A', latin: 'a', features: Float32Array.from([1, 0, 0, 0]) },
    { char: 'B', latin: 'b', features: Float32Array.from([0, 1, 0, 0]) },
    { char: 'C', latin: 'c', features: Float32Array.from([0, 0, 1, 0]) },
  ];

  it('ranks the closest template first', () => {
    const [top] = classify(Float32Array.from([0.9, 0.1, 0, 0]), templates);
    expect(top.char).toBe('A');
  });

  it('returns the requested number of candidates', () => {
    expect(classify(Float32Array.from([1, 1, 1, 0]), templates, 2)).toHaveLength(2);
  });

  it('returns nothing for an empty drawing rather than a confident wrong guess', () => {
    expect(classify(null, templates)).toEqual([]);
  });

  it('sorts descending by score', () => {
    const out = classify(Float32Array.from([0.5, 0.9, 0.1, 0]), templates);
    expect(out[0].score).toBeGreaterThanOrEqual(out[1].score);
    expect(out[1].score).toBeGreaterThanOrEqual(out[2].score);
  });
});

describe('glyph set', () => {
  it('covers the 17 base characters', () => {
    expect(BASE).toHaveLength(17);
  });

  // The first version only had the 17 bare letters, so it could never tell
  // "ka" from "ki" - the kudlit was invisible to it. Every writable form now
  // has a template: 14 consonants x 4 forms, plus the 3 standalone vowels.
  it('covers every writable form, not just the bare letters', () => {
    expect(GLYPHS).toHaveLength(59);
  });

  it('includes the kudlit and virama forms of each consonant', () => {
    const forms = GLYPHS.reduce((acc, g) => ({ ...acc, [g.form]: (acc[g.form] ?? 0) + 1 }), {});
    expect(forms).toEqual({ vowel: 3, a: 14, i: 14, u: 14, virama: 14 });
  });

  it('builds the consonant stem correctly, including the ng digraph', () => {
    const ng = GLYPHS.filter(g => g.form === 'i' && g.latin === 'ngi');
    expect(ng).toHaveLength(1);
  });

  it('has a unique character sequence per entry', () => {
    expect(new Set(GLYPHS.map(g => g.char)).size).toBe(GLYPHS.length);
  });

  it('gives every glyph a human reading', () => {
    for (const g of GLYPHS) expect(g.reading).toBeTruthy();
  });

  it('states both vowel readings a kudlit can carry', () => {
    const ki = GLYPHS.find(g => g.latin === 'ki');
    expect(ki.reading).toBe('ki / ke');
  });

  it('marks a virama form as carrying no vowel', () => {
    const k = GLYPHS.find(g => g.form === 'virama' && g.latin === 'k');
    expect(k.reading).toContain('no vowel');
  });
});
