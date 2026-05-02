export const ACTIVITY_STATES = [
  'idle',
  'starting',
  'running',
  'stopping',
  'stopped',
  'error',
] as const;

export type ActivityState = (typeof ACTIVITY_STATES)[number];

export const ACTIVITY_TRANSITIONS = [
  'START',
  'STARTED',
  'STOP',
  'STOPPED',
  'FAIL',
  'RESET',
] as const;

export type ActivityTransition = (typeof ACTIVITY_TRANSITIONS)[number];

export const ACTIVE_ACTIVITY_STATES: readonly ActivityState[] = [
  'starting',
  'running',
  'stopping',
];

export function isActiveState(state: ActivityState): boolean {
  return ACTIVE_ACTIVITY_STATES.includes(state);
}
