// tools.js
// The toolshed, and the search over it.
//
// The section used to print every tool at once: about sixty chips in five rows,
// which is the wall of text the whole site exists to avoid. Nobody reads a
// skills list. They arrive with ONE tool in mind and want to know whether it is
// there.
//
// So the list stops being the surface and becomes the answer to a question.
// The full list still renders into the HTML behind a disclosure, because a
// crawler should see every term even when a reader sees one line.
//
// Deterministic, like the rest of the page. Matching a typed word against sixty
// known strings is a rule, and reaching for anything cleverer would be reaching
// for the sake of it.

import { plain } from './richText.jsx';

/** The five lines of the resume skills block that are actually tools. */
const TOOL_LABELS = new Set([
  'Languages',
  'AI / ML',
  'Backend & Web',
  'DevOps & Tooling',
  'APIs & Integrations',
]);

export function toolGroups(section) {
  if (!section?.lines) return [];
  return section.lines
    .filter(line => TOOL_LABELS.has(plain(line.label)))
    .map(line => ({
      label: plain(line.label),
      items: plain(line.text)
        .split(/[,·]/)
        .map(s => s.trim())
        .filter(Boolean),
    }));
}

export const countTools = groups => groups.reduce((n, g) => n + g.items.length, 0);

// Written forms of the same tool. These are spellings, not synonyms: someone
// typing "csharp" means the thing written "C# / .NET 8" on the page, and it is
// the keyboard that stops them typing the hash. Nothing here maps one tool to a
// different tool.
const ALIASES = {
  csharp: 'c#',
  'c sharp': 'c#',
  dotnet: '.net',
  'dot net': '.net',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  golang: 'go',
  postgres: 'postgresql',
  node: 'node.js',
  nodejs: 'node.js',
  k8s: 'kubernetes',
  ci: 'ci/cd',
  hf: 'hugging face',
  huggingface: 'hugging face',
  'hugging-face': 'hugging face',
  sklearn: 'scikit-learn',
  'scikit learn': 'scikit-learn',
  ts: 'typescript',
  gha: 'github actions',
  'github action': 'github actions',
};

// An acronym on a CV is one line that means five tools. A reader expands it
// without noticing; a substring search cannot, so "Express" came back "not on
// the list" while the E in MERN sat right there - and React and Node with it,
// on a site built in React.
//
// This is not inventing a skill. MERN means these four words; the resume is
// still the only source, and the CV keeps its compact line.
const CONTAINS = {
  'MERN/PERN': ['MongoDB', 'Express', 'React', 'Node.js', 'PostgreSQL'],
  'Blazor WebAssembly/Razor': ['Blazor', 'WebAssembly', 'Razor'],
  'JavaScript/TypeScript': ['JavaScript', 'TypeScript'],
  'PHP/WordPress': ['PHP', 'WordPress'],
  'C# / .NET 8': ['C#', '.NET'],
  'GitLab CI/CD': ['GitLab', 'CI/CD'],
  'Stable Diffusion/Flux': ['Stable Diffusion', 'Flux'],
  'TikTok Events/Ads API': ['TikTok'],
};

const norm = s => s.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * Finds every tool matching a typed query.
 *
 * Substring rather than exact, because "docker" should find "Docker" and "sql"
 * should find both "SQL" and "SQLite" - a person checking for SQL is glad to
 * see both.
 */
export function searchTools(groups, query) {
  const q = norm(query);
  if (!q) return [];
  const term = ALIASES[q] ?? q;

  const hits = [];
  for (const group of groups) {
    for (const item of group.items) {
      if (norm(item).includes(term)) {
        hits.push({ item, group: group.label });
        continue;
      }

      // Nothing matched the line itself, so try what the line stands for. The
      // answer names the tool the visitor asked about AND the line it lives
      // on, because "Express, part of MERN/PERN" is the honest reply.
      const inside = (CONTAINS[item] ?? []).find(part => norm(part).includes(term));
      if (inside) hits.push({ item: inside, group: group.label, within: item });
    }
  }

  // A tool that is written on the page outranks one that had to be unpacked
  // from an acronym: MongoDB is its own line as well as the M in MERN, and the
  // line is the better answer. Stable otherwise, so the order stays the
  // resume's.
  const ranked = hits.sort((a, b) => (a.within ? 1 : 0) - (b.within ? 1 : 0));

  // The same tool can be found twice - once as its own line and once inside an
  // acronym - and answering "Yes, MongoDB. Also MongoDB." is worse than not
  // expanding at all. The first of a pair is the better one, by the sort above.
  const seen = new Set();
  return ranked.filter(hit => {
    const key = norm(hit.item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// --- What the tool list leaves out --------------------------------------- //
//
// The five lines of chips are the CV's compact summary, and a summary drops
// things. BERT is not in them, on a resume whose research section is about
// BERT. Neither is Redmine, which the Azeus chatbot was built over, nor
// Elementor, nor the OpenAPI registry at Offshorly.
//
// Adding them all to the chips would turn the CV back into the wall this
// section exists to replace. So the search falls through to the resume's own
// prose instead: same single source, nothing added to it, and the answer can
// say WHERE she used the thing rather than only that she did.
//
// A "no" that should have been a "yes" is the worst thing this box can do.

const strip = t => String(t ?? '')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&')
  .replace(/&#x27;/g, "'")
  .replace(/&quot;/g, '"');

/** Every sentence of the resume, tagged with the work it belongs to. */
export function mentionIndex(resume) {
  const out = [];

  for (const section of resume?.sections ?? []) {
    for (const entry of section.entries ?? []) {
      const where = strip(entry.org ?? section.title ?? '');
      const texts = [strip(entry.context), ...(entry.bullets ?? []).map(b => strip(b.text))];
      for (const text of texts) if (text) out.push({ where, text });
    }
  }

  return out;
}

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Looks for a tool in the resume's prose.
 *
 * Whole words only: without that, "excel" matches "excellent" and the box
 * starts claiming skills off the back of an adjective. Short queries are
 * refused for the same reason - two letters inside a sentence prove nothing.
 */
export function searchMentions(index, query, limit = 3) {
  const q = norm(query);
  if (q.length < 3) return [];
  const term = ALIASES[q] ?? q;
  const pattern = new RegExp(`(^|[^a-z0-9])${escape(term)}([^a-z0-9]|$)`, 'i');

  const found = [];
  const seen = new Set();
  for (const row of index) {
    if (!pattern.test(row.text)) continue;
    if (seen.has(row.where)) continue;
    seen.add(row.where);
    found.push(row);
    if (found.length >= limit) break;
  }
  return found;
}
