// pickVoice.js
// Chooses which installed voice reads the page aloud.
//
// The Web Speech API exposes no gender field, so preference has to be inferred
// from voice names. That is a heuristic and it is stated as one: the lists
// below are the voices actually shipped by Windows, macOS, iOS, Android and
// Chrome, checked by name. An unknown voice scores neutral rather than being
// guessed at, and the function always returns something usable.
//
// Order of preference, from Rheana's request:
//   1. a female Filipino voice   (Windows ships Blessica for fil-PH)
//   2. a female Philippine-English voice
//   3. a female voice in the page's language
//   4. any female voice
//   5. any voice in the page's language
//   6. whatever the browser defaults to
//
// Language match is weighted heavily even against the gender preference,
// because a voice reading a language it does not know is unintelligible, and
// intelligibility is the whole point on this site.

const FEMALE = [
  // Windows
  'zira', 'aria', 'jenny', 'michelle', 'ana', 'blessica', 'rosa', 'hazel', 'susan', 'linda', 'heera',
  // macOS / iOS
  'samantha', 'karen', 'moira', 'tessa', 'victoria', 'fiona', 'ava', 'allison', 'nicky',
  'serena', 'kate', 'catherine', 'zoe', 'joana', 'luciana', 'paulina', 'alice', 'amelie',
  // Android / Google / generic
  'female', 'woman',
];

const MALE = [
  'david', 'mark', 'guy', 'james', 'ryan', 'george', 'angelo', 'thomas', 'daniel',
  'alex', 'fred', 'oliver', 'rishi', 'aaron', 'gordon', 'male', 'man',
];

const has = (name, list) => list.some(word => name.includes(word));

/** true / false / null, where null means "the name says nothing either way". */
export function guessFemale(voice) {
  const name = (voice?.name ?? '').toLowerCase();
  if (has(name, FEMALE)) return true;
  if (has(name, MALE)) return false;
  return null;
}

const base = tag => String(tag ?? '').toLowerCase().replace('_', '-').split('-')[0];
const region = tag => {
  const parts = String(tag ?? '').toLowerCase().replace('_', '-').split('-');
  return parts[1] ?? '';
};

export function scoreVoice(voice, locale = 'en') {
  const lang = String(voice?.lang ?? '').toLowerCase();
  const wanted = base(locale);
  const isFilipino = base(lang) === 'fil' || base(lang) === 'tl';
  const female = guessFemale(voice);

  let score = 0;

  // Intelligibility first: a voice that cannot pronounce the page language is
  // worse than one of the wrong gender, whatever the preference.
  if (base(lang) === wanted) score += 100;
  else if (isFilipino && wanted === 'en') score += 20;  // Philippine English is close enough
  else score -= 40;

  if (female === true) score += 40;
  if (female === false) score -= 30;

  // Rheana is Filipino; where the choice is otherwise equal, sound like it.
  if (isFilipino) score += 25;
  if (region(lang) === 'ph') score += 15;

  // Local voices start instantly; network voices can lag or fail offline.
  if (voice?.localService) score += 5;
  if (voice?.default) score += 2;

  return score;
}

/**
 * Returns the best available voice, or null when the list is empty (in which
 * case the caller should let the browser pick its own default).
 */
export function pickVoice(voices, locale = 'en') {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  return voices
    .map(voice => ({ voice, score: scoreVoice(voice, locale) }))
    .sort((a, b) => b.score - a.score)[0].voice;
}
