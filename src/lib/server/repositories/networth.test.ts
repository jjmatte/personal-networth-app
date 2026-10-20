// src/lib/server/repositories/networth.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from './test-harness';
import { createHolding } from './holdings';
import { createAccount } from './accounts';
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

  it('buildPrefill seeds per-account Investments lines when there is no prior snapshot', async () => {
    const k = await createAccount({ name: '401k', type: 'retirement', accessible: false, sortOrder: 0 });
    const t = await createAccount({ name: 'Brokerage', type: 'taxable', accessible: true, sortOrder: 1 });
    await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: null, currentValue: 1000, accountId: k.id });
    await createHolding({ symbol: 'VTI', name: 'Total Market', categoryId: null, currentValue: 960, accountId: t.id });
    const pre = await buildPrefill();
    const inv = pre.rows.filter((r) => r.category === 'Investments');
    expect(inv.map((r) => [r.label, r.amount])).toEqual([['401k', 1000], ['Brokerage', 960]]);
    expect(pre.rows.some((r) => r.label === INVESTMENTS_LINE.label)).toBe(false);
  });

  it('buildPrefill floors each Investments line down to the cent', async () => {
    const k = await createAccount({ name: '401k', type: 'retirement', accessible: false, sortOrder: 0 });
    await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: null, currentValue: 239070.15564999997, accountId: k.id });
    const pre = await buildPrefill();
    expect(pre.rows.find((r) => r.label === '401k')!.amount).toBe(239070.15);
  });

  it('buildPrefill refreshes derived lines, drops stale ones, and keeps manual Investments lines', async () => {
    const k = await createAccount({ name: '401k', type: 'retirement', accessible: false, sortOrder: 0 });
    await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: null, currentValue: 500, accountId: k.id });
    await createHolding({ symbol: 'VTI', name: 'Total Market', categoryId: null, currentValue: 70 });
    await createSnapshot({
      takenAt: new Date('2026-01-01'),
      items: [
        row({ ...INVESTMENTS_LINE, amount: 100 }),
        row({ category: 'Investments', label: '401k', amount: 100 }),
        row({ category: 'Investments', label: 'Metals', amount: 3000 }),
        row({ category: 'Cash', label: 'Checking', amount: 8400 })
      ]
    });
    const pre = await buildPrefill();
    const inv = pre.rows.filter((r) => r.category === 'Investments');
    expect(inv.map((r) => [r.label, r.amount]).sort()).toEqual(
      [['401k', 500], ['Metals', 3000], ['Unassigned', 70]].sort()
    );
    expect(pre.rows.find((r) => r.category === 'Cash')!.amount).toBe(8400);
  });

  it('buildPrefill(fromId) copies the specified snapshot, not the latest', async () => {
    const older = await createSnapshot({
      takenAt: new Date('2026-01-01'),
      items: [row({ category: 'Cash', label: 'Older checking', amount: 1111 })]
    });
    await createSnapshot({
      takenAt: new Date('2026-06-01'),
      items: [row({ category: 'Cash', label: 'Newer checking', amount: 2222 })]
    });
    const pre = await buildPrefill(older.id);
    expect(pre.rows.find((r) => r.category === 'Cash')!.label).toBe('Older checking');
    expect(pre.rows.find((r) => r.category === 'Cash')!.amount).toBe(1111);
    expect(pre.rows.some((r) => r.label === 'Newer checking')).toBe(false);
  });
});
