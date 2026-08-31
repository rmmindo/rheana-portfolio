import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Work from '../src/sections/Work.jsx';
import work from '../src/content/work.json';
import resume from '../src/content/resume.json';

const render_ = () => act(async () => { render(<Work />); });

describe('the claim', () => {
  it('shows one role at a time, not all of them', async () => {
    await render_();
    const visible = [...document.querySelectorAll('.work__panel')].filter(p => !p.hidden);
    expect(visible).toHaveLength(1);
  });

  // The failure this guards: sliding back toward a CV. One claim, one number.
  it('shows exactly one figure per role', async () => {
    await render_();
    const panel = [...document.querySelectorAll('.work__panel')].find(p => !p.hidden);
    expect(panel.querySelectorAll('.work__figure')).toHaveLength(1);
  });

  it('leads with the reader, then answers as her', async () => {
    await render_();
    const panel = [...document.querySelectorAll('.work__panel')].find(p => !p.hidden);
    const you = panel.querySelector('.work__you');
    const me = panel.querySelector('.work__me');
    expect(you.compareDocumentPosition(me) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('keeps every claim short enough to read standing up', async () => {
    for (const r of work.roles) {
      expect(r.you.length, `${r.id} "you" line is too long`).toBeLessThan(70);
      expect(r.me.length, `${r.id} "me" line is too long`).toBeLessThan(50);
    }
  });
});

describe('honesty', () => {
  // work.json chooses which claim leads; resume.json remains the source of
  // every fact. A figure that appears here and nowhere in the resume would be
  // a number invented for the website.
  it('states no figure that is absent from the resume', async () => {
    const haystack = JSON.stringify(resume);
    const exempt = new Set([1, 3]); // plain counts stated in their own caption
    for (const r of work.roles) {
      if (exempt.has(r.figure.value)) continue;
      const n = r.figure.value.toLocaleString('en-US');
      expect(
        haystack.includes(n) || haystack.includes(String(r.figure.value)),
        `${r.id}: figure ${n} is not in resume.json`
      ).toBe(true);
    }
  });

  it('gives every role a detail paragraph, so nothing is lost from the page', async () => {
    for (const r of work.roles) expect(r.detail.length).toBeGreaterThan(80);
  });
});

// A role that owns a playground nests a second tablist inside its panel, which
// is valid ARIA but means a page-wide getAllByRole('tab') sees both sets. These
// assertions scope to the role rail rather than counting every tab on screen.
const roleTabs = () => [...document.querySelectorAll('.work__rail [role="tab"]')];
const rolePanels = () => [...document.querySelectorAll('.work__panel')];

describe('tabs', () => {
  it('follows the ARIA tabs pattern', async () => {
    await render_();
    expect(document.querySelector('.work__rail[role="tablist"]')).toBeInTheDocument();
    expect(roleTabs()).toHaveLength(work.roles.length);
    expect(rolePanels()).toHaveLength(work.roles.length);
  });

  it('marks exactly one tab selected', async () => {
    await render_();
    expect(roleTabs().filter(t => t.getAttribute('aria-selected') === 'true')).toHaveLength(1);
  });

  // Six tabs would otherwise mean six presses to get past the strip.
  it('keeps only the selected tab in the tab order', async () => {
    await render_();
    expect(roleTabs().filter(t => t.tabIndex === 0)).toHaveLength(1);
  });

  it('ties each panel to its tab', async () => {
    await render_();
    for (const tab of roleTabs()) {
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      expect(panel).not.toBeNull();
      expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    }
  });

  it('switches the claim when another role is chosen', async () => {
    await render_();
    const tabs = roleTabs();
    await act(async () => { tabs[2].click(); });
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    const visible = [...document.querySelectorAll('.work__panel')].filter(p => !p.hidden);
    expect(visible[0].id).toContain(work.roles[2].id);
  });
});

describe('the playground', () => {
  // The demo is the evidence for its role's claim, so it belongs in that
  // panel rather than in a section of its own further down the page.
  it('lives inside the role it proves', async () => {
    await render_();
    const i = work.roles.findIndex(r => r.demo === 'baybayin');
    const panel = rolePanels()[i];
    expect(panel.querySelector('.demo')).not.toBeNull();
  });

  it('is not rendered for roles that do not own one', async () => {
    await render_();
    const i = work.roles.findIndex(r => !r.demo);
    expect(rolePanels()[i].querySelector('.demo')).toBeNull();
  });
});

describe('search engines', () => {
  // Progressive disclosure must hide detail from people in a hurry, never from
  // a crawler. Hidden panels and closed details are still in the markup.
  it('renders every role detail into the DOM even when not shown', async () => {
    await render_();
    for (const r of work.roles) {
      expect(document.body.textContent).toContain(r.detail.slice(0, 40));
    }
  });
});
