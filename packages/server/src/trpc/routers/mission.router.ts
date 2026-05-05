import { router, protectedProcedure } from '../trpc.js';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema.js';

export const missionRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const missions = await ctx.db
      .select()
      .from(schema.missions);
    return missions;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [mission] = await ctx.db
        .select()
        .from(schema.missions)
        .where(eq(schema.missions.id, input.id));
      return mission || null;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        configSchema: z.record(z.unknown()).optional(),
        defaultConfig: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      const [mission] = await ctx.db
        .insert(schema.missions)
        .values({
          id,
          name: input.name,
          description: input.description ?? null,
          configSchema: input.configSchema ?? null,
          defaultConfig: input.defaultConfig ?? null,
        })
        .returning();
      return mission;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        configSchema: z.record(z.unknown()).optional(),
        defaultConfig: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description ?? null;
      if (data.configSchema !== undefined) updateData.configSchema = data.configSchema ?? null;
      if (data.defaultConfig !== undefined) updateData.defaultConfig = data.defaultConfig ?? null;

      const [mission] = await ctx.db
        .update(schema.missions)
        .set(updateData)
        .where(eq(schema.missions.id, id))
        .returning();
      return mission;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(schema.missions)
        .where(eq(schema.missions.id, input.id));
      return { success: true };
    }),
});
