import { z } from 'zod';

export const PROXY_PROTOCOLS = ['http', 'https', 'socks4', 'socks5'] as const;
export type ProxyProtocol = (typeof PROXY_PROTOCOLS)[number];

export const proxyProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  protocol: z.enum(PROXY_PROTOCOLS),
  host: z.string(),
  port: z.number().int().min(1).max(65535),
  username: z.string().nullable(),
  hasPassword: z.boolean(),
  activityId: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createProxyProfileSchema = z.object({
  name: z.string().min(1).max(100),
  protocol: z.enum(PROXY_PROTOCOLS),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  username: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
});

export const proxyToggleSchema = z.object({
  activityId: z.string(),
  enable: z.boolean(),
  proxyProfileId: z.string().nullable().optional(),
});

export type ProxyProfileDto = z.infer<typeof proxyProfileSchema>;
export type CreateProxyProfileInput = z.infer<typeof createProxyProfileSchema>;
export type ProxyToggleInput = z.infer<typeof proxyToggleSchema>;
