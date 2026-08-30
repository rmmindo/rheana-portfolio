import RichText, { plain } from '../lib/richText.jsx';
import { useReveal } from '../hooks/useReveal.js';
import Stage from '../components/Stage.jsx';
import { useI18n } from '../hooks/useI18n.jsx';

export default function Education({ section }) {
  const ref = useReveal();
  const { t } = useI18n();

  return (
    <section className="education" id="education" aria-labelledby="education-heading" ref={ref}>
      <div className="section__inner">
        <Stage n={8} nameKey="stage.roots" season="winter" hue="powder" />
        <h2 id="education-heading" className="section__title">{t('section.education')}</h2>
        <div className="education__grid">
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
