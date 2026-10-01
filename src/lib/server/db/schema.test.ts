import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { category } from './schema';

describe('schema', () => {
  it('inserts and reads a category', () => {
    const sqlite = new Database(':memory:');
    const tdb = drizzle(sqlite);
    migrate(tdb, { migrationsFolder: './drizzle' });
    tdb.insert(category).values({ name: 'US Large Cap', targetWeight: 40 }).run();
    const rows = tdb.select().from(category).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('US Large Cap');
  });
});
