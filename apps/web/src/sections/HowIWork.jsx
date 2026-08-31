import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';
import SectionCta from '../components/SectionCta.jsx';

// What she believes, then what working with her actually looks like.
//
// The belief comes first because it is the reason for everything above it on
// the page - the blur, the playground, the fact that a portfolio has a game in
// it at all. The four steps come second because a client who agrees with the
// belief immediately wants to know what happens next.
//
// Numbered, because a process with numbers reads as a process and a process
// without them reads as a list of adjectives.

const STEPS = ['s1', 's2', 's3', 's4'];
const HUES = ['powder', 'mint', 'pink', 'purple'];

export default function HowIWork() {
  const ref = useReveal();
  const { t } = useI18n();

  return (
    <section className="how" id="how" aria-labelledby="how-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="how-heading" className="how__heading">{t('how.heading')}</h2>

        <p className="how__belief">{t('how.belief')}</p>
        <p className="how__belief-sub">{t('how.beliefSub')}</p>

        <ol className="how__steps" role="list">
          {STEPS.map((s, i) => (
            <li className="step" key={s} style={{ '--step-ink': `var(--ink-${HUES[i]})`, '--i': i }}>
              <p className="step__n">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="step__t">{t(`how.${s}t`)}</h3>
              <p className="step__b">{t(`how.${s}b`)}</p>
            </li>
          ))}
        </ol>
        <SectionCta id="how" />
      </div>
    </section>
  );
}
