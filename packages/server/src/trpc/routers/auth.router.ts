import { router, publicProcedure, protectedProcedure } from '../trpc.js';

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
