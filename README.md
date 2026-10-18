# Kvarta: React + Node.js

## Prerequisites

Requires Node.js 18 or newer.

Rename `.env.example` to `.env` and add your values.

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