// server.js
// The Express API behind rheanamindo.me.
//
// Currently serves the visitor counter. The chatbot mounts here later behind
// the same rate limiting and CORS policy.

import express from 'express';
import rateLimit from 'express-rate-limit';
import { createStore } from './lib/visitors.js';

export function createApp({ store = createStore(), origins } = {}) {
  const app = express();

  // Fly terminates TLS at its proxy, so the client IP arrives in
  // X-Forwarded-For. Trusting exactly one hop is deliberate: trusting all hops
  // would let a client forge the header and inflate the counter.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  const allowed = new Set(
    origins ?? (process.env.ALLOWED_ORIGINS ?? 'https://rheanamindo.me,https://www.rheanamindo.me')
      .split(',').map(s => s.trim()).filter(Boolean)
  );

  app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin && allowed.has(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Vary', 'Origin');
    }
    res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.get('/healthz', (req, res) => res.json({ ok: true }));

  // A visitor can only be counted a handful of times a minute. This bounds
  // both accidental double-counting and a trivial refresh-loop attack.
  const limiter = rateLimit({
    windowMs: 60_000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Try again shortly.' },
  });

  app.post('/api/visit', limiter, (req, res) => {
    const ip = req.ip ?? 'unknown';
    const ua = req.get('user-agent') ?? 'unknown';
    const { total, today, isNew } = store.visit(ip, ua);
    res.json({ total, today, counted: isNew });
  });

  app.get('/api/stats', limiter, (req, res) => res.json(store.stats()));

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));

  // Never leak a stack trace to a public endpoint.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[api]', err);
    res.status(500).json({ error: 'Internal error' });
  });

  return app;
}

// Only listen when run directly, so tests can import createApp without a port.
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const store = createStore();
  const app = createApp({ store });
  const port = Number(process.env.PORT) || 8080;

  // Yesterday's hashes are unlinkable and serve no purpose. Prune hourly.
  const timer = setInterval(() => store.prune(), 3600_000);
  timer.unref?.();

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[api] listening on ${port}`);
  });

  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => {
      server.close(() => { store.close(); process.exit(0); });
    });
  }
}
