import { db } from '../db';
import { holding, valueHistory, lot } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { fetchPrice } from '../pricing';

export async function listHoldings() { return db.select().from(holding).all(); }
export async function getHolding(id: number) { return db.select().from(holding).where(eq(holding.id, id)).get(); }
export async function createHolding(input: { symbol: string; name: string; categoryId: number | null; currentValue: number }) {
  return db.insert(holding).values(input).returning().get();
}
export async function updateHolding(id: number, input: { symbol: string; name: string; categoryId: number | null }) {
  return db.update(holding).set({ ...input, updatedAt: new Date() }).where(eq(holding.id, id)).returning().get();
}
export async function setHoldingValue(id: number, value: number) {
  db.update(holding).set({ currentValue: value, updatedAt: new Date() }).where(eq(holding.id, id)).run();
  db.insert(valueHistory).values({ holdingId: id, value }).run();
}

export async function refreshHoldingValue(
  id: number,
  opts?: { apiKey?: string; fetchFn?: typeof fetch }
) {
  const h = await getHolding(id);
  if (!h) throw new Error('holding not found');
  const lots = db.select().from(lot).where(eq(lot.holdingId, id)).all();
  const shares = lots.reduce((s, l) => s + l.shares, 0);
  const price = await fetchPrice(h.symbol, opts);
  const value = shares * price;
  // Overwrite the most-recent snapshot rather than appending, so backfilled history is preserved.
  const latest = db
    .select()
    .from(valueHistory)
    .where(eq(valueHistory.holdingId, id))
    .orderBy(desc(valueHistory.recordedAt))
    .limit(1)
    .get();
  if (latest) {
    db.update(valueHistory).set({ value }).where(eq(valueHistory.id, latest.id)).run();
  } else {
    db.insert(valueHistory).values({ holdingId: id, value }).run();
  }
  db.update(holding).set({ currentValue: value, updatedAt: new Date() }).where(eq(holding.id, id)).run();
  return { symbol: h.symbol, shares, price, value };
}
