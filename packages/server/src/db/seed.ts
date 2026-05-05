import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../../data');
mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'swarm.db');

const sqlite = new Database(dbPath);

// Create tables directly using raw SQL
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    email_verified INTEGER DEFAULT 0,
    name TEXT NOT NULL,
    image TEXT,
    role TEXT DEFAULT 'operator',
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000)
  );

  CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    config_schema TEXT,
    default_config TEXT,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000)
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT DEFAULT 'idle',
    mission_id TEXT NOT NULL,
    proxy_profile_id TEXT,
    error TEXT,
    started_at INTEGER,
    stopped_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (mission_id) REFERENCES missions(id)
  );
`);

// Insert test data
const now = Date.now();
sqlite.exec(`
  INSERT OR IGNORE INTO users (id, email, name, email_verified, role)
  VALUES ('user-1', 'operator@swarm.local', 'Operator', 1, 'operator');

  INSERT OR IGNORE INTO missions (id, name, description)
  VALUES ('mission-1', 'Web Scraping', 'Automated data collection');

  INSERT OR IGNORE INTO activities (id, name, state, mission_id, started_at)
  VALUES
    ('activity-1', 'Agent Alpha', 'running', 'mission-1', ${now - 300000}),
    ('activity-2', 'Agent Beta', 'idle', 'mission-1', NULL),
    ('activity-3', 'Agent Gamma', 'stopped', 'mission-1', ${now - 600000});
`);

console.log('✓ Database seeded with test data');
sqlite.close();
process.exit(0);
