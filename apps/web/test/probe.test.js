import { describe, it, expect } from 'vitest';
import { SENTENCES, PAIRS, sentenceFor, compare, divergence, readPredictions } from '../src/lib/probe.js';

describe('building the masked sentence', () => {
  it('puts the subject and the mask where the model expects them', () => {
    const s = SENTENCES.find(x => x.id === 'work');
    expect(sentenceFor(s, 'She', '[MASK]')).toBe('She works as a [MASK].');
  });

  it('uses whatever mask token the tokeniser gives it', () => {
    const s = SENTENCES.find(x => x.id === 'work');
    expect(sentenceFor(s, 'He', '<mask>')).toBe('He works as a <mask>.');
  });

  // The measurement only means anything if the two sentences are otherwise
  // identical. Anything else that differed would be a second variable.
  it('changes only the subject between the two sentences', () => {
    for (const template of SENTENCES) {
      for (const pair of PAIRS) {
        const one = sentenceFor(template, pair.a);
        const two = sentenceFor(template, pair.b);
        expect(one.replace(pair.a, '')).toBe(two.replace(pair.b, ''));
      }
    }
  });
});

describe('comparing two prediction lists', () => {
  const a = [{ token: 'teacher', p: 0.4 }, { token: 'nurse', p: 0.1 }];
  const b = [{ token: 'nurse', p: 0.5 }, { token: 'doctor', p: 0.2 }];

  it('keeps every word either side predicted', () => {
    expect(compare(a, b).map(r => r.token).sort()).toEqual(['doctor', 'nurse', 'teacher']);
  });

  // "The model never suggests this one for her" is the finding, so a missing
  // word has to score zero rather than be dropped.
  it('scores a word missing from one side as zero, not as absent', () => {
    const doctor = compare(a, b).find(r => r.token === 'doctor');
    expect(doctor).toMatchObject({ a: 0, b: 0.2 });
  });

  it('puts the widest gap first', () => {
    expect(compare(a, b)[0].token).toBe('nurse');
  });

  it('is deterministic for tied gaps', () => {
    const tied = compare([{ token: 'b', p: 0.5 }], [{ token: 'a', p: 0.5 }]);
    expect(tied.map(r => r.token)).toEqual(['a', 'b']);
  });
});

describe('divergence', () => {
  it('is zero when the swap changes nothing', () => {
    const same = [{ token: 'x', p: 0.6 }, { token: 'y', p: 0.4 }];
    expect(divergence(same, same)).toBe(0);
  });

  it('is one when the two sides share no prediction', () => {
    expect(divergence([{ token: 'x', p: 1 }], [{ token: 'y', p: 1 }])).toBe(1);
  });

  it('never exceeds one', () => {
    const a = [{ token: 'x', p: 1 }, { token: 'z', p: 1 }];
    const b = [{ token: 'y', p: 1 }];
    expect(divergence(a, b)).toBeLessThanOrEqual(1);
  });
});

describe('reading the model output', () => {
  it('takes the token and its probability', () => {
    expect(readPredictions([{ token_str: ' nurse', score: 0.31 }])).toEqual([
      { token: 'nurse', p: 0.31 },
    ]);
  });

  it('caps the list', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ token_str: `w${i}`, score: 0.01 }));
    expect(readPredictions(many, 10)).toHaveLength(10);
  });

  it('survives the model returning something unexpected', () => {
    expect(readPredictions(null)).toEqual([]);
    expect(readPredictions([{ score: 0.5 }])).toEqual([]);
  });
});
