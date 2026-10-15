import { describe, it, expect } from 'vitest';
import { holdingSchema, lotSchema, netWorthItemSchema } from './schemas';

describe('schema cent-flooring', () => {
  it('floors holding currentValue down to the cent', () => {
    const h = holdingSchema.parse({ symbol: 'X', name: 'X', categoryId: null, currentValue: '10.999' });
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
