import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion.js';

// Counts from 0 to `value` once the element enters view.
//
// Under reduced motion it renders the final number immediately: someone who
// asked for less motion still wants the fact, they just do not want it to move.
export function useCountUp(value, { duration = 1400, decimals = 0 } = {}) {
  // Decimals matter: 96.9% rounded to an integer becomes 97%, which overstates
  // a measured result. The counter carries the precision the fact was stated in.
  const round = n => Number(n.toFixed(decimals));
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setDisplay(value); return; }

    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting || started.current) return;
      started.current = true;
      io.disconnect();

      const t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / duration);
        // easeOutCubic: fast start, settles rather than stopping dead.
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(round(value * eased));
        if (p < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });

    io.observe(el);
    return () => io.disconnect();
  }, [value, duration, decimals, reduced]);

  return [display, ref];
}
