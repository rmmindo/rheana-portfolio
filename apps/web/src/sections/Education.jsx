import RichText from '../lib/richText.jsx';

export default function Education({ section }) {
  return (
    <section className="education" id="education" aria-labelledby="education-heading">
      <div className="section__inner">
        <h2 id="education-heading" className="section__title">{section.title}</h2>
        <ul className="education__list" role="list">
          {section.entries.map(e => (
            <li className="education__item" key={e.school}>
              <h3 className="education__degree">{e.degree}</h3>
              <p className="education__school"><RichText>{e.school}</RichText></p>
              <p className="education__dates">{e.dates}</p>
              {e.honors && (
                <p className="education__honors"><RichText>{e.honors}</RichText></p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
