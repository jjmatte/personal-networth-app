import { db } from '../db';
import { lot } from '../db/schema';
import { eq } from 'drizzle-orm';
import { refreshHoldingValue, getHolding, applyHoldingPrice } from './holdings';

type PriceOpts = { apiKey?: string; fetchFn?: typeof fetch };

export async function listLots(holdingId: number) {
  return db.select().from(lot).where(eq(lot.holdingId, holdingId)).all();
}
export async function createLot(input: { holdingId: number; tradeDate: Date; shares: number; pricePerShare: number; fee?: number; note?: string }) {
  return db.insert(lot).values(input).returning().get();
}
export async function deleteLot(id: number) { db.delete(lot).where(eq(lot.id, id)).run(); }

// A purchase or sale changes the share count, so re-derive the holding's value.
// Try a fresh live price; if that fails, fall back to the cached last price so an
// offline buy/sell still reflects the new share count. A holding that has never
// been priced stays at $0 until its first refresh. Returns priced=false on either
// fallback so the UI can warn the value may be stale.
async function repriceAfterLotChange(holdingId: number, opts?: PriceOpts) {
  try {
    await refreshHoldingValue(holdingId, opts);
    return true;
  } catch {
    const h = await getHolding(holdingId);
    if (h && h.lastPrice != null) applyHoldingPrice(holdingId, h.lastPrice);
    return false;
  }
}

export async function addLotAndRefresh(
  input: { holdingId: number; tradeDate: Date; shares: number; pricePerShare: number; fee?: number; note?: string },
  opts?: PriceOpts
) {
  const created = await createLot(input);
  const priced = await repriceAfterLotChange(input.holdingId, opts);
  return { lot: created, priced };
}

export async function removeLotAndRefresh(id: number, opts?: PriceOpts) {
  const existing = db.select().from(lot).where(eq(lot.id, id)).get();
  await deleteLot(id);
  const priced = existing ? await repriceAfterLotChange(existing.holdingId, opts) : false;
  return { priced };
}
