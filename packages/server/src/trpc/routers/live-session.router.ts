import { router, protectedProcedure } from '../trpc.js';
import { z } from 'zod';
import { observable } from '@trpc/server/observable';
import { activityEvents } from '../../ws/activity-events.js';
import { ActivityService } from '../../services/activity.service.js';

export const liveSessionRouter = router({
  stateChanges: protectedProcedure
    .input(z.object({ activityId: z.string() }))
    .subscription(({ ctx, input }) => {
      return observable((emit) => {
        const unsubscribe = activityEvents.onStateChange(input.activityId, (event) => {
          emit.next(event);
        });
        return unsubscribe;
      });
    }),

  output: protectedProcedure
    .input(z.object({ activityId: z.string() }))
    .subscription(({ ctx, input }) => {
      return observable((emit) => {
        const unsubscribe = activityEvents.onOutput(input.activityId, (event) => {
          emit.next(event);
        });
        return unsubscribe;
      });
    }),

  getListenerCount: protectedProcedure
    .input(z.object({ activityId: z.string() }))
    .query(({ input }) => {
      return {
        activityId: input.activityId,
        listenerCount: activityEvents.getListenerCount(input.activityId),
      };
    }),

  triggerStarted: protectedProcedure
    .input(z.object({ activityId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = new ActivityService(ctx.db);
      try {
        const activity = await service.markRunning(input.activityId);
        return { success: true, activity };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed');
      }
    }),

  triggerStopped: protectedProcedure
    .input(z.object({ activityId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = new ActivityService(ctx.db);
      try {
        const activity = await service.markStopped(input.activityId);
        return { success: true, activity };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed');
      }
    }),

  testOutput: protectedProcedure
    .input(z.object({ activityId: z.string(), message: z.string() }))
    .mutation(({ ctx, input }) => {
      const service = new ActivityService(ctx.db);
      service.emitOutput(input.activityId, input.message);
      return { success: true };
    }),
}) as any;
