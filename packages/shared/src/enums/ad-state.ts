export const AD_STATES = [
  'draft',
  'generating',
  'review',
  'policy-checking',
  'approved',
  'rejected',
  'publishing',
  'published',
  'failed',
] as const;

export type AdState = (typeof AD_STATES)[number];

export const AD_TRANSITIONS = [
  'GENERATE',
  'GENERATION_COMPLETE',
  'EDIT',
  'CHECK_POLICY',
  'POLICY_PASS',
  'POLICY_FAIL',
  'PUBLISH',
  'PUBLISH_COMPLETE',
  'FAIL',
  'ARCHIVE',
] as const;

export type AdTransition = (typeof AD_TRANSITIONS)[number];
