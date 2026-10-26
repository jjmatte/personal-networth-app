// src/lib/server/repositories/yearly.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from './test-harness';
import { listYearlyNetWorth, upsertYearlyNetWorth, deleteYearlyNetWorth } from './yearly';

beforeEach(() => makeTestDb());

describe('yearly net worth repository', () => {
  it('upsert inserts a row', async () => {
    await upsertYearlyNetWorth(2024, 1000);
    const list = await listYearlyNetWorth();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ year: 2024, netWorth: 1000 });
    expect(typeof list[0].id).toBe('number');
  });

  it('a second upsert on the same year updates instead of duplicating', async () => {
    await upsertYearlyNetWorth(2024, 1000);
    await upsertYearlyNetWorth(2024, 2500);
    const list = await listYearlyNetWorth();
    expect(list).toHaveLength(1);
    expect(list[0].netWorth).toBe(2500);
  });

  it('truncates to cents', async () => {
    await upsertYearlyNetWorth(2024, 100.019);
    expect((await listYearlyNetWorth())[0].netWorth).toBe(100.01);
    await upsertYearlyNetWorth(2024, 200.019);
    expect((await listYearlyNetWorth())[0].netWorth).toBe(200.01);
  });

  it('lists ascending by year', async () => {
    await upsertYearlyNetWorth(2025, 3);
    await upsertYearlyNetWorth(2023, 1);
    await upsertYearlyNetWorth(2024, 2);
    expect((await listYearlyNetWorth()).map((r) => r.year)).toEqual([2023, 2024, 2025]);
  });

  it('deletes by id', async () => {
    await upsertYearlyNetWorth(2023, 1);
    await upsertYearlyNetWorth(2024, 2);
    const [first] = await listYearlyNetWorth();
    await deleteYearlyNetWorth(first.id);
    expect((await listYearlyNetWorth()).map((r) => r.year)).toEqual([2024]);
  });
});
