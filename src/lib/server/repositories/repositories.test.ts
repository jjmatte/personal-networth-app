import { describe, it, expect, beforeEach } from 'vitest';
// NOTE: these repos read `db` from ../db; for the test, set DATABASE_URL=':memory:'
// before import and run migrations. See Step 3 for the test harness helper.
import { makeTestDb } from './test-harness';
import { createCategory, listCategories, deleteCategory } from './categories';
import { createHolding, setHoldingValue, getHolding } from './holdings';
import { holdingHistory } from './history';

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

  it('deleting a category nulls its holdings, not deletes them', async () => {
    const cat = await createCategory({ name: 'Temp', targetWeight: 10, sortOrder: 0 });
    const h = await createHolding({ symbol: 'X', name: 'X', categoryId: cat.id, currentValue: 50 });
    await deleteCategory(cat.id);
    expect((await getHolding(h.id))!.categoryId).toBeNull();
  });
});
