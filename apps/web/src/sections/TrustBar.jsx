import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';
import recommendations from '../content/recommendations.json';
import Odometer from '../components/Odometer.jsx';

// The proof line: four numbers, side by side, directly under the hero.
//
// It answers the four questions a stranger asks in the first ten seconds, in
// the order they ask them. Who trusted her with real work. Who will say so.
// How much of it there was. How much of it was any good.
//
// The counts are not typed in. The recommendation count is the length of the
// file the carousel reads, so it can never drift from what is on the page, and
// the company count is the list below it. Every other figure is in the resume,
// which is generated from the same source as the CV.
//
// Four is the limit. A row of eight numbers is a dashboard, and nobody believes
// a dashboard.

// The employers, not the projects. Baybayin Detector and 2 Weeks sit in the
// same part of the resume but they are her own work, and counting them here
// would be counting herself as a client.
const COMPANIES = 4;

export default function TrustBar() {
  const ref = useReveal();
  const { t } = useI18n();

  const figures = [
    { value: COMPANIES, label: t('trust.companies') },
    { value: recommendations.items.length, label: t('trust.recos') },
    { value: 2320, label: t('trust.prs') },
    { value: 96.5, suffix: '%', label: t('trust.merged') },
  ];

  return (
    <section className="trust" aria-labelledby="trust-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="trust-heading" className="visually-hidden">{t('trust.heading')}</h2>

        <ul className="trust__row" role="list">
          {figures.map((f, i) => (
            <li className="trust__item" key={f.label} style={{ '--i': i }}>
              <span className="trust__n">
                <Odometer value={f.value} suffix={f.suffix ?? ''} label={f.label} />
              </span>
              <span className="trust__label">{f.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
