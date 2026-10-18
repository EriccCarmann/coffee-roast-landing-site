// Admin area: login (password from .env), session cookie, and the JSON API behind it.
// There is deliberately NO way to run SQL from here: every action is a fixed, validated operation.
import crypto from 'node:crypto';
import express from 'express';
import { BadParam, STATUSES } from './db.js';
import { cleanAdminOrder } from './validate.js';

export const COOKIE = 'kvarta_admin';

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
const samePassword = (given, expected) => crypto.timingSafeEqual(sha(given), sha(expected)); // constant time

function readCookie(req, name) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) {
      try { return decodeURIComponent(part.slice(i + 1).trim()); } catch { return null; }
    }
  }
  return null;
}

const queryStr = (v, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '');

export function createAdminRouter({ db, password, sessionHours = 12, maxLoginFailures = 8 }) {
  const router = express.Router();
  const sessions = new Map();   // token -> expiry time (in memory: a server restart logs everyone out)
  const failures = new Map();   // ip -> times of recent failed logins
  const FAIL_WINDOW = 15 * 60_000;

  setInterval(() => {
    const now = Date.now();
    for (const [token, exp] of sessions) if (exp < now) sessions.delete(token);
    for (const [ip, times] of failures) if (!times.some((t) => now - t < FAIL_WINDOW)) failures.delete(ip);
  }, 10 * 60_000).unref();

  const isLoggedIn = (req) => {
    const token = readCookie(req, COOKIE);
    const exp = token && sessions.get(token);
    return Boolean(exp && exp > Date.now());
  };

  // Nothing from here may be cached or indexed.
  router.use((_req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
    next();
  });

  // No password configured = the admin area is switched off (there is no default password).
  router.use((_req, res, next) => (password ? next() : res.status(503).json({ ok: false, error: 'admin_disabled' })));

  // CSRF guard, on top of the SameSite=Strict cookie: changes must be JSON (a cross-site form or fetch cannot send
  // that without a CORS preflight, which we never allow) and, if the browser says where it came from, it must be us.
  router.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') return next();
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
      return res.status(415).json({ ok: false, error: 'json_required' });
    }
    const origin = req.headers.origin;
    if (origin) {
      let ok = false;
      try { ok = new URL(origin).host === req.headers.host; } catch { /* malformed Origin */ }
      if (!ok) return res.status(403).json({ ok: false, error: 'bad_origin' });
    }
    next();
  });

  router.post('/login', (req, res) => {
    const now = Date.now();
    const recent = (failures.get(req.ip) || []).filter((t) => now - t < FAIL_WINDOW);
    if (recent.length >= maxLoginFailures) return res.status(429).json({ ok: false, error: 'too_many_attempts' });

    if (typeof req.body?.password !== 'string' || !samePassword(req.body.password, password)) {
      failures.set(req.ip, [...recent, now]);
      return res.status(401).json({ ok: false, error: 'invalid_password' });
    }
    failures.delete(req.ip);
    const token = crypto.randomBytes(32).toString('base64url');
    sessions.set(token, now + sessionHours * 3_600_000);
    res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'strict', secure: req.secure, path: '/', maxAge: sessionHours * 3_600_000 });
    res.json({ ok: true });
  });

  router.post('/logout', (req, res) => {
    const token = readCookie(req, COOKIE);
    if (token) sessions.delete(token);
    res.clearCookie(COOKIE, { path: '/' });
    res.json({ ok: true });
  });

  // Everything below needs a valid session.
  router.use((req, res, next) => (isLoggedIn(req) ? next() : res.status(401).json({ ok: false, error: 'unauthorized' })));

  router.get('/session', (_req, res) => res.json({ ok: true, statuses: STATUSES }));

  const idOf = (req) => (/^\d{1,12}$/.test(req.params.id) ? Number(req.params.id) : null);
  const notFound = (res) => res.status(404).json({ ok: false, error: 'not_found' });

  router.get('/orders', (req, res) => {
    try {
      const orders = db.list({
        q: queryStr(req.query.q),
        status: queryStr(req.query.status, 20) || 'all',
        sort: queryStr(req.query.sort, 20) || 'created_at',
        dir: queryStr(req.query.dir, 10) || 'desc',
      });
      res.json({ ok: true, orders, counts: db.counts() });
    } catch (err) {
      if (err instanceof BadParam) return res.status(400).json({ ok: false, error: 'bad_param', param: err.param });
      throw err;
    }
  });

  router.post('/orders', (req, res) => {
    const { value, errors } = cleanAdminOrder(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, error: 'validation', errors });
    res.status(201).json({ ok: true, order: db.create(value, { source: 'manual' }) });
  });

  router.put('/orders/:id', (req, res) => {
    const id = idOf(req);
    if (id === null) return notFound(res);
    const { value, errors } = cleanAdminOrder(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, error: 'validation', errors });
    const order = db.update(id, value);
    if (!order) return notFound(res);
    res.json({ ok: true, order });
  });

  router.patch('/orders/:id/status', (req, res) => {
    const id = idOf(req);
    if (id === null) return notFound(res);
    if (!STATUSES.includes(req.body?.status)) return res.status(400).json({ ok: false, error: 'bad_param', param: 'status' });
    const order = db.setStatus(id, req.body.status);
    if (!order) return notFound(res);
    res.json({ ok: true, order });
  });

  router.delete('/orders/:id', (req, res) => {
    const id = idOf(req);
    if (id === null || !db.remove(id)) return notFound(res);
    res.json({ ok: true });
  });

  return router;
}
