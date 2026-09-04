// passages.js
// Splitting a document into searchable passages, and the two ways of searching
// it that the Azeus playground puts side by side.
//
// Keyword search is exact and needs nothing. Meaning search needs a model, and
// the model is the whole argument: "how do I book leave" finds "annual leave
// requests go through the portal" without sharing a single content word with
// it. That is the difference between a search box that works and one everybody
// stops using, and it is the difference the on-premise chatbot at Azeus was
// built to close.
//
// Everything in this file is deterministic and testable. The model lives in
// models.js, behind an explicit press, because it is 23 MB and nobody should
// pay for it by scrolling past.

const STOP = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'do', 'does',
  'for', 'from', 'how', 'i', 'if', 'in', 'is', 'it', 'me', 'my', 'of', 'on',
  'or', 'our', 'that', 'the', 'this', 'to', 'we', 'what', 'when', 'where',
  'which', 'who', 'why', 'will', 'with', 'you', 'your',
]);

// Punctuation inside a word is part of it - "c#", "ci/cd", "node.js" - but
// punctuation at the end of one is the sentence's, not the word's. Keeping it
// made "merge." fail to match "merge", which is a search box that quietly does
// not work.
export const tokens = s =>
  (String(s ?? '').toLowerCase().match(/[a-z0-9][a-z0-9'+#./-]*/g) ?? [])
    .map(w => w.replace(/[.'/-]+$/, ''))
    .filter(w => w && !STOP.has(w));

/**
 * Splits a document into passages worth searching.
 *
 * Paragraphs first, because a paragraph is usually one idea. Anything longer
 * than `max` characters is split again on sentence ends, so a wall of text does
 * not become one useless passage. Blank lines, headings and one-word lines are
 * dropped: they match everything and answer nothing.
 */
export function passages(text, { max = 320, limit = 400 } = {}) {
  const out = [];

  for (const block of String(text ?? '').split(/\n\s*\n/)) {
    const clean = block.replace(/\s+/g, ' ').trim();
    if (clean.length < 24) continue;

    if (clean.length <= max) {
      out.push(clean);
      continue;
    }

    let buffer = '';
    for (const sentence of clean.split(/(?<=[.!?])\s+/)) {
      if ((buffer + ' ' + sentence).trim().length > max && buffer) {
        out.push(buffer.trim());
        buffer = sentence;
      } else {
        buffer = (buffer + ' ' + sentence).trim();
      }
    }
    if (buffer.trim().length >= 24) out.push(buffer.trim());

    // A pasted book should not turn into ten thousand embeddings on a phone.
    if (out.length >= limit) break;
  }

  return out.slice(0, limit);
}

/**
 * Keyword search: how many of the query's words appear in the passage.
 *
 * Deliberately the naive version, because it is the one being argued with. It
 * scores nothing it does not literally contain, which is exactly why a new
 * hire's question returns an empty page.
 */
export function keywordSearch(list, query, top = 3) {
  const want = tokens(query);
  if (!want.length) return [];

  return list
    .map((text, i) => {
      const have = new Set(tokens(text));
      const hits = want.filter(w => have.has(w));
      return { i, text, score: hits.length / want.length, hits };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, top);
}

/** Cosine similarity. The vectors from the model are already unit length, but
 *  normalising here means the function is correct for any input, and a test can
 *  hand it something that is not. */
export function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

/** Meaning search: rank passages by how close their vector is to the query's. */
export function vectorSearch(list, vectors, queryVector, top = 3) {
  if (!queryVector || !vectors?.length) return [];
  return vectors
    .map((v, i) => ({ i, text: list[i], score: cosine(v, queryVector) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, top);
}
