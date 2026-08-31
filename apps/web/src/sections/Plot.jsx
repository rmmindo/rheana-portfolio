import plot from '../content/plot.json';
import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';
import SectionCta from '../components/SectionCta.jsx';
import Odometer from '../components/Odometer.jsx';

// Work that was not a job.
//
// This replaces two separate bullet lists - Leadership & Projects, and
// Volunteering & Community - which between them ran to nine entries of resume
// prose. Same discipline as the timeline: one claim, one figure, everything
// else behind a disclosure.
//
// A grid rather than a timeline, because these did not happen in a sequence
// that means anything. They are things she did alongside the paid work.

export default function Plot() {
  const ref = useReveal();
  const { t } = useI18n();

  return (
    <section className="plot" id="projects" aria-labelledby="plot-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="plot-heading" className="plot__heading">{t('plot.heading')}</h2>
        <p className="plot__lead">{t('plot.lead')}</p>

        <ul className="plot__list" role="list">
          {plot.items.map((item, i) => (
            <li
              className="sown"
              key={item.id}
              style={{ '--sown-ink': `var(--ink-${item.hue})`, '--sown-accent': `var(--accent-${item.hue})`, '--i': i }}
            >
              <p className="sown__label">{item.label}</p>
              <p className="sown__you">{item.you}</p>
              <p className="sown__me">{item.me}</p>

              <p className="sown__figure">
                <Odometer value={item.figure.value} suffix={item.figure.unit} label={item.figure.caption} />
              </p>
              <p className="sown__caption">{item.figure.caption}</p>

              <details className="sown__more">
                <summary>{t('work.how')}</summary>
                <p>{item.detail}</p>
              </details>
            </li>
          ))}
        </ul>
        <SectionCta id="plot" />
      </div>
    </section>
  );
}
