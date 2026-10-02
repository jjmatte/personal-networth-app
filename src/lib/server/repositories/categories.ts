import { db } from '../db';
import { category, holding } from '../db/schema';
import { eq } from 'drizzle-orm';

export class TargetWeightError extends Error {
  constructor(public attemptedTotal: number) {
    super(`Target weights can't exceed 100% (would total ${attemptedTotal}%)`);
    this.name = 'TargetWeightError';
  }
}

function assertWithinTarget(newWeight: number, excludeId?: number) {
  const existing = db
    .select()
    .from(category)
    .all()
    .filter((c) => c.id !== excludeId)
    .reduce((s, c) => s + c.targetWeight, 0);
  const total = Math.round((existing + newWeight) * 100) / 100;
  if (total > 100 + 1e-9) throw new TargetWeightError(total);
}

export async function listCategories() {
  return db.select().from(category).orderBy(category.sortOrder).all();
}
export async function createCategory(input: { name: string; targetWeight: number; sortOrder: number }) {
  assertWithinTarget(input.targetWeight);
  return db.insert(category).values(input).returning().get();
}
export async function updateCategory(id: number, input: { name: string; targetWeight: number; sortOrder: number }) {
  assertWithinTarget(input.targetWeight, id);
  return db.update(category).set(input).where(eq(category.id, id)).returning().get();
}
export async function deleteCategory(id: number) {
  db.update(holding).set({ categoryId: null }).where(eq(holding.categoryId, id)).run();
  db.delete(category).where(eq(category.id, id)).run();
}
