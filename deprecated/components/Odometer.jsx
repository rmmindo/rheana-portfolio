import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

// A number that rolls into place, digit by digit, like a slot machine.
//
// Chosen over a plain count-up because a count-up is a number changing fast and
// this is a number ARRIVING - each column settles on its digit, and the eye
// reads the shape of the result before it reads the value.
//
// The mechanic: every digit is a column listing 0-9 vertically inside a box one
// line tall with overflow hidden. Landing on a digit is translateY(-N * 10%).
// That is one transform per column, GPU-composited, no library, no per-frame
// JavaScript. A staggered delay per column makes them settle left to right.
//
// Accessibility: the rolling columns are aria-hidden, because a screen reader
// reading ten digits per column is noise. The real value is exposed once, as
// text, next to it.

function Column({ digit, index, roll }) {
  return (
    <span className="odo__col" aria-hidden="true">
      <span
        className="odo__strip"
        style={{
          // Under reduced motion the strip is placed at its final offset with
          // no transition, so the number is simply correct on arrival.
          transform: `translateY(-${digit * 10}%)`,
          transitionDelay: roll ? `${index * 70}ms` : '0ms',
        }}
      >
        {['0','1','2','3','4','5','6','7','8','9'].map(d => (
          <span className="odo__digit" key={d}>{d}</span>
        ))}
      </span>
    </span>
  );
}

export default function Odometer({ value, prefix = '', suffix = '', label }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const [rolling, setRolling] = useState(false);

  // Rolls once, when the number first comes into view.
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setRolling(true); return; }

    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setRolling(true); io.disconnect(); }
    }, { threshold: 0.4 });

    io.observe(el);

    // If the observer never fires - a stubbed environment, an odd viewport, a
    // browser quirk - the number must not sit on zero forever. Showing the
    // real figure late beats showing a wrong figure indefinitely.
    const failsafe = setTimeout(() => { setRolling(true); io.disconnect(); }, 2500);

    return () => { clearTimeout(failsafe); io.disconnect(); };
  }, [reduced]);

  const text = `${prefix}${value.toLocaleString('en-US')}${suffix}`;
  // Digits only; separators and units are rendered as static characters so they
  // never roll.
  const chars = [...text];
  let digitIndex = -1;

  const settled = reduced || rolling;

  return (
    <span className={`odo${settled ? ' is-settled' : ''}`} ref={ref}>
      {chars.map((c, i) => {
        if (c >= '0' && c <= '9') {
          digitIndex += 1;
          return (
            <Column
              key={i}
              index={digitIndex}
              roll={settled}
              digit={settled ? Number(c) : 0}
            />
          );
        }
        return <span className="odo__fixed" aria-hidden="true" key={i}>{c}</span>;
      })}
      <span className="visually-hidden">{text}{label ? ` ${label}` : ''}</span>
    </span>
  );
}
