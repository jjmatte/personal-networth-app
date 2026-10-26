import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import {
  category, netWorthSnapshot, netWorthItem, yearlyNetWorth, incomeYear, incomePersonYear
} from './schema';

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

  it('round-trips yearly net worth and rejects a duplicate year', () => {
    const sqlite = new Database(':memory:');
    const tdb = drizzle(sqlite);
    migrate(tdb, { migrationsFolder: './drizzle' });
    tdb.insert(yearlyNetWorth).values({ year: 2025, netWorth: 123456.5 }).run();
    const rows = tdb.select().from(yearlyNetWorth).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].year).toBe(2025);
    expect(rows[0].netWorth).toBe(123456.5);
    expect(() => tdb.insert(yearlyNetWorth).values({ year: 2025, netWorth: 1 }).run()).toThrow();
  });

  it('round-trips income year and per-person income', () => {
    const sqlite = new Database(':memory:');
    const tdb = drizzle(sqlite);
    migrate(tdb, { migrationsFolder: './drizzle' });
    tdb.insert(incomeYear).values({
      year: 2025, estimatedIncome: 200000, investmentIncome: 5000, netMonthlyMargin: 1500
    }).run();
    const y = tdb.select().from(incomeYear).all();
    expect(y).toHaveLength(1);
    expect(y[0].estimatedIncome).toBe(200000);
    expect(y[0].investmentIncome).toBe(5000);
    expect(y[0].netMonthlyMargin).toBe(1500);
    tdb.insert(incomePersonYear).values({ year: 2025, name: 'Person A', amount: 100000 }).run();
    const p = tdb.select().from(incomePersonYear).all();
    expect(p).toHaveLength(1);
    expect(p[0].name).toBe('Person A');
    expect(p[0].amount).toBe(100000);
  });
});
