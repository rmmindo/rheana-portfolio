import RichText from '../lib/richText.jsx';

export default function Hero({ profile }) {
  const links = profile.contact.filter(c => c.url);
  const email = profile.contact.find(c => c.label.includes('@'));
  const location = profile.contact.find(c => !c.url && !c.label.includes('@'));

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__inner">
        <p className="hero__eyebrow">
          <span className="hero__dot" aria-hidden="true" />
          Available for remote, asynchronous work
        </p>

        <h1 id="hero-heading" className="hero__name">Rheana Mindo</h1>
        <p className="hero__headline"><RichText>{profile.headline}</RichText></p>
        <p className="hero__summary"><RichText>{profile.summary}</RichText></p>

        <div className="hero__actions">
          <a className="btn btn--primary" href={`mailto:${email?.label ?? ''}`}>
            Let&rsquo;s build something
          </a>
          <a className="btn btn--ghost" href="#experience">See the work</a>
        </div>

        <ul className="hero__links" role="list">
          {location && <li className="hero__meta">{location.label}</li>}
          {links.map(l => (
            <li key={l.url}>
              <a href={l.url} rel="me noopener">{l.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
