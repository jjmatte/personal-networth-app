// src/lib/server/repositories/yearly.ts
import { db } from '../db';
import { yearlyNetWorth } from '../db/schema';
import { eq, asc } from 'drizzle-orm';
import { truncToCents } from '$lib/money';

export async function listYearlyNetWorth(): Promise<{ id: number; year: number; netWorth: number }[]> {
  return db
    .select({ id: yearlyNetWorth.id, year: yearlyNetWorth.year, netWorth: yearlyNetWorth.netWorth })
    .from(yearlyNetWorth)
    .orderBy(asc(yearlyNetWorth.year))
    .all();
}

export async function upsertYearlyNetWorth(year: number, netWorth: number): Promise<void> {
  const value = truncToCents(netWorth);
  db.insert(yearlyNetWorth)
    .values({ year, netWorth: value })
    .onConflictDoUpdate({ target: yearlyNetWorth.year, set: { netWorth: value } })
    .run();
}

export async function deleteYearlyNetWorth(id: number): Promise<void> {
  db.delete(yearlyNetWorth).where(eq(yearlyNetWorth.id, id)).run();
}
