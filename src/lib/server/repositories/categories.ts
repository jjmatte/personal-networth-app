import { db } from '../db';
import { category, holding } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function listCategories() {
  return db.select().from(category).orderBy(category.sortOrder).all();
}
export async function createCategory(input: { name: string; targetWeight: number; sortOrder: number }) {
  return db.insert(category).values(input).returning().get();
}
export async function updateCategory(id: number, input: { name: string; targetWeight: number; sortOrder: number }) {
  return db.update(category).set(input).where(eq(category.id, id)).returning().get();
}
export async function deleteCategory(id: number) {
  db.update(holding).set({ categoryId: null }).where(eq(holding.categoryId, id)).run();
  db.delete(category).where(eq(category.id, id)).run();
}
