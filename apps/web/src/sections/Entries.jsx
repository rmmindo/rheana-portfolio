import RichText, { plain } from '../lib/richText.jsx';
import { useReveal } from '../hooks/useReveal.js';
import { SpeakButton } from '../components/SpeechProvider.jsx';
import { useI18n } from '../hooks/useI18n.jsx';
import { useRef } from 'react';

// Renders an experience or projects section. Both share a shape in the resume
// JSON, so they share a component rather than two near-identical ones.
export default function Entries({ section, id, accent, titleKey }) {
  const ref = useReveal();
  const listRef = useRef(null);
  const { t } = useI18n();
  // Fall back to the generated title when no key is supplied, so a new section
  // added in raysume still renders a heading.
  const title = titleKey ? t(titleKey) : plain(section.title);

  return (
    <section className="entries" id={id} aria-labelledby={`${id}-heading`} ref={ref}>
      <div className="section__inner">
        <div className="section__head">
          <h2 id={`${id}-heading`} className="section__title">{title}</h2>
          <SpeakButton targetRef={listRef} id={id} label={title} />
        </div>

        <ol className="entries__list" role="list" ref={listRef}>
          {section.entries.map((entry, i) => (
            <li
              className="entry"
              key={`${entry.org}-${entry.dates}`}
              style={{ '--entry-accent': `var(--accent-${accent[i % accent.length]})`,
                       '--entry-ink': `var(--ink-${accent[i % accent.length]})`,
                       '--i': i }}
            >
              <div className="entry__head">
                <h3 className="entry__title">
                  <span className="entry__role"><RichText>{entry.title}</RichText></span>
                  <span className="entry__org"><RichText>{entry.org}</RichText></span>
                </h3>
                <p className="entry__dates">{plain(entry.dates)}</p>
              </div>

              {(entry.location || entry.context) && (
                <p className="entry__meta">
                  {[entry.location, entry.context].filter(Boolean).map(plain).join(' · ')}
                </p>
              )}

              <ul className="entry__bullets" role="list">
                {entry.bullets.map((b, j) => (
                  <li key={j}>
                    {b.lead && <strong className="entry__lead"><RichText>{b.lead}</RichText></strong>}{' '}
                    <RichText>{b.text}</RichText>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
