import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from './test-harness';
import { createHolding, getHolding } from './holdings';
import { createAccount, getAccount, listAccounts, deleteAccount } from './accounts';

beforeEach(() => makeTestDb());

describe('accounts repository', () => {
  it('creates an account and reads it back', async () => {
    const a = await createAccount({ name: '401k', type: 'retirement', accessible: false, sortOrder: 0 });
    const got = await getAccount(a.id);
    expect(got).toMatchObject({ name: '401k', type: 'retirement', accessible: false, sortOrder: 0 });
  });

  it('lists accounts in sortOrder', async () => {
    await createAccount({ name: 'B', type: 'taxable', accessible: true, sortOrder: 2 });
    await createAccount({ name: 'A', type: 'taxable', accessible: true, sortOrder: 1 });
    expect((await listAccounts()).map((a) => a.name)).toEqual(['A', 'B']);
  });

  it('deleteAccount nulls its holdings accountId and removes the account', async () => {
    const a = await createAccount({ name: 'IRA', type: 'retirement', accessible: false, sortOrder: 0 });
    const h = await createHolding({ symbol: 'VTI', name: 'Total Market', categoryId: null, currentValue: 100, accountId: a.id });
    expect((await getHolding(h.id))!.accountId).toBe(a.id);
    await deleteAccount(a.id);
    expect(await getAccount(a.id)).toBeUndefined();
    expect((await getHolding(h.id))!.accountId).toBeNull();
  });
});
