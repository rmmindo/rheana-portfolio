import { useCallback, useEffect, useRef, useState } from 'react';
import data from '../content/recommendations.json';
import { useReveal } from '../hooks/useReveal.js';
import { useI18n } from '../hooks/useI18n.jsx';

// Recommendations, as a carousel you can shove.
//
// Sixteen stacked cards was a wall. This is one card at a time on a scroll-snap
// track: the pattern browsers already implement well, and the one the reference
// sites use for galleries.
//
// Why CSS scroll-snap rather than a carousel library:
//   - it is a real scroll container, so trackpad, touch swipe, shift-wheel and
//     scrollbar drag all work with no code of ours
//   - keyboard users get arrow buttons and can also tab card to card
//   - with JavaScript broken it degrades to a horizontally scrollable list,
//     which is still perfectly usable
//   - it costs nothing to download
//
// The index is READ BACK from scroll position rather than owned by React, so a
// drag and the buttons can never disagree about which card is showing.

// Paragraph break, built from char codes rather than an escape sequence so
// no tooling in the pipeline can turn it back into a literal newline.
const PARA = String.fromCharCode(10, 10);

const HUES = ['powder', 'purple', 'pink', 'mint', 'red', 'yellow'];

export default function Proof() {
  const ref = useReveal();
  const { t } = useI18n();
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);

  const items = data.items;

  const stepWidth = () => {
    const track = trackRef.current;
    const card = track?.querySelector('.rec');
    if (!track || !card) return 0;
    return card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
  };

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    const step = stepWidth();
    if (!track || !step) return;
    setIndex(Math.round(track.scrollLeft / step));
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const go = useCallback(delta => {
    const track = trackRef.current;
    const step = stepWidth();
    if (!track || !step) return;
    const next = Math.min(items.length - 1, Math.max(0, index + delta));
    track.scrollTo({ left: next * step, behavior: 'smooth' });
  }, [index, items.length]);

  return (
    <section className="proof" id="proof" aria-labelledby="proof-heading" ref={ref}>
      <div className="section__inner">
        <div className="proof__head">
          <div>
            <h2 id="proof-heading" className="proof__heading">{t('proof.heading')}</h2>
            <p className="proof__lead">{t('proof.lead', { count: items.length })}</p>
          </div>

          <div className="proof__nav">
            <button
              type="button"
              className="proof__arrow"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label={t('proof.prev')}
            >
              &larr;
            </button>
            <p className="proof__count" aria-live="polite">
              <span className="visually-hidden">{t('proof.position')} </span>
              {index + 1} / {items.length}
            </p>
            <button
              type="button"
              className="proof__arrow"
              onClick={() => go(1)}
              disabled={index === items.length - 1}
              aria-label={t('proof.next')}
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* The track bleeds past the content column so the next card peeks in and
          the row reads as continuing rather than ending. tabIndex makes it a
          keyboard-scrollable region, which any scroll container needs if it is
          not otherwise focusable. */}
      <ul
        className="proof__track"
        ref={trackRef}
        role="list"
        tabIndex={0}
        aria-label={t('proof.rail')}
      >
        {items.map((item, i) => (
          <li
            className="rec"
            key={item.name}
            style={{
              '--rec-accent': `var(--accent-${HUES[i % HUES.length]})`,
              '--rec-ink': `var(--ink-${HUES[i % HUES.length]})`,
            }}
          >
            <figure className="rec__figure">
              {/* VERBATIM AND WHOLE. The entire recommendation is shown - not
                  clamped, not scrolled, not truncated. Cards are as tall as the
                  words require, which is the correct way round: the testimony
                  sets the layout, the layout does not edit the testimony. */}
              <blockquote className="rec__quote">
                {item.text.split(PARA).map((para, k) => <p key={k}>{para}</p>)}
              </blockquote>
              <figcaption className="rec__by">
                <span className="rec__name">{item.name}</span>
                <span className="rec__title">{item.title}</span>
                <span className="rec__rel">{item.rel}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
