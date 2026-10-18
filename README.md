# Kvarta: React + Node.js

Landing page of the "Кварта" roastery, ported from `coffee.html`.
React frontend (bundled with esbuild, no Vite) + Express server with a form endpoint.

## Run

Requires Node.js 18 or newer.

```
npm install
npm run build     # builds the frontend into dist/
npm start         # http://localhost:3000
```

Development: `npm run dev` rebuilds on every change and restarts the server automatically
(refresh the browser after edits).

## How it fits together

- `src/` is the React app. One component per section in `src/components/`, CSS per section in `src/styles/`
  (copied unchanged from the HTML; `global.css` adds what Tilda used to provide).
- Languages: `src/i18n/locales/{ru,by,en}.json`. Russian is the default and the fallback.
  Use `<T k="section.key" />` in JSX or `t('section.key')` for attributes.
- Prices and order options: `src/data/products.js` (single source of truth).
- `server/index.js` serves `dist/` and handles `POST /api/requests`: validates, rate-limits,
  appends the request to `data/requests.jsonl`, and optionally sends it to Telegram.
- Optional Telegram notifications: copy `.env.example` to `.env` and fill in the two variables.

## Still to do

- Images and icons still load from Tilda's CDN: download them into `public/images/`
  and update `src/data/images.js`.
- Fonts: `global.css` uses system fonts; set `--t-text-font` / `--t-headline-font` to your own.
