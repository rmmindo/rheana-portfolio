import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/server.js';
import { createStore, visitorHash, dayKey } from '../src/lib/visitors.js';

let store;
let app;

beforeEach(() => {
  store = createStore(':memory:');
  app = createApp({ store, origins: ['https://rheanamindo.me'] });
});

afterEach(() => store.close());

describe('privacy', () => {
  it('never stores a raw IP address', () => {
    store.visit('203.0.113.42', 'Mozilla/5.0');
    const rows = store._db.prepare('SELECT * FROM visitors').all();
    const dump = JSON.stringify(rows);
    expect(dump).not.toContain('203.0.113.42');
  });

  it('produces a stable hash within one day', () => {
    const a = visitorHash('1.2.3.4', 'UA', '2026-08-29');
    const b = visitorHash('1.2.3.4', 'UA', '2026-08-29');
    expect(a).toBe(b);
  });

  it('produces a different hash the next day, so a visitor is unlinkable across days', () => {
    const a = visitorHash('1.2.3.4', 'UA', '2026-08-29');
    const b = visitorHash('1.2.3.4', 'UA', '2026-08-30');
    expect(a).not.toBe(b);
  });

  it('separates different visitors on the same day', () => {
    const a = visitorHash('1.2.3.4', 'UA', '2026-08-29');
    const b = visitorHash('5.6.7.8', 'UA', '2026-08-29');
    expect(a).not.toBe(b);
  });

  it('uses a UTC day key', () => {
    expect(dayKey(new Date('2026-08-29T23:59:59Z'))).toBe('2026-08-29');
  });
});

describe('counting', () => {
  it('counts a first-time visitor once', () => {
    const r = store.visit('1.1.1.1', 'UA');
    expect(r).toMatchObject({ total: 1, today: 1, isNew: true });
  });

  it('does not double-count the same visitor on the same day', () => {
    store.visit('1.1.1.1', 'UA');
    const second = store.visit('1.1.1.1', 'UA');
    expect(second.isNew).toBe(false);
    expect(second.total).toBe(1);
  });

  it('counts distinct visitors separately', () => {
    store.visit('1.1.1.1', 'UA');
    store.visit('2.2.2.2', 'UA');
    expect(store.stats().total).toBe(2);
  });

  it('treats a different user agent from the same IP as a different visitor', () => {
    store.visit('1.1.1.1', 'Firefox');
    store.visit('1.1.1.1', 'Chrome');
    expect(store.stats().total).toBe(2);
  });

  it('never decreases the running total', () => {
    for (let i = 0; i < 25; i++) store.visit(`10.0.0.${i}`, 'UA');
    const before = store.stats().total;
    for (let i = 0; i < 25; i++) store.visit(`10.0.0.${i}`, 'UA');
    expect(store.stats().total).toBe(before);
  });

  it('keeps the lifetime total when old day rows are pruned', () => {
    store.visit('1.1.1.1', 'UA');
    store._db.prepare("UPDATE visitors SET day = '2020-01-01'").run();
    store.prune();
    expect(store.stats().total).toBe(1);
    expect(store.stats().today).toBe(0);
  });
});

describe('http', () => {
  it('reports health', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('records a visit and returns the totals', async () => {
    const res = await request(app).post('/api/visit');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.counted).toBe(true);
  });

  it('reads stats without recording a visit', async () => {
    await request(app).get('/api/stats');
    expect(store.stats().total).toBe(0);
  });

  it('allows the site origin', async () => {
    const res = await request(app).get('/api/stats').set('Origin', 'https://rheanamindo.me');
    expect(res.headers['access-control-allow-origin']).toBe('https://rheanamindo.me');
  });

  it('does not allow an unknown origin', async () => {
    const res = await request(app).get('/api/stats').set('Origin', 'https://evil.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rate limits a refresh loop', async () => {
    let limited = false;
    for (let i = 0; i < 40; i++) {
      const res = await request(app).post('/api/visit');
      if (res.status === 429) { limited = true; break; }
    }
    expect(limited).toBe(true);
  });

  it('returns json, not html, for an unknown route', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });

  it('does not advertise the server framework', async () => {
    const res = await request(app).get('/healthz');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
