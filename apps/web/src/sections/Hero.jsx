import { useRef } from 'react';
import { SpeakButton } from '../components/SpeechProvider.jsx';
import { useI18n } from '../hooks/useI18n.jsx';

// The hero.
//
// One idea, at size. The resume summary used to live here - six lines of
// metrics nobody reads standing up - and it has gone. Those numbers are in the
// trust bar directly below, where a number belongs, and in the CV for anyone
// who wants all of them.
//
// The headline is the payoff of the gate: you put the glasses on, the page
// comes into focus, and this is what it says.

export default function Hero({ profile }) {
  const introRef = useRef(null);
  const { t } = useI18n();
  const email = profile.contact.find(c => c.label.includes('@'));

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__inner" ref={introRef}>
        <p className="hero__role">{t('hero.role')}</p>

        <h1 id="hero-heading" className="hero__line">
          <span className="hero__line-a">{t('hero.line')}</span>
          <span className="hero__line-b">{t('hero.line2')}</span>
        </h1>

        {/* Said once, afterwards. Explaining the blur before it happens would
            turn a thing you feel into a caption you skim. */}
        <p className="hero__aside">{t('hero.aside')}</p>

        <div className="hero__actions">
          <a className="btn btn--primary btn--lg" href={`mailto:${email?.label ?? ''}`}>
            {t('hero.cta.primary')}
          </a>
          <a className="btn btn--quiet btn--lg" href="/rheana-mindo-cv.pdf" download>
            {t('hero.cta.cv')}
          </a>
          <SpeakButton targetRef={introRef} id="hero" label={t('speak.intro')} />
        </div>
      </div>
    </section>
  );
}
