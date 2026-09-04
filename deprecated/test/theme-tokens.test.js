// Guards the cascade rule in themes/_tokens.scss.
//
// The failure this prevents: defining a colour ONLY inside
// @media (prefers-color-scheme: dark). When that happens the manual theme
// toggle cannot override it and the page renders half-themed. Compiling the
// real stylesheet and asserting on the output catches it at build time.
//
// Selectors below are written unquoted ([data-theme=dark]) because that is what
// dart-sass emits; the source writes them quoted and both are valid CSS.

import { describe, it, expect, beforeAll } from 'vitest';
import { compile } from 'sass';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
let css;

beforeAll(() => {
  css = compile(join(here, '../src/styles/main.scss'), { style: 'expanded' }).css;
});

const blockFor = selector => {
  const i = css.indexOf(selector);
  if (i === -1) throw new Error(`selector not found in compiled css: ${selector}`);
  return css.slice(i, css.indexOf('}', i));
};

const TOKENS = [
  '--paper', '--text', '--text-muted', '--border', '--shadow', '--focus', '--focus-halo',
  '--surface-powder', '--ink-powder', '--surface-purple', '--ink-purple',
  '--surface-pink', '--ink-pink', '--surface-mint', '--ink-mint',
  '--surface-red', '--ink-red', '--surface-yellow', '--ink-yellow',
];

describe('theme token cascade', () => {
  it('defines every token on bare :root', () => {
    const root = blockFor(':root {');
    for (const t of TOKENS) expect(root, `${t} missing from :root`).toContain(`${t}:`);
  });

  it('scopes the OS dark preference so an explicit light choice still wins', () => {
    expect(css).toContain('prefers-color-scheme: dark');
    expect(css).toContain(':root:not([data-theme=light])');
  });

  it('lets an explicit dark choice win without a media query', () => {
    expect(blockFor(':root[data-theme=dark]')).toContain('--paper:');
  });

  it('redefines every token in dark mode, not just a subset', () => {
    const dark = blockFor(':root[data-theme=dark]');
    for (const t of TOKENS) expect(dark, `${t} missing from dark theme`).toContain(`${t}:`);
  });

  it('emits readable token names despite CSS colour-keyword palette keys', () => {
    // purple, pink and red are CSS colour keywords. Unquoted as Sass map keys
    // they interpolate as colour VALUES, producing mangled property names.
    for (const name of ['powder', 'purple', 'pink', 'mint', 'red', 'yellow']) {
      expect(css, `--surface-${name} malformed`).toContain(`--surface-${name}:`);
      expect(css, `--ink-${name} malformed`).toContain(`--ink-${name}:`);
    }
  });

  it('never lets a pastel become body text in light mode', () => {
    // #a0cfec is 1.66:1 on white. It is legal as a surface, never as --text.
    const textLine = blockFor(':root {').split('\n').find(l => l.trim().startsWith('--text:'));
    expect(textLine).not.toMatch(/#a0cfe[bc]/i);
  });
});

describe('reduced motion', () => {
  it('honours prefers-reduced-motion', () => {
    expect(css).toContain('prefers-reduced-motion: reduce');
  });
});
