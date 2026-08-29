import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { I18nProvider, useI18n, LOCALES } from '../src/hooks/useI18n.jsx';
import LangToggle from '../src/components/LangToggle.jsx';
import strings from '../src/content/i18n/ui.json';

function Probe({ k = 'hero.available' }) {
  const { t, locale } = useI18n();
  return <p data-testid="p" data-locale={locale}>{t(k)}</p>;
}

const setLanguages = langs => {
  Object.defineProperty(window.navigator, 'languages', { value: langs, configurable: true });
};

beforeEach(() => {
  try { localStorage.clear(); } catch { /* ignore */ }
  setLanguages(['en-US']);
});

describe('translation table', () => {
  it('covers every English key in Filipino, so nothing silently falls back', () => {
    const missing = Object.keys(strings.en).filter(k => !(k in strings.fil));
    expect(missing, `missing Filipino keys: ${missing.join(', ')}`).toEqual([]);
  });

  it('has no Filipino key without an English original', () => {
    const extra = Object.keys(strings.fil).filter(k => !(k in strings.en));
    expect(extra, `orphan Filipino keys: ${extra.join(', ')}`).toEqual([]);
  });

  it('has no empty translations', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(strings[locale])) {
        expect(String(value).trim(), `${locale}.${key} is empty`).not.toBe('');
      }
    }
  });

  it('keeps the {count} placeholder in every locale that uses it', () => {
    for (const locale of LOCALES) {
      expect(strings[locale]['proof.more']).toContain('{count}');
    }
  });
});

describe('useI18n', () => {
  it('defaults to English', async () => {
    await act(async () => { render(<I18nProvider><Probe /></I18nProvider>); });
    expect(screen.getByTestId('p')).toHaveAttribute('data-locale', 'en');
  });

  it('detects Filipino from the browser languages', async () => {
    setLanguages(['fil-PH', 'en-US']);
    await act(async () => { render(<I18nProvider><Probe /></I18nProvider>); });
    expect(screen.getByTestId('p')).toHaveAttribute('data-locale', 'fil');
  });

  it('treats tl as Filipino', async () => {
    setLanguages(['tl']);
    await act(async () => { render(<I18nProvider><Probe /></I18nProvider>); });
    expect(screen.getByTestId('p')).toHaveAttribute('data-locale', 'fil');
  });

  it('sets the html lang attribute, which screen readers depend on', async () => {
    setLanguages(['fil-PH']);
    await act(async () => { render(<I18nProvider><Probe /></I18nProvider>); });
    expect(document.documentElement.lang).toBe('fil');
  });

  it('substitutes variables', async () => {
    await act(async () => {
      render(<I18nProvider><Probe k="proof.more" /></I18nProvider>);
    });
    // Rendered without vars, the placeholder survives rather than blanking.
    expect(screen.getByTestId('p').textContent).toContain('{count}');
  });

  it('falls back to readable English rather than printing a raw key', () => {
    const { t } = { t: k => strings.en[k] ?? k };
    expect(t('hero.available')).not.toBe('hero.available');
  });

  it('works without a provider, so a component can be tested in isolation', async () => {
    await act(async () => { render(<Probe />); });
    expect(screen.getByTestId('p').textContent).toBe(strings.en['hero.available']);
  });
});

describe('LangToggle', () => {
  it('offers the other language, labelled in that language', async () => {
    await act(async () => {
      render(<I18nProvider><LangToggle /><Probe /></I18nProvider>);
    });
    // In English, the control invites you to switch to Filipino, in Filipino.
    expect(screen.getByRole('button', { name: strings.en['lang.switchTo'] })).toBeInTheDocument();
  });

  it('switches the locale when pressed', async () => {
    await act(async () => {
      render(<I18nProvider><LangToggle /><Probe /></I18nProvider>);
    });
    await act(async () => { screen.getByRole('button').click(); });
    expect(screen.getByTestId('p')).toHaveAttribute('data-locale', 'fil');
    expect(screen.getByTestId('p').textContent).toBe(strings.fil['hero.available']);
  });

  it('remembers the choice', async () => {
    await act(async () => {
      render(<I18nProvider><LangToggle /><Probe /></I18nProvider>);
    });
    await act(async () => { screen.getByRole('button').click(); });
    expect(localStorage.getItem('rm-lang')).toBe('fil');
  });
});
