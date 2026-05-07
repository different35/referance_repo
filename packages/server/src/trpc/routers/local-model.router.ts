import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { getLocalAgentService } from '../../services/local-agent.service.js';

export const localModelRouter = router({
  chat: publicProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string(),
      })),
      temperature: z.number().min(0).max(2).optional().default(0.7),
      maxTokens: z.number().min(1).max(8192).optional().default(2000),
    }))
    .mutation(async ({ input }) => {
      const service = getLocalAgentService();
      return service.chat(input.messages, input.temperature, input.maxTokens);
    }),

  checkHealth: publicProcedure.query(async () => {
    const service = getLocalAgentService();
    const available = await service.isAvailable();
    let models: string[] = [];
    if (available) {
      models = await service.getAvailableModels();
    }
    return { available, models };
  }),

  listModels: publicProcedure.query(async () => {
    const service = getLocalAgentService();
    return service.getAvailableModels();
  }),
});
