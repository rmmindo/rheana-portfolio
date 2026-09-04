// attribution.js
// The reporting bug at Luxe Lips, reduced to something you can drag.
//
// The ad platform uploaders were selecting contacts by SIGNUP date and then
// uploading their payments as conversions for that window. It reads as
// reasonable until you remember that a returning customer signed up months ago:
// her payment lands inside the window, her signup does not, and she is silently
// dropped from reporting. The ads look like they failed. They had not.
//
// Two different errors fall out of the same mistake, and the demo shows both:
//   MISSED   paid inside the window, signed up before it   -> never reported
//   MISDATED signed up inside the window, paid after it    -> reported in the
//            wrong window, so a later window is short too
//
// Dates are compared as ISO strings rather than parsed into Date objects. That
// is not laziness: "2026-03-01" parsed in a browser west of Greenwich becomes
// the previous evening, and every row within a day of an edge changes side
// depending on who is looking. Lexicographic comparison of ISO dates is exact,
// and timezone drift is the same class of bug as the one being demonstrated.

export const within = (date, from, to) => date >= from && date <= to;

/**
 * What each method reports for a window.
 *
 * mode 'signup'  the bug: take customers who signed up in the window, count
 *                every payment they have made
 * mode 'payment' the fix: take the payments that happened in the window
 */
export function report(customers, from, to, mode) {
  const rows = [];

  for (const c of customers) {
    // Test-mode rows exist in the real data and must never reach an ad
    // platform. Both methods drop them; the guard is not the thing being
    // demonstrated, but shipping the demo without it would misrepresent the
    // work.
    if (c.test) continue;

    if (mode === 'signup') {
      if (within(c.signup, from, to)) {
        for (const p of c.payments) rows.push({ id: c.id, name: c.name, ...p });
      }
    } else {
      for (const p of c.payments) {
        if (within(p.date, from, to)) rows.push({ id: c.id, name: c.name, ...p });
      }
    }
  }

  return { rows, count: rows.length, revenue: rows.reduce((n, r) => n + r.amount, 0) };
}

/** The money that arrived in the window but never reached reporting. */
export function missed(customers, from, to) {
  const reported = new Set(report(customers, from, to, 'signup').rows.map(key));
  return report(customers, from, to, 'payment').rows.filter(r => !reported.has(key(r)));
}

/** Reported for this window although the money arrived outside it. */
export function misdated(customers, from, to) {
  return report(customers, from, to, 'signup').rows.filter(r => !within(r.date, from, to));
}

// A payment is identified by customer and date, never by its position in a
// result set: the same payment must key the same way whichever window is being
// built, or a re-upload creates a duplicate conversion.
const key = r => `${r.id}:${r.date}`;

export const share = (part, whole) => (whole === 0 ? 0 : Math.round((part / whole) * 100));
