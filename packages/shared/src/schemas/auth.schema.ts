import { z } from 'zod';
import { ROLES } from '../enums/role.js';

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(ROLES),
  createdAt: z.string(),
});

export const apiKeySchema = z.object({
  id: z.string(),
  label: z.string(),
  lastUsedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
});

export const createApiKeySchema = z.object({
  label: z.string().min(1).max(100),
  expiresInDays: z.number().int().positive().max(365).nullable().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UserDto = z.infer<typeof userSchema>;
export type ApiKeyDto = z.infer<typeof apiKeySchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
