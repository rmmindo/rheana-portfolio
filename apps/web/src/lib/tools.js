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
  postgres: 'pern',
  k8s: 'kubernetes',
  ci: 'ci/cd',
  hf: 'hugging face',
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
      if (norm(item).includes(term)) hits.push({ item, group: group.label });
    }
  }
  return hits;
}
