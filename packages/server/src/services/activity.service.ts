/**
 * Activity Service — Business logic layer
 *
 * Orchestrates:
 * 1. FSM state transitions (validate)
 * 2. Database updates
 * 3. EventEmitter pub/sub
 * 4. Agent execution (CLAUDE CALLS)
 *
 * Used by tRPC routers and subscriptions
 */

import { eq } from 'drizzle-orm';
import type { DbClient } from '../db/client.js';
import * as schema from '../db/schema.js';
import { transition, isValidState, type ActivityState } from '../state-machines/activity.fsm.js';
import { emitStateChange, emitOutput } from '../ws/activity-events.js';
import { getAgentExecutor } from './agent-executor.service.js';
import { getLocalAgentService } from './local-agent.service.js';

export class ActivityService {
  constructor(private db: DbClient) {}

  /**
   * Get activity by ID
   */
  async getActivity(id: string) {
    const [activity] = await this.db
      .select()
      .from(schema.activities)
      .where(eq(schema.activities.id, id));

    return activity || null;
  }

  /**
   * List all activities
   */
  async listActivities() {
    return this.db.select().from(schema.activities);
  }

  /**
   * Create new activity
   */
  async createActivity(data: {
    name: string;
    missionId: string;
    proxyProfileId?: string;
  }) {
    const id = crypto.randomUUID();

    const [activity] = await this.db
      .insert(schema.activities)
      .values({
        id,
        name: data.name,
        missionId: data.missionId,
        proxyProfileId: data.proxyProfileId ?? null,
        state: 'idle',
      })
      .returning();

    return activity;
  }

  /**
   * Start activity — FSM: idle → starting
   */
  async startActivity(activityId: string) {
    const activity = await this.getActivity(activityId);
    if (!activity) throw new Error(`Activity ${activityId} not found`);

    // FSM validation
    const result = transition(activity.state as ActivityState, { type: 'START' });
    if (!result.isValid) {
      throw new Error(result.error);
    }

    // Update DB
    const [updated] = await this.db
      .update(schema.activities)
      .set({
        state: 'starting',
        startedAt: new Date(),
      })
      .where(eq(schema.activities.id, activityId))
      .returning();

    // Emit event
    emitStateChange(
      activityId,
      activity.state as ActivityState,
      'starting'
    );

    return updated;
  }

  /**
   * Mark activity as running — FSM: starting → running
   */
  async markRunning(activityId: string) {
    const activity = await this.getActivity(activityId);
    if (!activity) throw new Error(`Activity ${activityId} not found`);

    const result = transition(activity.state as ActivityState, { type: 'STARTED' });
    if (!result.isValid) {
      throw new Error(result.error);
    }

    const [updated] = await this.db
      .update(schema.activities)
      .set({ state: 'running' })
      .where(eq(schema.activities.id, activityId))
      .returning();

    emitStateChange(activityId, 'starting', 'running');

    return updated;
  }

  /**
   * Stop activity — FSM: running → stopping
   */
  async stopActivity(activityId: string) {
    const activity = await this.getActivity(activityId);
    if (!activity) throw new Error(`Activity ${activityId} not found`);

    const result = transition(activity.state as ActivityState, { type: 'STOP' });
    if (!result.isValid) {
      throw new Error(result.error);
    }

    const [updated] = await this.db
      .update(schema.activities)
      .set({ state: 'stopping' })
      .where(eq(schema.activities.id, activityId))
      .returning();

    emitStateChange(
      activityId,
      activity.state as ActivityState,
      'stopping'
    );

    return updated;
  }

  /**
   * Mark activity as stopped — FSM: stopping → stopped
   */
  async markStopped(activityId: string) {
    const activity = await this.getActivity(activityId);
    if (!activity) throw new Error(`Activity ${activityId} not found`);

    const result = transition(activity.state as ActivityState, { type: 'STOPPED' });
    if (!result.isValid) {
      throw new Error(result.error);
    }

    const [updated] = await this.db
      .update(schema.activities)
      .set({
        state: 'stopped',
        stoppedAt: new Date(),
      })
      .where(eq(schema.activities.id, activityId))
      .returning();

    emitStateChange(activityId, 'stopping', 'stopped');

    return updated;
  }

