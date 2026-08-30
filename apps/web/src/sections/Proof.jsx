import { useState } from 'react';
import data from '../content/recommendations.json';
import { useReveal } from '../hooks/useReveal.js';
import Stage from '../components/Stage.jsx';
import Petal from '../components/Petal.jsx';
import { useI18n } from '../hooks/useI18n.jsx';

const HUES = ['powder', 'purple', 'pink', 'mint', 'red', 'yellow'];

function Card({ item, hue, index }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <li
      className="rec"
      style={{ '--rec-accent': `var(--accent-${hue})`, '--rec-ink': `var(--ink-${hue})`, '--i': index }}
    >
      <Petal className="rec__mark" size={26} />

      {/* blockquote + figcaption so the attribution is programmatically tied to
          the quote, rather than being a visually adjacent paragraph. */}
      <figure className="rec__figure">
        <blockquote className="rec__quote"><p>{item.quote}</p></blockquote>

        {item.more && (
          <>
            <div id={`rec-more-${index}`} className="rec__more" hidden={!open}>
              {item.more.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <button
              type="button"
              className="rec__toggle"
              aria-expanded={open}
              aria-controls={`rec-more-${index}`}
              onClick={() => setOpen(o => !o)}
            >
              {open ? t('rec.collapse') : t('rec.expand')}
              <span className="visually-hidden"> from {item.name}</span>
            </button>
          </>
        )}

        <figcaption className="rec__by">
          <span className="rec__name">{item.name}</span>
          <span className="rec__title">{item.title}</span>
          <span className="rec__rel">{item.rel}</span>
        </figcaption>
      </figure>
    </li>
  );
}

export default function Proof() {
  const ref = useReveal();
  const { t } = useI18n();
  const [showAll, setShowAll] = useState(false);

  const featured = data.items.filter(i => i.featured);
  const rest = data.items.filter(i => !i.featured);
  const visible = showAll ? [...featured, ...rest] : featured;

  return (
    <section className="proof" id="proof" aria-labelledby="proof-heading" ref={ref}>
      <div className="section__inner">
        <Stage n={6} nameKey="stage.whatgrew" season="autumn" art="/img/fruit-strawberry.webp" hue="pink" />
        <h2 id="proof-heading" className="section__title">{t('proof.heading')}</h2>

        <p className="proof__lead">{t('proof.lead', { count: data.items.length })}</p>

        <ul className="proof__list" role="list">
          {visible.map((item, i) => (
            <Card key={item.name} item={item} hue={HUES[i % HUES.length]} index={i} />
          ))}
        </ul>

        {!showAll && (
          <button type="button" className="btn btn--ghost proof__more" onClick={() => setShowAll(true)}>
            {t('proof.more', { count: data.items.length })}
          </button>
        )}
      </div>
    </section>
  );
}
