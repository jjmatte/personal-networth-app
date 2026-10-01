import { db } from '../db';
import { lot } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function listLots(holdingId: number) {
  return db.select().from(lot).where(eq(lot.holdingId, holdingId)).all();
}
export async function createLot(input: { holdingId: number; tradeDate: Date; shares: number; pricePerShare: number; fee?: number; note?: string }) {
  return db.insert(lot).values(input).returning().get();
}
export async function deleteLot(id: number) { db.delete(lot).where(eq(lot.id, id)).run(); }
