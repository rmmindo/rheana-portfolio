import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import strings from '../content/i18n/ui.json';

// A ~40-line translation layer instead of i18next.
//
// i18next is roughly 40 kB for two languages and a flat key list. That is most
// of a Lighthouse Performance budget spent on plural rules and interpolation
// features this page does not use. The cost of writing it here is one function;
// the cost of the library would be paid by every visitor on every load.
//
// What it does NOT translate: the resume content. Roles, metrics and
// recommendations stay in English because that is the language they were
// written and verified in. A machine-translated achievement is a misquoted one,
// and a recommendation is someone else's words to begin with.

export const LOCALES = ['en', 'fil'];
const DEFAULT = 'en';
const KEY = 'rm-lang';

const I18nContext = createContext(null);

const read = () => {
  try {
    const stored = localStorage.getItem(KEY);
    return LOCALES.includes(stored) ? stored : null;
  } catch { return null; }
};

// Honours the browser's Accept-Language on a first visit, so a Filipino
// visitor lands in Filipino without hunting for a switcher.
const detect = () => {
  if (typeof navigator === 'undefined') return DEFAULT;
  const tags = navigator.languages ?? [navigator.language ?? ''];
  for (const tag of tags) {
    const base = String(tag).toLowerCase().split('-')[0];
    if (base === 'fil' || base === 'tl') return 'fil';
    if (base === 'en') return 'en';
  }
  return DEFAULT;
};

export function I18nProvider({ children }) {
  // Starts at DEFAULT so the server-rendered markup and the first client render
  // agree; detection runs in an effect, after hydration. Guessing during render
  // would produce a hydration mismatch and a flash of the wrong language.
  const [locale, setLocale] = useState(DEFAULT);

  useEffect(() => {
    const chosen = read() ?? detect();
    if (chosen !== locale) setLocale(chosen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // The lang attribute is what tells a screen reader which pronunciation
    // rules to use. Getting this wrong makes Filipino read as mangled English.
    document.documentElement.lang = locale === 'fil' ? 'fil' : 'en';
    try { localStorage.setItem(KEY, locale); } catch { /* storage unavailable */ }
  }, [locale]);

  const t = useCallback((key, vars) => {
    const table = strings[locale] ?? strings[DEFAULT];
    // Fall back to English rather than rendering a raw key, so a missing
    // translation degrades to readable text instead of "proof.more".
    let value = table[key] ?? strings[DEFAULT][key] ?? key;
    if (vars) {
      for (const [name, replacement] of Object.entries(vars)) {
        value = value.replace(`{${name}}`, String(replacement));
      }
    }
    return value;
  }, [locale]);

  const toggle = useCallback(() => {
    setLocale(current => (current === 'en' ? 'fil' : 'en'));
  }, []);

  const value = useMemo(() => ({ locale, setLocale, toggle, t }), [locale, toggle, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  // Falling back to an English passthrough keeps a component usable in a test
  // that renders it without the provider.
  if (!ctx) {
    return {
      locale: DEFAULT,
      setLocale: () => {},
      toggle: () => {},
      t: key => strings[DEFAULT][key] ?? key,
    };
  }
  return ctx;
}
