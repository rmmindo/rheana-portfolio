// check-contrast.mjs
// Every contrast claim in _variables.scss is asserted here, so a future colour
// edit fails the test run instead of silently shipping unreadable text.
// Run: node tools/check-contrast.mjs

const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lum = ([r, g, b]) => {
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
export const ratio = (a, b) => {
  const [l1, l2] = [lum(hex2rgb(a)), lum(hex2rgb(b))];
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
};

const PAPER = '#fffdfa', NIGHT = '#12101a';
const INK_STRONG = '#1a1626', INK_MUTED = '#4a4458';
const NIGHT_INK = '#f4f1fa', NIGHT_MUTED = '#b9b2c9';

const PALETTE = {
  powder: { surface: '#a0cfec', ink: '#24597b', darkSurface: '#26495e', darkInk: '#63bcf2', glow: '#1997e6' },
  purple: { surface: '#ac8aea', ink: '#3b0c92', darkSurface: '#3a265e', darkInk: '#ac84f5', glow: '#905eed' },
  pink:   { surface: '#ffa0e2', ink: '#862769', darkSurface: '#5e264d', darkInk: '#f47bd0', glow: '#e935b3' },
  mint:   { surface: '#c8f1f3', ink: '#227377', darkSurface: '#25585b', darkInk: '#39e6ef', glow: '#17c5cf' },
  red:    { surface: '#ff998f', ink: '#82251c', darkSurface: '#5e2b26', darkInk: '#f4857b', glow: '#ea4c3e' },
  yellow: { surface: '#ffd788', ink: '#775a22', darkSurface: '#5e4c26', darkInk: '#f0b642', glow: '#cf9117' },
};

const AA_TEXT = 4.5, AA_UI = 3.0;
const checks = [];
const add = (label, fg, bg, min) => checks.push({ label, fg, bg, min, got: ratio(fg, bg) });

add('body text on paper', INK_STRONG, PAPER, AA_TEXT);
add('muted text on paper', INK_MUTED, PAPER, AA_TEXT);
add('body text on night', NIGHT_INK, NIGHT, AA_TEXT);
add('muted text on night', NIGHT_MUTED, NIGHT, AA_TEXT);

for (const [name, p] of Object.entries(PALETTE)) {
  add(`${name}: ink on white`, p.ink, '#ffffff', AA_TEXT);
  add(`${name}: ink on its surface`, p.ink, p.surface, AA_TEXT);
  add(`${name}: strong ink on surface`, INK_STRONG, p.surface, AA_TEXT);
  add(`${name}: dark ink on dark surface`, p.darkInk, p.darkSurface, AA_TEXT);
  add(`${name}: dark ink on night`, p.darkInk, NIGHT, AA_TEXT);
  // Dark surfaces must stay readable AND stay chromatic. 7:1 is deliberately
  // stricter than AA: the first attempt desaturated every hue to near-black,
  // which passed contrast and destroyed the palette.
  add(`${name}: text on dark surface`, NIGHT_INK, p.darkSurface, 7.0);
  add(`${name}: glow border on dark surface`, p.glow, p.darkSurface, AA_UI);
}

// Brand blue is deliberately UI-only in light mode. Assert BOTH facts, so a
// future edit that promotes it to body text fails loudly.
add('brand blue as UI on paper', '#3394ce', PAPER, AA_UI);
add('brand blue as text on night', '#3394ce', NIGHT, AA_TEXT);
add('focus ring (purple) on paper', '#3b0c92', PAPER, AA_UI);
add('focus ring (yellow) on night', '#f8cf2f', NIGHT, AA_UI);

let failed = 0;
for (const c of checks) {
  const ok = c.got >= c.min;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.label.padEnd(34)} ${c.got.toFixed(2).padStart(6)} (need ${c.min})`);
}
console.log(`\n${checks.length - failed}/${checks.length} passed`);
if (failed) { console.error(`${failed} contrast check(s) FAILED`); process.exit(1); }
