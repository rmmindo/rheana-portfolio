import RichText, { plain } from '../lib/richText.jsx';
import { useReveal } from '../hooks/useReveal.js';
import Stage from '../components/Stage.jsx';
import { useI18n } from '../hooks/useI18n.jsx';

export default function Skills({ section }) {
  const ref = useReveal();
  const { t } = useI18n();

  return (
    <section className="skills" id="skills" aria-labelledby="skills-heading" ref={ref}>
      <div className="section__inner">
        <Stage n={7} nameKey="stage.toolshed" art="/img/garden-leaf.webp" hue="purple" />
        <h2 id="skills-heading" className="section__title">{t('section.skills')}</h2>
        <dl className="skills__list">
          {section.lines.map((line, i) => (
            <div className="skills__row" key={line.label} style={{ '--i': i }}>
              <dt className="skills__label">{plain(line.label)}</dt>
              <dd className="skills__value"><RichText>{line.text}</RichText></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
