import { describe, it, expect } from 'vitest';
import { parseNotes, layout } from '../src/lib/dashboard.js';

describe('recognising shapes', () => {
  it('reads a heading as a section title', () => {
    expect(parseNotes('## Q3 revenue')[0]).toMatchObject({ type: 'title', label: 'Q3 revenue' });
  });

  it('reads one number as a measurement', () => {
    expect(parseNotes('- signups: 1,240')[0]).toMatchObject({
      type: 'stat', label: 'signups', value: 1240,
    });
  });

  it('strips thousands separators so the value is a real number', () => {
    expect(parseNotes('- revenue: 1,089,925')[0].value).toBe(1089925);
  });

  it('reads three or more numbers as a series', () => {
    expect(parseNotes('- weekly: 12, 18, 25, 31')[0]).toMatchObject({
      type: 'chart', label: 'weekly', series: [12, 18, 25, 31],
    });
  });

  // Two numbers with a joining word is a change, not a series and not a stat.
  it('reads a from-to pair as a change', () => {
    expect(parseNotes('- conversion: 2% to 5%')[0]).toMatchObject({
      type: 'delta', label: 'conversion', from: 2, to: 5,
    });
  });

  it('reads an arrow as a change too', () => {
    expect(parseNotes('- build: 36 -> 35')[0]).toMatchObject({ type: 'delta', from: 36, to: 35 });
  });

  it('keeps text with no numbers as a note', () => {
    expect(parseNotes('- owner: the growth team')[0]).toMatchObject({
      type: 'note', label: 'owner', text: 'the growth team',
    });
  });

  it('keeps a bare line as a note', () => {
    expect(parseNotes('remember to ask about Q4')[0]).toMatchObject({ type: 'note' });
  });

  it('ignores blank lines', () => {
    expect(parseNotes('- a: 1\n\n\n- b: 2')).toHaveLength(2);
  });

  it('returns nothing for empty input', () => {
    expect(parseNotes('')).toEqual([]);
    expect(parseNotes(null)).toEqual([]);
  });

  it('accepts several bullet characters', () => {
    for (const b of ['-', '*', '•']) {
      expect(parseNotes(`${b} signups: 12`)[0].type).toBe('stat');
    }
  });

  it('is deterministic', () => {
    const notes = '## Q3\n- signups: 1,240\n- churn: 3.1%\n- weekly: 4, 9, 16';
    const once = JSON.stringify(parseNotes(notes));
    for (let i = 0; i < 10; i++) expect(JSON.stringify(parseNotes(notes))).toBe(once);
  });
});

describe('layout', () => {
  const rowsOf = placed => [...new Set(placed.map(w => w.row))];

  it('never exceeds the column count on a row', () => {
    const widgets = parseNotes('- a: 1\n- b: 2\n- c: 3\n- d: 4\n- e: 5');
    const placed = layout(widgets, 3);
    for (const row of rowsOf(placed)) {
      const total = placed.filter(w => w.row === row).reduce((n, w) => n + w.span, 0);
      expect(total, `row ${row} overflows`).toBeLessThanOrEqual(3);
    }
  });

  it('gives a title a row of its own', () => {
    const placed = layout(parseNotes('- a: 1\n## Section\n- b: 2'), 3);
    const title = placed.find(w => w.type === 'title');
    expect(placed.filter(w => w.row === title.row)).toHaveLength(1);
  });

  it('wraps a wide widget rather than overflowing', () => {
    // stat(1) then chart(2) fills the row; the next chart must wrap.
    const placed = layout(parseNotes('- a: 1\n- b: 1,2,3\n- c: 4,5,6'), 3);
    expect(placed[2].row).toBeGreaterThan(placed[1].row);
  });

  it('clamps a span that is wider than the grid', () => {
    const placed = layout(parseNotes('- a: 1,2,3'), 1);
    expect(placed[0].span).toBe(1);
  });

  it('places nothing for no widgets', () => {
    expect(layout([], 3)).toEqual([]);
  });
});
