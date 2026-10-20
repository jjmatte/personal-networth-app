import { describe, it, expect } from 'vitest';
import { accountSchema, holdingSchema, lotSchema, netWorthItemSchema } from './schemas';

describe('schema cent-flooring', () => {
  it('floors holding currentValue down to the cent', () => {
    const h = holdingSchema.parse({ symbol: 'X', name: 'X', categoryId: null, accountId: null, currentValue: '10.999' });
    expect(h.currentValue).toBe(10.99);
  });
  it('floors lot fee but leaves pricePerShare at full precision', () => {
    const l = lotSchema.parse({
      holdingId: 1, tradeDate: '2026-01-01', shares: '2',
      pricePerShare: '0.00012', fee: '1.239'
    });
    expect(l.fee).toBe(1.23);
    expect(l.pricePerShare).toBe(0.00012); // sub-cent crypto price untouched
  });
  it('floors net-worth item amount down to the cent', () => {
    const i = netWorthItemSchema.parse({ side: 'asset', category: 'c', label: 'l', amount: '100.009' });
    expect(i.amount).toBe(100);
  });
});

describe('accountSchema', () => {
  it('rejects an empty name', () => {
    expect(accountSchema.safeParse({ name: '', type: 'taxable' }).success).toBe(false);
  });
  it('rejects an unknown type', () => {
    expect(accountSchema.safeParse({ name: 'A', type: 'brokerage' }).success).toBe(false);
  });
  it('accepts every known type', () => {
    for (const type of ['taxable', 'roth_ira', 'traditional_ira', 'hsa', '401k', 'other']) {
      expect(accountSchema.safeParse({ name: 'A', type }).success).toBe(true);
    }
  });
  it('coerces accessible and defaults accessible/sortOrder', () => {
    expect(accountSchema.parse({ name: 'A', type: 'hsa', accessible: 'true' }).accessible).toBe(true);
    const a = accountSchema.parse({ name: 'A', type: 'hsa' });
    expect(a.accessible).toBe(false);
    expect(a.sortOrder).toBe(0);
  });
});

describe('holdingSchema accountId', () => {
  const base = { symbol: 'X', name: 'X', categoryId: null };
  it('parses a valid accountId', () => {
    expect(holdingSchema.parse({ ...base, accountId: '3' }).accountId).toBe(3);
  });
  it('accepts null accountId', () => {
    expect(holdingSchema.parse({ ...base, accountId: null }).accountId).toBeNull();
  });
});
