import RichText from '../lib/richText.jsx';
import { useReveal } from '../hooks/useReveal.js';

export default function Skills({ section }) {
  const ref = useReveal();

  return (
    <section className="skills" id="skills" aria-labelledby="skills-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="skills-heading" className="section__title">{section.title}</h2>
        <dl className="skills__list">
          {section.lines.map((line, i) => (
            <div className="skills__row" key={line.label} style={{ '--i': i }}>
              <dt className="skills__label">{line.label}</dt>
              <dd className="skills__value"><RichText>{line.text}</RichText></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
