import { router, protectedProcedure } from '../trpc.js';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema.js';

export const proxyRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const proxies = await ctx.db
      .select()
      .from(schema.proxyProfiles);
    return proxies;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [proxy] = await ctx.db
        .select()
        .from(schema.proxyProfiles)
        .where(eq(schema.proxyProfiles.id, input.id));
      return proxy || null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        protocol: z.enum(['http', 'https', 'socks5']),
        host: z.string().min(1),
        port: z.number().int().min(1).max(65535),
        username: z.string().optional(),
        password: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      // In production: encrypt password before storing
      const [proxy] = await ctx.db
        .insert(schema.proxyProfiles)
        .values({
          id,
          name: input.name,
          protocol: input.protocol,
          host: input.host,
          port: input.port,
          username: input.username ?? null,
          passwordEnc: input.password ? Buffer.from(input.password).toString('base64') : null,
        })
        .returning();
      return proxy;
    }),

  toggle: protectedProcedure
    .input(z.object({ id: z.string(), enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [proxy] = await ctx.db
        .update(schema.proxyProfiles)
        .set({ isActive: input.enabled })
        .where(eq(schema.proxyProfiles.id, input.id))
        .returning();
      return { success: !!proxy };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(schema.proxyProfiles)
        .where(eq(schema.proxyProfiles.id, input.id));
      return { success: true };
    }),
});
