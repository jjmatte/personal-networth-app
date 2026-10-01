import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

type DB = ReturnType<typeof drizzle<typeof schema>>;

let realDb: DB | undefined;
function resolveDb(): DB {
  const injected = (globalThis as Record<string, unknown>).__db as DB | undefined;
  if (injected) return injected;
  if (!realDb) {
    const sqlite = new Database(env.DATABASE_URL ?? 'data/app.db');
    sqlite.pragma('foreign_keys = ON');
    realDb = drizzle(sqlite, { schema });
  }
  return realDb;
}

export const db = new Proxy({} as DB, {
  get(_t, prop) {
    const current = resolveDb() as unknown as Record<string | symbol, unknown>;
    const value = current[prop];
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(current) : value;
  }
});
