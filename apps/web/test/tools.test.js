import { describe, it, expect } from 'vitest';
import resume from '../src/content/resume.json';
import { toolGroups, countTools, searchTools } from '../src/lib/tools.js';

const section = resume.sections.find(s => s.type === 'skills');
const groups = toolGroups(section);

describe('the toolshed', () => {
  it('reads the five tool groups out of the resume', () => {
    expect(groups.map(g => g.label)).toEqual([
      'Languages', 'AI / ML', 'Backend & Web', 'DevOps & Tooling', 'APIs & Integrations',
    ]);
  });

  // Awards, scholarships and competitions belong to Roots. A tool search that
  // answers "yes" to a scholarship name is answering the wrong question.
  it('leaves awards and scholarships out', () => {
    expect(searchTools(groups, 'DOST')).toEqual([]);
    expect(searchTools(groups, 'Olympiad')).toEqual([]);
  });

  it('decodes escaped labels rather than printing the escape', () => {
    expect(groups.map(g => g.label)).toContain('Backend & Web');
    expect(groups.some(g => g.label.includes('&amp;'))).toBe(false);
  });

  it('counts every tool once', () => {
    expect(countTools(groups)).toBe(groups.reduce((n, g) => n + g.items.length, 0));
    expect(countTools(groups)).toBeGreaterThan(50);
  });
});

describe('searching for a tool', () => {
  it('finds a tool whatever the case', () => {
    for (const q of ['Docker', 'docker', 'DOCKER', '  docker  ']) {
      expect(searchTools(groups, q)[0]?.item).toBe('Docker');
    }
  });

  it('names the group the tool is in', () => {
    expect(searchTools(groups, 'FastAPI')[0].group).toBe('Backend & Web');
    expect(searchTools(groups, 'PyTorch')[0].group).toBe('AI / ML');
  });

  // Someone checking for SQL is glad to see SQLite too.
  it('matches on a substring, not only the whole name', () => {
    const items = searchTools(groups, 'sql').map(h => h.item);
    expect(items).toContain('SQL');
    expect(items).toContain('SQLite');
  });

  it('understands the spelling a keyboard makes easy', () => {
    expect(searchTools(groups, 'csharp')[0].item).toBe('C# / .NET 8');
    expect(searchTools(groups, 'js')[0].item).toBe('JavaScript/TypeScript');
  });

  it('returns nothing for a tool that is not there', () => {
    expect(searchTools(groups, 'COBOL')).toEqual([]);
  });

  it('returns nothing for an empty query rather than everything', () => {
    expect(searchTools(groups, '')).toEqual([]);
    expect(searchTools(groups, '   ')).toEqual([]);
  });

  it('is deterministic', () => {
    const once = JSON.stringify(searchTools(groups, 'a'));
    for (let i = 0; i < 5; i++) expect(JSON.stringify(searchTools(groups, 'a'))).toBe(once);
  });
});
