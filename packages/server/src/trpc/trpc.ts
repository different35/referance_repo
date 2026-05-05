import { initTRPC, TRPCError } from '@trpc/server';
import type { Context } from './context.js';
import type { Role } from '@swarm/shared';
import { hasRole } from '@swarm/shared';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        cause: error.cause instanceof Error ? error.cause.message : undefined,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;

const requireUser = middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Önce giriş yapın' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireUser);

export function requireRole(required: Role) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!hasRole(ctx.user.role, required)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Bu işlem için ${required} yetkisi gerekli`,
      });
    }
    return next({ ctx });
  });
}
