import { describe, it, expect } from 'vitest';
import { transliterate, transliterateWord, syllabify } from '../src/lib/baybayin.js';

// Codepoints spelled out so a failure says which glyph moved, and so the test
// does not depend on the editor rendering Baybayin correctly.
const KA = 'ᜃ', GA = 'ᜄ', NGA = 'ᜅ';
const TA = 'ᜆ', DA = 'ᜇ', NA = 'ᜈ';
const PA = 'ᜉ', BA = 'ᜊ', MA = 'ᜋ';
const YA = 'ᜌ', LA = 'ᜎ', WA = 'ᜏ';
const SA = 'ᜐ', HA = 'ᜑ';
const A = 'ᜀ', I = 'ᜁ', U = 'ᜂ';
const KUDLIT_I = 'ᜒ', KUDLIT_U = 'ᜓ', VIRAMA = '᜔';

describe('inherent vowel', () => {
  it('writes a bare consonant glyph for a consonant plus a', () => {
    expect(transliterateWord('ka')).toBe(KA);
    expect(transliterateWord('ba')).toBe(BA);
  });

  it('adds no mark for a, because a is inherent', () => {
    expect(transliterateWord('ma')).toBe(MA);
    expect(transliterateWord('mama')).toBe(MA + MA);
  });
});

describe('kudlit marks', () => {
  it('marks i and e above', () => {
    expect(transliterateWord('ki')).toBe(KA + KUDLIT_I);
    expect(transliterateWord('ke')).toBe(KA + KUDLIT_I);
  });

  it('marks u and o below', () => {
    expect(transliterateWord('ku')).toBe(KA + KUDLIT_U);
    expect(transliterateWord('ko')).toBe(KA + KUDLIT_U);
  });
});

describe('the ng digraph', () => {
  it('treats ng as one glyph, not n followed by g', () => {
    expect(transliterateWord('nga')).toBe(NGA);
    expect(transliterateWord('nga')).not.toBe(NA + GA);
  });

  it('handles ng at the end of a word', () => {
    expect(transliterateWord('ang')).toBe(A + NGA + VIRAMA);
  });
});

describe('final consonants', () => {
  it('cancels the inherent vowel with a virama', () => {
    expect(transliterateWord('bak')).toBe(BA + KA + VIRAMA);
  });

  it('applies a virama to every consonant in a cluster', () => {
    // "sports" -> so-po-r-t-s with viramas on the trailing consonants
    expect(transliterateWord('kt')).toBe(KA + VIRAMA + TA + VIRAMA);
  });
});

describe('standalone vowels', () => {
  it('uses the independent vowel glyphs word-initially', () => {
    expect(transliterateWord('ako')).toBe(A + KA + KUDLIT_U);
    expect(transliterateWord('ito')).toBe(I + TA + KUDLIT_U);
  });
});

describe('letters Baybayin does not have', () => {
  it('substitutes f as p, v as b, z as s', () => {
    expect(transliterateWord('fa')).toBe(PA);
    expect(transliterateWord('va')).toBe(BA);
    expect(transliterateWord('za')).toBe(SA);
  });

  it('expands x to ks', () => {
    expect(transliterateWord('xa')).toBe(KA + VIRAMA + SA);
  });

  it('shares one glyph between d and r, as the script historically did', () => {
    expect(transliterateWord('da')).toBe(DA);
    expect(transliterateWord('ra')).toBe(DA);
  });
});

describe('real words', () => {
  it('writes rheana', () => {
    // r-he-a-na. The r is followed by another consonant, so its inherent "a"
    // is cancelled with a virama before the "he" syllable. This is letter-based
    // transliteration, not phonetic: the silent h in the English spelling is
    // still written, because the transliterator reads letters, not sounds.
    expect(transliterateWord('rheana')).toBe(DA + VIRAMA + HA + KUDLIT_I + A + NA);
  });

  it('writes kumusta', () => {
    expect(transliterateWord('kumusta')).toBe(
      KA + KUDLIT_U + MA + KUDLIT_U + SA + VIRAMA + TA
    );
  });

  it('writes mabuhay', () => {
    expect(transliterateWord('mabuhay')).toBe(MA + BA + KUDLIT_U + HA + YA + VIRAMA);
  });
});

describe('phrases', () => {
  it('preserves spacing between words', () => {
    expect(transliterate('ka ka')).toBe(`${KA} ${KA}`);
  });

  it('is case insensitive', () => {
    expect(transliterate('KA')).toBe(transliterate('ka'));
  });

  it('returns empty for empty input', () => {
    expect(transliterate('')).toBe('');
    expect(transliterate(null)).toBe('');
  });

  it('drops characters it cannot represent rather than passing them through', () => {
    expect(transliterate('ka!123')).toBe(KA);
  });

  it('is deterministic', () => {
    const once = transliterate('rheana mindo');
    for (let i = 0; i < 20; i++) expect(transliterate('rheana mindo')).toBe(once);
  });
});

describe('syllabify', () => {
  it('splits into the syllables that were actually written', () => {
    expect(syllabify('kumusta').map(s => s.latin)).toEqual(['ku', 'mu', 's', 'ta']);
  });

  it('pairs each syllable with its glyph', () => {
    const [first] = syllabify('ko');
    expect(first).toEqual({ latin: 'ko', baybayin: KA + KUDLIT_U });
  });

  it('keeps ng together', () => {
    expect(syllabify('ngayon').map(s => s.latin)).toEqual(['nga', 'yo', 'n']);
  });

  it('agrees with transliterateWord', () => {
    for (const word of ['rheana', 'mindo', 'kumusta', 'mabuhay', 'ngayon', 'bakit']) {
      expect(syllabify(word).map(s => s.baybayin).join('')).toBe(transliterateWord(word));
    }
  });
});
