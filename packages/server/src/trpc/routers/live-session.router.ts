/**
 * Live Session Router — tRPC subscriptions for real-time updates
 *
 * Uses WebSocket (via tRPC's observable pattern)
 * Clients subscribe → receive events as they happen
 */

import { router, protectedProcedure } from '../trpc.js';
import { z } from 'zod';
import { observable } from '@trpc/server/observable';
import {
  streamStateChanges,
  streamOutput,
  activityEvents,
} from '../../ws/activity-events.js';
import { ActivityService } from '../../services/activity.service.js';

export const liveSessionRouter = router({
  /**
   * Subscribe to activity state changes
   *
   * Client call: trpc.liveSession.stateChanges.subscribe({ activityId: 'xxx' })
   *
   * Yields: { activityId, oldState, newState, error?, timestamp }
   */
  stateChanges: protectedProcedure
    .input(z.object({ activityId: z.string() }))
    .subscription(({ ctx, input }) => {
      return observable((emit) => {
        const unsubscribe = activityEvents.onStateChange(input.activityId, (event) => {
          emit.next(event);
        });

        // Cleanup on unsubscribe
        return unsubscribe;
      });
    }),

  /**
   * Subscribe to activity output (terminal/logs)
   *
   * Client call: trpc.liveSession.output.subscribe({ activityId: 'xxx' })
   *
   * Yields: { activityId, chunk, timestamp }
   */
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

  /**
   * List active listeners for debugging
   */
  getListenerCount: protectedProcedure
    .input(z.object({ activityId: z.string() }))
    .query(({ input }) => {
      return {
        activityId: input.activityId,
        listenerCount: activityEvents.getListenerCount(input.activityId),
      };
    }),

  /**
   * Trigger activity started (for testing state transitions)
   * In production, execa/PTY would do this automatically
   */
  triggerStarted: protectedProcedure
    .input(z.object({ activityId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = new ActivityService(ctx.db);

      try {
        const activity = await service.markRunning(input.activityId);
        return { success: true, activity };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to mark running');
      }
    }),

  /**
   * Trigger activity stopped (for testing)
   */
  triggerStopped: protectedProcedure
    .input(z.object({ activityId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const service = new ActivityService(ctx.db);

      try {
        const activity = await service.markStopped(input.activityId);
        return { success: true, activity };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to mark stopped');
      }
    }),

  /**
   * Emit test output (for testing)
   */
  testOutput: protectedProcedure
    .input(z.object({ activityId: z.string(), message: z.string() }))
    .mutation(({ ctx, input }) => {
      const service = new ActivityService(ctx.db);
      service.emitOutput(input.activityId, input.message);
      return { success: true };
    }),
});
