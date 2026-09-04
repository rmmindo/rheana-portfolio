import { useEffect } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

// Scatters hydrangea petals from the pointer.
//
// TOUCH IS NOT MOUSE.
// The first version burst on pointerdown for everything. On a phone,
// pointerdown fires the instant a finger lands, which is also how a scroll
// begins - so every swipe threw petals across the screen. A mouse press is a
// deliberate click; a finger press is usually the start of a gesture.
//
// So: a mouse bursts on press, because instant feedback feels better and a
// mouse cannot scroll by pressing. Touch waits for release and only bursts if
// the finger barely moved and did not linger, which is the definition of a tap
// rather than a scroll or a long-press.
//
// Purely decorative, so the layer is aria-hidden and pointer-events:none, and
// none of it mounts under prefers-reduced-motion.

const COUNT = 9;
const HUES = ['powder', 'purple', 'pink', 'mint', 'red', 'yellow'];
const TAP_SLOP_PX = 10;     // finger wobble that still counts as a tap
const TAP_MAX_MS = 500;     // longer than this is a long-press, not a tap
const INTERACTIVE = 'a, button, input, textarea, select, label, [role="button"], canvas';

export default function PetalBurst() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const layer = document.createElement('div');
    layer.className = 'petal-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    const burst = (x, y) => {
      for (let i = 0; i < COUNT; i++) {
        const petal = document.createElement('span');
        // Every third one is the star from the centre of the hydrangea mark.
        petal.className = 'petal-layer__petal'
          + (i % 3 === 0 ? ' petal-layer__petal--star' : '');

        const angle = (Math.PI * 2 * i) / COUNT + Math.random() * 0.5;
        const distance = 60 + Math.random() * 90;

        petal.style.setProperty('--x0', '0px');
        petal.style.setProperty('--y0', '0px');
        petal.style.setProperty('--x1', `${Math.cos(angle) * distance}px`);
        petal.style.setProperty('--y1', `${Math.sin(angle) * distance + 40}px`);
        petal.style.setProperty('--a', `${Math.random() * 360}deg`);
        petal.style.setProperty('--d', `${760 + Math.random() * 340}ms`);
        petal.style.setProperty('--s', `${0.5 + Math.random() * 0.6}`);
        petal.style.setProperty('--petal-fill', `var(--surface-${HUES[i % HUES.length]})`);
        petal.style.left = `${x}px`;
        petal.style.top = `${y}px`;

        petal.addEventListener('animationend', () => petal.remove(), { once: true });
        layer.appendChild(petal);
      }
    };

    // Confetti on top of a control the user is operating is noise, not delight.
    const isInteractive = target => target?.closest?.(INTERACTIVE);

    let pending = null;

    const onPointerDown = event => {
      if (event.button !== 0) return;
      if (isInteractive(event.target)) return;

      if (event.pointerType === 'mouse') {
        burst(event.clientX, event.clientY);
        return;
      }

      // Touch and pen: remember where and when, decide on release.
      pending = { x: event.clientX, y: event.clientY, t: performance.now() };
    };

    const onPointerUp = event => {
      if (!pending) return;
      const { x, y, t } = pending;
      pending = null;

      if (isInteractive(event.target)) return;

      const moved = Math.hypot(event.clientX - x, event.clientY - y);
      const elapsed = performance.now() - t;
      if (moved <= TAP_SLOP_PX && elapsed <= TAP_MAX_MS) {
        burst(event.clientX, event.clientY);
      }
    };

    // A scroll or a cancelled gesture must never leave a pending tap armed.
    const onCancel = () => { pending = null; };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onCancel);
    window.addEventListener('scroll', onCancel, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('scroll', onCancel);
      layer.remove();
    };
  }, [reduced]);

  return null;
}
