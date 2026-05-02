/**
 * Tek dosyada tüm veritabanı şeması — Drizzle ORM (SQLite).
 * Phase 0'da iskelet; sonraki phase'lerde tablolar eklenecek.
 */
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ─────────────────────────────────────────────────────────
// Better-Auth tabloları (Better-Auth bunları kendisi yönetir,
// burada referans olarak tutuyoruz; CLI ile generate edilecek)
// ─────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  name: text('name').notNull(),
  image: text('image'),
  role: text('role', { enum: ['admin', 'operator', 'viewer'] }).notNull().default('operator'),
  createdAt: text('created_at').notNull().default(`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(`(datetime('now'))`),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull().default(`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(`(datetime('now'))`),
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
  accessTokenExpiresAt: text('access_token_expires_at'),
  refreshTokenExpiresAt: text('refresh_token_expires_at'),
  scope: text('scope'),
  createdAt: text('created_at').notNull().default(`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(`(datetime('now'))`),
});

export const verifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull().default(`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(`(datetime('now'))`),
});

// ─────────────────────────────────────────────────────────
// Domain tabloları (Phase 2+ ile genişleyecek)
// ─────────────────────────────────────────────────────────
export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  keyHash: text('key_hash').notNull().unique(),
  label: text('label').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  lastUsedAt: text('last_used_at'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull().default(`(datetime('now'))`),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id'),
  payload: text('payload', { mode: 'json' }).$type<Record<string, unknown>>(),
  ipAddress: text('ip_address'),
  at: text('at').notNull().default(`(datetime('now'))`),
});

// Sonraki phase'lerde eklenecek:
// - missions, activities, proxy_profiles, ads, customer_visits, push_subscriptions
