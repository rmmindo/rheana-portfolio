import { describe, it, expect } from 'vitest';
import { pickVoice, scoreVoice, guessFemale } from '../src/lib/pickVoice.js';

const v = (name, lang, extra = {}) => ({ name, lang, localService: true, ...extra });

// A realistic Windows 11 voice list, which is what Rheana is on.
const WINDOWS = [
  v('Microsoft David - English (United States)', 'en-US'),
  v('Microsoft Zira - English (United States)', 'en-US'),
  v('Microsoft Mark - English (United States)', 'en-US'),
  v('Microsoft Angelo Online (Natural) - Filipino (Philippines)', 'fil-PH'),
  v('Microsoft Blessica Online (Natural) - Filipino (Philippines)', 'fil-PH'),
];

describe('guessFemale', () => {
  it('recognises known female voices', () => {
    expect(guessFemale(v('Microsoft Zira - English', 'en-US'))).toBe(true);
    expect(guessFemale(v('Microsoft Blessica', 'fil-PH'))).toBe(true);
    expect(guessFemale(v('Samantha', 'en-US'))).toBe(true);
  });

  it('recognises known male voices', () => {
    expect(guessFemale(v('Microsoft David', 'en-US'))).toBe(false);
    expect(guessFemale(v('Microsoft Angelo', 'fil-PH'))).toBe(false);
  });

  it('returns null for a name that says nothing, rather than guessing', () => {
    expect(guessFemale(v('Voice 3', 'en-US'))).toBeNull();
  });

  it('survives a missing voice', () => {
    expect(guessFemale(undefined)).toBeNull();
  });
});

describe('pickVoice', () => {
  it('prefers the female Filipino voice when the page is in Filipino', () => {
    expect(pickVoice(WINDOWS, 'fil').name).toContain('Blessica');
  });

  it('never picks the male Filipino voice over the female one', () => {
    expect(pickVoice(WINDOWS, 'fil').name).not.toContain('Angelo');
  });

  it('prefers a female English voice for English content', () => {
    expect(pickVoice(WINDOWS, 'en').name).toContain('Zira');
  });

  it('does not pick a Filipino-only voice to read English', () => {
    // Intelligibility beats accent: Blessica reading English text is worse than
    // Zira reading it, so the language match has to dominate.
    expect(pickVoice(WINDOWS, 'en').lang).toBe('en-US');
  });

  it('falls back to a female voice when no language matches', () => {
    const only = [v('Microsoft David - German', 'de-DE'), v('Microsoft Hazel - German', 'de-DE')];
    expect(pickVoice(only, 'en').name).toContain('Hazel');
  });

  it('returns something usable when every name is unknown', () => {
    const unknown = [v('Voice A', 'en-US'), v('Voice B', 'en-GB')];
    expect(pickVoice(unknown, 'en')).toBeTruthy();
  });

  it('returns null for an empty list so the browser default is used', () => {
    expect(pickVoice([], 'en')).toBeNull();
    expect(pickVoice(undefined, 'en')).toBeNull();
  });

  it('prefers a Philippine English voice over a generic one, all else equal', () => {
    const list = [v('Microsoft Zira - English (United States)', 'en-US'),
                  v('Microsoft Rosa - English (Philippines)', 'en-PH')];
    expect(pickVoice(list, 'en').lang).toBe('en-PH');
  });

  it('prefers a local voice over a network one', () => {
    const list = [v('Microsoft Zira', 'en-US', { localService: false }),
                  v('Microsoft Aria', 'en-US', { localService: true })];
    expect(pickVoice(list, 'en').name).toContain('Aria');
  });
});

describe('scoreVoice', () => {
  it('penalises a language mismatch more than it rewards gender', () => {
    const femaleWrongLang = scoreVoice(v('Hazel', 'de-DE'), 'en');
    const maleRightLang = scoreVoice(v('David', 'en-US'), 'en');
    expect(maleRightLang).toBeGreaterThan(femaleWrongLang);
  });

  it('rewards a female match in the right language most', () => {
    const best = scoreVoice(v('Zira', 'en-US'), 'en');
    for (const other of [v('David', 'en-US'), v('Hazel', 'de-DE'), v('Voice', 'en-US')]) {
      expect(best).toBeGreaterThan(scoreVoice(other, 'en'));
    }
  });
});
