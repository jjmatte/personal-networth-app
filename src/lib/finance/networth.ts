// src/lib/finance/networth.ts
export type NetWorthSide = 'asset' | 'liability';

export interface NetWorthRow {
  side: NetWorthSide;
  category: string;
  label: string;
  amount: number;
  sortOrder: number;
}

export const INVESTMENTS_LINE = { category: 'Investments', label: 'Investment portfolio' } as const;

export function netWorthTotals(items: { side: NetWorthSide; amount: number }[]): {
  assets: number;
  liabilities: number;
  net: number;
} {
  let assets = 0;
  let liabilities = 0;
  for (const i of items) {
    if (i.side === 'asset') assets += i.amount;
    else liabilities += i.amount;
  }
  return { assets, liabilities, net: assets - liabilities };
}

function isInvestmentsLine(r: NetWorthRow): boolean {
  return r.category === INVESTMENTS_LINE.category && r.label === INVESTMENTS_LINE.label;
}

export function reconcileInvestmentLine(rows: NetWorthRow[], portfolioTotal: number): NetWorthRow[] {
  if (rows.some(isInvestmentsLine)) {
    return rows.map((r) => (isInvestmentsLine(r) ? { ...r, amount: portfolioTotal } : r));
  }
  const seeded: NetWorthRow = {
    side: 'asset',
    category: INVESTMENTS_LINE.category,
    label: INVESTMENTS_LINE.label,
    amount: portfolioTotal,
    sortOrder: 0
  };
  return [seeded, ...rows];
}
