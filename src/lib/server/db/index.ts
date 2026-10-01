import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const sqlite = new Database(env.DATABASE_URL ?? 'data/app.db');
sqlite.pragma('foreign_keys = ON');
export const db = drizzle(sqlite, { schema });
