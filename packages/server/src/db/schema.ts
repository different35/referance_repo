/**
 * Tek dosyada tüm veritabanı şeması — Drizzle ORM (SQLite).
 *
 * Better-Auth gereği:
 *  - tarih alanları integer ('timestamp_ms') modunda (Date objesi olarak çalışır)
 *  - boolean alanları integer ('boolean') modunda (0/1 olarak saklanır)
 *
 * Phase 0'da iskelet; sonraki phase'lerde tablolar eklenecek.
 */
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

const now = sql`(unixepoch() * 1000)`;

// ─────────────────────────────────────────────────────────
// Better-Auth tabloları
// ─────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  name: text('name').notNull(),
  image: text('image'),
  role: text('role', { enum: ['admin', 'operator', 'viewer'] }).notNull().default('operator'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(now),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(now),
});

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  providerId: text('provider_id').notNull(),
  accountId: text('account_id').notNull(),
  password: text('password'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
  scope: text('scope'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(now),
});

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(now),
});

// ─────────────────────────────────────────────────────────
// Domain tabloları (Phase 2+ ile genişleyecek)
// ─────────────────────────────────────────────────────────
export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  keyHash: text('key_hash').notNull().unique(),
  label: text('label').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp_ms' }),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  payload: text('payload', { mode: 'json' }).$type<Record<string, unknown>>(),
  ipAddress: text('ip_address'),
  at: integer('at', { mode: 'timestamp_ms' }).notNull().default(now),
});

// ─────────────────────────────────────────────────────────
// Domain tabloları (Phase 2)
// ─────────────────────────────────────────────────────────
export const missions = sqliteTable('missions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  configSchema: text('config_schema', { mode: 'json' }).$type<Record<string, unknown>>(),
  defaultConfig: text('default_config', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(now),
});

export const agentSkills = sqliteTable('agent_skills', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  promptTemplate: text('prompt_template').notNull(),
  requiredFields: text('required_fields', { mode: 'json' }).$type<string[]>(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
});

export const proxyProfiles = sqliteTable('proxy_profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  protocol: text('protocol').notNull(),
  host: text('host').notNull(),
  port: integer('port').notNull(),
  username: text('username'),
  passwordEnc: text('password_enc'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(now),
});

export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  state: text('state', {
    enum: ['idle', 'starting', 'running', 'stopping', 'stopped', 'error'],
  }).notNull().default('idle'),
  missionId: text('mission_id').notNull().references(() => missions.id, { onDelete: 'cascade' }),
  proxyProfileId: text('proxy_profile_id').references(() => proxyProfiles.id, { onDelete: 'set null' }),
  error: text('error'),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }),
  stoppedAt: integer('stopped_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(now),
});

export const ads = sqliteTable('ads', {
  id: text('id').primaryKey(),
  state: text('state', {
    enum: ['draft', 'generating', 'review', 'policy-checking', 'approved', 'publishing', 'published'],
  }).notNull().default('draft'),
  platform: text('platform').notNull(),
  format: text('format').notNull(),
  headline: text('headline'),
  body: text('body'),
  cta: text('cta'),
  previewHtml: text('preview_html'),
  policyScore: integer('policy_score'),
  policyIssues: text('policy_issues', { mode: 'json' }).$type<Array<{ issue: string; severity: string }>>(),
  roiEstimate: text('roi_estimate', { mode: 'json' }).$type<{ cpc: number; ctr: number; conversions: number }>(),
  publishedUrl: text('published_url'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(now),
});

export const customerVisits = sqliteTable('customer_visits', {
  id: text('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  locationLat: text('location_lat'),
  locationLng: text('location_lng'),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull().default(now),
  endedAt: integer('ended_at', { mode: 'timestamp_ms' }),
  notes: text('notes'),
  photoPaths: text('photo_paths', { mode: 'json' }).$type<string[]>(),
  recordedByUserId: text('recorded_by_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
});

// Sonraki phase'lerde eklenecek:
// - push_subscriptions, vscode_bridge_sessions, claude_cli_logs
