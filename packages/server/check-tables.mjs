import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, 'data/swarm.db'));

const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
console.log('Tables in DB:');
tables.forEach(t => {
  console.log(`\n--- ${t.name} ---`);
  console.log(t.sql);
});

db.close();
