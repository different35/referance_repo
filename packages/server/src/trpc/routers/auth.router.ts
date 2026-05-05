import { router, publicProcedure, protectedProcedure } from '../trpc.js';

/**
 * Login/logout/register Better-Auth'un kendi REST endpoint'leri ile yapılır:
 *   POST /api/auth/sign-in/email
 *   POST /api/auth/sign-up/email
 *   POST /api/auth/sign-out
 *
 * Burada sadece tRPC üzerinden okunan auth durumu sağlanır:
 *   - me: oturumu açık kullanıcının özet bilgisi
 *   - hasSession: hızlı kontrol
 */
export const authRouter = router({
  hasSession: publicProcedure.query(({ ctx }) => ({
    hasSession: ctx.user !== null,
  })),

  me: protectedProcedure.query(({ ctx }) => ({
    user: {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
    },
    session: {
      id: ctx.session.id,
      expiresAt: ctx.session.expiresAt.toISOString(),
    },
  })),
});
