# Kvarta: React + Node.js

## Prerequisites

- Requires Node.js 18 or newer.
- Rename `.env.example` to `.env` and add your values.
- In order to receive messages in TG you need `TELEGRAM_CHAT_ID`. To get it:
  - Go to `https://t.me/[YOUR_BOT_NAME]`
  - Click start and send at least 1 message with any content.
  - Go to `https://api.telegram.org/bot[TELEGRAM_BOT_TOKEN]/getUpdates` and, if you sent the bot a message, you'll have a json, that will contain `chat:{ id: 1062489357, .. }`
  - Copy `id` to `TELEGRAM_CHAT_ID`
  - The bot will now send you orders from landing page.

## Run

```
npm install
npm run build     # builds the frontend into dist/
npm start         # http://localhost:3000
```

Development: `npm run dev` rebuilds on every change and restarts the server automatically
(refresh the browser after edits).

## Program Description

- The page can be displayed in 3 languages: russian, belarusian, english. 
- Every button has an anchor to the specific part of the page, except the form button. 
- Orders data is stored in SQLite database. SQLite was chosen for its structure and querying capacities. 
- In order to access admin page you need the correct password.
- For privacy reasons, TG bot's token is shared only with certain people.