import { z } from 'zod';
import { ACTIVITY_STATES } from '../enums/activity-state.js';

export const activitySchema = z.object({
  id: z.string(),
  name: z.string(),
  state: z.enum(ACTIVITY_STATES),
  missionId: z.string().nullable(),
  proxyProfileId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  errorMessage: z.string().nullable(),
  startedAt: z.string().nullable(),
  stoppedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createActivitySchema = z.object({
  name: z.string().min(1).max(100),
  missionId: z.string().nullable().optional(),
  proxyProfileId: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateActivitySchema = createActivitySchema.partial();

export const startActivitySchema = z.object({
  id: z.string(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export const activityIdSchema = z.object({
  id: z.string(),
});

export const activityReportSchema = z.object({
  activityId: z.string(),
  totalRuntimeSeconds: z.number(),
  eventsProcessed: z.number(),
  errorCount: z.number(),
  lastError: z.string().nullable(),
  proxyBytesIn: z.number(),
  proxyBytesOut: z.number(),
  generatedAt: z.string(),
});

export type ActivityDto = z.infer<typeof activitySchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type StartActivityInput = z.infer<typeof startActivitySchema>;
export type ActivityReportDto = z.infer<typeof activityReportSchema>;
