import { useCallback, useId, useMemo, useState } from 'react';
import { parseNotes, layout, barHeights } from '../../lib/dashboard.js';
import { useI18n } from '../../hooks/useI18n.jsx';

// Paste notes, get a dashboard.
//
// The browser-sized version of the service Rheana shipped at Offshorly, where
// markdown from upstream bots came back as positioned dashboards: 36 widgets in
// 35 seconds against a manual process that took about 36 minutes.
//
// The timer is the argument. It is measured, not decorative - performance.now()
// either side of the parse and layout - and it usually reads under a
// millisecond, which is the point. The comparison underneath is what that
// replaced, so the number has something to mean.
//
// There is no model here, and that is deliberate. Deciding that "signups:
// 1,240" is a measurement and "2% to 5%" is a change needs a few rules applied
// consistently, not a language model. An LLM would add latency, cost and a new
// way to be wrong, in exchange for nothing.

const SAMPLE = [
  '## Q3 in review',
  '- signups: 1,240',
  '- churn: 3.1%',
  '- weekly active: 820, 910, 1,050, 1,180',
  '- conversion: 2% to 5%',
  '- owner: the growth team',
].join('\n');

function Spark({ series }) {
  const heights = barHeights(series);
  return (
    <span className="dash__spark" aria-hidden="true">
      {heights.map((h, i) => (
        <span key={i} className="dash__bar" style={{ height: `${h}%` }} />
      ))}
    </span>
  );
}

export default function DashboardDemo() {
  const { t } = useI18n();
  const id = useId();
  const [notes, setNotes] = useState(SAMPLE);

  // Both the widgets and the timing come out of the same memo. Timing it into
  // state instead would be a setState during render, and it would make the
  // number describe the previous keystroke rather than this one.
  const { widgets, ms } = useMemo(() => {
    const started = performance.now();
    const placed = layout(parseNotes(notes), 3);
    // Measured, not asserted. If this ever gets slow the number will say so.
    return { widgets: placed, ms: performance.now() - started };
  }, [notes]);

  const reset = useCallback(() => setNotes(SAMPLE), []);

  return (
    <div className="dash">
      <label className="demo__label" htmlFor={`${id}-notes`}>{t('dash.label')}</label>
      <textarea
        id={`${id}-notes`}
        className="dash__notes"
        rows={7}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        spellCheck="false"
      />

      <div className="dash__bar-row">
        <button type="button" className="demo__preset" onClick={reset}>{t('dash.reset')}</button>
        {/* Not a live region. It changes on every keystroke, and a screen
            reader announcing the widget count over someone's own typing is
            noise, not information. */}
        <p className="dash__timer">
          {widgets.length} {t('dash.widgets')} &middot; {ms < 1 ? '<1' : ms.toFixed(0)} ms
        </p>
      </div>

      <div className="dash__grid">
        {widgets.map((w, i) => (
          <div
            key={`${w.type}-${i}`}
            className={`dash__w dash__w--${w.type}`}
            // The row comes from layout(), so what the tests assert about
            // placement is what the browser actually draws.
            style={{ gridColumn: `span ${w.span}`, gridRow: w.row }}
          >
            {w.type === 'title' && <h4 className="dash__title">{w.label}</h4>}

            {w.type === 'stat' && (
              <>
                <p className="dash__value">
                  {w.value.toLocaleString('en-US')}<span className="dash__unit">{w.unit}</span>
                </p>
                <p className="dash__label">{w.label}</p>
              </>
            )}

            {w.type === 'delta' && (
              <>
                <p className="dash__value">
                  {w.from.toLocaleString('en-US')}
                  <span className="dash__arrow" aria-hidden="true"> &rarr; </span>
                  {w.to.toLocaleString('en-US')}<span className="dash__unit">{w.unit}</span>
                </p>
                <p className="dash__label">{w.label}</p>
              </>
            )}

            {w.type === 'chart' && (
              <>
                <Spark series={w.series} />
                <p className="dash__label">{w.label}</p>
                <span className="visually-hidden">{w.series.join(', ')}</span>
              </>
            )}

            {w.type === 'note' && (
              <p className="dash__note">
                {w.label && <strong>{w.label}: </strong>}{w.text}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="demo__note">{t('dash.note')}</p>
    </div>
  );
}
