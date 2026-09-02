import { render, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import data from '../src/content/recommendations.json';
import Proof from '../src/sections/Proof.jsx';

const mount = () => act(async () => { render(<Proof />); });

// These are other people's words about Rheana. An earlier version of the data
// file "fixed" grammar, corrected a pronoun, and split each recommendation into
// a pull-quote plus a remainder. All of that was editing testimony, and these
// tests exist so it cannot happen again by accident.
describe('recommendations are verbatim', () => {
  it('stores one whole string per person, not an excerpt and a remainder', () => {
    for (const item of data.items) {
      expect(item.text, `${item.name} has no text`).toBeTruthy();
      expect(item, `${item.name} still has a pull-quote field`).not.toHaveProperty('quote');
      expect(item, `${item.name} still has a remainder field`).not.toHaveProperty('more');
    }
  });

  it('never truncates with an ellipsis', () => {
    for (const item of data.items) {
      expect(item.text, `${item.name} looks truncated`).not.toMatch(/\.\.\.$|…$/);
    }
  });

  // Three specific things the earlier version had "corrected". If any of these
  // assertions fail, someone has tidied testimony again.
  it('keeps the original wording, including its mistakes', () => {
    const byName = Object.fromEntries(data.items.map(i => [i.name, i.text]));
    expect(byName['Gian Carlo Maglines']).toContain('teached');
    expect(byName['Wince Dela Fuente']).toContain('one the most cracked intern team');
    expect(byName['MARC GERARD ODON']).toContain('She were always approachable');
  });

  it('credits every recommender by name and relationship', () => {
    for (const item of data.items) {
      expect(item.name).toBeTruthy();
      expect(item.rel).toBeTruthy();
    }
  });

  it('carries the rule with the data, where the next person will see it', () => {
    expect(data.rule).toMatch(/verbatim/i);
  });
});

// The card shows the first few lines and a button opens the rest. That is a
// CSS clamp on the rendered box, not a shorter string, and these guard the
// difference: shortening the text itself would edit somebody's words.
describe('the read-more card', () => {
  it('renders every word of every recommendation into the page', async () => {
    await mount();
    const text = document.body.textContent;
    for (const item of data.items) {
      const last = item.text.trim().split(/\s+/).slice(-6).join(' ');
      expect(text, `the end of ${item.name}'s recommendation is missing`).toContain(last);
    }
  });

  it('gives every card a control that opens the rest', async () => {
    await mount();
    expect(document.querySelectorAll('.rec__more')).toHaveLength(data.items.length);
  });

  // A crawler and a screen reader both read the markup, so the whole text has
  // to be there whatever the button says.
  it('starts with every card shut, and shortens nothing in the text itself', async () => {
    await mount();
    expect(document.querySelectorAll('.rec.is-open')).toHaveLength(0);
    for (const el of document.querySelectorAll('.rec__words')) {
      expect(el.textContent).not.toMatch(/\.\.\.$|…$/);
    }
  });

  it('keeps the carousel stoppable', async () => {
    await mount();
    expect(document.querySelector('.proof__pause')).not.toBeNull();
  });
});
