import { useReveal } from '../hooks/useReveal.js';
import Stat from '../components/Stat.jsx';

// The orgs come from the resume JSON rather than a hand-written list, so a role
// added in raysume shows up here with no code change.
export default function TrustBar({ experience }) {
  const ref = useReveal();
  const orgs = experience ? experience.entries.map(e => e.org.replace(/<[^>]+>/g, '')) : [];

  return (
    <section className="trust" aria-labelledby="trust-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="trust-heading" className="visually-hidden">
          Track record and where I have worked
        </h2>

        <p className="trust__lead">Trusted with production systems at</p>

        <ul className="trust__orgs" role="list">
          {orgs.map((org, i) => (
            <li key={org} className="trust__org" style={{ '--i': i }}>{org}</li>
          ))}
        </ul>

        <div className="trust__stats">
          <Stat value={2320} label="merged pull requests" hue="powder" />
          <Stat value={96.9} decimals={1} suffix="%" label="dead-code detection accuracy, up from 5%" hue="mint" />
          <Stat value={61} suffix="x" label="faster dashboard builds in production" hue="pink" />
          <Stat value={6} label="paid roles, 3 of them concurrent" hue="purple" />
        </div>
      </div>
    </section>
  );
}
