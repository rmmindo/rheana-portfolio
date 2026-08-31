import resume from '../content/resume.json';
import { plain } from '../lib/richText.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';

// The toolshed.
//
// This was a definition list of six comma-separated strings, some of them forty
// items long, which is the least readable shape a skills section can take: no
// entry point, nothing scannable, and impossible to search with your eyes.
//
// Now each group is a row of chips. Same facts, same source - still generated
// from the resume, so adding a tool in raysume adds it here - but a reader can
// find "Docker" without reading a paragraph to get to it.
//
// The lead-in matters more than the list. A tool list proves nothing on its
// own; what it is for is letting someone confirm the one thing they came to
// check.

const GROUPS = ['skills', 'roots'];

export default function Skills() {
  const ref = useReveal();
  const { t } = useI18n();

  const section = resume.sections.find(s => s.type === 'skills');
  if (!section) return null;

  // Awards, scholarships and competitions live in Roots now, so the toolshed
  // shows only the lines that are actually tools.
  const TOOLS = new Set(['Languages', 'AI / ML', 'Backend & Web', 'DevOps & Tooling', 'APIs & Integrations']);
  const lines = section.lines.filter(l => TOOLS.has(plain(l.label)));

  void GROUPS;

  return (
    <section className="tools" id="skills" aria-labelledby="tools-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="tools-heading" className="tools__heading">{t('tools.heading')}</h2>
        <p className="tools__lead">{t('tools.lead')}</p>

        <dl className="tools__list">
          {lines.map((line, i) => (
            <div className="tools__group" key={line.label} style={{ '--i': i }}>
              <dt className="tools__label">{plain(line.label)}</dt>
              <dd className="tools__items">
                <ul role="list">
                  {plain(line.text)
                    .split(/[,·]/)
                    .map(s => s.trim())
                    .filter(Boolean)
                    .map(item => <li key={item}>{item}</li>)}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
