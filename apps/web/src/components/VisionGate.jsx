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
const BLINK_MS = 1500;

// Two eyes, blinking twice, once the glasses are on.
//
// The first three attempts drew one enormous eyelid across the whole viewport.
// It never read as an eye. A lid stretched to the width of a screen has almost
// no curvature left, and stretching the drawing to fit meant the lashes
// stretched with it, so what arrived on screen was a row of hatch marks. Three
// rounds of adjusting the numbers did not fix that, because the shape was
// wrong rather than the values.
//
// So: two eyes at a readable size, side by side, the way the two lenses just
// were. Nothing is stretched - one viewBox, its own proportions kept - and the
// blink is a single scaleY about each eye's own midline, which is what a lid
// closing actually does to the shape of an eye.

const EYE = { w: 132, h: 86 };

function Eye({ x }) {
  // The almond, drawn as two arcs meeting at the corners.
  const almond = `M6 43 Q66 -1 126 43 Q66 87 6 43 Z`;

  // Lashes along the upper arc, longest in the middle, fanning outwards.
  const lashes = [];
  for (let i = 0; i < 7; i++) {
    const t = (i + 0.5) / 7;
    const u = 1 - t;
    const px = u * u * 6 + 2 * u * t * 66 + t * t * 126;
    const py = u * u * 43 + 2 * u * t * -1 + t * t * 43;
    const fromCentre = Math.abs(t - 0.5) * 2;
    const len = 17 - fromCentre * 7;
    const lean = (t - 0.5) * 26;
    lashes.push(<path key={i} d={`M${px.toFixed(1)} ${py.toFixed(1)} q${(lean * 0.3).toFixed(1)} ${(-len * 0.6).toFixed(1)} ${lean.toFixed(1)} ${(-len).toFixed(1)}`} />);
  }

  return (
    <g className="gate__eyeball" transform={`translate(${x} 0)`}>
      {/* The eye flattens; the lashes do not. Scaling them with everything
          else squashed them into a smear at the moment the eye was shut, which
          is the one moment they should be most visible. They keep their length
          and ride the lid down instead, on the same timing. */}
      <g className="gate__shut">
        <path className="gate__sclera" d={almond} />
        <circle className="gate__iris" cx="66" cy="43" r="17" />
        <circle className="gate__pupil" cx="66" cy="43" r="7" />
        <circle className="gate__glint" cx="60" cy="37" r="3.5" />
        <path className="gate__rim" d={almond} fill="none" />
      </g>
      <g className="gate__lash" fill="none" strokeLinecap="round">{lashes}</g>
    </g>
  );
}

function Lids() {
  return (
    <div className="gate__eye" aria-hidden="true">
      <svg viewBox={`0 0 ${EYE.w * 2 + 40} ${EYE.h}`} aria-hidden="true" focusable="false">
        <Eye x={0} />
        <Eye x={EYE.w + 40} />
      </svg>
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
      {blinking && <Lids />}

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
