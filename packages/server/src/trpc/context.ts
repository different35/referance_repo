import type { Context as HonoContext } from 'hono';
import type { Role } from '@swarm/shared';
import { auth } from '../auth/auth.js';
import { db } from '../db/client.js';

export interface AuthedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthedSession {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface Context {
  db: typeof db;
  user: AuthedUser | null;
  session: AuthedSession | null;
  ipAddress: string | null;
}

export async function createContext(c: HonoContext): Promise<Context> {
  const headers = c.req.raw.headers;

  let user: AuthedUser | null = null;
  let session: AuthedSession | null = null;

  try {
    const result = await auth.api.getSession({ headers });
    if (result?.session && result.user) {
      session = {
        id: result.session.id,
        userId: result.session.userId,
        expiresAt: new Date(result.session.expiresAt),
      };
      user = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: ((result.user as { role?: string }).role ?? 'operator') as Role,
      };
    }
  } catch {
    // Session geçersiz/yok — public olarak devam et.
  }

  const ipAddress =
    c.req.header('cf-connecting-ip') ??
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    null;

  return { db, user, session, ipAddress };
}
