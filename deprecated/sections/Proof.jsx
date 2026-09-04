import { useCallback, useEffect, useRef, useState } from 'react';
import data from '../content/recommendations.json';
import { useReveal } from '../hooks/useReveal.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useI18n } from '../hooks/useI18n.jsx';
import SectionCta from '../components/SectionCta.jsx';

// Recommendations, one at a time, moving on by themselves.
//
// Sixteen at once was a wall, and even a peeking carousel asked someone to read
// four things before deciding to read one. One card fills the view, holds for a
// few seconds, and hands over to the next. A visitor who reads none of them
// still watches four or five faces go past, which is the point of having
// sixteen.
//
// VERBATIM, still, and this is where that rule needs care. The card shows the
// first few lines and a button opens the rest. Nothing is rewritten, shortened
// or summarised: the clamp is CSS, so the full text is in the DOM, in the
// prerendered HTML, and read in full by a screen reader whichever state the
// button is in. Trimming the string itself would edit somebody's words, which
// is the thing we never do.
//
// Motion has to be stoppable. Content that moves on its own for longer than
// five seconds needs a way to stop it (WCAG 2.2.2), so there is a pause button,
// and it also pauses on hover, on keyboard focus, and whenever a card is opened
// - yanking the text away from someone mid-sentence is the whole failure mode.
// Under prefers-reduced-motion it never starts at all.
//
// Still a scroll-snap track underneath, so swipe, trackpad and scrollbar drag
// all work without a line of our code, and with JavaScript broken it degrades
// to a scrollable list rather than to nothing.

// Paragraph break, built from char codes rather than an escape sequence so
// no tooling in the pipeline can turn it back into a literal newline.
const PARA = String.fromCharCode(10, 10);

const HUES = ['powder', 'purple', 'pink', 'mint', 'red', 'yellow'];

const DWELL = 8000;

export default function Proof() {
  const ref = useReveal();
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const items = data.items;

  const stepWidth = () => {
    const track = trackRef.current;
    const card = track && track.querySelector('.rec');
    if (!track || !card) return 0;
    return card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
  };

  // The index is read back from scroll position rather than owned by React, so
  // a swipe and the buttons can never disagree about which card is showing.
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

  const goTo = useCallback((next, smooth = true) => {
    const track = trackRef.current;
    const step = stepWidth();
    if (!track || !step) return;
    track.scrollTo({ left: next * step, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Wrapping, rather than stopping at the ends. Scrolling smoothly back across
  // fifteen cards to reach the first one looks like a mistake, so the wrap is
  // an instant jump and every other move glides.
  const go = useCallback(delta => {
    const next = (index + delta + items.length) % items.length;
    const wrapped = Math.abs(next - index) > 1;
    goTo(next, !wrapped);
    setOpen(null);
  }, [goTo, index, items.length]);

  const running = !reduced && !paused && !hovered && open === null;

  useEffect(() => {
    if (!running) return undefined;
    const timer = setTimeout(() => go(1), DWELL);
    return () => clearTimeout(timer);
  }, [running, go, index]);

  return (
    <section
      className="proof"
      id="proof"
      aria-labelledby="proof-heading"
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={e => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHovered(false);
      }}
    >
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
              aria-label={t('proof.prev')}
            >
              &larr;
            </button>

            <p className="proof__count">
              <span className="visually-hidden">{t('proof.position')} </span>
              {index + 1} / {items.length}
            </p>

            <button
              type="button"
              className="proof__arrow"
              onClick={() => go(1)}
              aria-label={t('proof.next')}
            >
              &rarr;
            </button>

            {!reduced && (
              <button
                type="button"
                className="proof__pause"
                onClick={() => setPaused(p => !p)}
                aria-pressed={paused}
              >
                <span aria-hidden="true">{paused ? '▶' : '‖'}</span>
                <span className="visually-hidden">
                  {paused ? t('proof.play') : t('proof.pause')}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* A thin line that empties as the card's time runs out, so the change
            is expected rather than sudden. Keyed on the index so it restarts
            with each card.
            
            Always rendered, never conditionally. Unmounting it when the
            carousel paused took its 22px of height out of the layout, so
            moving the mouse toward a card shifted that card upwards and the
            click that followed landed on nothing. A control that moves as you
            reach for it is worse than no control. */}
        <span
          key={index}
          className={`proof__timer${running ? '' : ' is-held'}`}
          aria-hidden="true"
        />
      </div>

      {/* The track sits inside the content column rather than bleeding past
          it. Full-bleed was what let the next card show at the edge, and one
          card per view is the whole point of the change. */}
      <div className="section__inner">
      <ul
        className="proof__track"
        ref={trackRef}
        role="list"
        tabIndex={0}
        aria-label={t('proof.rail')}
      >
        {items.map((item, i) => (
          <li
            className={`rec${open === i ? ' is-open' : ''}`}
            key={item.name}
            style={{
              '--rec-accent': `var(--accent-${HUES[i % HUES.length]})`,
              '--rec-ink': `var(--ink-${HUES[i % HUES.length]})`,
            }}
          >
            <figure className="rec__figure">
              {/* VERBATIM. The clamp is CSS: every word is in the DOM whether
                  the card is open or shut, so a screen reader and a crawler
                  both get the whole thing. */}
              <blockquote className="rec__quote">
                {/* The words sit in their own box because the clamp needs a
                    block that is not a grid item: a grid item blockifies
                    display, -webkit-box becomes flow-root, and line-clamp is
                    silently ignored. */}
                <div className="rec__words">
                  {item.text.split(PARA).map((para, k) => <p key={k}>{para}</p>)}
                </div>
              </blockquote>

              <button
                type="button"
                className="rec__more"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                {open === i ? t('proof.less') : t('proof.readAll')}
                <span className="rec__chev" aria-hidden="true">
                  {open === i ? ' ↑' : ' ↓'}
                </span>
              </button>

              <figcaption className="rec__by">
                <span className="rec__name">{item.name}</span>
                <span className="rec__title">{item.title}</span>
                <span className="rec__rel">{item.rel}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

        <SectionCta id="proof" />
      </div>
    </section>
  );
}
