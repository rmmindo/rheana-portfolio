import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const built = join(here, '../dist/index.html');

// A var() pointing at a property nobody defines fails silently. The rule is
// dropped at computed-value time, so the colour simply inherits and the page
// looks nearly right - which is how three rules sat pointing at --ink-teal,
// a hue that has never existed in this palette, without anything failing.
//
// The fallback that would have saved them, var(--ink-teal, var(--ink-purple)),
// was removed by a search and replace that only looked at the first argument.
describe('css custom properties', () => {
  const css = existsSync(built) ? readFileSync(built, 'utf8') : null;

  it.runIf(css)('defines every custom property that is used', () => {
    const defined = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map(m => m[1]));

    // Set on individual elements at runtime by PetalBurst.jsx, so they are
    // never in a stylesheet. Listing them here rather than loosening the check
    // keeps the guard sharp: anything else missing is a real fault.
    const SET_BY_SCRIPT = new Set(['--x0', '--y0', '--x1', '--y1', '--a', '--d', '--s']);

    // Only the first argument of var() has to be defined; a second argument is
    // an explicit fallback and is the correct way to reference a maybe.
    const used = [...css.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(,)?/gi)]
      .filter(m => !m[2])
      .map(m => m[1]);

    const missing = [...new Set(used)]
      .filter(name => !defined.has(name) && !SET_BY_SCRIPT.has(name))
      .sort();
    expect(missing, `used but never defined: ${missing.join(', ')}`).toEqual([]);
  });

  it.runIf(css)('defines every palette hue in both themes', () => {
    for (const hue of ['powder', 'purple', 'pink', 'mint', 'red', 'yellow']) {
      for (const kind of ['ink', 'surface']) {
        const matches = css.match(new RegExp(`--${kind}-${hue}\s*:`, 'g')) ?? [];
        expect(matches.length, `--${kind}-${hue} is defined ${matches.length} times`)
          .toBeGreaterThanOrEqual(2);
      }
    }
  });
});
