/**
 * Activity Events — In-process EventEmitter
 *
 * Singleton pattern. tRPC subscriptions subscribe to these events.
 * When activity state changes, this emits; subscriptions receive it via WebSocket.
 */

import { EventEmitter } from 'events';
import type { ActivityState } from '../state-machines/activity.fsm.js';

export interface ActivityStateChangeEvent {
  activityId: string;
  oldState: ActivityState;
  newState: ActivityState;
  error?: string | null;
  timestamp: number;
}

export interface ActivityOutputEvent {
  activityId: string;
  chunk: string;
  timestamp: number;
}

class ActivityEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Support many WebSocket clients
  }

  /**
   * Emit activity state change
   */
  stateChanged(event: ActivityStateChangeEvent) {
    this.emit('activity:state-changed', event);
  }

  /**
   * Emit activity output (terminal/log)
   */
  output(event: ActivityOutputEvent) {
    this.emit('activity:output', event);
  }

  /**
   * Subscribe to state changes for specific activity
   */
  onStateChange(
    activityId: string,
    callback: (event: ActivityStateChangeEvent) => void
  ): () => void {
    const handler = (event: ActivityStateChangeEvent) => {
      if (event.activityId === activityId) {
        callback(event);
      }
    };

    this.on('activity:state-changed', handler);

    // Return unsubscribe function
    return () => this.off('activity:state-changed', handler);
  }

  /**
   * Subscribe to output for specific activity
   */
  onOutput(
    activityId: string,
    callback: (event: ActivityOutputEvent) => void
  ): () => void {
    const handler = (event: ActivityOutputEvent) => {
      if (event.activityId === activityId) {
        callback(event);
      }
    };

    this.on('activity:output', handler);

    // Return unsubscribe function
    return () => this.off('activity:output', handler);
  }

  /**
   * Get listener count
   */
  getListenerCount(activityId: string): number {
    const stateListeners = this.listeners('activity:state-changed').filter((l) => {
      // Count handlers that might be for this activity
      return typeof l === 'function';
    }).length;

    const outputListeners = this.listeners('activity:output').filter((l) => {
      return typeof l === 'function';
    }).length;

    return stateListeners + outputListeners;
  }
}

// Singleton instance
export const activityEvents = new ActivityEventEmitter();

/**
 * Type-safe emit wrappers (for use in services)
 */
export function emitStateChange(
  activityId: string,
  oldState: ActivityState,
  newState: ActivityState,
  error?: string
) {
  activityEvents.stateChanged({
    activityId,
    oldState,
    newState,
    error: error ?? null,
    timestamp: Date.now(),
  });
}

export function emitOutput(activityId: string, chunk: string) {
  activityEvents.output({
    activityId,
    chunk,
    timestamp: Date.now(),
  });
}

/**
 * Get stream of state changes (for subscriptions)
 * Yields events as they come
 */
export async function* streamStateChanges(
  activityId: string
): AsyncGenerator<ActivityStateChangeEvent> {
  let unsubscribe: (() => void) | null = null;
  let resolver: ((event: ActivityStateChangeEvent) => void) | null = null;
  let promise: Promise<ActivityStateChangeEvent> | null = null;

  unsubscribe = activityEvents.onStateChange(activityId, (event) => {
    if (resolver) {
      const r = resolver;
      resolver = null;
      promise = null;
      r(event);
    }
  });

  try {
    while (true) {
      promise = new Promise((resolve) => {
        resolver = resolve;
      });
      yield await promise;
    }
  } finally {
    if (unsubscribe) {
      unsubscribe();
    }
  }
}

/**
 * Get stream of output (for subscriptions)
 */
export async function* streamOutput(activityId: string): AsyncGenerator<ActivityOutputEvent> {
  let unsubscribe: (() => void) | null = null;
  let resolver: ((event: ActivityOutputEvent) => void) | null = null;
  let promise: Promise<ActivityOutputEvent> | null = null;

  unsubscribe = activityEvents.onOutput(activityId, (event) => {
    if (resolver) {
      const r = resolver;
      resolver = null;
      promise = null;
      r(event);
    }
  });

  try {
    while (true) {
      promise = new Promise((resolve) => {
        resolver = resolve;
      });
      yield await promise;
    }
  } finally {
    if (unsubscribe) {
      unsubscribe();
    }
  }
}
