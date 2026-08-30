import Odometer from './Odometer.jsx';

// One proof number. `value` is the number that rolls; `prefix` and `suffix`
// carry the units so the digits stay a real number for the animation and for
// a screen reader.
export default function Stat({ value, prefix = '', suffix = '', label, hue, decimals = 0 }) {
  return (
    <div className="stat" style={{ '--stat-ink': `var(--ink-${hue})` }}>
      <p className="stat__value">
        <Odometer
          value={decimals ? Number(value.toFixed(decimals)) : Math.round(value)}
          prefix={prefix}
          suffix={suffix}
          label={label}
        />
      </p>
      <p className="stat__label" aria-hidden="true">{label}</p>
    </div>
  );
}
