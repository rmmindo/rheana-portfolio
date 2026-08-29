import { useReveal } from '../hooks/useReveal.js';
import Stat from '../components/Stat.jsx';
import { plain } from '../lib/richText.jsx';
import { useI18n } from '../hooks/useI18n.jsx';

// The orgs come from the resume JSON rather than a hand-written list, so a role
// added in raysume shows up here with no code change.
export default function TrustBar({ experience }) {
  const ref = useReveal();
  const { t } = useI18n();
  const orgs = experience ? experience.entries.map(e => plain(e.org)) : [];

  return (
    <section className="trust" aria-labelledby="trust-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="trust-heading" className="visually-hidden">
          {t('trust.heading')}
        </h2>

        <p className="trust__lead">{t('trust.lead')}</p>

        <ul className="trust__orgs" role="list">
          {orgs.map((org, i) => (
            <li key={org} className="trust__org" style={{ '--i': i }}>{org}</li>
          ))}
        </ul>

        <div className="trust__stats">
          <Stat value={2320} label={t('stat.prs')} hue="powder" />
          <Stat value={96.9} decimals={1} suffix="%" label={t('stat.accuracy')} hue="mint" />
          <Stat value={61} suffix="x" label={t('stat.speedup')} hue="pink" />
          <Stat value={6} label={t('stat.roles')} hue="purple" />
        </div>
      </div>
    </section>
  );
}
