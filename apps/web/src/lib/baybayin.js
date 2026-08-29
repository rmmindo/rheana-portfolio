// baybayin.js
// Latin to Baybayin transliteration.
//
// Baybayin is an abugida: each consonant glyph already carries an inherent "a".
// Other vowels are written by adding a kudlit (a small mark) above for i/e or
// below for u/o. A consonant with no vowel after it takes a virama.
//
// Deterministic on purpose. This is a lookup table and a small state machine,
// not a model — the same input always produces the same output, it runs in
// microseconds, and it cannot hallucinate a character that does not exist.
// That is the whole point of putting it next to the AI work on the page.
//
// Related to the Baybayin Detector role (2024), which did the harder inverse
// problem: recognising handwritten Baybayin from a webcam with OpenCV and a
// GRU RNN.

// U+1700 block.
const CONSONANT = {
  k: 'ᜃ', g: 'ᜄ', ng: 'ᜅ',
  t: 'ᜆ', d: 'ᜇ', n: 'ᜈ',
  p: 'ᜉ', b: 'ᜊ', m: 'ᜋ',
  y: 'ᜌ', l: 'ᜎ', w: 'ᜏ',
  s: 'ᜐ', h: 'ᜑ',
  // Baybayin has no distinct glyph for r; historically da and ra share one
  // character, and context tells them apart.
  r: 'ᜇ',
};

// Latin letters the script never had. These are the conventional substitutions
// used when writing loanwords, not inventions.
const SUBSTITUTE = {
  c: 'k', f: 'p', j: 'h', q: 'k', v: 'b', x: 'ks', z: 's',
};

const VOWEL_STANDALONE = {
  a: 'ᜀ',
  e: 'ᜁ', i: 'ᜁ',
  o: 'ᜂ', u: 'ᜂ',
};

// Kudlit marks. "a" is inherent, so it adds nothing.
const VOWEL_MARK = {
  a: '',
  e: 'ᜒ', i: 'ᜒ',
  o: 'ᜓ', u: 'ᜓ',
};

const VIRAMA = '᜔';
const VOWELS = 'aeiou';

const isVowel = ch => VOWELS.includes(ch);

// Expands multi-letter substitutions (x -> ks) before syllable parsing, so the
// state machine only ever sees letters the script can represent.
function normalise(word) {
  let out = '';
  for (const ch of word.toLowerCase()) {
    if (SUBSTITUTE[ch]) out += SUBSTITUTE[ch];
    else out += ch;
  }
  return out;
}

/**
 * Transliterate a single word. Unknown characters are dropped rather than
 * passed through, so the output is always valid Baybayin or empty.
 */
export function transliterateWord(word) {
  const chars = normalise(word);
  let out = '';
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];

    if (isVowel(ch)) {
      out += VOWEL_STANDALONE[ch];
      i += 1;
      continue;
    }

    // "ng" is one letter in Tagalog and one glyph in Baybayin, so it must be
    // matched before the single-consonant lookup or "nga" becomes "na-ga".
    let consonant = null;
    if (ch === 'n' && chars[i + 1] === 'g') { consonant = 'ng'; i += 2; }
    else if (CONSONANT[ch]) { consonant = ch; i += 1; }
    else { i += 1; continue; }

    const next = chars[i];
    if (next && isVowel(next)) {
      out += CONSONANT[consonant] + VOWEL_MARK[next];
      i += 1;
    } else {
      // No vowel follows, so the inherent "a" must be cancelled.
      out += CONSONANT[consonant] + VIRAMA;
    }
  }

  return out;
}

/**
 * Transliterate a phrase, preserving the spaces between words so the result
 * still reads as separate words.
 */
export function transliterate(text) {
  if (!text) return '';
  return text
    .split(/(\s+)/)
    .map(part => (/^\s+$/.test(part) ? part : transliterateWord(part)))
    .join('');
}

/**
 * Breaks a word into the syllables the transliteration produced, so the UI can
 * show the reader HOW the conversion happened rather than only the result.
 */
export function syllabify(word) {
  const chars = normalise(word);
  const parts = [];
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];

    if (isVowel(ch)) {
      parts.push({ latin: ch, baybayin: VOWEL_STANDALONE[ch] });
      i += 1;
      continue;
    }

    let consonant = null;
    let consumed = 0;
    if (ch === 'n' && chars[i + 1] === 'g') { consonant = 'ng'; consumed = 2; }
    else if (CONSONANT[ch]) { consonant = ch; consumed = 1; }
    else { i += 1; continue; }

    const next = chars[i + consumed];
    if (next && isVowel(next)) {
      parts.push({
        latin: consonant + next,
        baybayin: CONSONANT[consonant] + VOWEL_MARK[next],
      });
      i += consumed + 1;
    } else {
      parts.push({ latin: consonant, baybayin: CONSONANT[consonant] + VIRAMA });
      i += consumed;
    }
  }

  return parts;
}
