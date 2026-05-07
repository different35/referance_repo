import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema.js';

export const skillsRouter = router({
  listByAgent: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const skills = await ctx.db
        .select()
        .from(schema.agentSkills)
        .where(eq(schema.agentSkills.agentId, input.agentId));
      return skills;
    }),

  execute: publicProcedure
    .input(z.object({
      skillId: z.string(),
      inputs: z.record(z.string()),
      useLocal: z.boolean().optional().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const [skill] = await ctx.db
        .select()
        .from(schema.agentSkills)
        .where(eq(schema.agentSkills.id, input.skillId))
        .limit(1);

      if (!skill) {
        return { success: false, error: 'Skill bulunamadi' };
      }

      let prompt = skill.promptTemplate;
      for (const [key, value] of Object.entries(input.inputs)) {
        prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      if (input.useLocal) {
        const { getLocalAgentService } = await import('../../services/local-agent.service.js');
        const localService = getLocalAgentService();
        const result = await localService.executeTask({
          activityId: `skill-${Date.now()}`,
          agentId: skill.agentId,
          objective: prompt,
        }, () => {});

        return {
          success: result.success,
          skillId: input.skillId,
          output: result.output,
          duration: result.duration,
          error: result.error,
        };
      }

      return {
        success: true,
        skillId: input.skillId,
        prompt,
      };
    }),
});