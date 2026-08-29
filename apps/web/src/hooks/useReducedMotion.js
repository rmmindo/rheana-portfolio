import { useEffect, useState } from 'react';

// Single source of truth for the motion preference. Every animated component
// reads this rather than checking the media query itself, so there is one place
// to be wrong instead of ten.
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}
