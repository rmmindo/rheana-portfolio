import { describe, it, expect } from 'vitest';
import { parseNotes, layout, barHeights } from '../src/lib/dashboard.js';

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

  // Two stats and then a chart used to strand the third column on every row
  // after the first, so the dashboard rendered two-thirds empty.
  it('fills every row rather than leaving a gap', () => {
    const placed = layout(parseNotes('- a: 1\n- b: 2\n- c: 4,5,6\n- d: 7% to 9%'), 3);
    for (const row of rowsOf(placed)) {
      const total = placed.filter(w => w.row === row).reduce((n, w) => n + w.span, 0);
      expect(total, `row ${row} does not fill`).toBe(3);
    }
  });

  it('keeps widgets in the order they were written', () => {
    const placed = layout(parseNotes('- a: 1\n- b: 2\n- c: 4,5,6'), 3);
    expect(placed.map(w => w.label)).toEqual(['a', 'b', 'c']);
    // Rows never go backwards, so reading order matches screen order.
    for (let i = 1; i < placed.length; i++) {
      expect(placed[i].row).toBeGreaterThanOrEqual(placed[i - 1].row);
    }
  });
});

describe('units', () => {
  // "2% to 5%" carries the same unit twice. Stripping every number out of the
  // string and tidying what was left read it as "%  %", which then rendered
  // beside the value on the page.
  it('reads a repeated unit once', () => {
    expect(parseNotes('- conversion: 2% to 5%')[0].unit).toBe('%');
  });

  it('takes the unit from the second number of a change', () => {
    expect(parseNotes('- build: 36 min -> 35 s')[0].unit).toBe('s');
  });

  it('takes the unit from the number it belongs to, not a later one', () => {
    // indexOf('3') inside "3 out of 30" lands on the wrong digit and returns
    // "0" as the unit.
    expect(parseNotes('- passed: 3 out of 30')[0]).toMatchObject({ value: 3, unit: '' });
  });

  it('keeps a short unit that touches the number', () => {
    expect(parseNotes('- churn: 3.1%')[0].unit).toBe('%');
    expect(parseNotes('- latency: 820 ms')[0].unit).toBe('ms');
  });

  it('does not treat trailing prose as a unit', () => {
    expect(parseNotes('- signups: 1,240 new customers')[0].unit).toBe('');
  });
});

describe('bar heights', () => {
  it('puts the largest value at full height', () => {
    expect(barHeights([820, 910, 1050, 1180]).at(-1)).toBe(100);
  });

  it('measures from zero, not from the smallest value', () => {
    // Otherwise 98 and 100 look like nothing and everything.
    expect(barHeights([98, 100])[0]).toBeCloseTo(98);
  });

  // A negative height is invalid CSS, so the bar vanishes rather than showing a
  // dip.
  it('never returns a negative height', () => {
    for (const h of barHeights([-5, 3, 8])) expect(h).toBeGreaterThanOrEqual(0);
  });

  it('survives a series far longer than the call stack', () => {
    // Math.max(...series) on this would overflow.
    const long = Array.from({ length: 200000 }, (_, i) => i);
    expect(() => barHeights(long)).not.toThrow();
  });

  it('handles all-equal and empty series', () => {
    expect(barHeights([5, 5, 5]).every(h => h === 100)).toBe(true);
    expect(barHeights([])).toEqual([]);
  });
});
