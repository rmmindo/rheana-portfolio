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
// The gate makes one statement and asks nothing. The blur is roughly what
// Rheana sees without correction - 850 myopia - and the hero names it
// afterwards, once. Explaining it first would turn a thing you feel into a
// caption you skim, and a yes/no question would add a decision where the page
// wants an action.
//
// "Putting them on" is literal: the glasses rush toward the camera and past it
// on a perspective transform, the way an object does when it arrives at your
// face, while the page behind them comes into focus.
//
// Rules: EVERY visit, not once per visitor - Rheana's call on 2026-08-31. It is
// the first thing the site says, and a returning client showing the site to a
// colleague should get to show them this rather than explain it. Always
// skippable; Escape closes it; the glasses are a real button; injected by
// JavaScript only, so crawlers get the plain page.
//
// Reduced motion still holds. Asking for less motion is an accessibility
// setting, not a preference to be overridden, and on a site whose whole point
// is being readable by anyone it would be the worst place to break that. Those
// visitors get the page directly, which is what they asked for.

const WEAR_MS = 1250;

export default function VisionGate() {
  const reduced = useReducedMotion();
  const { t } = useI18n();

  const [open, setOpen] = useState(false);
  const [wearing, setWearing] = useState(false);
  const dialogRef = useRef(null);
  const timer = useRef(0);

  useEffect(() => {
    // Read the query directly: useReducedMotion resolves in its own effect and
    // still reports false on the first pass, which would flash a blurred page
    // at exactly the person who asked for no motion.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReduced) return;
    setOpen(true);
  }, [reduced]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('is-gated');
    // Focus the dialog itself, not the glasses. Focusing the button paints a
    // focus ring around the graphic the instant the gate opens - a hard
    // rectangle around a pair of glasses, which is the first thing anyone
    // sees. The dialog is the correct target anyway: a screen reader reads the
    // whole thing rather than starting halfway down at a control.
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove('is-gated');
      document.documentElement.classList.remove('is-clearing');
    };
  }, [open]);

  const dismiss = useCallback(() => {
    setOpen(false);
    clearTimeout(timer.current);
  }, []);

  const wear = useCallback(() => {
    if (wearing) return;
    setWearing(true);
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
      aria-labelledby="gate-statement"
      ref={dialogRef}
      tabIndex={-1}
    >
      <button type="button" className="gate__skip" onClick={dismiss}>
        {t('gate.skip')}
      </button>

      <div className="gate__stage">
        {/* A statement, not a question. Nothing here asks for consent: the
            visitor is already inside her eyesight, and the only thing to do is
            take the glasses. A yes/no would add a decision exactly where the
            page wants none. */}
        <p id="gate-statement" className="gate__statement">{t('gate.statement')}</p>

        <button type="button" className="gate__glasses" onClick={wear}>
          {/* Drawn as glass, not as an outline.
              The old pair was two stroked rectangles, which read as two empty
              boxes: a border, when the thing being shown is a lens. These are
              filled shapes with a highlight across them and only the bridge and
              temples stroked, so the lenses look like something you could see
              through. */}
          <svg viewBox="0 0 210 86" width="210" height="86" aria-hidden="true" focusable="false">
            <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round">
              {/* The bridge sits low and curves, the way a real one does. */}
              <path d="M84 40 q21 -11 42 0" />
              {/* Temples, folding away from the viewer. */}
              <path d="M24 33 L6 24" />
              <path d="M186 33 L204 24" />
            </g>

            <g fill="currentColor" opacity="0.22">
              <ellipse cx="54" cy="45" rx="32" ry="27" />
              <ellipse cx="156" cy="45" rx="32" ry="27" />
            </g>

            {/* A single sweep of light across both lenses. One highlight, at
                the same angle on each, is what makes glass read as glass. */}
            <g fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.5">
              <path d="M36 56 L66 30" />
              <path d="M138 56 L168 30" />
            </g>
          </svg>
          <span className="visually-hidden">{t('gate.action')}</span>
        </button>

        <p className="gate__hint" aria-hidden="true">{t('gate.prompt')} &rarr;</p>
      </div>
    </div>
  );
}
