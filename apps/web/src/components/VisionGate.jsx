import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useI18n } from '../hooks/useI18n.jsx';

// The way in.
//
// The page loads out of focus. A pair of glasses sits in the middle. Pick them
// up and the blur resolves into the hero, and the line lands:
//
//     You bring the vision. I'll bring it to life.
//
// Why glasses and not a door or a light switch: Rheana has 850 myopia and is
// legally blind. The blur is not a stock transition, it is roughly what she
// sees without correction. It makes the accessibility argument the first thing
// a visitor FEELS rather than something they read in a footnote, and it is the
// one entry animation nobody else can copy.
//
// Rules this obeys:
//   - once per visitor, remembered in localStorage
//   - fully keyboard operable; the glasses are a real <button>
//   - always skippable, and the skip control is reachable first
//   - under prefers-reduced-motion nothing blurs or moves: the line is shown
//     and the gate dismisses itself
//   - injected by JavaScript only, so crawlers and no-JS readers get the plain
//     page and there is no SEO cost
//   - it never traps a screen reader: the dialog is labelled, focus moves into
//     it, and Escape closes it

const SEEN_KEY = 'rm-seen-gate';
const REVEAL_MS = 1100;

const seen = () => {
  try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
};
const remember = () => {
  try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* private window */ }
};

export default function VisionGate() {
  const reduced = useReducedMotion();
  const { t } = useI18n();

  // Starts closed so the server-rendered markup and the first client render
  // agree. Opening happens in an effect, after hydration.
  const [open, setOpen] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const buttonRef = useRef(null);
  const timer = useRef(0);

  useEffect(() => {
    if (seen()) return;

    // Read the media query directly rather than trusting the hook's state.
    // useReducedMotion resolves in an effect of its own, so on the first pass
    // it still reports false - which would flash a blurred page at exactly the
    // person who asked for no motion.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (prefersReduced) { remember(); return; }
    setOpen(true);
  }, [reduced]);

  // Hold the page still while the gate is up, and put focus inside it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('is-gated');
    buttonRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove('is-gated');
    };
  }, [open]);

  const dismiss = useCallback(() => {
    remember();
    setOpen(false);
    setRevealing(false);
    clearTimeout(timer.current);
  }, []);

  const lift = useCallback(() => {
    if (revealing) return;
    setRevealing(true);
    remember();
    timer.current = setTimeout(() => setOpen(false), REVEAL_MS);
  }, [revealing]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismiss]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!open) return null;

  return (
    <div
      className={`gate${revealing ? ' is-revealing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
    >
      <button type="button" className="gate__skip" onClick={dismiss}>
        {t('gate.skip')}
      </button>

      <div className="gate__stage">
        <p id="gate-title" className="gate__prompt">{t('gate.prompt')}</p>

        <button
          ref={buttonRef}
          type="button"
          className="gate__glasses"
          onClick={lift}
          aria-describedby="gate-title"
        >
          {/* Drawn, not an image: two lenses, a bridge and two arms. */}
          <svg viewBox="0 0 200 80" width="200" height="80" aria-hidden="true" focusable="false">
            <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
              <rect x="14" y="20" width="62" height="44" rx="16" />
              <rect x="124" y="20" width="62" height="44" rx="16" />
              <path d="M76 40 q24 -10 48 0" />
              <path d="M14 34 L2 26" />
              <path d="M186 34 L198 26" />
            </g>
          </svg>
          <span className="visually-hidden">{t('gate.action')}</span>
        </button>

        {/* aria-live so the line is announced when it lands, not only seen. */}
        <p className="gate__line" aria-live="polite">
          {revealing ? t('gate.line') : ''}
        </p>
      </div>
    </div>
  );
}
