import express from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHONE_RE } from '../src/data/constants.js';
import { SOURCES } from '../src/data/sources.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const envFile = path.join(root, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith('#') && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(root, 'data', 'requests.jsonl');
const ATTRIBUTION = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'referrer', 'landing_page'];

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '10kb' }));

// At most 5 requests per minute per IP (in memory, resets on restart).
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function validate(body = {}) {
  const phone = str(body.phone, 40);
  const digits = phone.replace(/\D/g, '');
  const errors = {};
  if (!PHONE_RE.test(phone)) errors.phone = 'invalid';
  if (body.agreement !== 'yes') errors.agreement = 'required';

  const clean = {
    form_name: str(body.form_name, 120),
    order_type: str(body.order_type, 100),
    name: str(body.name, 60),
    phone,
    comment: str(body.comment, 300),
  };
  for (const key of ATTRIBUTION) clean[key] = str(body[key], 500);
  return { errors, clean };
}

async function notifyTelegram(r) {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chat } = process.env;
  if (!token || !chat) return;
  const text = [
    r.form_name || 'Новая заявка',
    `Заказ: ${r.order_type}`,
    `Имя: ${r.name || '—'}`,
    `Телефон: ${r.phone}`,
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

app.post('/api/requests', async (req, res) => {
  if (rateLimited(req.ip)) return res.status(429).json({ ok: false, error: 'too_many_requests' });

  const { errors, clean } = validate(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });

  const record = { ...clean, received_at: new Date().toISOString(), ip: req.ip };
  try {
    await mkdir(path.dirname(DATA_FILE), { recursive: true });
    await appendFile(DATA_FILE, JSON.stringify(record) + '\n', 'utf8'); // the request is saved: that's what matters
  } catch (err) {
    console.error('Could not save the request:', err);
    return res.status(500).json({ ok: false, error: 'storage_failed' });
  }
  // A failed notification must not fail the request: it is already in the file.
  notifyTelegram(record).catch((err) => console.error('Notification not sent:', err.message));
  res.status(201).json({ ok: true });
});

app.use('/api', (_req, res) => res.status(404).json({ ok: false, error: 'not_found' }));
app.use(express.static(path.join(root, 'dist')));

app.listen(PORT, () => console.log(`Kvarta: http://localhost:${PORT}`));
