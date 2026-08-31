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

// Two blinks, seen from behind the eyes.
//
// The mistake in every earlier version was drawing an eye. There is nobody to
// look at: the visitor has just put the glasses on, so they ARE the eye, and
// what they should see is what you see when you blink - dark, then the world
// arriving as your lids lift, twice.
//
// So there is no illustration here at all. Two soft-edged dark masses, one from
// the top and one from the bottom, meeting to make black and parting to let the
// page through. The edges are heavily blurred because your own eyelids are
// centimetres from your retina and never in focus, and a hard line would read
// as a shutter rather than an eye.
//
// The fringe along the top stays a moment longer than the rest: lashes hang in
// the top of your vision after the lid has lifted, out of focus and darkening
// the very top of everything you see.

function Blink() {
  return (
    <div className="gate__blink" aria-hidden="true">
      <div className="gate__lid gate__lid--top" />
      <div className="gate__lid gate__lid--bottom" />
      <div className="gate__fringe" />
    </div>
  );
}

export default function VisionGate() {
  const reduced = useReducedMotion();
  const { t } = useI18n();

  const [open, setOpen] = useState(false);
  const [wearing, setWearing] = useState(false);
  const [blinking, setBlinking] = useState(false);
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
    // Read the query at the moment of the press rather than trusting the hook,
    // which resolves in its own effect and can still be reporting false.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (prefersReduced) {
      // No travel, no blink. Just gone, and the page is clear.
      timer.current = setTimeout(() => setOpen(false), CALM_MS);
      return;
    }

    // The glasses reach your face, and then you blink twice, the way anyone
    // does settling into a new pair.
    timer.current = setTimeout(() => {
      setBlinking(true);
      timer.current = setTimeout(() => setOpen(false), BLINK_MS);
    }, WEAR_MS);
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
      className={`gate${wearing ? ' is-wearing' : ''}${blinking ? ' is-blinking' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-statement"
      ref={dialogRef}
      tabIndex={-1}
    >
      {blinking && <Blink />}

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
