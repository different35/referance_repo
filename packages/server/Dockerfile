FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

# ── Dependency layer ─────────────────────────────────────
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
RUN pnpm install --frozen-lockfile --filter @swarm/server... || pnpm install --filter @swarm/server...

# ── Build layer ──────────────────────────────────────────
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server
RUN pnpm --filter @swarm/server build

# ── Runtime layer ────────────────────────────────────────
FROM node:20-alpine AS runtime
RUN apk add --no-cache tini
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

ENV NODE_ENV=production
COPY --from=build /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=build /app/packages/shared /app/packages/shared
COPY --from=build /app/packages/server/package.json /app/packages/server/
COPY --from=build /app/packages/server/dist /app/packages/server/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/packages/server/node_modules /app/packages/server/node_modules

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "packages/server/dist/index.js"]
