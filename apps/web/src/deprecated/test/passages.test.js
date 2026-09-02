import { describe, it, expect } from 'vitest';
import { passages, tokens, keywordSearch, cosine, vectorSearch } from '../src/lib/passages.js';

const DOC = [
  'Annual leave requests go through the staff portal. Two weeks notice is expected.',
  '',
  'The build pipeline runs on every push. A red build blocks the merge.',
  '',
  'short',
].join('\n');

describe('splitting a document', () => {
  it('keeps a paragraph as one passage', () => {
    expect(passages(DOC)).toHaveLength(2);
  });

  it('drops fragments too short to answer anything', () => {
    expect(passages(DOC).some(p => p === 'short')).toBe(false);
  });

  it('splits a long paragraph on sentence ends', () => {
    const long = Array.from({ length: 20 }, (_, i) => `Sentence number ${i} of the wall.`).join(' ');
    const out = passages(long, { max: 120 });
    expect(out.length).toBeGreaterThan(1);
    for (const p of out) expect(p.length).toBeLessThanOrEqual(160);
  });

  // A pasted book should not become ten thousand embeddings on a phone.
  it('caps how much of a huge document it will take', () => {
    const huge = Array.from({ length: 900 }, (_, i) => `Paragraph ${i} with enough words in it.`).join('\n\n');
    expect(passages(huge, { limit: 50 })).toHaveLength(50);
  });

  it('returns nothing for empty input', () => {
    expect(passages('')).toEqual([]);
    expect(passages(null)).toEqual([]);
  });
});

describe('tokens', () => {
  it('drops the words that match everything', () => {
    expect(tokens('how do I book the leave')).toEqual(['book', 'leave']);
  });

  it('keeps the punctuation inside a tool name', () => {
    expect(tokens('we use C# and .NET')).toContain('c#');
  });
});

describe('keyword search', () => {
  const list = passages(DOC);

  it('finds a passage that shares a word', () => {
    expect(keywordSearch(list, 'leave')[0].text).toMatch(/Annual leave/);
  });

  // The failure the meaning search exists to fix: same question, no shared
  // word, nothing found.
  it('finds nothing when the words differ', () => {
    expect(keywordSearch(list, 'how do I book time off')).toEqual([]);
  });

  it('returns nothing for a query of only stopwords', () => {
    expect(keywordSearch(list, 'how do I')).toEqual([]);
  });

  it('ranks a passage matching both words above one matching one', () => {
    expect(keywordSearch(list, 'build merge')[0].score).toBe(1);
  });
});

describe('cosine', () => {
  it('is 1 for the same direction and 0 for a right angle', () => {
    expect(cosine([1, 0], [2, 0])).toBeCloseTo(1);
    expect(cosine([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it('does not divide by zero', () => {
    expect(cosine([0, 0], [1, 1])).toBe(0);
  });
});

describe('vector search', () => {
  it('ranks by closeness to the query', () => {
    const hits = vectorSearch(['a', 'b'], [[1, 0], [0, 1]], [0.9, 0.1], 2);
    expect(hits[0].text).toBe('a');
    expect(hits[0].score).toBeGreaterThan(hits[1].score);
  });

  it('returns nothing before the model has run', () => {
    expect(vectorSearch(['a'], [[1, 0]], null)).toEqual([]);
    expect(vectorSearch([], [], [1, 0])).toEqual([]);
  });
});
