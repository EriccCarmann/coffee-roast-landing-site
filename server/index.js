// Entry point: reads .env, starts the server.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The database is Node's built-in SQLite, which needs Node 22.13+ (or 23.4+).
const [major, minor] = process.versions.node.split('.').map(Number);
if (!(major > 23 || (major === 23 && minor >= 4) || (major === 22 && minor >= 13))) {
  console.error(`This app needs Node.js 22.13 or newer (built-in SQLite). You are running ${process.version}.\nGet the current LTS from https://nodejs.org`);
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Tiny .env loader (so we don't need dotenv). Real environment variables win over the file.
const envFile = path.join(root, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith('#') && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const { createApp } = await import('./app.js');

const PORT = Number(process.env.PORT) || 3000;
const adminPassword = process.env.ADMIN_PASSWORD || '';
const { app, close } = createApp({
  distDir: path.join(root, 'dist'),
  dbPath: process.env.DB_PATH ? path.resolve(root, process.env.DB_PATH) : path.join(root, 'data', 'kvarta.db'),
  legacyJsonl: path.join(root, 'data', 'requests.jsonl'),
  adminPassword,
  trustProxy: process.env.TRUST_PROXY === '0' ? false : 1, // see README: TRUST_PROXY=0 when there is no proxy in front
  telegram: { token: process.env.TELEGRAM_BOT_TOKEN, chatId: process.env.TELEGRAM_CHAT_ID },
});

const server = app.listen(PORT, () => {
  console.log(`Kvarta: http://localhost:${PORT}`);
  if (!adminPassword) console.log('Admin area is OFF: set ADMIN_PASSWORD in .env to enable http://localhost:' + PORT + '/admin');
  else {
    console.log(`Admin area: http://localhost:${PORT}/admin`);
    if (adminPassword.length < 10) console.warn('Warning: ADMIN_PASSWORD is short. Use a long random one before putting the site online.');
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => { close(); process.exit(0); }));
}
