import { db } from '../db';
import { account, holding } from '../db/schema';
import { eq } from 'drizzle-orm';

type AccountInput = { name: string; type: string; accessible: boolean; sortOrder: number };

export async function listAccounts() {
  return db.select().from(account).orderBy(account.sortOrder).all();
}
export async function getAccount(id: number) {
  return db.select().from(account).where(eq(account.id, id)).get();
}
export async function createAccount(input: AccountInput) {
  return db.insert(account).values(input).returning().get();
}
export async function updateAccount(id: number, input: AccountInput) {
  return db.update(account).set(input).where(eq(account.id, id)).returning().get();
}
export async function deleteAccount(id: number) {
  db.update(holding).set({ accountId: null }).where(eq(holding.accountId, id)).run();
  db.delete(account).where(eq(account.id, id)).run();
}
