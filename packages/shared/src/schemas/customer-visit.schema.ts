import { z } from 'zod';

export const customerVisitSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  contactInfo: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  locationAddress: z.string().nullable(),
  notes: z.string(),
  photoPaths: z.array(z.string()).default([]),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  recordedByUserId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createCustomerVisitSchema = z.object({
  customerName: z.string().min(1).max(200),
  contactInfo: z.string().max(500).nullable().optional(),
  locationLat: z.number().min(-90).max(90).nullable().optional(),
  locationLng: z.number().min(-180).max(180).nullable().optional(),
  locationAddress: z.string().max(500).nullable().optional(),
  notes: z.string().max(5000).default(''),
});

export const updateCustomerVisitSchema = createCustomerVisitSchema.partial().extend({
  endedAt: z.string().nullable().optional(),
});

export type CustomerVisitDto = z.infer<typeof customerVisitSchema>;
export type CreateCustomerVisitInput = z.infer<typeof createCustomerVisitSchema>;
export type UpdateCustomerVisitInput = z.infer<typeof updateCustomerVisitSchema>;
