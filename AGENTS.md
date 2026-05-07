# AGENTS.md — Swarm Panel

pnpm monorepo: `packages/{server,web,shared}`, `tools/{agents,vscode-bridge}`.

## Commands

```bash
pnpm dev            # All packages (parallel)
pnpm dev:server     # Server only (tsx watch)
pnpm dev:web        # Web only (vite)
pnpm build          # shared → server → web → vscode-bridge (ordered)
pnpm typecheck      # All packages
pnpm test           # All packages (vitest)
pnpm db:push        # Apply schema to SQLite (drizzle-kit push)
pnpm db:studio      # Drizzle Studio UI
```

## Ports

Server: **3000**, Web dev: **5173** (Vite default). In dev, Vite proxies `/api` and `/trpc` to `VITE_API_URL` (default `http://localhost:3000`). Server dotenv loads from repo root `.env`.

## Build Order

`shared` → `server` → `web` → `vscode-bridge`. Shared has no compiled output — consumed as raw `.ts` source via `workspace:*` dependency. Don't skip shared when building dependencies.

## TypeScript Gotchas

- `exactOptionalPropertyTypes: true` in base config. Optional props need explicit `| undefined` when the source value may be undefined. Use `?? undefined` to satisfy this.
- **Web uses `vue-tsc`**, not `tsc`. Running plain `tsc` on `packages/web` will miss `.vue` template errors.
- Server and shared use `tsc --noEmit` for typecheck.
- VSCode bridge does NOT extend base config — it uses CommonJS (`"module": "CommonJS"`).

## Drizzle ORM (SQLite)

- **Schema**: single file — `packages/server/src/db/schema.ts`
- **Migration**: `drizzle-kit push` (direct push, no migration files). Config at `packages/server/drizzle.config.ts`.
- **Inserts**: use `null`, never `undefined`. Pattern: `?? null` for optional fields.
- **Date fields**: `integer({ mode: 'timestamp_ms' })` — stores milliseconds as integer.
- **Boolean fields**: `integer({ mode: 'boolean' })` — stores 0/1 as integer.

## tRPC v11 RC

Using `@trpc/server@11.0.0-rc.660` (release candidate, not stable). Check `packages/server/src/trpc/routers/_app.ts` for the actual router surface — API may differ from stable docs.

## Server Entry (`packages/server/src/index.ts`)

- Hono + `@hono/trpc-server` adapter
- Auth: Better-Auth at `/api/auth/*`
- tRPC: `/trpc/*`
- SSE: `/events` and `/events/agents/:agentId`
- Health: `/health`
- CORS in dev: allows `localhost:5000, 5173, 4173`

## tools/agents — Hybrid pnpm/npm

Listed in `pnpm-workspace.yaml` but has its own `package-lock.json`. If `pnpm install` fails for this package, run `npm install` inside `tools/agents`. Uses `ts-node/esm` loader (not `tsx`). Has older `@anthropic-ai/sdk@0.27.1`.

## tools/vscode-bridge — CommonJS

VSCode extensions require CJS. Does NOT extend `tsconfig.base.json`. Output at `out/extension.js`.

## No Linting Config

`lint` scripts exist in package.json but there is no ESLint config. Running `pnpm lint` will fail. This is a known gap — don't add lint config unless asked.

## Conventions

- No `any` — always use explicit types
- No raw SQL — Drizzle ORM only
- No manual auth — Better-Auth handles it
- Zod validation for all API inputs and forms
- Drizzle inserts: `null` not `undefined`
- Tailwind dark theme: `slate-950/900/800` backgrounds, `yellow-400` (active), `blue-400` (info), `green-400` (running), `red-400` (error)

## Key Files

| File | Purpose |
|------|---------|
| `packages/server/src/db/schema.ts` | All DB tables |
| `packages/server/src/trpc/routers/_app.ts` | tRPC router assembly |
| `packages/server/src/env.ts` | Env validation (Zod) |
| `packages/server/src/auth/auth.ts` | Better-Auth config |
| `packages/shared/src/schemas/` | Shared Zod schemas |
| `packages/web/src/pages/Dashboard.vue` | Main UI |
| `packages/web/src/pages/Login.vue` | Auth UI |
| `tools/agents/check-status.js` | Phase completion check |

## Phase Tracking

```bash
node tools/agents/check-status.js
```

Phases 0-3 complete. Phase 4 (WebSocket live updates) is next.

## Further Reading

- `CLAUDE.md` — Full agent identity doc (Turkish), design system, do-not list
- `PROJECT_STATUS.md` — Detailed phase-by-phase status
- `.claude/skills/` — Claude Code skills for code generation tasks
