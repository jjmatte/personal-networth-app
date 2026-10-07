import { describe, it, expect, beforeEach } from 'vitest';
// NOTE: these repos read `db` from ../db; for the test, set DATABASE_URL=':memory:'
// before import and run migrations. See Step 3 for the test harness helper.
import { makeTestDb } from './test-harness';
import {
  createCategory,
  listCategories,
  deleteCategory,
  updateCategory,
  TargetWeightError
} from './categories';
import { createHolding, getHolding, refreshHoldingValue } from './holdings';
import { listLots, createLot, addLotAndRefresh, removeLotAndRefresh } from './lots';
import { holdingHistory } from './history';
import { valueHistory, lot } from '../db/schema';

beforeEach(() => makeTestDb());

describe('repositories', () => {
  it('creates and lists categories', async () => {
    await createCategory({ name: 'Bonds', targetWeight: 30, sortOrder: 0 });
    const cats = await listCategories();
    expect(cats.map((c) => c.name)).toContain('Bonds');
  });

  const priceAt = (price: string) =>
    (async () => ({ json: async () => ({ price }) }) as Response) as unknown as typeof fetch;

  it('addLotAndRefresh records the purchase and derives value from shares x live price', async () => {
    const cat = await createCategory({ name: 'US Large Cap', targetWeight: 40, sortOrder: 0 });
    const h = await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: cat.id, currentValue: 0 });
    const { priced } = await addLotAndRefresh(
      { holdingId: h.id, tradeDate: new Date('2026-01-01'), shares: 3, pricePerShare: 90 },
      { apiKey: 'k', fetchFn: priceAt('100') }
    );
    expect(priced).toBe(true);
    expect(await listLots(h.id)).toHaveLength(1);
    expect((await getHolding(h.id))!.currentValue).toBe(300);
  });

  it('refreshHoldingValue stores the last price for offline reuse', async () => {
    const cat = await createCategory({ name: 'US Large Cap', targetWeight: 40, sortOrder: 0 });
    const h = await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: cat.id, currentValue: 0 });
    await createLot({ holdingId: h.id, tradeDate: new Date('2026-01-01'), shares: 2, pricePerShare: 90 });
    await refreshHoldingValue(h.id, { apiKey: 'k', fetchFn: priceAt('250') });
    expect((await getHolding(h.id))!.lastPrice).toBe(250);
  });

  it('addLotAndRefresh falls back to the cached last price when the API is offline', async () => {
    const cat = await createCategory({ name: 'US Large Cap', targetWeight: 40, sortOrder: 0 });
    const h = await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: cat.id, currentValue: 0 });
    // First, a successful purchase caches a price of 100 (2 shares -> $200).
    await addLotAndRefresh(
      { holdingId: h.id, tradeDate: new Date('2026-01-01'), shares: 2, pricePerShare: 90 },
      { apiKey: 'k', fetchFn: priceAt('100') }
    );
    // A later purchase while offline re-derives value from the cached $100 price.
    const failingFetch = (async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;
    const { priced } = await addLotAndRefresh(
      { holdingId: h.id, tradeDate: new Date('2026-02-01'), shares: 3, pricePerShare: 95 },
      { apiKey: 'k', fetchFn: failingFetch }
    );
    expect(priced).toBe(false);
    expect((await getHolding(h.id))!.currentValue).toBe(500); // 5 shares x cached 100
  });

  it('addLotAndRefresh still records the purchase when pricing fails', async () => {
    const cat = await createCategory({ name: 'US Large Cap', targetWeight: 40, sortOrder: 0 });
    const h = await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: cat.id, currentValue: 0 });
    const failingFetch = (async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;
    const { priced } = await addLotAndRefresh(
      { holdingId: h.id, tradeDate: new Date('2026-01-01'), shares: 3, pricePerShare: 90 },
      { apiKey: 'k', fetchFn: failingFetch }
    );
    expect(priced).toBe(false);
    expect(await listLots(h.id)).toHaveLength(1);
    expect((await getHolding(h.id))!.currentValue).toBe(0);
  });

  it('removeLotAndRefresh re-prices the holding after a sale', async () => {
    const cat = await createCategory({ name: 'US Large Cap', targetWeight: 40, sortOrder: 0 });
    const h = await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: cat.id, currentValue: 0 });
    const first = await addLotAndRefresh(
      { holdingId: h.id, tradeDate: new Date('2026-01-01'), shares: 2, pricePerShare: 90 },
      { apiKey: 'k', fetchFn: priceAt('100') }
    );
    await addLotAndRefresh(
      { holdingId: h.id, tradeDate: new Date('2026-02-01'), shares: 3, pricePerShare: 95 },
      { apiKey: 'k', fetchFn: priceAt('100') }
    );
    expect((await getHolding(h.id))!.currentValue).toBe(500);
    const { priced } = await removeLotAndRefresh(first.lot.id, { apiKey: 'k', fetchFn: priceAt('100') });
    expect(priced).toBe(true);
    expect(await listLots(h.id)).toHaveLength(1);
    expect((await getHolding(h.id))!.currentValue).toBe(300);
  });

  it('rejects a new category that pushes target weights over 100%', async () => {
    await createCategory({ name: 'A', targetWeight: 70, sortOrder: 0 });
    await expect(createCategory({ name: 'B', targetWeight: 40, sortOrder: 1 })).rejects.toThrow(
      TargetWeightError
    );
  });

  it('allows target weights that total exactly 100%', async () => {
    await createCategory({ name: 'A', targetWeight: 60, sortOrder: 0 });
    await expect(
      createCategory({ name: 'B', targetWeight: 40, sortOrder: 1 })
    ).resolves.toBeTruthy();
  });

  it('rejects an update that pushes target weights over 100%', async () => {
    await createCategory({ name: 'A', targetWeight: 50, sortOrder: 0 });
    const b = await createCategory({ name: 'B', targetWeight: 50, sortOrder: 1 });
    await expect(
      updateCategory(b.id, { name: 'B', targetWeight: 60, sortOrder: 1 })
    ).rejects.toThrow(TargetWeightError);
  });

  it('refreshHoldingValue sets value to shares x live price and overwrites only the latest snapshot', async () => {
    const tdb = makeTestDb();
    const cat = await createCategory({ name: 'US Large Cap', targetWeight: 40, sortOrder: 0 });
    const h = await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: cat.id, currentValue: 0 });
    tdb
      .insert(valueHistory)
      .values([
        { holdingId: h.id, recordedAt: new Date('2025-01-01'), value: 100 },
        { holdingId: h.id, recordedAt: new Date('2025-02-01'), value: 200 },
        { holdingId: h.id, recordedAt: new Date('2025-03-01'), value: 300 }
      ])
      .run();
    tdb
      .insert(lot)
      .values({ holdingId: h.id, tradeDate: new Date('2025-01-01'), shares: 2, pricePerShare: 400 })
      .run();

    const fakeFetch = (async () => ({ json: async () => ({ price: '500' }) }) as Response) as unknown as typeof fetch;
    const result = await refreshHoldingValue(h.id, { apiKey: 'k', fetchFn: fakeFetch });

    expect(result).toMatchObject({ symbol: 'VOO', shares: 2, price: 500, value: 1000 });
    const hist = await holdingHistory(h.id);
    expect(hist).toHaveLength(3);
    expect(hist.map((r) => r.value)).toEqual([100, 200, 1000]);
    expect((await getHolding(h.id))!.currentValue).toBe(1000);
  });

  it('deleting a category nulls its holdings, not deletes them', async () => {
    const cat = await createCategory({ name: 'Temp', targetWeight: 10, sortOrder: 0 });
    const h = await createHolding({ symbol: 'X', name: 'X', categoryId: cat.id, currentValue: 50 });
    await deleteCategory(cat.id);
    expect((await getHolding(h.id))!.categoryId).toBeNull();
  });
});
