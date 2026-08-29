import { useEffect, useState } from 'react';
import { useI18n } from '../hooks/useI18n.jsx';

// Live unique-visitor count.
//
// Three things this deliberately does NOT do:
//   - block rendering: it mounts after paint and fetches in the background,
//     so it can never affect LCP
//   - render a broken box: if the API is unreachable, or has not been deployed
//     yet, the component returns null and the footer simply has one fewer line
//   - render a zero: a counter showing 0 actively works against the site, so
//     nothing appears until there is a real number
//
// The API base comes from VITE_API_BASE at build time. With no value set the
// component short-circuits, which is what keeps the site deployable before the
// backend exists.
const API = import.meta.env?.VITE_API_BASE ?? '';

export default function VisitorCount() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!API) return;

    const controller = new AbortController();
    // A counter is not worth making anyone wait for.
    const timeout = setTimeout(() => controller.abort(), 4000);

    fetch(`${API}/api/visit`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data && typeof data.total === 'number' && data.total > 0) setStats(data); })
      .catch(() => { /* offline, blocked, cold-starting, or not deployed: stay silent */ })
      .finally(() => clearTimeout(timeout));

    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  if (!stats) return null;

  return (
    <p className="visitors">
      <span className="visitors__dot" aria-hidden="true" />
      <span className="visitors__count">{stats.total.toLocaleString('en-US')}</span>
      {' '}
      {stats.total === 1 ? t('visitors.one') : t('visitors.many')}
      {stats.today > 0 && (
        <span className="visitors__today"> &middot; {stats.today.toLocaleString('en-US')} {t('visitors.today')}</span>
      )}
      <span className="visually-hidden">{'. ' + t('visitors.note')}</span>
    </p>
  );
}
