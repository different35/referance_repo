import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/client.js';
import * as schema from '../db/schema.js';
import { getEnv } from '../env.js';

const env = getEnv();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins:
    env.NODE_ENV === 'production'
      ? env.PUBLIC_DOMAIN
        ? [`https://${env.PUBLIC_DOMAIN}`]
        : []
      : ['http://localhost:5173', 'http://localhost:4173'],
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'operator',
        input: false,
      },
    },
  },
});

export type Auth = typeof auth;
export type AuthSession = Auth['$Infer']['Session'];
