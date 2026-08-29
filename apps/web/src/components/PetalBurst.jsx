import { useEffect } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

// Scatters hydrangea petals from the pointer on click.
//
// Purely decorative, so it is built to be invisible to assistive technology and
// to disappear entirely under prefers-reduced-motion. The layer is
// pointer-events:none and aria-hidden, so it can never intercept a click or add
// noise to a screen reader. Petals are plain divs with a masked background,
// animated by CSS custom properties; the component only sets the numbers.

const COUNT = 9;
const HUES = ['powder', 'purple', 'pink', 'mint', 'red', 'yellow'];

export default function PetalBurst() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const layer = document.createElement('div');
    layer.className = 'petal-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    const onPointerDown = event => {
      // Only real pointer input, and never on a control the user is operating:
      // confetti on top of a submit button is noise, not delight.
      if (event.button !== 0) return;
      if (event.target.closest('a, button, input, textarea, select, [role="button"]')) return;

      for (let i = 0; i < COUNT; i++) {
        const petal = document.createElement('span');
        petal.className = 'petal-layer__petal';

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
        petal.style.left = `${event.clientX}px`;
        petal.style.top = `${event.clientY}px`;

        petal.addEventListener('animationend', () => petal.remove(), { once: true });
        layer.appendChild(petal);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      layer.remove();
    };
  }, [reduced]);

  return null;
}
