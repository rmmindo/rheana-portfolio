import RichText from '../lib/richText.jsx';

export default function Skills({ section }) {
  return (
    <section className="skills" id="skills" aria-labelledby="skills-heading">
      <div className="section__inner">
        <h2 id="skills-heading" className="section__title">{section.title}</h2>
        <dl className="skills__list">
          {section.lines.map(line => (
            <div className="skills__row" key={line.label}>
              <dt className="skills__label">{line.label}</dt>
              <dd className="skills__value"><RichText>{line.text}</RichText></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
