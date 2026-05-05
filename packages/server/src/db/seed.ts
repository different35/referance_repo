import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../../data');
mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'swarm.db');
const sqlite = new Database(dbPath);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL,
    email_verified INTEGER DEFAULT 0, name TEXT NOT NULL,
    image TEXT, role TEXT DEFAULT 'operator',
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000)
  );
  CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
    config_schema TEXT, default_config TEXT,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000)
  );
  CREATE TABLE IF NOT EXISTS proxy_profiles (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, protocol TEXT NOT NULL,
    host TEXT NOT NULL, port INTEGER NOT NULL,
    username TEXT, password_enc TEXT,
    is_active INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000)
  );
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY, name TEXT NOT NULL,
    state TEXT DEFAULT 'idle', mission_id TEXT NOT NULL,
    proxy_profile_id TEXT, error TEXT,
    started_at INTEGER, stopped_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (mission_id) REFERENCES missions(id)
  );
`);

const now = Date.now();

sqlite.exec(`INSERT OR IGNORE INTO users (id, email, name, email_verified, role)
  VALUES ('user-1', 'admin@swarm.local', 'Thomas', 1, 'admin');`);

sqlite.exec(`INSERT OR IGNORE INTO missions (id, name, description) VALUES
  ('mission-heycalli',  'HEYCALLI Ops',  'Strateji ve Satış Grubu'),
  ('mission-community', 'COMMUNITY Ops', 'Skool Engagement & Retention'),
  ('mission-marketing', 'MARKETING Ops', 'Content & Growth · Serves Both Teams');`);

sqlite.exec(`INSERT OR IGNORE INTO activities (id, name, state, mission_id, started_at) VALUES
  ('agent-strategist', 'STRATEGIST',  'running', 'mission-heycalli',  ${now - 3600000}),
  ('agent-hey-sales',  'HEY-SALES',   'idle',    'mission-heycalli',  NULL),
  ('agent-community',  'COMMUNITY',   'idle',    'mission-community', NULL),
  ('agent-youtube',    'YOUTUBE',     'running', 'mission-marketing', ${now - 1800000}),
  ('agent-repurpose',  'REPURPOSE',   'running', 'mission-marketing', ${now - 900000}),
  ('agent-twitter',    'TWITTER',     'running', 'mission-marketing', ${now - 7200000}),
  ('agent-linkedin',   'LINKEDIN',    'idle',    'mission-marketing', NULL),
  ('agent-visuals',    'VISUALS',     'running', 'mission-marketing', ${now - 600000}),
  ('agent-gram',       'GRAM-BETA',   'idle',    'mission-marketing', NULL);`);

console.log('✓ DB seeded — 9 agents ready');
sqlite.close();
process.exit(0);
