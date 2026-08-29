// visitors.js
// Unique-visitor counting that stores no personal data.
//
// The privacy problem: counting UNIQUE visitors means recognising a returning
// one, and the obvious way to do that is to store their IP. An IP address is
// personal data under GDPR, and a portfolio counter is nowhere near a good
// enough reason to hold it.
//
// What this does instead: hash the IP and user agent together with a secret
// salt that ROTATES DAILY. The hash identifies a visitor within one day and
// becomes unlinkable the next, so the database can answer "how many distinct
// people today" without ever being able to answer "was this person here".
// The raw IP is never written to disk and never leaves the request handler.

import { createHash, randomBytes } from 'node:crypto';
import Database from 'better-sqlite3';

// A process-lifetime secret. Regenerating it on restart is deliberate: the salt
// is not meant to be recoverable, and a leaked database plus a known salt would
// let someone brute-force the small IPv4 space back to addresses.
const SECRET = process.env.VISITOR_SALT || randomBytes(32).toString('hex');

export const dayKey = (now = new Date()) => now.toISOString().slice(0, 10);

export function visitorHash(ip, userAgent, day = dayKey()) {
  return createHash('sha256')
    .update(`${SECRET}|${day}|${ip}|${userAgent}`)
    .digest('hex')
    .slice(0, 32);
}

export function createStore(file = process.env.DB_PATH || ':memory:') {
  const db = new Database(file);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS visitors (
      hash TEXT NOT NULL,
      day  TEXT NOT NULL,
      seen INTEGER NOT NULL,
      PRIMARY KEY (hash, day)
    );
    CREATE TABLE IF NOT EXISTS totals (
      key   TEXT PRIMARY KEY,
      value INTEGER NOT NULL
    );
    INSERT OR IGNORE INTO totals (key, value) VALUES ('unique_visitors', 0);
  `);

  const insert = db.prepare('INSERT OR IGNORE INTO visitors (hash, day, seen) VALUES (?, ?, ?)');
  const bumpTotal = db.prepare("UPDATE totals SET value = value + 1 WHERE key = 'unique_visitors'");
  const readTotal = db.prepare("SELECT value FROM totals WHERE key = 'unique_visitors'");
  const countToday = db.prepare('SELECT COUNT(*) AS n FROM visitors WHERE day = ?');
  const dropOld = db.prepare('DELETE FROM visitors WHERE day < ?');

  // The running total must only increase when the hash is genuinely new, so the
  // insert and the increment happen in one transaction. Without it, two
  // concurrent requests from the same visitor could both bump the counter.
  const record = db.transaction((hash, day) => {
    const result = insert.run(hash, day, Date.now());
    const isNew = result.changes === 1;
    if (isNew) bumpTotal.run();
    return isNew;
  });

  return {
    /** Records a visit. Returns { total, today, isNew }. */
    visit(ip, userAgent) {
      const day = dayKey();
      const isNew = record(visitorHash(ip, userAgent, day), day);
      return { total: readTotal.get().value, today: countToday.get(day).n, isNew };
    },

    /** Read-only snapshot, for a client that only wants to display the number. */
    stats() {
      return { total: readTotal.get().value, today: countToday.get(dayKey()).n };
    },

    /** Yesterday's hashes are already unlinkable; keeping them serves nothing. */
    prune(keepDays = 2) {
      const cutoff = new Date(Date.now() - keepDays * 86400000);
      return dropOld.run(dayKey(cutoff)).changes;
    },

    close() { db.close(); },
    _db: db,
  };
}
