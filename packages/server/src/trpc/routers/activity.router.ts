import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../db/schema.js';

export const activityRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const activities = await ctx.db
      .select()
      .from(schema.activities);
    return activities;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [activity] = await ctx.db
        .select()
        .from(schema.activities)
        .where(eq(schema.activities.id, input.id));
      return activity || null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        missionId: z.string(),
        proxyProfileId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      const [activity] = await ctx.db
        .insert(schema.activities)
        .values({
          id,
          name: input.name,
          missionId: input.missionId,
          proxyProfileId: input.proxyProfileId ?? null,
          state: 'idle',
        })
        .returning();
      return activity;
    }),

  start: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [activity] = await ctx.db
        .update(schema.activities)
        .set({
          state: 'starting',
          startedAt: new Date(),
        })
        .where(eq(schema.activities.id, input.id))
        .returning();
      return { success: !!activity, activity };
    }),

  stop: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [activity] = await ctx.db
        .update(schema.activities)
        .set({
          state: 'stopped',
          stoppedAt: new Date(),
        })
        .where(eq(schema.activities.id, input.id))
        .returning();
      return { success: !!activity, activity };
    }),

  setError: protectedProcedure
    .input(z.object({ id: z.string(), error: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [activity] = await ctx.db
        .update(schema.activities)
        .set({
          state: 'error',
          error: input.error,
        })
        .where(eq(schema.activities.id, input.id))
        .returning();
      return { success: !!activity };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(schema.activities)
        .where(eq(schema.activities.id, input.id));
      return { success: true };
    }),
});
