import { useState } from 'react';
import next from '../content/next.json';
import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';

// The long read, for the one visitor in twenty who wants it.
//
// It stays closed by default because most people do not want an essay at the
// end of a portfolio, and the ones who do are exactly the ones worth writing
// for. Closed it is a single line; open it is the case for working together.
//
// It is a <details>, not a JavaScript toggle, so it opens with no script, is
// keyboard operable for free, and its text is in the HTML either way - which
// matters for search, since this is the most keyword-dense prose on the page.
//
// It ends by handing the reader back to the form directly above it.

export default function NextStep() {
  const ref = useReveal();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <section className="next" id="next" aria-labelledby="next-heading" ref={ref}>
      <div className="section__inner">
        <details className="next__d" open={open} onToggle={e => setOpen(e.currentTarget.open)}>
          <summary className="next__summary">
            <span className="next__eyebrow">{next.eyebrow}</span>
            <span className="next__cue" aria-hidden="true">{open ? '−' : '+'}</span>
          </summary>

          <div className="next__body">
            <h2 id="next-heading" className="next__heading">{next.heading}</h2>
            {next.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            <a className="next__close" href="#write">{next.close} &rarr;</a>
          </div>
        </details>
      </div>
    </section>
  );
}
