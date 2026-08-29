import { useRef } from 'react';
import RichText from '../lib/richText.jsx';
import Petal from '../components/Petal.jsx';
import { SpeakButton } from '../components/SpeechProvider.jsx';
import { useI18n } from '../hooks/useI18n.jsx';

// Splits a plain string into words wrapped for the staggered rise-in.
//
// The separator is a real space emitted OUTSIDE the clipped inline-block.
// Putting it inside the span meant overflow:hidden collapsed it and the name
// rendered as "RheanaMindo".
function Words({ text }) {
  return text.split(' ').flatMap((word, i) => [
    i > 0 ? ' ' : null,
    <span className="word" key={`${word}-${i}`} style={{ '--i': i }}>
      <span className="word__inner">{word}</span>
    </span>,
  ]);
}

export default function Hero({ profile }) {
  const introRef = useRef(null);
  const { t } = useI18n();
  const links = profile.contact.filter(c => c.url);
  const email = profile.contact.find(c => c.label.includes('@'));
  const location = profile.contact.find(c => !c.url && !c.label.includes('@'));

  return (
    <section className="hero" aria-labelledby="hero-heading">
      {/* Decorative only, so both are aria-hidden and neither carries meaning
          the text does not already give. */}
      <img className="hero__bloom hero__bloom--a" src="/img/hydrangea-cluster.webp"
           alt="" aria-hidden="true" width="320" height="320" loading="lazy" decoding="async" />
      <Petal className="hero__bloom hero__bloom--b" size={170} />

      <div className="hero__inner">
        <div className="hero__text" ref={introRef}>
          <p className="hero__eyebrow">
            <span className="hero__dot" aria-hidden="true" />
            {t('hero.available')}
          </p>

          <h1 id="hero-heading" className="hero__name">
            <Words text="Rheana Mindo" />
          </h1>

          <p className="hero__claim">
            {t('hero.claim.before')} <em>{t('hero.claim.em')}</em> {t('hero.claim.after')}
          </p>

          <p className="hero__headline"><RichText>{profile.headline}</RichText></p>
          <p className="hero__summary"><RichText>{profile.summary}</RichText></p>

          <div className="hero__actions">
            <a className="btn btn--primary btn--lg" href={`mailto:${email?.label ?? ''}`}>
              {t('hero.cta.primary')}
            </a>
            <a className="btn btn--ghost btn--lg" href="#baybayin">{t('hero.cta.play')}</a>
            <a className="btn btn--quiet btn--lg" href="/rheana-mindo-cv.pdf" download>
              {t('hero.cta.cv')}
            </a>
            <SpeakButton targetRef={introRef} id="hero" label={t('speak.intro')} />
          </div>

          <ul className="hero__links" role="list">
            {location && <li className="hero__meta">{location.label}</li>}
            {links.map(l => (
              <li key={l.url}><a href={l.url} rel="me noopener">{l.label}</a></li>
            ))}
          </ul>
        </div>

        {/* The portrait fills the right-hand column that was previously empty
            on wide screens. It is decorative-adjacent but not decorative: a
            client wants to see who they would be working with, so it gets a
            real alt description rather than alt="". */}
        <div className="hero__portrait">
          <img
            className="hero__photo"
            src="/img/rheana-mindo-ai-developer-portrait-640.webp"
            srcSet="/img/rheana-mindo-ai-developer-portrait-320.webp 320w, /img/rheana-mindo-ai-developer-portrait-640.webp 640w"
            sizes="(min-width: 64rem) 22rem, 12rem"
            alt={t('hero.portrait.alt')}
            width="640"
            height="640"
            fetchPriority="high"
            decoding="async"
          />
          <Petal className="hero__photo-mark" size={64} />
        </div>
      </div>
    </section>
  );
}
