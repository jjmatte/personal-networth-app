// src/lib/server/repositories/networth.ts
import { db } from '../db';
import { netWorthSnapshot, netWorthItem } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { listHoldings } from './holdings';
import { totalValue } from '$lib/finance/gains';
import { netWorthTotals, reconcileInvestmentLine, type NetWorthRow } from '$lib/finance/networth';

export interface SnapshotInput {
  takenAt: Date;
  note?: string;
  items: NetWorthRow[];
}

export async function createSnapshot(input: SnapshotInput): Promise<{ id: number }> {
  const total = netWorthTotals(input.items).net;
  return db.transaction((tx) => {
    const snap = tx
      .insert(netWorthSnapshot)
      .values({ takenAt: input.takenAt, note: input.note ?? null, total })
      .returning()
      .get();
    for (const [i, r] of input.items.entries()) {
      tx.insert(netWorthItem)
        .values({
          snapshotId: snap.id,
          side: r.side,
          category: r.category,
          label: r.label,
          amount: r.amount,
          sortOrder: r.sortOrder ?? i
        })
        .run();
    }
    return { id: snap.id };
  });
}

export async function getSnapshot(id: number) {
  const snapshot = db.select().from(netWorthSnapshot).where(eq(netWorthSnapshot.id, id)).get();
  if (!snapshot) return undefined;
  const items = db
    .select()
    .from(netWorthItem)
    .where(eq(netWorthItem.snapshotId, id))
    .orderBy(netWorthItem.side, netWorthItem.sortOrder)
    .all();
  return { snapshot, items };
}

export async function listSnapshots() {
  const snaps = db.select().from(netWorthSnapshot).orderBy(desc(netWorthSnapshot.takenAt), desc(netWorthSnapshot.id)).all();
  const counts = db
    .select({ snapshotId: netWorthItem.snapshotId, n: sql<number>`count(*)` })
    .from(netWorthItem)
    .groupBy(netWorthItem.snapshotId)
    .all();
  const byId = new Map(counts.map((c) => [c.snapshotId, c.n]));
  return snaps.map((s) => ({ id: s.id, takenAt: s.takenAt, total: s.total, itemCount: byId.get(s.id) ?? 0 }));
}

export async function latestSnapshot() {
  return db.select().from(netWorthSnapshot).orderBy(desc(netWorthSnapshot.takenAt), desc(netWorthSnapshot.id)).limit(1).get();
}

export async function updateSnapshot(id: number, input: SnapshotInput): Promise<void> {
  const total = netWorthTotals(input.items).net;
  db.transaction((tx) => {
    tx.update(netWorthSnapshot)
      .set({ takenAt: input.takenAt, note: input.note ?? null, total })
      .where(eq(netWorthSnapshot.id, id))
      .run();
    tx.delete(netWorthItem).where(eq(netWorthItem.snapshotId, id)).run();
    for (const [i, r] of input.items.entries()) {
      tx.insert(netWorthItem)
        .values({
          snapshotId: id,
          side: r.side,
          category: r.category,
          label: r.label,
          amount: r.amount,
          sortOrder: r.sortOrder ?? i
        })
        .run();
    }
  });
}

export async function deleteSnapshot(id: number): Promise<void> {
  db.delete(netWorthSnapshot).where(eq(netWorthSnapshot.id, id)).run();
}

export async function distinctCategories(): Promise<string[]> {
  return db
    .selectDistinct({ category: netWorthItem.category })
    .from(netWorthItem)
    .all()
    .map((r) => r.category);
}

export async function buildPrefill(fromId?: number) {
  const holdings = await listHoldings();
  const portfolioTotal = totalValue(holdings);
  const source = fromId
    ? await getSnapshot(fromId)
    : await (async () => {
        const latest = await latestSnapshot();
        return latest ? await getSnapshot(latest.id) : undefined;
      })();

  const baseRows: NetWorthRow[] = source
    ? source.items.map((it) => ({
        side: it.side as NetWorthRow['side'],
        category: it.category,
        label: it.label,
        amount: it.amount,
        sortOrder: it.sortOrder
      }))
    : [
        { side: 'asset', category: 'Cash', label: '', amount: 0, sortOrder: 0 },
        { side: 'liability', category: 'Loans', label: '', amount: 0, sortOrder: 0 }
      ];

  return {
    takenAt: new Date(),
    rows: reconcileInvestmentLine(baseRows, portfolioTotal),
    categories: await distinctCategories()
  };
}
