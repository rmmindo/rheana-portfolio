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
// There is no skip button any more - Rheana's call on 2026-08-31. That leaves
// two ways out, which is still two: pressing the glasses, which is the point
// of the screen and is a real focusable button, and Escape. Anyone who asked
// for reduced motion never sees it at all. A modal with one obvious action and
// a working Escape is not a trap; a modal with no way out would be, and
// gate.test.jsx holds that line.
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

// Two slow blinks after the glasses go on, then the page. Settling into a new
// pair is not instant, and the eyes are the thing this whole screen is about.
const BLINK_MS = 1900;

// What it takes instead, for anyone who asked for no motion: long enough for
// the blur to lift rather than snap, short enough that nothing travels.
const CALM_MS = 320;


export default function VisionGate() {
  const reduced = useReducedMotion();
  const { t } = useI18n();

  const [open, setOpen] = useState(false);
  const [wearing, setWearing] = useState(false);
  const dialogRef = useRef(null);
  const timer = useRef(0);

  // Everyone sees the gate. It used to be skipped entirely for anyone who
  // asked for reduced motion, which meant a friend on a phone with Reduce
  // Motion on - or a laptop in battery saver, which switches it on without
  // telling you - simply never saw the first thing the site says.
  //
  // The setting is about MOVEMENT, not about content. So the statement and the
  // glasses are there for everyone, and what those visitors do not get is the
  // travel and the blinking: they press, and the page is simply clear. A fade
  // is not the kind of motion the setting exists to prevent.
  useEffect(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('is-gated');
    dialogRef.current?.focus();

    // Block interaction on the background layer
    const root = document.getElementById('root');
    const siblings = root ? Array.from(root.children).filter(child => !child.classList.contains('gate')) : [];
    siblings.forEach(s => {
      s.setAttribute('aria-hidden', 'true');
      s.setAttribute('inert', 'true'); // Native block for focus and screen readers
    });

    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove('is-gated');
      document.documentElement.classList.remove('is-clearing');
      siblings.forEach(s => {
        s.removeAttribute('aria-hidden');
        s.removeAttribute('inert');
      });
    };
  }, [open]);

  const dismiss = useCallback(() => {
    setOpen(false);
    clearTimeout(timer.current);
  }, []);

  const wear = useCallback(() => {
    if (wearing) return;
    setWearing(true);
    document.documentElement.classList.add('is-clearing');
    
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (prefersReduced) {
      // No travel. Just gone, and the page is clear.
      timer.current = setTimeout(() => setOpen(false), CALM_MS);
      return;
    }

    // The glasses reach your face and unblur over ~2.5s
    timer.current = setTimeout(() => setOpen(false), 2500);
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
    <div className="hero-container">
      {/* Layer 1: The Pitch Black Background */}
      <div className="bg-void"></div>

      {/* Layer 2: The Blurred Image Peephole */}
      <div className={`bg-autorefractor ${wearing ? 'is-revealing' : ''}`}></div>

      {/* Layer 3: The Foreground Overlay (Keep all existing glasses/text logic here) */}
      <div
        className={`gate${wearing ? ' is-wearing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-statement"
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="gate__stage">
          <p id="gate-statement" className="gate__statement">{t('gate.statement')}</p>

          <button 
            type="button" 
            className="gate__glasses" 
            onClick={wear}
            aria-label="A pair of glasses. Click to clear the blurry screen and reveal Rheana's portfolio."
          >
            <span className="gate__lens">
              <img src="/glasses.png" alt="" aria-hidden="true" />
            </span>
            <span className="gate__tooltip">Put them on</span>
          </button>
        </div>
      </div>
    </div>
  );
}
