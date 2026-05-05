import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { trpcServer } from '@hono/trpc-server';
import { getEnv } from './env.js';
import { logger } from './lib/logger.js';
import { auth } from './auth/auth.js';
import { appRouter, type AppRouter } from './trpc/routers/_app.js';
import { createContext } from './trpc/context.js';

export type { AppRouter };

const env = getEnv();
const app = new Hono();

const allowedOrigins =
  env.NODE_ENV === 'production'
    ? env.PUBLIC_DOMAIN
      ? [`https://${env.PUBLIC_DOMAIN}`]
      : []
    : ['http://localhost:5173', 'http://localhost:4173'];

app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  })
);

// ── Better-Auth handler ──────────────────────────────────
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

// ── tRPC handler ─────────────────────────────────────────
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) =>
      createContext(c) as unknown as Promise<Record<string, unknown>>,
  })
);

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  })
);

app.get('/', (c) =>
  c.json({
    name: 'swarm-panel-server',
    version: '0.1.0',
    docs: '/health',
  })
);

const port = env.SERVER_PORT;

serve(
  {
    fetch: app.fetch,
    port,
    hostname: env.SERVER_HOST,
  },
  (info) => {
    logger.info(
      { port: info.port, address: info.address },
      `🚀 Swarm server başlatıldı: http://${env.SERVER_HOST}:${info.port}`
    );
  }
);
