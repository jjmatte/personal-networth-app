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

export function investmentLinesByAccount(
  holdings: { accountId: number | null; currentValue: number }[],
  accounts: { id: number; name: string }[]
): NetWorthRow[] {
  const byAccount = new Map<number, number>();
  let unassigned = 0;
  let hasUnassigned = false;
  for (const h of holdings) {
    if (h.accountId === null) {
      unassigned += h.currentValue;
      hasUnassigned = true;
    } else {
      byAccount.set(h.accountId, (byAccount.get(h.accountId) ?? 0) + h.currentValue);
    }
  }
  const lines: { label: string; amount: number }[] = [];
  for (const a of accounts) {
    const amount = byAccount.get(a.id);
    if (amount !== undefined) lines.push({ label: a.name, amount });
  }
  if (hasUnassigned) lines.push({ label: 'Unassigned', amount: unassigned });
  return lines.map((l, i) => ({
    side: 'asset',
    category: INVESTMENTS_LINE.category,
    label: l.label,
    amount: l.amount,
    sortOrder: i
  }));
}
