import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

// A hairline across the top showing how far through the page you are.
//
// It is decorative in the sense that nothing depends on it, but it does real
// work on a long single-page site: it tells a reader whether they are two
// screens from the end or twelve, which is the difference between scrolling on
// and giving up.
//
// Cheap by construction. Scroll fires far more often than the screen repaints,
// so the handler only stores a number and a single rAF does the write. Nothing
// reads layout in the handler, so there is no forced reflow.
//
// aria-hidden: a screen reader already knows where it is in the document, and
// a live percentage would be noise.

export default function ReadingProgress() {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const pending = useRef(0);

  useEffect(() => {
    const read = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      pending.current = scrollable > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollable))
        : 0;

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
  }, []);

  return (
    <div className="progress" aria-hidden="true">
      <div
        className="progress__bar"
        style={{
          transform: `scaleX(${progress})`,
          // The bar tracks the scrollbar exactly; easing it would make it lag
          // behind the thing it is reporting on.
          transition: reduced ? 'none' : undefined,
        }}
      />
    </div>
  );
}
