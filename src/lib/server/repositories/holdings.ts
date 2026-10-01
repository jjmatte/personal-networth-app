import { db } from '../db';
import { holding, valueHistory } from '../db/schema';
import { eq } from 'drizzle-orm';

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
