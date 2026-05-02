import { z } from 'zod';

export const missionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  configSchema: z.record(z.string(), z.unknown()),
  defaultConfig: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

export const createMissionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  configSchema: z.record(z.string(), z.unknown()).default({}),
  defaultConfig: z.record(z.string(), z.unknown()).default({}),
});

export const assignMissionSchema = z.object({
  activityId: z.string(),
  missionId: z.string(),
});

export type MissionDto = z.infer<typeof missionSchema>;
export type CreateMissionInput = z.infer<typeof createMissionSchema>;
export type AssignMissionInput = z.infer<typeof assignMissionSchema>;
