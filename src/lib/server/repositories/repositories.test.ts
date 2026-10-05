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
import { createHolding, setHoldingValue, getHolding, refreshHoldingValue } from './holdings';
import { holdingHistory } from './history';
import { valueHistory, lot } from '../db/schema';

beforeEach(() => makeTestDb());

describe('repositories', () => {
  it('creates and lists categories', async () => {
    await createCategory({ name: 'Bonds', targetWeight: 30, sortOrder: 0 });
    const cats = await listCategories();
    expect(cats.map((c) => c.name)).toContain('Bonds');
  });

  it('setHoldingValue updates value and appends history', async () => {
    const cat = await createCategory({ name: 'US Large Cap', targetWeight: 40, sortOrder: 0 });
    const h = await createHolding({ symbol: 'VOO', name: 'S&P 500', categoryId: cat.id, currentValue: 0 });
    await setHoldingValue(h.id, 1000);
    await setHoldingValue(h.id, 1100);
    expect((await getHolding(h.id))!.currentValue).toBe(1100);
    expect((await holdingHistory(h.id))).toHaveLength(2);
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
