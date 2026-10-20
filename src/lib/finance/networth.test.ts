// src/lib/finance/networth.test.ts
import { describe, it, expect } from 'vitest';
import { netWorthTotals, reconcileInvestmentLine, INVESTMENTS_LINE, type NetWorthRow } from './networth';

const row = (p: Partial<NetWorthRow>): NetWorthRow => ({
  side: 'asset', category: 'Cash', label: 'Checking', amount: 0, sortOrder: 0, ...p
});

describe('netWorthTotals', () => {
  it('sums assets and liabilities and nets them', () => {
    expect(netWorthTotals([
      { side: 'asset', amount: 100 },
      { side: 'asset', amount: 50 },
      { side: 'liability', amount: 30 }
    ])).toEqual({ assets: 150, liabilities: 30, net: 120 });
  });
  it('is all zero for no items', () => {
    expect(netWorthTotals([])).toEqual({ assets: 0, liabilities: 0, net: 0 });
  });
  it('nets negative when liabilities exceed assets', () => {
    expect(netWorthTotals([
      { side: 'asset', amount: 10 },
      { side: 'liability', amount: 40 }
    ]).net).toBe(-30);
  });
  it('handles a single-sided (liabilities-only) snapshot', () => {
    expect(netWorthTotals([{ side: 'liability', amount: 25 }]))
      .toEqual({ assets: 0, liabilities: 25, net: -25 });
  });
});

describe('reconcileInvestmentLine', () => {
  it('injects an Investments asset line when none is present', () => {
    const out = reconcileInvestmentLine([row({ category: 'Cash', label: 'Checking', amount: 8400 })], 1960);
    const inv = out.find((r) => r.category === INVESTMENTS_LINE.category && r.label === INVESTMENTS_LINE.label);
    expect(inv).toMatchObject({ side: 'asset', amount: 1960 });
    expect(out).toHaveLength(2);
  });
  it('updates the existing Investments line amount, leaving other rows intact', () => {
    const rows = [
      row({ ...INVESTMENTS_LINE, side: 'asset', amount: 100 }),
      row({ category: 'Cash', label: 'Checking', amount: 8400 })
    ];
    const out = reconcileInvestmentLine(rows, 1960);
    expect(out.find((r) => r.category === 'Investments')!.amount).toBe(1960);
    expect(out.find((r) => r.category === 'Cash')!.amount).toBe(8400);
    expect(out).toHaveLength(2);
  });
  it('requires both category AND label to match — decoys do not count as the Investments line', () => {
    const rows = [
      row({ category: 'Investments', label: 'Crypto fund', amount: 500 }), // category match, label miss
      row({ category: 'Brokerage', label: 'Investment portfolio', amount: 700 }) // label match, category miss
    ];
    const out = reconcileInvestmentLine(rows, 1960);
    // Neither decoy matched, so a fresh Investments line is prepended and both decoys stay intact.
    expect(out).toHaveLength(3);
    expect(out[0]).toMatchObject({ ...INVESTMENTS_LINE, side: 'asset', amount: 1960 });
    expect(out.find((r) => r.label === 'Crypto fund')!.amount).toBe(500);
    expect(out.find((r) => r.category === 'Brokerage')!.amount).toBe(700);
  });
});
