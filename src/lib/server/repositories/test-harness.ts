import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../db/schema';

// Rebind the shared db to a fresh in-memory database for each test.
export function makeTestDb() {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  const tdb = drizzle(sqlite, { schema });
  migrate(tdb, { migrationsFolder: './drizzle' });
  // swap the singleton used by repositories
  (globalThis as any).__db = tdb;
  return tdb;
}
