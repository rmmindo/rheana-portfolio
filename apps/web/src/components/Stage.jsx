import { useI18n } from '../hooks/useI18n.jsx';

// Marks a section's place in the growth narrative: 01 Seed, 02 Sprout, and so
// on. The sticker is decorative and the words carry the meaning, so the image
// is alt="" and the stage name is real text.
export default function Stage({ n, nameKey, art, hue = 'mint', season }) {
  const { t } = useI18n();
  return (
    <p className="stage" style={{ '--stage-ink': `var(--ink-${hue})` }}>
      <img className="stage__art" src={art} alt="" width="32" height="32"
           loading="lazy" decoding="async" />
      <span className="stage__num">{String(n).padStart(2, '0')}</span>
      <span className="stage__name">{t(nameKey)}</span>
      {/* The season the section's colour belongs to. The page runs a full year
          and ends in winter, where roots are - which turns back into spring. */}
      {season && <span className="stage__season">{t(`season.${season}`)}</span>}
    </p>
  );
}
