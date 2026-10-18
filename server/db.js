// SQLite storage for orders (Node's built-in node:sqlite, no native packages to install).
// All SQL lives in this file and always uses bound parameters (?), never string concatenation of user input.
import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { str } from './validate.js';

// Statuses are checked in code (not with a CHECK constraint) so adding one later does not need a table rebuild.
export const STATUSES = ['to deliver', 'in delivery', 'delivered'];
export const DEFAULT_STATUS = STATUSES[0];
export const SORTS = ['created_at', 'status'];
export const DIRS = ['asc', 'desc'];

export class BadParam extends Error {
  constructor(param) {
    super(`bad parameter: ${param}`);
    this.code = 'BAD_PARAM';
    this.param = param;
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS orders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT NOT NULL,                       -- ISO 8601, UTC: sorts correctly as text
  updated_at  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'to deliver',
  name        TEXT NOT NULL DEFAULT '',
  phone       TEXT NOT NULL,
  order_type  TEXT NOT NULL DEFAULT '',
  heard_from  TEXT NOT NULL DEFAULT '',
  comment     TEXT NOT NULL DEFAULT '',
  source      TEXT NOT NULL DEFAULT 'website',     -- 'website' (the form) or 'manual' (added in the admin)
  meta        TEXT NOT NULL DEFAULT '{}',          -- JSON: form_name, utm_*, gclid, referrer, landing_page, ip
  search_text TEXT NOT NULL DEFAULT ''             -- lowercased copy of the searchable fields (see below)
);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders (status, created_at);
`;

const COLUMNS = 'id, created_at, updated_at, status, name, phone, order_type, heard_from, comment, source';
const STATUS_RANK = `CASE status ${STATUSES.map((s, i) => `WHEN '${s}' THEN ${i}`).join(' ')} ELSE ${STATUSES.length} END`;
const META_KEYS = ['form_name', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'referrer', 'landing_page', 'ip'];

// SQLite's LIKE only ignores case for English letters, so "алекс" would not find "Алекс".
// Search therefore runs on a column that we lowercase ourselves (JS lowercases Cyrillic correctly).
// The phone is stored a second time as digits only, so "345 67" finds "+375 (29) 345-67-89".
export function searchText(o) {
  const digits = String(o.phone ?? '').replace(/\D/g, '');
  return [o.name, o.phone, digits, o.order_type, o.heard_from, o.comment].map((v) => String(v ?? '')).join(' ').toLowerCase();
}

const like = (term) => `%${term.replace(/[\\%_]/g, '\\$&')}%`;
const nowIso = () => new Date().toISOString();
const plain = (row) => (row ? { ...row } : null);          // node:sqlite rows have a null prototype

export function openDb(file) {
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);

  const stmt = {
    insert: db.prepare(`INSERT INTO orders (created_at, updated_at, status, name, phone, order_type, heard_from, comment, source, meta, search_text)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
    get: db.prepare(`SELECT ${COLUMNS} FROM orders WHERE id = ?`),
    update: db.prepare(`UPDATE orders SET name = ?, phone = ?, order_type = ?, heard_from = ?, comment = ?, search_text = ?, updated_at = ? WHERE id = ?`),
    setStatus: db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?'),
    remove: db.prepare('DELETE FROM orders WHERE id = ?'),
    counts: db.prepare('SELECT status, COUNT(*) AS c FROM orders GROUP BY status'),
  };

  const get = (id) => plain(stmt.get.get(id));

  function create(f, { source = 'website', status = DEFAULT_STATUS, createdAt = nowIso(), meta = {} } = {}) {
    const fields = {
      name: String(f.name ?? ''), phone: String(f.phone ?? ''), order_type: String(f.order_type ?? ''),
      heard_from: String(f.heard_from ?? ''), comment: String(f.comment ?? ''),
    };
    const info = stmt.insert.run(createdAt, createdAt, status, fields.name, fields.phone, fields.order_type,
      fields.heard_from, fields.comment, source, JSON.stringify(meta), searchText(fields));
    return get(Number(info.lastInsertRowid));
  }

  function update(id, f) {
    const cur = get(id);
    if (!cur) return null;
    const next = {
      name: String(f.name ?? cur.name), phone: String(f.phone ?? cur.phone), order_type: String(f.order_type ?? cur.order_type),
      heard_from: String(f.heard_from ?? cur.heard_from), comment: String(f.comment ?? cur.comment),
    };
    stmt.update.run(next.name, next.phone, next.order_type, next.heard_from, next.comment, searchText(next), nowIso(), id);
    return get(id);
  }

  function setStatus(id, status) {
    if (!STATUSES.includes(status)) throw new BadParam('status');
    return stmt.setStatus.run(status, nowIso(), id).changes ? get(id) : null;
  }

  const remove = (id) => stmt.remove.run(id).changes > 0;

  // q: every word must match (AND). "#12" = order number 12. A plain number also matches the order number.
  function list({ q = '', status = 'all', sort = 'created_at', dir = 'desc' } = {}) {
    if (status !== 'all' && !STATUSES.includes(status)) throw new BadParam('status');
    if (!SORTS.includes(sort)) throw new BadParam('sort');
    if (!DIRS.includes(dir)) throw new BadParam('dir');

    const where = [];
    const params = [];
    if (status !== 'all') {
      where.push('status = ?');
      params.push(status);
    }
    for (const term of String(q).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8)) {
      const byId = term.match(/^#(\d{1,12})$/);
      if (byId) {
        where.push('id = ?');
        params.push(Number(byId[1]));
        continue;
      }
      const alts = ["search_text LIKE ? ESCAPE '\\'"];
      params.push(like(term));
      if (/^\d{1,12}$/.test(term)) {
        alts.push('id = ?');
        params.push(Number(term));
      }
      const digits = term.replace(/\D/g, '');
      if (digits.length >= 3 && digits !== term && /^[\d\s+()\-.]+$/.test(term)) {
        alts.push("search_text LIKE ? ESCAPE '\\'");
        params.push(like(digits));
      }
      where.push(`(${alts.join(' OR ')})`);
    }

    // Only whitelisted fragments are put into the SQL text; user input only ever goes through "?".
    const d = dir === 'asc' ? 'ASC' : 'DESC';
    const orderBy = sort === 'status' ? `${STATUS_RANK} ${d}, created_at DESC, id DESC` : `created_at ${d}, id ${d}`;
    const sql = `SELECT ${COLUMNS} FROM orders ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${orderBy}`;
    return db.prepare(sql).all(...params).map(plain);
  }

  function counts() {
    const out = { all: 0 };
    for (const s of STATUSES) out[s] = 0;
    for (const r of stmt.counts.all()) {
      out[r.status] = (out[r.status] || 0) + r.c;
      out.all += r.c;
    }
    return out;
  }

  // One-time import of the old data/requests.jsonl (the version before SQLite). The file itself is left untouched.
  function importLegacyJsonl(file) {
    const { user_version: version } = db.prepare('PRAGMA user_version').get();
    if (version >= 1) return 0;
    let imported = 0;
    if (file && existsSync(file)) {
      db.exec('BEGIN');
      try {
        for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
          if (!line.trim()) continue;
          let r;
          try { r = JSON.parse(line); } catch { continue; }
          if (!r || typeof r !== 'object' || !str(r.phone, 40)) continue;
          const meta = {};
          for (const k of META_KEYS) if (r[k]) meta[k] = str(r[k], 500);
          const when = typeof r.received_at === 'string' && !Number.isNaN(Date.parse(r.received_at)) ? new Date(r.received_at).toISOString() : nowIso();
          create({ name: str(r.name, 80), phone: str(r.phone, 40), order_type: str(r.order_type, 100), heard_from: str(r.heard_from, 100), comment: str(r.comment, 1000) },
            { source: 'website', createdAt: when, meta });
          imported++;
        }
        db.exec('COMMIT');
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    }
    db.exec('PRAGMA user_version = 1');
    return imported;
  }

  return { get, create, update, setStatus, remove, list, counts, importLegacyJsonl, close: () => db.close() };
}
