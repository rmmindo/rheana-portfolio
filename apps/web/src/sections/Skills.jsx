import { useId, useMemo, useState } from 'react';
import resume from '../content/resume.json';
import { toolGroups, countTools, searchTools, mentionIndex, searchMentions } from '../lib/tools.js';
import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';

// The toolshed.
//
// This printed about sixty chips in five rows: the last wall of text on the
// page, and a straight violation of one claim per section. A tool list proves
// nothing on its own, and nobody reads one. A visitor arrives with a single
// tool in mind.
//
// So the list answers a question instead of being one. Type a tool, get a
// straight answer. The whole list is still in the HTML, one disclosure away,
// which keeps every term crawlable while keeping it off the surface.
//
// A miss is not a dead end. "Not on the list" is followed by the honest version
// - a list of sixty is not a list of everything - and a way to ask.
//
// The result line is a live region. That is the correct use of one: it is the
// content the visitor came for, and there is no other way to convey it to
// someone who cannot see the answer appear.

export default function Skills() {
  const ref = useReveal();
  const { t } = useI18n();
  const id = useId();
  const [query, setQuery] = useState('');

  const section = resume.sections.find(s => s.type === 'skills');
  const groups = useMemo(() => toolGroups(section), [section]);
  const total = useMemo(() => countTools(groups), [groups]);
  const hits = useMemo(() => searchTools(groups, query), [groups, query]);

  // The chips are the CV's summary, and a summary drops things: BERT is not
  // among them on a resume whose research is about BERT. When the chips have
  // no answer, the resume's own prose gets asked before anyone is told no.
  const index = useMemo(() => mentionIndex(resume), []);
  const mentions = useMemo(
    () => (hits.length ? [] : searchMentions(index, query)),
    [hits.length, index, query]
  );

  if (!groups.length) return null;

  const asked = query.trim().length > 0;

  return (
    <section className="tools" id="skills" aria-labelledby="tools-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="tools-heading" className="tools__heading">{t('tools.heading')}</h2>
        <p className="tools__lead">{t('tools.lead')}</p>

        <div className="tools__ask">
          <label className="tools__ask-label" htmlFor={`${id}-q`}>{t('tools.label')}</label>
          <input
            id={`${id}-q`}
            className="tools__input"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('tools.placeholder')}
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        <p className="tools__answer" aria-live="polite">
          {!asked && (
            <span className="tools__resting">
              <strong className="tools__count">{total}</strong> {t('tools.resting')}
            </span>
          )}

          {asked && hits.length > 0 && (
            <span className="tools__hit">
              {t('tools.yes')} <strong>{hits[0].item}</strong>
              {hits[0].within && <span className="tools__within">, {t('tools.partOf')} {hits[0].within}</span>}
              , {t('tools.in')} {hits[0].group}.
              {hits.length > 1 && (
                <span className="tools__also">
                  {' '}{t('tools.also')} {hits.slice(1, 5).map(h => h.item).join(', ')}.
                </span>
              )}
            </span>
          )}

          {asked && hits.length === 0 && mentions.length > 0 && (
            <span className="tools__hit">
              {t('tools.yes')} {t('tools.usedOn')}{' '}
              <strong>{mentions.map(m => m.where).join(', ')}</strong>.
              <span className="tools__also">{t('tools.notInList')}</span>
            </span>
          )}

          {asked && hits.length === 0 && mentions.length === 0 && (
            <span className="tools__miss">
              {t('tools.no')}{' '}
              <a className="tools__ask-link" href="#write">{t('tools.askAnyway')} &rarr;</a>
            </span>
          )}
        </p>

        {/* Closed, this is one line. Open, it is every term on the page. Either
            way it is in the HTML, so search engines see the whole list. */}
        <details className="tools__all">
          <summary className="tools__summary">{t('tools.seeAll')}</summary>
          <dl className="tools__list">
            {groups.map((group, i) => (
              <div className="tools__group" key={group.label} style={{ '--i': i }}>
                <dt className="tools__group-label">{group.label}</dt>
                <dd className="tools__items">
                  <ul role="list">
                    {group.items.map(item => (
                      <li
                        key={item}
                        className={asked && hits.some(h => (h.within ?? h.item) === item) ? 'is-hit' : undefined}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </details>
      </div>
    </section>
  );
}
