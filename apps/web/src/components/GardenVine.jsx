import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

// A vine that grows down the page as you scroll.
//
// This is the site's spine, in both senses. Rheana's video résumé opens with
// "I'm a cultivator of stories", and the page is arranged as a growth cycle:
// seed, sprout, bloom, harvest, seeds shared. The vine is what makes that
// legible rather than a caption nobody reads.
//
// How it draws: the path declares pathLength="1", so stroke-dasharray and
// stroke-dashoffset can be written in fractions instead of measured pixels.
// Offset 1 is fully hidden, 0 fully drawn, and scroll progress maps straight
// onto it. Nothing has to know how long the path actually is, which means the
// same code works at any viewport height.
//
// Cost control: scroll fires far more often than the screen repaints, so the
// handler only stores the value and a single rAF does the write. Nothing reads
// layout, so there is no forced reflow.
//
// Reduced motion: the vine renders fully grown and never animates. It is
// decorative, so it is aria-hidden either way.

// Eight, alternating sides of the stem, so the vine reads as a plant rather
// than a line with five dots on it. Sizes vary a little for the same reason.
const STEM = 'M30 0 C 8 90, 52 170, 30 260 S 8 430, 30 520 S 52 690, 30 780 S 8 930, 30 1000';

const BUDS = [
  { at: 0.07, art: '/img/garden-sprout.webp',   size: 26, side: -1 },
  { at: 0.18, art: '/img/garden-leaf.webp',     size: 34, side:  1 },
  { at: 0.30, art: '/img/garden-sprout.webp',   size: 28, side: -1 },
  { at: 0.42, art: '/img/garden-flower.webp',   size: 44, side:  1 },
  { at: 0.55, art: '/img/garden-leaf.webp',     size: 32, side: -1 },
  { at: 0.67, art: '/img/garden-lavender.webp', size: 40, side:  1 },
  { at: 0.79, art: '/img/garden-clover.webp',   size: 34, side: -1 },
  { at: 0.91, art: '/img/fruit-cherry.webp',    size: 38, side:  1 },
];

export default function GardenVine() {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const pending = useRef(0);

  useEffect(() => {
    if (reduced) { setProgress(1); return; }

    const read = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      pending.current = scrollable > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollable))
        : 1;

      if (!frame.current) {
        frame.current = requestAnimationFrame(() => {
          frame.current = 0;
          setProgress(pending.current);
        });
      }
    };

    read();
    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read, { passive: true });

    return () => {
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', read);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [reduced]);

  return (
    <div className="vine" aria-hidden="true">
      <svg className="vine__svg" viewBox="0 0 60 1000" preserveAspectRatio="none" focusable="false">
        {/* The full stem, faint. Without it the drawn portion ends mid-air and
            reads as a line that has been cut off rather than one still growing. */}
        <path className="vine__ghost" d={STEM} />
        <path
          className="vine__path"
          pathLength="1"
          d={STEM}
          style={{ strokeDashoffset: 1 - progress }}
        />
      </svg>

      {BUDS.map(bud => (
        <img
          key={bud.at}
          className={`vine__bud${progress >= bud.at ? ' is-open' : ''}`}
          src={bud.art}
          alt=""
          width={bud.size}
          height={bud.size}
          loading="lazy"
          decoding="async"
          style={{
            top: `${bud.at * 100}%`,
            width: bud.size,
            height: bud.size,
            '--side': bud.side,
          }}
        />
      ))}
    </div>
  );
}
