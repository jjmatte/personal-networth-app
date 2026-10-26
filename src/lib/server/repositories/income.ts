// src/lib/server/repositories/income.ts
import { db } from '../db';
import { incomeYear, incomePersonYear } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { truncToCents } from '$lib/money';

export async function listIncomeYears(): Promise<
  { id: number; year: number; estimatedIncome: number; investmentIncome: number; netMonthlyMargin: number }[]
> {
  return db
    .select({
      id: incomeYear.id,
      year: incomeYear.year,
      estimatedIncome: incomeYear.estimatedIncome,
      investmentIncome: incomeYear.investmentIncome,
      netMonthlyMargin: incomeYear.netMonthlyMargin
    })
    .from(incomeYear)
    .orderBy(asc(incomeYear.year))
    .all();
}

export async function upsertIncomeYear(input: {
  year: number;
  estimatedIncome: number;
  investmentIncome: number;
  netMonthlyMargin: number;
}): Promise<void> {
  const values = {
    year: input.year,
    estimatedIncome: truncToCents(input.estimatedIncome),
    investmentIncome: truncToCents(input.investmentIncome),
    netMonthlyMargin: truncToCents(input.netMonthlyMargin)
  };
  db.insert(incomeYear)
    .values(values)
    .onConflictDoUpdate({
      target: incomeYear.year,
      set: {
        estimatedIncome: values.estimatedIncome,
        investmentIncome: values.investmentIncome,
        netMonthlyMargin: values.netMonthlyMargin
      }
    })
    .run();
}

export async function deleteIncomeYear(id: number): Promise<void> {
  db.delete(incomeYear).where(eq(incomeYear.id, id)).run();
}

export async function listPersonIncomes(): Promise<{ id: number; year: number; name: string; amount: number }[]> {
  return db
    .select({
      id: incomePersonYear.id,
      year: incomePersonYear.year,
      name: incomePersonYear.name,
      amount: incomePersonYear.amount
    })
    .from(incomePersonYear)
    .orderBy(asc(incomePersonYear.year), asc(incomePersonYear.id))
    .all();
}

export async function upsertPersonIncome(input: {
  id?: number;
  year: number;
  name: string;
  amount: number;
}): Promise<void> {
  const values = { year: input.year, name: input.name, amount: truncToCents(input.amount) };
  if (input.id === undefined) {
    db.insert(incomePersonYear).values(values).run();
  } else {
    db.update(incomePersonYear).set(values).where(eq(incomePersonYear.id, input.id)).run();
  }
}

export async function deletePersonIncome(id: number): Promise<void> {
  db.delete(incomePersonYear).where(eq(incomePersonYear.id, id)).run();
}
