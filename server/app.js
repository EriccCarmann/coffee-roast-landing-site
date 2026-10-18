import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { SOURCES } from '../src/data/sources.js'; // same list as the form's "where did you hear about us?"
import { openDb } from './db.js';
import { createAdminRouter } from './admin.js';
import { phoneIsValid, str } from './validate.js';
import { PHONE_RE } from '../src/data/constants.js';

const ATTRIBUTION = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'referrer', 'landing_page'];

export function createApp(config) {
  const {
    distDir, dbPath, legacyJsonl, adminPassword = '', telegram = {},
    publicRateLimit = 5, maxLoginFailures = 8, trustProxy = 1, log = console,
  } = config;

  const db = openDb(dbPath);
  const imported = db.importLegacyJsonl(legacyJsonl);
  if (imported) log.log(`Imported ${imported} request(s) from the old requests.jsonl into SQLite (the file was left untouched).`);

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy); // 1 = behind one reverse proxy (hosting/nginx); false = server is reached directly
  app.use(express.json({ limit: '10kb' }));

  // ---- public form: at most N requests per minute per IP (in memory, resets on restart) ----
  const hits = new Map();
  const rateLimited = (ip) => {
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > publicRateLimit;
  };

  function validate(body = {}) {
    const phone = str(body.phone, 40);
    const errors = {};
    if (!PHONE_RE.test(phone)) errors.phone = 'invalid';
    if (body.agreement !== 'yes') errors.agreement = 'required';

    const clean = {
      form_name: str(body.form_name, 120),
      order_type: str(body.order_type, 100),
      name: str(body.name, 60),
      phone,
      comment: str(body.comment, 300),
      heard_from: SOURCES.some((o) => o.value === body.heard_from) ? body.heard_from : '', // optional; unknown values dropped
    };
    for (const key of ATTRIBUTION) clean[key] = str(body[key], 500);
    return { errors, clean };
  }

  function formatBelarusPhone(input) {
    let digits = input.replace(/\D/g, "");

    if (digits.startsWith("375")) {
      digits = digits.slice(3);
    }

    const match = digits.match(/^(29|44|17)(\d{3})(\d{2})(\d{2})$/);
    if (!match) return null;

    return `+375 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
  }

  async function notifyTelegram(r) {
    const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chat } = process.env;
    if (!token || !chat) return;
    const text = [
      r.form_name || 'Новая заявка',
      `Заказ: ${r.order_type}`,
      `Имя: ${r.name || '—'}`,
      `Телефон: ${formatBelarusPhone(r.phone)}`,
      r.heard_from && `Откуда узнали: ${r.heard_from}`,
      r.comment && `Комментарий: ${r.comment}`,
      r.utm_source && `Источник: ${r.utm_source} / ${r.utm_medium} / ${r.utm_campaign}`,
    ].filter(Boolean).join('\n');
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text }),
    });
    if (!res.ok) throw new Error(`Telegram responded with ${res.status}`);
  }

  app.post('/api/requests', (req, res) => {
    if (rateLimited(req.ip)) return res.status(429).json({ ok: false, error: 'too_many_requests' });

    const { errors, clean } = validate(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });

    const meta = { ip: req.ip };
    for (const key of ['form_name', ...ATTRIBUTION]) if (clean[key]) meta[key] = clean[key];
    let order;
    try {
      order = db.create(clean, { source: 'website', meta }); // new orders always start as "to deliver"
    } catch (err) {
      log.error('Could not save the request:', err);
      return res.status(500).json({ ok: false, error: 'storage_failed' });
    }
    // A failed notification must not fail the request: it is already in the database.
    notifyTelegram({ ...clean, id: order.id }).catch((err) => log.error('Notification not sent:', err.message));
    res.status(201).json({ ok: true });
  });

  // ---- admin ----
  app.use('/api/admin', createAdminRouter({ db, password: adminPassword, maxLoginFailures }));

  app.get(['/admin', '/admin/'], (_req, res) => {
    const file = path.join(distDir, 'admin.html');
    if (!existsSync(file)) return res.status(404).type('text').send('Admin page is not built yet: run npm run build');
    res.set({
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
      'X-Frame-Options': 'DENY', // nobody may put the admin page in a frame (clickjacking)
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    });
    res.sendFile(file);
  });

  app.use('/api', (_req, res) => res.status(404).json({ ok: false, error: 'not_found' }));
  app.use(express.static(distDir));

  // Malformed JSON etc. on the API: answer with JSON, not an HTML error page.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (req.path.startsWith('/api')) return res.status(err.status || 500).json({ ok: false, error: err.status === 400 ? 'bad_request' : 'server_error' });
    next(err);
  });

  return { app, db, close: () => db.close() };
}
