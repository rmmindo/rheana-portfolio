import { useEffect, useRef } from 'react';

// Adds .is-revealed to an element the first time it scrolls into view, which is
// what the CSS animates against. Unobserves immediately after, so scrolling back
// up does not replay the entrance.
//
// The element starts visible in the markup and CSS hides it only when motion is
// allowed. That ordering matters: if JavaScript fails or IntersectionObserver is
// missing, the content is still on the page rather than permanently invisible.
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-revealed');
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
