import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';
import Odometer from '../components/Odometer.jsx';

// The proof line.
//
// This used to be a row of six company names above a four-column stat grid.
// The company names were the problem: the timeline directly below lists exactly
// the same six as its tabs, so the bar was a duplicate wearing a different
// layout. Deleting it lost nothing.
//
// What is left is three sentences, each carrying one number, set at reading
// size rather than boxed into a grid. A stat grid is what a SaaS landing page
// does; a sentence is what a person does.

export default function TrustBar() {
  const ref = useReveal();
  const { t } = useI18n();

  return (
    <section className="trust" aria-labelledby="trust-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="trust-heading" className="visually-hidden">{t('trust.heading')}</h2>

        <p className="trust__line">
          <span className="trust__n"><Odometer value={6} label={t('trust.a')} /></span>
          {' '}{t('trust.a')}
        </p>

        <p className="trust__line">
          <span className="trust__n"><Odometer value={2320} label={t('trust.b')} /></span>
          {' '}{t('trust.b')}
        </p>

        <p className="trust__line trust__line--last">
          <span className="trust__n"><Odometer value={96.5} suffix="%" label={t('trust.c')} /></span>
          {' '}{t('trust.c')}
        </p>
      </div>
    </section>
  );
}
