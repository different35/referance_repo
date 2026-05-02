import { z } from 'zod';
import { AD_STATES } from '../enums/ad-state.js';
import { AD_PLATFORMS, AD_FORMATS, AD_TONES } from '../enums/ad-platform.js';

export const policyIssueSchema = z.object({
  severity: z.enum(['error', 'warning', 'info']),
  code: z.string(),
  message: z.string(),
  field: z.string(),
});

export const roiEstimateSchema = z.object({
  estimatedCtrPercent: z.number(),
  estimatedCpcUsd: z.number(),
  audienceFitScore: z.number().min(0).max(100),
  confidenceLevel: z.enum(['low', 'medium', 'high']),
  reasoning: z.string(),
});

export const adContentSchema = z.object({
  id: z.string(),
  state: z.enum(AD_STATES),
  platform: z.enum(AD_PLATFORMS),
  format: z.enum(AD_FORMATS),
  headline: z.string(),
  body: z.string(),
  cta: z.string(),
  imagePrompt: z.string().nullable(),
  previewHtml: z.string().nullable(),
  policyScore: z.number().min(0).max(100).nullable(),
  policyIssues: z.array(policyIssueSchema).default([]),
  roiEstimate: roiEstimateSchema.nullable(),
  publishedUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const adGenerateSchema = z.object({
  platform: z.enum(AD_PLATFORMS),
  format: z.enum(AD_FORMATS),
  productDescription: z.string().min(10).max(2000),
  targetAudience: z.string().min(5).max(500),
  tone: z.enum(AD_TONES),
  keywords: z.array(z.string()).max(20).default([]),
  budget: z.number().positive().nullable().optional(),
});

export const adIdSchema = z.object({
  id: z.string(),
});

export const adPublishSchema = z.object({
  id: z.string(),
  platform: z.enum(AD_PLATFORMS),
});

export type PolicyIssue = z.infer<typeof policyIssueSchema>;
export type RoiEstimate = z.infer<typeof roiEstimateSchema>;
export type AdContentDto = z.infer<typeof adContentSchema>;
export type AdGenerateInput = z.infer<typeof adGenerateSchema>;
export type AdPublishInput = z.infer<typeof adPublishSchema>;
