/**
 * Activity State Machine — Pure function (no I/O, no imports)
 *
 * State transitions for activity lifecycle:
 * idle → starting → running → stopping → stopped
 *     ↘ error (from any state) → idle (reset)
 */

export type ActivityState = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';

export type ActivityEvent =
  | { type: 'START' }
  | { type: 'STARTED' }
  | { type: 'STOP' }
  | { type: 'STOPPED' }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' };

export interface FSMResult {
  nextState: ActivityState;
  isValid: boolean;
  error?: string;
}

/**
 * Pure state transition function
 * Returns next state + validity + error message if invalid
 */
export function transition(state: ActivityState, event: ActivityEvent): FSMResult {
  // Validate current state
  if (!isValidState(state)) {
    return { nextState: state, isValid: false, error: `Invalid state: ${state}` };
  }

  // State machine logic
  switch (state) {
    case 'idle':
      if (event.type === 'START') {
        return { nextState: 'starting', isValid: true };
      }
      if (event.type === 'ERROR') {
        return { nextState: 'error', isValid: true };
      }
      break;

    case 'starting':
      if (event.type === 'STARTED') {
        return { nextState: 'running', isValid: true };
      }
      if (event.type === 'ERROR') {
        return { nextState: 'error', isValid: true };
      }
      if (event.type === 'STOP') {
        return { nextState: 'stopping', isValid: true };
      }
      break;

    case 'running':
      if (event.type === 'STOP') {
        return { nextState: 'stopping', isValid: true };
      }
      if (event.type === 'ERROR') {
        return { nextState: 'error', isValid: true };
      }
      break;

    case 'stopping':
      if (event.type === 'STOPPED') {
        return { nextState: 'stopped', isValid: true };
      }
      if (event.type === 'ERROR') {
        return { nextState: 'error', isValid: true };
      }
      break;

    case 'stopped':
      if (event.type === 'START') {
        return { nextState: 'starting', isValid: true };
      }
      if (event.type === 'RESET') {
        return { nextState: 'idle', isValid: true };
      }
      break;

    case 'error':
      if (event.type === 'RESET') {
        return { nextState: 'idle', isValid: true };
      }
      break;
  }

  // Invalid transition
  return {
    nextState: state,
    isValid: false,
    error: `Cannot transition from ${state} on ${event.type}`,
  };
}

/**
 * Check if a state is valid
 */
export function isValidState(state: string): state is ActivityState {
  return ['idle', 'starting', 'running', 'stopping', 'stopped', 'error'].includes(state);
}

/**
 * Check if direct transition exists
 */
export function isValidTransition(from: ActivityState, to: ActivityState): boolean {
  const result = transition(from, { type: 'START' } as ActivityEvent);
  return result.isValid && result.nextState === to;
}

/**
 * Get all valid next states
 */
export function getValidNextStates(state: ActivityState): ActivityState[] {
  const events: ActivityEvent[] = [
    { type: 'START' },
    { type: 'STARTED' },
    { type: 'STOP' },
    { type: 'STOPPED' },
    { type: 'ERROR', error: 'test' },
    { type: 'RESET' },
  ];

  return events
    .map((e) => transition(state, e))
    .filter((r) => r.isValid && r.nextState !== state)
    .map((r) => r.nextState)
    .filter((s, i, arr) => arr.indexOf(s) === i); // unique
}
