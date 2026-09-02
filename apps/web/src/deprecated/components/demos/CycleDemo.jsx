import { useCallback, useMemo, useState } from 'react';
import { findCycles, cycleEdges } from '../../lib/tarjan.js';
import { useI18n } from '../../hooks/useI18n.jsx';

// Wire up a dependency graph and watch a cycle light up the moment it closes.
//
// This is the algorithm from the role above it, running for real: the same
// Tarjan pass that took false positives from 88% to zero across 457 projects.
// Nothing here is faked or precomputed - press a pair of buttons and the answer
// is recalculated from scratch.
//
// The point it makes is the one the claim above cannot: a regex can see that
// auth mentions billing, but only a graph walk can see that billing comes back
// round to auth through two other modules.
//
// Accessibility: the graph is drawn as SVG but driven by a grid of buttons, so
// it is entirely operable by keyboard. The verdict is announced through a live
// region rather than being conveyed only by red lines.

const MODULES = ['auth', 'user', 'billing', 'email', 'report'];

// Positions on a circle, so the SVG needs no layout engine.
const POINTS = MODULES.map((id, i) => {
  const angle = (Math.PI * 2 * i) / MODULES.length - Math.PI / 2;
  return { id, x: 50 + Math.cos(angle) * 34, y: 50 + Math.sin(angle) * 34 };
});
const POS = Object.fromEntries(POINTS.map(p => [p.id, p]));

const key = (a, b) => `${a}->${b}`;

const PRESET = [['auth', 'user'], ['user', 'billing'], ['billing', 'email']];

export default function CycleDemo() {
  const { t } = useI18n();
  const [edges, setEdges] = useState(PRESET);

  const toggle = useCallback((from, to) => {
    if (from === to) return;
    setEdges(current => {
      const exists = current.some(([a, b]) => a === from && b === to);
      return exists
        ? current.filter(([a, b]) => !(a === from && b === to))
        : [...current, [from, to]];
    });
  }, []);

  const cycles = useMemo(() => findCycles(MODULES, edges), [edges]);
  const hot = useMemo(
    () => new Set(cycleEdges(MODULES, edges).map(([a, b]) => key(a, b))),
    [edges]
  );
  const inCycle = useMemo(() => new Set(cycles.flat()), [cycles]);

  return (
    <div className="cyc">
      <p className="cyc__hint">{t('cyc.hint')}</p>

      <div className="cyc__stage">
        <svg viewBox="0 0 100 100" className="cyc__svg" aria-hidden="true" focusable="false">
          {edges.map(([from, to]) => {
            const a = POS[from];
            const b = POS[to];
            if (!a || !b) return null;
            return (
              <line
                key={key(from, to)}
                className={`cyc__edge${hot.has(key(from, to)) ? ' is-hot' : ''}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              />
            );
          })}
          {POINTS.map(p => (
            <circle
              key={p.id}
              className={`cyc__node${inCycle.has(p.id) ? ' is-hot' : ''}`}
              cx={p.x} cy={p.y} r="9"
            />
          ))}
          {POINTS.map(p => (
            <text key={p.id} className="cyc__label" x={p.x} y={p.y + 1.2}>{p.id}</text>
          ))}
        </svg>
      </div>

      {/* The graph is a picture; this grid is the control. Every dependency can
          be toggled from the keyboard, and each button says what it does. */}
      <table className="cyc__grid">
        <caption className="visually-hidden">{t('cyc.caption')}</caption>
        <thead>
          <tr>
            <td />
            {MODULES.map(m => <th key={m} scope="col">{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {MODULES.map(from => (
            <tr key={from}>
              <th scope="row">{from}</th>
              {MODULES.map(to => {
                if (from === to) return <td key={to} className="cyc__self" aria-hidden="true">&middot;</td>;
                const on = edges.some(([a, b]) => a === from && b === to);
                return (
                  <td key={to}>
                    <button
                      type="button"
                      className={`cyc__cell${on ? ' is-on' : ''}`}
                      aria-pressed={on}
                      onClick={() => toggle(from, to)}
                    >
                      <span className="visually-hidden">{from} depends on {to}</span>
                      <span aria-hidden="true">{on ? '•' : ''}</span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p className={`cyc__verdict${cycles.length ? ' is-bad' : ''}`} aria-live="polite">
        {cycles.length === 0
          ? t('cyc.clean')
          : cycles.map(c => c.join(' → ') + ' → ' + c[0]).join('; ')}
      </p>

      <p className="cyc__note">{t('cyc.note')}</p>
    </div>
  );
}
