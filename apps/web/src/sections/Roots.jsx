import roots from '../content/roots.json';
import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';
import Odometer from '../components/Odometer.jsx';

// Roots.
//
// The foundation, and it sits at the BOTTOM of the page on purpose. Roots are
// underneath in a plant, and they are underneath here: degrees, certifications,
// contests and scholarships hold the rest up, but they are not what a client
// came to read. Putting education at the top is a CV habit.
//
// Same discipline as the work section. Each group gets one claim and one
// figure. Nine years of schooling, seven contests and four scholarships used to
// be a comma-separated skills line; now they are four claims with the full list
// one disclosure away, still in the HTML for anyone - or anything - reading
// closely.

export default function Roots() {
  const ref = useReveal();
  const { t } = useI18n();

  return (
    <section className="roots" id="roots" aria-labelledby="roots-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="roots-heading" className="roots__heading">{t('roots.heading')}</h2>
        <p className="roots__lead">{t('roots.lead')}</p>

        <ol className="roots__list" role="list">
          {roots.groups.map((g, i) => (
            <li
              className="root"
              key={g.id}
              style={{ '--root-ink': `var(--ink-${g.hue})`, '--root-accent': `var(--accent-${g.hue})`, '--i': i }}
            >
              <p className="root__label">{g.label}</p>
              <p className="root__claim">{g.claim}</p>

              <p className="root__figure">
                <Odometer
                  value={g.figure.value}
                  suffix={g.figure.unit}
                  label={g.figure.caption}
                />
              </p>
              <p className="root__caption">{g.figure.caption}</p>

              <details className="root__more">
                <summary>{t('roots.all')}</summary>
                <ul role="list">
                  {g.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
