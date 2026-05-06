import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../db/schema.js';
import { ActivityService } from '../../services/activity.service.js';

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
    .input(
      z.object({
        id: z.string(),
        objective: z.string().optional(),
        context: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const service = new ActivityService(ctx.db);
      const activity = await service.startActivity(input.id);

      // Transition to running after starting
      await service.markRunning(input.id);

      // Execute agent task asynchronously (don't block response)
      if (input.objective) {
        service
          .runAgentTask(input.id, input.objective, input.context)
          .catch((err) => {
            console.error(`Agent task failed for activity ${input.id}:`, err);
          });
      }

      return { success: true, activity };
    }),

  stop: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = new ActivityService(ctx.db);
      const activity = await service.stopActivity(input.id);
      return { success: true, activity };
    }),

  setError: protectedProcedure
    .input(z.object({ id: z.string(), error: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = new ActivityService(ctx.db);
      const activity = await service.setError(input.id, input.error);
      return { success: true, activity };
    }),

  resetError: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = new ActivityService(ctx.db);
      const activity = await service.resetError(input.id);
      return { success: true, activity };
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
