import { useEffect, useRef } from 'react';

// Adds .is-revealed to an element the first time it scrolls into view, which is
// what the CSS animates against.
//
// THRESHOLD MUST STAY 0.
//
// It was 0.15, and that broke the site on phones. A threshold is a fraction of
// the OBSERVED ELEMENT, not of the viewport. The Experience section is several
// screen-heights tall on a narrow viewport, so 15% of it can never be visible
// at once, the callback never fired, and every card stayed at opacity: 0. The
// page looked empty. With 0, any overlap at all triggers, which is the actual
// intent: "this has started coming into view".
//
// The CSS hidden state is additionally gated behind the js-reveal class set in
// main.jsx, so if this hook never runs the content is simply visible rather
// than invisible forever. A reveal animation must never be able to hide
// content permanently.
const FAILSAFE_MS = 3000;

export function useReveal({ rootMargin = '0px 0px -5% 0px' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => el.classList.add('is-revealed');

    if (typeof IntersectionObserver === 'undefined') {
      reveal();
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
      { threshold: 0, rootMargin }
    );

    io.observe(el);

    // Belt and braces: if the observer has not fired by now, something is wrong
    // with our assumptions and showing the content beats hiding it.
    const failsafe = setTimeout(reveal, FAILSAFE_MS);

    return () => { clearTimeout(failsafe); io.disconnect(); };
  }, [rootMargin]);

  return ref;
}
