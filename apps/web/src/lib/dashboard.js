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

// A unit is a single short token: "%", "ms", "min". Anything with a space in it
// is prose, not a unit, so "5 out of 30" gets no unit rather than "5 out".
const UNIT = /^[%a-zA-Z/]{1,6}$/;

const toNumber = s => Number(String(s).replace(/,/g, ''));

/**
 * The unit is whatever sits immediately after a given number.
 *
 * It reads from the match position rather than searching for the number again:
 * indexOf("3") inside "3 out of 30" finds the wrong 3 and returns "0" as the
 * unit.
 */
function unitAfter(value, match) {
  const tail = value.slice(match.index + match[0].length).trim();
  return UNIT.test(tail) ? tail : '';
}

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
      // matchAll keeps each match's position, which is what the unit needs. It
      // also clones the pattern internally, so the shared /g regex carries no
      // lastIndex between lines.
      const found = [...value.matchAll(NUM)];

      if (found.length >= 3) {
        widgets.push({ type: 'chart', label, series: found.map(m => toNumber(m[0])) });
        continue;
      }

      // "2% to 5%" or "36 min -> 35 s": two numbers and a joining word is a
      // change. The unit comes from the second number, so a repeated one is
      // read once - "2% to 5%" is a move to 5%, not to "%  %".
      if (found.length === 2 && /\bto\b|->|→|from/i.test(value)) {
        widgets.push({
          type: 'delta',
          label,
          from: toNumber(found[0][0]),
          to: toNumber(found[1][0]),
          unit: unitAfter(value, found[1]),
        });
        continue;
      }

      if (found.length >= 1) {
        widgets.push({
          type: 'stat',
          label,
          value: toNumber(found[0][0]),
          unit: unitAfter(value, found[0]),
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

  const placed = widgets.map(w => {
    const span = Math.min(SPAN[w.type] ?? 1, columns);

    // A title always starts its own row, and anything that does not fit wraps.
    if (w.type === 'title' || used + span > columns) {
      if (used > 0) row += 1;
      used = 0;
    }

    const item = { ...w, span, row };
    used += span;
    if (used >= columns) { row += 1; used = 0; }
    return item;
  });

  // First fit leaves a hole whenever the next widget is too wide for what is
  // left of the row: two stats and then a chart strands a third of the grid,
  // and the dashboard reads as half-built. The last widget on each row takes
  // the leftover columns.
  //
  // Widening rather than reordering is deliberate. CSS dense packing would
  // pull a later widget forward to fill the hole, and then the reading order a
  // screen reader follows would no longer match the order on screen.
  const wide = new Map();
  for (const item of placed) wide.set(item.row, (wide.get(item.row) ?? 0) + item.span);
  const last = new Map();
  for (const item of placed) last.set(item.row, item);
  for (const [row_, item] of last) item.span += columns - wide.get(row_);

  return placed;
}

/**
 * Bar heights as percentages, measured from a baseline that always includes
 * zero.
 *
 * Dividing by the largest value alone gives a negative height for a negative
 * value, and CSS drops the bar entirely. Reduce rather than spread, because
 * Math.max(...series) on a long pasted series overflows the call stack.
 */
export function barHeights(series) {
  if (!series.length) return [];
  let lo = 0;
  let hi = 0;
  for (const n of series) {
    if (n < lo) lo = n;
    if (n > hi) hi = n;
  }
  const range = hi - lo || 1;
  return series.map(n => ((n - lo) / range) * 100);
}
