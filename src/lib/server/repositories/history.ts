import { db } from '../db';
import { valueHistory } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function holdingHistory(holdingId: number) {
  return db.select().from(valueHistory).where(eq(valueHistory.holdingId, holdingId)).orderBy(valueHistory.recordedAt).all();
}
