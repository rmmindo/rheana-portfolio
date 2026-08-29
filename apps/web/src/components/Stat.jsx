import { useCountUp } from '../hooks/useCountUp.js';

// One animated proof number. `value` is the number that counts; `prefix` and
// `suffix` carry the units so the digits stay a real number for the animation
// and for a screen reader.
export default function Stat({ value, prefix = '', suffix = '', label, hue, decimals = 0 }) {
  const [display, ref] = useCountUp(value, { decimals });
  const fmt = n => n.toLocaleString('en-US', {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });

  return (
    <div className="stat" ref={ref} style={{ '--stat-ink': `var(--ink-${hue})` }}>
      {/* The live value is aria-hidden and the final value is announced once,
          so a screen reader is not read a stream of incrementing numbers. */}
      <p className="stat__value" aria-hidden="true">
        {prefix}{fmt(display)}{suffix}
      </p>
      <p className="visually-hidden">{prefix}{fmt(value)}{suffix} {label}</p>
      <p className="stat__label" aria-hidden="true">{label}</p>
    </div>
  );
}
