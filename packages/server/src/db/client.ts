import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { getEnv } from '../env.js';
import * as schema from './schema.js';

const env = getEnv();

const dbPath = env.DATABASE_URL.replace(/^file:/, '');
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite: DatabaseType = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export const rawSqlite: DatabaseType = sqlite;
export type DbClient = typeof db;
