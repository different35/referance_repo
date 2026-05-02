import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  SERVER_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  SERVER_HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().default('file:./data/swarm.db'),
  BETTER_AUTH_SECRET: z.string().min(16, 'BETTER_AUTH_SECRET en az 16 karakter olmalı'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),
  ANTHROPIC_API_KEY: z.string().optional(),
  VSCODE_BRIDGE_PORT: z.coerce.number().int().default(3001),
  VSCODE_BRIDGE_API_KEY: z.string().min(8).optional(),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
  PUBLIC_DOMAIN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Geçersiz environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Environment validation failed');
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}
