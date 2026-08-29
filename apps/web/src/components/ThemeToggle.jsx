import { useTheme } from '../hooks/useTheme.js';

const LABEL = {
  system: 'Theme: follow system',
  light: 'Theme: light',
  dark: 'Theme: dark',
};
const ICON = { system: '◐', light: '☀', dark: '☾' };

export default function ThemeToggle() {
  const { theme, cycle } = useTheme();
  return (
    <button type="button" className="theme-toggle" onClick={cycle}>
      {/* aria-hidden on the glyph so a screen reader reads the label, not "◐". */}
      <span aria-hidden="true">{ICON[theme]}</span>
      <span className="visually-hidden">{LABEL[theme]}. Activate to change.</span>
      <span className="theme-toggle__text" aria-hidden="true">
        {theme === 'system' ? 'Auto' : theme === 'light' ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
