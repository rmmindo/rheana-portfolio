import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

// A vine that grows down the page as you scroll.
//
// This is the site's spine, in both senses. Rheana's video resume opens with
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
// The stem is generated, not hand-drawn.
//
// A path with four wide S-curves looks like a vine in isolation and like a
// straight line once preserveAspectRatio="none" stretches a 1000-unit viewBox
// down a 15,000px page. Twenty-eight short alternating curves keep a visible
// wave at any page length.
const WAVES = 28;
const STEM = (() => {
  const step = 1000 / WAVES;
  let d = `M30 0`;
  for (let i = 0; i < WAVES; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    d += ` q ${13 * dir} ${step / 2} 0 ${step}`;
  }
  return d;
})();

// Leaves drawn as shapes, not images: an asymmetric border-radius makes a
// convincing leaf, and it takes the palette rather than a fixed colour.
const BUDS = [
  { at: 0.07, hue: 'mint',   size: 14, side: -1 },
  { at: 0.18, hue: 'powder', size: 18, side:  1 },
  { at: 0.30, hue: 'mint',   size: 15, side: -1 },
  { at: 0.42, hue: 'pink',   size: 22, side:  1 },
  { at: 0.55, hue: 'yellow', size: 16, side: -1 },
  { at: 0.67, hue: 'purple', size: 20, side:  1 },
  { at: 0.79, hue: 'red',    size: 17, side: -1 },
  { at: 0.91, hue: 'powder', size: 19, side:  1 },
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
        <span
          key={bud.at}
          className={`vine__bud${progress >= bud.at ? ' is-open' : ''}`}
          style={{
            top: `${bud.at * 100}%`,
            width: bud.size,
            height: bud.size,
            '--side': bud.side,
            '--leaf': `var(--accent-${bud.hue})`,
          }}
        />
      ))}
    </div>
  );
}
