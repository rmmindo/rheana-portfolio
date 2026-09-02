import { useEffect, useState } from 'react';
import { useI18n } from '../hooks/useI18n.jsx';

// Live unique-visitor count.
//
// Backed by GoatCounter rather than our own service. The Express API in
// apps/api does this too, and does it well: the daily-rotating hash counts
// unique visitors without ever storing an IP. But running it needs a host, and
// the free hosts now want a card on file. GoatCounter is free without one, sets
// no cookies, and stores no personal data either, so the privacy property that
// made the custom service worth building survives the move.
//
// apps/api stays in the repo as the reference implementation, tested and
// deployable, for whenever self-hosting is worth the trouble.
//
// /counter/TOTAL.json is a public endpoint: no key, no auth, safe to call from
// a static page.
//
// Three things this deliberately does NOT do:
//   - block rendering: it mounts after paint and fetches in the background,
//     so it can never affect LCP
//   - render a broken box: if the request fails, or no site code is set, the
//     component returns null and the footer simply has one fewer line
//   - render a zero: a counter showing 0 works against the site, so nothing
//     appears until there is a real number
const SITE = import.meta.env?.VITE_GOATCOUNTER ?? '';

export default function VisitorCount() {
  const { t } = useI18n();
  const [total, setTotal] = useState(null);

  useEffect(() => {
    if (!SITE) return;

    const controller = new AbortController();
    // A counter is not worth making anyone wait for.
    const timeout = setTimeout(() => controller.abort(), 4000);

    fetch(`https://${SITE}.goatcounter.com/counter/TOTAL.json`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        // The API returns a display string using thin spaces as separators,
        // e.g. "1 089 925". Parse it back to a number so the page formats it
        // for the reader's locale rather than echoing GoatCounter's.
        const n = Number(String(data?.count_unique ?? '').replace(/\D/g, ''));
        if (Number.isFinite(n) && n > 0) setTotal(n);
      })
      .catch(() => { /* offline, blocked, or not configured: stay silent */ })
      .finally(() => clearTimeout(timeout));

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  if (total === null) return null;

  return (
    <p className="visitors">
      <span className="visitors__dot" aria-hidden="true" />
      <span className="visitors__count">{total.toLocaleString('en-US')}</span>
      {' '}
      {total === 1 ? t('visitors.one') : t('visitors.many')}
      <span className="visually-hidden">{'. ' + t('visitors.note')}</span>
    </p>
  );
}
