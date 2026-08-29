import { useState } from 'react';
import data from '../content/recommendations.json';
import { useReveal } from '../hooks/useReveal.js';
import Petal from '../components/Petal.jsx';

const HUES = ['powder', 'purple', 'pink', 'mint', 'red', 'yellow'];

function Card({ item, hue, index }) {
  const [open, setOpen] = useState(false);

  return (
    <li
      className="rec"
      style={{ '--rec-accent': `var(--surface-${hue})`, '--rec-ink': `var(--ink-${hue})`, '--i': index }}
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
              {open ? 'Show less' : 'Read the full recommendation'}
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
  const [showAll, setShowAll] = useState(false);

  const featured = data.items.filter(i => i.featured);
  const rest = data.items.filter(i => !i.featured);
  const visible = showAll ? [...featured, ...rest] : featured;

  return (
    <section className="proof" id="proof" aria-labelledby="proof-heading" ref={ref}>
      <div className="section__inner">
        <h2 id="proof-heading" className="section__title">What people say</h2>

        <p className="proof__lead">
          {data.items.length} recommendations on LinkedIn, from people who managed
          me, reported to me, and shipped alongside me.
        </p>

        <ul className="proof__list" role="list">
          {visible.map((item, i) => (
            <Card key={item.name} item={item} hue={HUES[i % HUES.length]} index={i} />
          ))}
        </ul>

        {!showAll && (
          <button type="button" className="btn btn--ghost proof__more" onClick={() => setShowAll(true)}>
            Read all {data.items.length} recommendations
          </button>
        )}
      </div>
    </section>
  );
}
