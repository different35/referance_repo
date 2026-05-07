import { auth } from '../auth/auth.js';
import { db } from '../db/client.js';
import type { Context as HonoContext } from 'hono';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface TRPCContext {
  db: typeof db;
  user: User | null;
  session: Session | null;
  ipAddress: string | null;
}

export async function createContext(c: HonoContext): Promise<TRPCContext> {
  const headers = c.req.raw.headers;

  let user: User | null = null;
  let session: Session | null = null;

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
        role: (result.user.role ?? 'operator') as string,
      };
    }
  } catch {
    // Session geçersiz/yok — public olarak devam et
  }

  const ipAddress =
    c.req.header('cf-connecting-ip') ??
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    null;

  return { db, user, session, ipAddress };
}
