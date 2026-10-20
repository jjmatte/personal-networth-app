import { db } from '../db';
import { settings, fireMilestone } from '../db/schema';
import { eq } from 'drizzle-orm';

type MilestoneInput = { label: string; kind: 'fixed' | 'percent'; value: number; sortOrder: number };

export async function getSettings() {
  db.insert(settings).values({ id: 1 }).onConflictDoNothing().run();
  const row = db.select().from(settings).where(eq(settings.id, 1)).get()!;
  return { monthlySpend: row.monthlySpend };
}
export async function setMonthlySpend(v: number) {
  db.insert(settings)
    .values({ id: 1, monthlySpend: v })
    .onConflictDoUpdate({ target: settings.id, set: { monthlySpend: v } })
    .run();
}

export async function listMilestones() {
  return db.select().from(fireMilestone).orderBy(fireMilestone.sortOrder).all();
}
export async function createMilestone(input: MilestoneInput) {
  return db.insert(fireMilestone).values(input).returning().get();
}
export async function updateMilestone(id: number, input: MilestoneInput) {
  return db.update(fireMilestone).set(input).where(eq(fireMilestone.id, id)).returning().get();
}
export async function deleteMilestone(id: number) {
  db.delete(fireMilestone).where(eq(fireMilestone.id, id)).run();
}
