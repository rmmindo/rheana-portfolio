import { useCallback, useEffect, useState } from 'react';

const KEY = 'rm-theme';
const read = () => {
  // Wrapped because a private window or blocked site data makes this throw,
  // and a theme preference must never be the reason the page fails to render.
  try { return localStorage.getItem(KEY); } catch { return null; }
};

export function useTheme() {
  const [theme, setTheme] = useState(() => read() ?? 'system');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      if (theme === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, theme);
    } catch { /* storage unavailable; the attribute above still applies */ }
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme(t => (t === 'system' ? 'light' : t === 'light' ? 'dark' : 'system'));
  }, []);

  return { theme, setTheme, cycle };
}
