import { useCallback, useId, useRef, useState } from 'react';
import work from '../content/work.json';
import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';
import SectionCta from '../components/SectionCta.jsx';
import Odometer from '../components/Odometer.jsx';
import BaybayinDemo from '../components/demos/BaybayinDemo.jsx';
import CycleDemo from '../components/demos/CycleDemo.jsx';
import DashboardDemo from '../components/demos/DashboardDemo.jsx';
import LedgerDemo from '../components/demos/LedgerDemo.jsx';

// Experience, as a timeline you step through rather than a wall you scroll.
//
// The old version printed four dense bullets per role - every metric, every
// technology, past tense, all of it about her. It was the CV with colour on it,
// and it was the single worst piece of word vomit on the page.
//
// This shows ONE claim per role, in two short sentences, with ONE figure. The
// second person comes first and the first person answers it, because a client
// reading a portfolio is looking for their own problem before they are looking
// for your history. Everything else is one disclosure away.
//
// SEO is unaffected: every panel is rendered into the HTML and merely hidden,
// so the full detail text is still crawled. Progressive disclosure hides things
// from people in a hurry, not from search engines.
//
// Keyboard: this is the ARIA tabs pattern. Arrow keys move between tabs, Home
// and End jump to the ends, and only the selected tab is in the tab order, so
// a keyboard user tabs past the whole strip in one press instead of six.

// A role may own a playground. The demo is the evidence for that role's claim,
// so it lives in the same panel rather than in a separate section three screens
// away. Roles without one simply do not render anything here.
const DEMOS = {
  baybayin: BaybayinDemo,
  cycles: CycleDemo,
  dashboard: DashboardDemo,
  ledger: LedgerDemo,
};

export default function Work() {
  const ref = useReveal();
  const { t } = useI18n();
  const base = useId();
  const [active, setActive] = useState(0);
  const tabRefs = useRef([]);

  const roles = work.roles;

  const onKeyDown = useCallback(event => {
    const last = roles.length - 1;
    let next = null;
    if (event.key === 'ArrowRight') next = active === last ? 0 : active + 1;
    if (event.key === 'ArrowLeft') next = active === 0 ? last : active - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }, [active, roles.length]);

  const role = roles[active];

  return (
    <section
      className="work"
      id="experience"
      aria-labelledby="work-heading"
      ref={ref}
      style={{ '--work-ink': `var(--ink-${role.hue})`, '--work-accent': `var(--accent-${role.hue})` }}
    >
      <div className="section__inner">
        <h2 id="work-heading" className="work__heading">{t('work.heading')}</h2>

        <div className="work__rail" role="tablist" aria-label={t('work.rail')} onKeyDown={onKeyDown}>
          {roles.map((r, i) => (
            <button
              key={r.id}
              ref={el => { tabRefs.current[i] = el; }}
              role="tab"
              id={`${base}-tab-${r.id}`}
              aria-controls={`${base}-panel-${r.id}`}
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              className={`work__tab${i === active ? ' is-active' : ''}`}
              style={{ '--tab-ink': `var(--ink-${r.hue})` }}
              onClick={() => setActive(i)}
            >
              <span className="work__tab-org">{r.org}</span>
              <span className="work__tab-period">{r.period}</span>
            </button>
          ))}
        </div>

        {roles.map((r, i) => (
          <div
            key={r.id}
            role="tabpanel"
            id={`${base}-panel-${r.id}`}
            aria-labelledby={`${base}-tab-${r.id}`}
            className="work__panel"
            hidden={i !== active}
            tabIndex={0}
          >
            <p className="work__label">{r.label}</p>

            <p className="work__you">{r.you}</p>
            <p className="work__me">{r.me}</p>

            <p className="work__figure">
              <Odometer value={r.figure.value} suffix={r.figure.unit} label={r.figure.caption} />
            </p>
            <p className="work__caption">{r.figure.caption}</p>

            {DEMOS[r.demo] && (() => {
              const Demo = DEMOS[r.demo];
              return <Demo />;
            })()}

            {/* Still in the HTML when closed, so nothing is hidden from a
                crawler - only from someone who did not ask for it. */}
            <details className="work__more">
              <summary>{t('work.how')}</summary>
              <p>{r.detail}</p>
            </details>
          </div>
        ))}
        <SectionCta id="work" />
      </div>
    </section>
  );
}
