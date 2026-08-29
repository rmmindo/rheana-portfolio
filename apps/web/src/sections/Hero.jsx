import RichText from '../lib/richText.jsx';
import Petal from '../components/Petal.jsx';
import { SpeakButton } from '../components/SpeechProvider.jsx';
import { useRef } from 'react';

// Splits a plain string into words wrapped for the staggered rise-in. The
// headline is read as one sentence by assistive tech because the wrapper spans
// carry no roles and the whitespace between them is preserved.
function Words({ text }) {
  return text.split(' ').map((word, i) => (
    <span className="word" key={`${word}-${i}`} style={{ '--i': i }}>
      <span className="word__inner">{word}</span>{' '}
    </span>
  ));
}

export default function Hero({ profile }) {
  const introRef = useRef(null);
  const links = profile.contact.filter(c => c.url);
  const email = profile.contact.find(c => c.label.includes('@'));
  const location = profile.contact.find(c => !c.url && !c.label.includes('@'));

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <Petal className="hero__bloom hero__bloom--a" size={220} />
      <Petal className="hero__bloom hero__bloom--b" size={140} />

      <div className="hero__inner" ref={introRef}>
        <p className="hero__eyebrow">
          <span className="hero__dot" aria-hidden="true" />
          Available for remote, asynchronous work
        </p>

        <h1 id="hero-heading" className="hero__name">
          <Words text="Rheana Mindo" />
        </h1>

        <p className="hero__claim">
          I build AI systems that <em>ship</em> &mdash; and I can prove every number below.
        </p>

        <p className="hero__headline"><RichText>{profile.headline}</RichText></p>

        <div className="hero__actions">
          <a className="btn btn--primary" href={`mailto:${email?.label ?? ''}`}>
            Let&rsquo;s build something
          </a>
          <a className="btn btn--ghost" href="#baybayin">Play with something I made</a>
          <a className="btn btn--quiet" href="/rheana-mindo-cv.pdf" download>
            Download CV
          </a>
          <SpeakButton targetRef={introRef} id="hero" label="the introduction" />
        </div>

        <ul className="hero__links" role="list">
          {location && <li className="hero__meta">{location.label}</li>}
          {links.map(l => (
            <li key={l.url}><a href={l.url} rel="me noopener">{l.label}</a></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
