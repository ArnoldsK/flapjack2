# Flapjack2

Monorepo: Discord bot (**app**) + React frontend (**web**), with shared types and tRPC API.

## Setup

```bash
pnpm install
```

- **App** needs `.env` at repo root with at least: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, and DB vars (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`). See `app/src/config/env.ts` for the full schema (Zod-validated).
- **Web** can use `VITE_API_BASE_URL` (default `http://localhost:3000`) to point at the app API.

## Development

From repo root:

```bash
pnpm dev
```

Runs both workspaces: **app** (Discord + API, watch) and **web** (Vite dev server). Use two terminals if you prefer one process per workspace.

- **Frontend (React):** http://localhost:5173
- **API (tRPC):** http://localhost:3000/trpc
- **GET /** on port 3000 returns 404 (only `/trpc` is mounted there).

## Build

```bash
pnpm build
```

Builds **app** (output in `app/dist/`, **gitignored**) and **web** (output in `web/dist/`, **gitignored**).

- **Development** already runs **pure TypeScript** (no build): `pnpm dev` uses nodemon + ts-node for the app and Vite for the web, so you don’t need to run a build step while developing.
- **Production**: A build step is recommended so Node runs compiled JS (faster and more robust). If you prefer not to build the app in prod, you can run it with `tsx src/index.ts` from the `app/` directory (path aliases require a loader like `tsconfig-paths` or running from a context that respects `tsconfig` paths).

## Production (PM2)

Build first, then run with PM2:

```bash
pnpm build
cd app && node dist/app/src/index.js    # or: pnpm start
```

Serve **web** static files (e.g. nginx, or a small static server). To run both under PM2 (from repo root after `pnpm build`):

```bash
pm2 start ecosystem.config.cjs
```

Or start manually: `pm2 start app/dist/app/src/index.js --name flapjack-app`, then serve `web/dist` (e.g. `npx serve web/dist -l 5173` or nginx).

- **App**: Discord bot + tRPC HTTP API (default port 3000).
- **Web**: Static SPA; point it at the app API via `VITE_API_BASE_URL` at build time.

## Structure

- **app**: Discord.js (slash commands, events), Knex/MySQL, **Fastify** + tRPC API, cron jobs (node-cron). Context: `AppContext` (env, client, db) passed everywhere.
- **web**: Vite + React, tRPC client, pages: Landing, Stats, Videos.
- **types**: Shared Zod schemas and types (`@project-types/*` in app and web).

Path aliases: `@app/*` → `app/src/*`, `@project-types/*` → `types/*` (see `tsconfig.base.json`). App build uses `tsc` + `tsc-alias`.
