import RichText, { plain } from '../lib/richText.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';

export default function Education({ section }) {
  const ref = useReveal();
  const { t } = useI18n();

  return (
    <section className="education" id="education" aria-labelledby="education-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="education-heading" className="section__title">{t('section.education')}</h2>
        <div className="education__grid">
        <img
          className="education__photo"
          src="/img/rheana-mindo-uplb-graduation-960.webp"
          srcSet="/img/rheana-mindo-uplb-graduation-480.webp 480w, /img/rheana-mindo-uplb-graduation-960.webp 960w"
          sizes="(min-width: 48rem) 20rem, 55vw"
          alt={t('edu.photo.alt')}
          width="960"
          height="1200"
          loading="lazy"
          decoding="async"
        />
        <ul className="education__list" role="list">
          {section.entries.map(e => (
            <li className="education__item" key={e.school}>
              <h3 className="education__degree">{plain(e.degree)}</h3>
              <p className="education__school"><RichText>{e.school}</RichText></p>
              <p className="education__dates">{plain(e.dates)}</p>
              {e.honors && (
                <p className="education__honors"><RichText>{e.honors}</RichText></p>
              )}
            </li>
          ))}
        </ul>
        </div>
      </div>
    </section>
  );
}
