// dashboard.js
// Turns loose notes into positioned dashboard widgets.
//
// This is the browser-sized version of the service Rheana shipped at Offshorly:
// markdown arrives from upstream bots, and dashboards come out already laid
// out. The real one ran on FastAPI and LangChain and produced 36 widgets in 35
// seconds against a manual process that took about 36 minutes.
//
// The parsing is deterministic on purpose, and that is the point worth making.
// Deciding that "signups: 1,240" is a number and "conversion up from 2% to 5%"
// is a comparison does not need a language model - it needs a few rules applied
// consistently. Reaching for an LLM here would add latency, cost and a way to
// be wrong, in exchange for nothing.
//
// Recognised shapes, in order of precedence:
//   ## Heading            a section title
//   - label: 12, 18, 25   a series      -> chart widget
//   - label: 1,240        a measurement -> stat widget
//   - label: 2% to 5%     a change      -> delta widget
//   anything else         a note        -> text widget

// A comma is a thousands separator ONLY when three digits follow it. Without
// that restriction the pattern is greedy across commas, so "1,2,3" parses as
// the single number 123 and a series is mistaken for a measurement.
//   1,240   -> one number
//   1,2,3   -> three numbers
const NUM = /-?\d+(?:,\d{3})*(?:\.\d+)?/g;

const toNumber = s => Number(String(s).replace(/,/g, ''));

/** Widget sizes in grid columns, so layout is a property of the type. */
const SPAN = { chart: 2, delta: 2, stat: 1, note: 2, title: 3 };

export function parseNotes(input) {
  if (!input || !input.trim()) return [];
  const widgets = [];

  for (const raw of input.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      widgets.push({ type: 'title', label: heading[1].trim() });
      continue;
    }

    const item = line.replace(/^[-*•]\s*/, '');
    const split = item.match(/^([^:]{1,40}):\s*(.+)$/);

    if (split) {
      const label = split[1].trim();
      const value = split[2].trim();
      const numbers = value.match(NUM);

      if (numbers && numbers.length >= 3) {
        widgets.push({ type: 'chart', label, series: numbers.map(toNumber) });
        continue;
      }

      // "2% to 5%" or "36 min -> 35 s": two numbers reads as a change.
      if (numbers && numbers.length === 2 && /\bto\b|->|→|from/i.test(value)) {
        widgets.push({
          type: 'delta',
          label,
          from: toNumber(numbers[0]),
          to: toNumber(numbers[1]),
          unit: value.replace(NUM, '').replace(/\b(to|from)\b|->|→/gi, '').trim().slice(0, 4),
        });
        continue;
      }

      if (numbers && numbers.length >= 1) {
        widgets.push({
          type: 'stat',
          label,
          value: toNumber(numbers[0]),
          unit: value.slice(value.indexOf(numbers[0]) + numbers[0].length).trim().slice(0, 6),
        });
        continue;
      }

      widgets.push({ type: 'note', label, text: value });
      continue;
    }

    widgets.push({ type: 'note', text: item });
  }

  return widgets;
}

/**
 * Places widgets on a fixed-column grid, first fit, left to right.
 *
 * Returns each widget with a column span and a row, which is all a CSS grid
 * needs. Nothing overlaps because a widget only starts where there is room.
 */
export function layout(widgets, columns = 3) {
  let row = 1;
  let used = 0;

  return widgets.map(w => {
    const span = Math.min(SPAN[w.type] ?? 1, columns);

    // A title always starts its own row, and anything that does not fit wraps.
    if (w.type === 'title' || used + span > columns) {
      if (used > 0) row += 1;
      used = 0;
    }

    const placed = { ...w, span, row };
    used += span;
    if (used >= columns) { row += 1; used = 0; }
    return placed;
  });
}
