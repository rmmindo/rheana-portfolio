import { describe, it, expect } from 'vitest';
import resume from '../src/content/resume.json';
import { mentionIndex, searchMentions, toolGroups, searchTools } from '../src/lib/tools.js';

const index = mentionIndex(resume);
const groups = toolGroups(resume.sections.find(s => s.type === 'skills'));

describe('falling through to the resume prose', () => {
  it('reads every bullet, tagged with the work it belongs to', () => {
    expect(index.length).toBeGreaterThan(15);
    for (const row of index) {
      expect(row.where).toBeTruthy();
      expect(row.text).toBeTruthy();
      expect(row.text).not.toMatch(/<strong>|&amp;/);
    }
  });

  // The tool chips are a summary, and a summary drops things. Answering "not
  // on the list" to BERT, on a resume whose research is about BERT, is the
  // worst thing this box can do.
  it('finds the models the thesis is about', () => {
    for (const model of ['BERT', 'RoBERTa', 'DistilBERT']) {
      expect(searchTools(groups, model), `${model} is in the chips now?`).toHaveLength(0);
      expect(searchMentions(index, model).length, `${model} not found in prose`).toBeGreaterThan(0);
    }
  });

  it('finds tools named only in the work itself', () => {
    for (const tool of ['Redmine', 'Elementor', 'OpenAPI', 'Tkinter']) {
      expect(searchMentions(index, tool).length, tool).toBeGreaterThan(0);
    }
  });

  it('says where the tool was used', () => {
    expect(searchMentions(index, 'Redmine')[0].where).toMatch(/Azeus/);
  });

  // Without whole-word matching, "excel" matches "excellent" and the site
  // starts claiming a skill off the back of an adjective.
  it('matches whole words, not fragments of longer ones', () => {
    expect(searchMentions(index, 'excel')).toEqual([]);
    expect(searchMentions(index, 'ang')).toEqual([]);
  });

  it('refuses a query too short to prove anything', () => {
    expect(searchMentions(index, 'a')).toEqual([]);
    expect(searchMentions(index, 'in')).toEqual([]);
  });

  it('says nothing about a tool she has not used', () => {
    for (const q of ['COBOL', 'Fortran', 'Salesforce']) {
      expect(searchMentions(index, q), q).toEqual([]);
    }
  });

  it('never repeats the same piece of work', () => {
    const wheres = searchMentions(index, 'Python', 5).map(r => r.where);
    expect(new Set(wheres).size).toBe(wheres.length);
  });
});
