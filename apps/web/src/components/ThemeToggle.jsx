import { useTheme } from '../hooks/useTheme.js';
import { useI18n } from '../hooks/useI18n.jsx';

const ICON = { system: '◐', light: '☀', dark: '☾' };

export default function ThemeToggle() {
  const { theme, cycle } = useTheme();
  const { t } = useI18n();
  return (
    <button type="button" className="theme-toggle" onClick={cycle}>
      {/* aria-hidden on the glyph so a screen reader reads the label, not "◐". */}
      <span aria-hidden="true">{ICON[theme]}</span>
      <span className="visually-hidden">{t(`theme.${theme}`)}</span>
      <span className="theme-toggle__text" aria-hidden="true">
        {t(`theme.${theme}.short`)}
      </span>
    </button>
  );
}
