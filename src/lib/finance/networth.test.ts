// src/lib/finance/networth.test.ts
import { describe, it, expect } from 'vitest';
import {
  netWorthTotals,
  investmentLinesByAccount,
  INVESTMENTS_LINE,
  type NetWorthRow
} from './networth';

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

describe('investmentLinesByAccount', () => {
  const accounts = [
    { id: 1, name: 'Brokerage' },
    { id: 2, name: 'Roth IRA' },
    { id: 3, name: 'Empty' }
  ];

  it('produces one labeled Investments asset line per account with summed amounts, omitting empty accounts', () => {
    const out = investmentLinesByAccount(
      [
        { accountId: 1, currentValue: 1000 },
        { accountId: 1, currentValue: 250.5 },
        { accountId: 2, currentValue: 700 }
      ],
      accounts
    );
    expect(out).toEqual([
      { side: 'asset', category: 'Investments', label: 'Brokerage', amount: 1250.5, sortOrder: 0 },
      { side: 'asset', category: 'Investments', label: 'Roth IRA', amount: 700, sortOrder: 1 }
    ]);
  });
  it('sums null-account holdings into a single Unassigned line', () => {
    const out = investmentLinesByAccount(
      [
        { accountId: null, currentValue: 40 },
        { accountId: 1, currentValue: 100 },
        { accountId: null, currentValue: 60 }
      ],
      accounts
    );
    const unassigned = out.filter((r) => r.label === 'Unassigned');
    expect(unassigned).toHaveLength(1);
    expect(unassigned[0]).toMatchObject({ side: 'asset', category: 'Investments', amount: 100 });
    expect(out).toHaveLength(2);
  });
  it('lands the same symbol split across two accounts in both lines, summing to the portfolio total', () => {
    const holdings = [
      { accountId: 1, currentValue: 600 },
      { accountId: 2, currentValue: 400 }
    ];
    const out = investmentLinesByAccount(holdings, accounts);
    expect(out.map((r) => r.amount)).toEqual([600, 400]);
    expect(out.reduce((s, r) => s + r.amount, 0)).toBe(holdings.reduce((s, h) => s + h.currentValue, 0));
  });
  it('returns no lines when there are no holdings', () => {
    expect(investmentLinesByAccount([], accounts)).toEqual([]);
  });
});
