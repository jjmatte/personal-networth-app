// src/lib/server/repositories/networth.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from './test-harness';
import { createHolding } from './holdings';
import {
  createSnapshot, getSnapshot, listSnapshots, latestSnapshot,
  updateSnapshot, deleteSnapshot, distinctCategories, buildPrefill
} from './networth';
import { netWorthItem } from '../db/schema';
import { INVESTMENTS_LINE, type NetWorthRow } from '$lib/finance/networth';

const row = (p: Partial<NetWorthRow>): NetWorthRow => ({
  side: 'asset', category: 'Cash', label: 'Checking', amount: 0, sortOrder: 0, ...p
});

beforeEach(() => makeTestDb());

describe('networth repository', () => {
  it('creates a snapshot, stores the net total, and reads it back', async () => {
    const { id } = await createSnapshot({
      takenAt: new Date('2026-10-13'),
      items: [row({ amount: 100 }), row({ side: 'liability', category: 'Loans', label: 'Car', amount: 30 })]
    });
    const got = await getSnapshot(id);
    expect(got!.items).toHaveLength(2);
    expect(got!.snapshot.total).toBe(70);
  });

  it('lists snapshots newest first with item counts', async () => {
    await createSnapshot({ takenAt: new Date('2026-01-01'), items: [row({ amount: 1 })] });
    await createSnapshot({ takenAt: new Date('2026-02-01'), items: [row({ amount: 2 }), row({ amount: 3 })] });
    const list = await listSnapshots();
    expect(list[0].takenAt.getTime()).toBeGreaterThan(list[1].takenAt.getTime());
    expect(list[0].itemCount).toBe(2);
  });

  it('latestSnapshot returns the most recent', async () => {
    await createSnapshot({ takenAt: new Date('2026-01-01'), items: [row({ amount: 1 })] });
    const b = await createSnapshot({ takenAt: new Date('2026-03-01'), items: [row({ amount: 9 })] });
    expect((await latestSnapshot())!.id).toBe(b.id);
  });

  it('breaks same-day ties by higher id in latestSnapshot and listSnapshots', async () => {
    await createSnapshot({ takenAt: new Date('2026-05-01'), items: [row({ amount: 1 })] });
    const second = await createSnapshot({ takenAt: new Date('2026-05-01'), items: [row({ amount: 2 })] });
    expect((await latestSnapshot())!.id).toBe(second.id);
    expect((await listSnapshots())[0].id).toBe(second.id);
  });

  it('updateSnapshot replaces items and recomputes total', async () => {
    const { id } = await createSnapshot({ takenAt: new Date('2026-01-01'), items: [row({ amount: 100 })] });
    await updateSnapshot(id, {
      takenAt: new Date('2026-01-02'),
      items: [row({ amount: 200 }), row({ side: 'liability', category: 'Loans', label: 'Car', amount: 50 })]
    });
    const got = await getSnapshot(id);
    expect(got!.items).toHaveLength(2);
    expect(got!.snapshot.total).toBe(150);
  });

  it('deleteSnapshot cascades its items', async () => {
    const { id } = await createSnapshot({ takenAt: new Date('2026-01-01'), items: [row({ amount: 1 })] });
    await deleteSnapshot(id);
    expect(await getSnapshot(id)).toBeUndefined();
    // no orphan items
    const db = (globalThis as any).__db;
    expect(db.select().from(netWorthItem).all()).toHaveLength(0);
  });

  it('distinctCategories returns categories seen across snapshots', async () => {
    await createSnapshot({ takenAt: new Date('2026-01-01'), items: [row({ category: 'Cash' }), row({ category: 'Real Estate' })] });
    const cats = await distinctCategories();
    expect(cats).toContain('Cash');
    expect(cats).toContain('Real Estate');
  });

  it('buildPrefill seeds the Investments line from the live portfolio when there is no prior snapshot', async () => {
    await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: null, currentValue: 1960 });
    const pre = await buildPrefill();
    const inv = pre.rows.find((r) => r.category === INVESTMENTS_LINE.category);
    expect(inv).toMatchObject({ side: 'asset', amount: 1960 });
  });

  it('buildPrefill carries forward the latest snapshot and refreshes the Investments amount', async () => {
    await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: null, currentValue: 500 });
    await createSnapshot({
      takenAt: new Date('2026-01-01'),
      items: [
        row({ ...INVESTMENTS_LINE, side: 'asset', amount: 100 }),
        row({ category: 'Cash', label: 'Checking', amount: 8400 })
      ]
    });
    const pre = await buildPrefill();
    expect(pre.rows.find((r) => r.category === 'Investments')!.amount).toBe(500);
    expect(pre.rows.find((r) => r.category === 'Cash')!.amount).toBe(8400);
  });
});
