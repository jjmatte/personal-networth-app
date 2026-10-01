# Personal Net Worth and Investing App

A self-hosted web app for tracking investments — holdings, purchases,
user-defined allocation categories and targets — and computing allocation,
drift, and gains, while building the value history a spreadsheet can't.

**Your data stays in your own database.** This repository contains code only.
Point the app at your own SQLite file (or another supported database) via the
`DATABASE_URL` environment variable; no real financial data is ever committed.

## Stack

SvelteKit (Svelte 5) · TypeScript · Drizzle ORM · SQLite · Tailwind CSS ·
Chart.js · Vitest · Playwright.

## Getting started

```bash
cp .env.example .env        # points at data/app.db by default
npm install
npm run db:migrate          # create the schema
npm run dev                 # http://localhost:5173
```

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm run preview` — production build
- `npm test` — unit tests (Vitest)
- `npm run test:e2e` — end-to-end tests (Playwright)
- `npm run db:generate` / `npm run db:migrate` — Drizzle migrations
- `npm run db:seed` — load fictional example data

## License

MIT — see [LICENSE](LICENSE).
