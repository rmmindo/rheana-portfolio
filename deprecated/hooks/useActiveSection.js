import { useEffect, useState } from 'react';

// Tracks which section the reader is currently looking at, for the nav
// highlight.
//
// Why IntersectionObserver rather than a scroll handler reading offsetTop:
// a scroll listener fires on every frame and forces layout each time it reads
// a position, which is a measurable jank cost on a long page. The observer is
// passive and only wakes when a boundary is crossed.
//
// rootMargin pulls the detection band to roughly the upper third of the
// viewport. Without it, the "active" section is whatever touches the very top
// of the screen, which flips to the next section while you are still reading
// the previous one.
export function useActiveSection(ids, { rootMargin = '-20% 0px -70% 0px' } = {}) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const elements = ids
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return;

    // Several sections can straddle the band at once; the one nearest the top
    // of the document wins, so the highlight never jumps backwards mid-scroll.
    const visible = new Set();

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      const first = ids.find(id => visible.has(id));
      if (first) { setActive(first); return; }

      // Above the first section - in the hero - nothing should be marked
      // current. Keeping the previous value meant loading the page after a
      // scroll left "Skills" highlighted while the reader looked at the hero.
      // Between two sections, keep the last value so the highlight does not
      // flicker.
      const firstEl = document.getElementById(ids[0]);
      if (firstEl && firstEl.getBoundingClientRect().top > window.innerHeight * 0.5) {
        setActive(null);
      }
    }, { rootMargin, threshold: 0 });

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, rootMargin]);

  return active;
}
