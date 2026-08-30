import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useI18n } from '../hooks/useI18n.jsx';

// The way in.
//
// The page loads out of focus. A pair of glasses sits in the middle. Put them
// on and the page resolves into the hero, which says:
//
//     You bring the vision. I'll bring it to life.
//
// The gate explains nothing. The blur is roughly what Rheana sees without
// correction - 850 myopia - and the hero says so afterwards, once. Explaining
// it first would turn a thing you feel into a caption you skim.
//
// "Putting them on" is literal: the glasses rush toward the camera and past it
// on a perspective transform, the way an object does when it arrives at your
// face, while the page behind them comes into focus.
//
// Rules: once per visitor; never mounts under prefers-reduced-motion; always
// skippable; Escape closes it; the glasses are a real button; injected by
// JavaScript only, so crawlers get the plain page.

const SEEN_KEY = 'rm-seen-gate';
const WEAR_MS = 1250;

const seen = () => {
  try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return false; }
};
const remember = () => {
  try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* private window */ }
};

export default function VisionGate() {
  const reduced = useReducedMotion();
  const { t } = useI18n();

  const [open, setOpen] = useState(false);
  const [wearing, setWearing] = useState(false);
  const buttonRef = useRef(null);
  const timer = useRef(0);

  useEffect(() => {
    if (seen()) return;
    // Read the query directly: useReducedMotion resolves in its own effect and
    // still reports false on the first pass, which would flash a blurred page
    // at exactly the person who asked for no motion.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReduced) { remember(); return; }
    setOpen(true);
  }, [reduced]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('is-gated');
    buttonRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove('is-gated');
      document.documentElement.classList.remove('is-clearing');
    };
  }, [open]);

  const dismiss = useCallback(() => {
    remember();
    setOpen(false);
    clearTimeout(timer.current);
  }, []);

  const wear = useCallback(() => {
    if (wearing) return;
    setWearing(true);
    remember();
    // The blur clears on the page itself, so the class goes on <html>.
    document.documentElement.classList.add('is-clearing');
    timer.current = setTimeout(() => setOpen(false), WEAR_MS);
  }, [wearing]);

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
      className={`gate${wearing ? ' is-wearing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('gate.action')}
    >
      <button type="button" className="gate__skip" onClick={dismiss}>
        {t('gate.skip')}
      </button>

      <div className="gate__stage">
        <button ref={buttonRef} type="button" className="gate__glasses" onClick={wear}>
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

        <p className="gate__hint" aria-hidden="true">{t('gate.prompt')}</p>
      </div>
    </div>
  );
}
