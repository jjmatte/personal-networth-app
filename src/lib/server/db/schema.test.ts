import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { category, netWorthSnapshot, netWorthItem } from './schema';

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

  it('inserts a net-worth snapshot with items (cascade)', () => {
    const sqlite = new Database(':memory:');
    sqlite.pragma('foreign_keys = ON');
    const tdb = drizzle(sqlite);
    migrate(tdb, { migrationsFolder: './drizzle' });
    const snap = tdb.insert(netWorthSnapshot).values({ total: 70 }).returning().get();
    tdb.insert(netWorthItem).values({
      snapshotId: snap.id, side: 'asset', category: 'Cash', label: 'Checking', amount: 100, sortOrder: 0
    }).run();
    tdb.insert(netWorthItem).values({
      snapshotId: snap.id, side: 'liability', category: 'Loans', label: 'Car', amount: 30, sortOrder: 0
    }).run();
    const items = tdb.select().from(netWorthItem).where(eq(netWorthItem.snapshotId, snap.id)).all();
    expect(items).toHaveLength(2);
  });
});
