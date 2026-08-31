import { describe, it, expect } from 'vitest';
import ledger from '../src/content/ledger.json';
import { report, missed, misdated, within, share } from '../src/lib/attribution.js';

const { customers } = ledger;
const FROM = '2026-03-01';
const TO = '2026-03-31';

describe('the window', () => {
  it('includes both edges', () => {
    expect(within('2026-03-01', FROM, TO)).toBe(true);
    expect(within('2026-03-31', FROM, TO)).toBe(true);
  });

  it('excludes the days either side', () => {
    expect(within('2026-02-28', FROM, TO)).toBe(false);
    expect(within('2026-04-01', FROM, TO)).toBe(false);
  });

  // Parsing these into Date objects puts a browser west of Greenwich on the
  // previous evening, and every row near an edge changes side depending on who
  // is looking. That is the same class of bug as the one being demonstrated.
  it('is not affected by the reader timezone', () => {
    const original = process.env.TZ;
    const answers = [];
    for (const tz of ['UTC', 'Pacific/Kiritimati', 'Pacific/Midway']) {
      process.env.TZ = tz;
      answers.push(report(customers, FROM, TO, 'payment').revenue);
    }
    process.env.TZ = original;
    expect(new Set(answers).size).toBe(1);
  });
});

describe('the bug', () => {
  it('reports less money than actually arrived', () => {
    const bug = report(customers, FROM, TO, 'signup');
    const fix = report(customers, FROM, TO, 'payment');
    expect(bug.revenue).toBeLessThan(fix.revenue);
  });

  // The whole point: she signed up months ago, so selecting by signup date
  // never sees her, however much she paid this month.
  it('drops a returning customer who paid inside the window', () => {
    const gone = missed(customers, FROM, TO);
    expect(gone.length).toBeGreaterThan(0);
    for (const row of gone) {
      const c = customers.find(x => x.id === row.id);
      expect(within(row.date, FROM, TO)).toBe(true);
      expect(within(c.signup, FROM, TO)).toBe(false);
    }
  });

  it('reports a payment that has not happened yet in this window', () => {
    const early = misdated(customers, FROM, TO);
    expect(early.length).toBeGreaterThan(0);
    for (const row of early) expect(within(row.date, FROM, TO)).toBe(false);
  });

  it('never uploads a test-mode row by either method', () => {
    for (const mode of ['signup', 'payment']) {
      const rows = report(customers, FROM, TO, mode).rows;
      expect(rows.some(r => r.id === 'C-9999')).toBe(false);
    }
  });

  it('agrees with itself when every signup is inside the window', () => {
    const sameDay = customers
      .filter(c => !c.test)
      .map(c => ({ ...c, signup: c.payments[0].date }));
    const bug = report(sameDay, FROM, TO, 'signup');
    const fix = report(sameDay, FROM, TO, 'payment');
    expect(bug.revenue).toBe(fix.revenue);
  });
});

describe('share', () => {
  it('is a whole percentage', () => {
    expect(share(1, 3)).toBe(33);
  });

  it('does not divide by zero', () => {
    expect(share(0, 0)).toBe(0);
  });
});
