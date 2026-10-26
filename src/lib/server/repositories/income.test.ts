// src/lib/server/repositories/income.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from './test-harness';
import {
  listIncomeYears,
  upsertIncomeYear,
  deleteIncomeYear,
  listPersonIncomes,
  upsertPersonIncome,
  deletePersonIncome
} from './income';

beforeEach(() => makeTestDb());

describe('income year repository', () => {
  it('inserts then updates on the same year (one row)', async () => {
    await upsertIncomeYear({ year: 2024, estimatedIncome: 100000, investmentIncome: 5000, netMonthlyMargin: 2000 });
    await upsertIncomeYear({ year: 2024, estimatedIncome: 120000, investmentIncome: 6000, netMonthlyMargin: 2500 });
    const list = await listIncomeYears();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      year: 2024,
      estimatedIncome: 120000,
      investmentIncome: 6000,
      netMonthlyMargin: 2500
    });
    expect(typeof list[0].id).toBe('number');
  });

  it('lists years in ascending order', async () => {
    await upsertIncomeYear({ year: 2025, estimatedIncome: 1, investmentIncome: 1, netMonthlyMargin: 1 });
    await upsertIncomeYear({ year: 2023, estimatedIncome: 1, investmentIncome: 1, netMonthlyMargin: 1 });
    expect((await listIncomeYears()).map((r) => r.year)).toEqual([2023, 2025]);
  });

  it('truncates money fields to cents', async () => {
    await upsertIncomeYear({ year: 2024, estimatedIncome: 100.019, investmentIncome: 5.999, netMonthlyMargin: 7.015 });
    expect((await listIncomeYears())[0]).toMatchObject({
      estimatedIncome: 100.01,
      investmentIncome: 5.99,
      netMonthlyMargin: 7.01
    });
  });

  it('deleteIncomeYear removes the row', async () => {
    await upsertIncomeYear({ year: 2024, estimatedIncome: 1, investmentIncome: 1, netMonthlyMargin: 1 });
    const [row] = await listIncomeYears();
    await deleteIncomeYear(row.id);
    expect(await listIncomeYears()).toHaveLength(0);
  });
});

describe('person income repository', () => {
  it('inserts without id then updates by id', async () => {
    await upsertPersonIncome({ year: 2024, name: 'Person A', amount: 50000 });
    const [row] = await listPersonIncomes();
    expect(row).toMatchObject({ year: 2024, name: 'Person A', amount: 50000 });
    await upsertPersonIncome({ id: row.id, year: 2024, name: 'Person A2', amount: 55000 });
    const list = await listPersonIncomes();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: row.id, name: 'Person A2', amount: 55000 });
  });

  it('truncates amount to cents', async () => {
    await upsertPersonIncome({ year: 2024, name: 'Person A', amount: 10.019 });
    expect((await listPersonIncomes())[0].amount).toBe(10.01);
    const id = (await listPersonIncomes())[0].id;
    await upsertPersonIncome({ id, year: 2024, name: 'Person A', amount: 20.019 });
    expect((await listPersonIncomes())[0].amount).toBe(20.01);
  });

  it('deletePersonIncome removes only that person, keeping siblings and the income_year row', async () => {
    await upsertIncomeYear({ year: 2024, estimatedIncome: 100, investmentIncome: 10, netMonthlyMargin: 5 });
    await upsertPersonIncome({ year: 2024, name: 'Person A', amount: 60 });
    await upsertPersonIncome({ year: 2024, name: 'Person B', amount: 40 });
    const people = await listPersonIncomes();
    const a = people.find((p) => p.name === 'Person A')!;
    await deletePersonIncome(a.id);
    const remaining = await listPersonIncomes();
    expect(remaining.map((p) => p.name)).toEqual(['Person B']);
    expect(await listIncomeYears()).toHaveLength(1);
  });
});
