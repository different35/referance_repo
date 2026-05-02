import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { getEnv } from './env.js';
import { logger } from './lib/logger.js';

const env = getEnv();
const app = new Hono();

app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: env.NODE_ENV === 'production'
      ? [`https://${env.PUBLIC_DOMAIN}`]
      : ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
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