  /**
   * Set error state — FSM: any → error
   */
  async setError(activityId: string, error: string) {
    const activity = await this.getActivity(activityId);
    if (!activity) throw new Error(`Activity ${activityId} not found`);

    const result = transition(activity.state as ActivityState, {
      type: 'ERROR',
      error,
    });
    if (!result.isValid) {
      throw new Error(result.error);
    }

    const [updated] = await this.db
      .update(schema.activities)
      .set({
        state: 'error',
        error,
      })
      .where(eq(schema.activities.id, activityId))
      .returning();

    emitStateChange(
      activityId,
      activity.state as ActivityState,
      'error',
      error
    );

    return updated;
  }

  /**
   * Reset error — FSM: error → idle
   */
  async resetError(activityId: string) {
    const activity = await this.getActivity(activityId);
    if (!activity) throw new Error(`Activity ${activityId} not found`);

    const result = transition(activity.state as ActivityState, { type: 'RESET' });
    if (!result.isValid) {
      throw new Error(result.error);
    }

    const [updated] = await this.db
      .update(schema.activities)
      .set({
        state: 'idle',
        error: null,
      })
      .where(eq(schema.activities.id, activityId))
      .returning();

    emitStateChange(activityId, 'error', 'idle');

    return updated;
  }

  /**
   * Emit output (for terminal/logs)
   */
  emitOutput(activityId: string, chunk: string) {
    emitOutput(activityId, chunk);
  }

  /**
   * Delete activity
   */
  async deleteActivity(activityId: string) {
    await this.db.delete(schema.activities).where(eq(schema.activities.id, activityId));
  }

  /**
   * Run agent task - EXECUTES CLAUDE or LOCAL MODEL
   * Called when activity transitions to running state
   */
  async runAgentTask(
    activityId: string,
    objective: string,
    context?: Record<string, unknown>,
    useLocal: boolean = false
  ) {
    const activity = await this.getActivity(activityId);
    if (!activity) throw new Error(`Activity ${activityId} not found`);

    try {
      if (useLocal) {
        // Use LM Studio (local model)
        const localService = getLocalAgentService();
        const isAvailable = await localService.isAvailable();

        if (!isAvailable) {
          emitOutput(
            activityId,
            `❌ LM Studio not available at http://localhost:1234\n`
          );
          await this.setError(
            activityId,
            "LM Studio unavailable - ensure LM Studio is running on port 1234"
          );
          return;
        }

        emitOutput(
          activityId,
          `🚀 Using LM Studio local model\n\nObjective: ${objective}\n\n`
        );

        const result = await localService.executeTask(
          {
            activityId,
            agentId: activity.name,
            objective,
          },
          (chunk: string) => {
            // Stream chunks to client in real-time
            emitOutput(activityId, chunk);
          }
        );

        if (result.success) {
          emitOutput(
            activityId,
            `\n\n✅ Local agent completed in ${result.duration}ms\n`
          );
        } else {
          emitOutput(activityId, `\n\n❌ Error: ${result.error}\n`);
          await this.setError(activityId, result.error || "Unknown error");
        }

        return result;
      } else {
        // Use Claude API
        const executor = getAgentExecutor();

        emitOutput(
          activityId,
          `🚀 Using Claude API\n\nObjective: ${objective}\n\n`
        );

        const result = await executor.executeTask({
          activityId,
          agentId: activity.name,
          missionName: activity.name,
          objective,
          context: context || null,
        });

        // Emit result to client
        emitOutput(activityId, `\n=== AGENT RESULT ===\n`);
        emitOutput(activityId, `Success: ${result.success}\n`);
        emitOutput(activityId, `Duration: ${result.duration}ms\n`);
        emitOutput(
          activityId,
          `Tokens: ${result.tokenUsage.input} input, ${result.tokenUsage.output} output\n`
        );
        emitOutput(activityId, `\n--- Output ---\n${result.output}\n`);

        if (result.thinking.length > 0) {
          emitOutput(
            activityId,
            `\n--- Thinking Process ---\n${result.thinking.join("\n")}\n`
          );
        }

        if (result.error) {
          emitOutput(activityId, `\n--- Error ---\n${result.error}\n`);
        }

        return result;
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      emitOutput(activityId, `\n❌ Agent execution failed: ${errorMessage}\n`);
      await this.setError(activityId, errorMessage);
      throw error;
    }
  }
}
