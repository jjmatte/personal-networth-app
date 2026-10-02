import type { CategoryTarget, HoldingForAllocation } from './types';
import { totalValue } from './gains';

export interface AllocationRow {
  categoryId: number | null;
  name: string;
  targetWeight: number;
  actualValue: number;
  actualPercent: number;
  driftPercent: number;
  targetValue: number;
  deltaValue: number;
}

function valueFor(holdings: HoldingForAllocation[], categoryId: number | null): number {
  return holdings.filter((h) => h.categoryId === categoryId).reduce((s, h) => s + h.currentValue, 0);
}

export function allocation(categories: CategoryTarget[], holdings: HoldingForAllocation[]): AllocationRow[] {
  const total = totalValue(holdings);
  const rows: AllocationRow[] = categories.map((c) => {
    const actualValue = valueFor(holdings, c.id);
    const actualPercent = total > 0 ? (actualValue / total) * 100 : 0;
    const targetValue = total * (c.targetWeight / 100);
    return {
      categoryId: c.id,
      name: c.name,
      targetWeight: c.targetWeight,
      actualValue,
      actualPercent,
      driftPercent: actualPercent - c.targetWeight,
      targetValue,
      deltaValue: targetValue - actualValue
    };
  });
  const uncatValue = valueFor(holdings, null);
  if (holdings.some((h) => h.categoryId === null)) {
    rows.push({
      categoryId: null, name: 'Uncategorized', targetWeight: 0,
      actualValue: uncatValue, actualPercent: total > 0 ? (uncatValue / total) * 100 : 0,
      driftPercent: total > 0 ? (uncatValue / total) * 100 : 0, targetValue: 0, deltaValue: -uncatValue
    });
  }
  return rows;
}

export function targetsSum(categories: CategoryTarget[]): number {
  return categories.reduce((s, c) => s + c.targetWeight, 0);
}

export function mostUnderweight(rows: AllocationRow[]): AllocationRow | null {
  const eligible = rows.filter((r) => r.targetWeight > 0);
  if (eligible.length === 0) return null;
  const relDrift = (r: AllocationRow) => (r.targetWeight - r.actualPercent) / r.targetWeight;
  return eligible.reduce((best, r) => {
    const d = relDrift(r);
    const bd = relDrift(best);
    if (d > bd) return r;
    if (d === bd && r.targetWeight > best.targetWeight) return r;
    return best;
  });
}

export function distributeContribution(rows: AllocationRow[], amount: number): { categoryId: number | null; buy: number }[] {
  const total = rows.reduce((s, r) => s + r.actualValue, 0);
  const newTotal = total + amount;
  const needs = rows.map((r) => ({ categoryId: r.categoryId, need: Math.max(0, (r.targetWeight / 100) * newTotal - r.actualValue) }));
  const sumNeeds = needs.reduce((s, n) => s + n.need, 0);
  if (sumNeeds <= 0) {
    const wsum = rows.reduce((s, r) => s + r.targetWeight, 0) || 1;
    return rows.map((r) => ({ categoryId: r.categoryId, buy: amount * (r.targetWeight / wsum) }));
  }
  if (sumNeeds <= amount) {
    const leftover = amount - sumNeeds;
    const wsum = rows.reduce((s, r) => s + r.targetWeight, 0) || 1;
    return needs.map((n, i) => ({ categoryId: n.categoryId, buy: n.need + leftover * (rows[i].targetWeight / wsum) }));
  }
  return needs.map((n) => ({ categoryId: n.categoryId, buy: amount * (n.need / sumNeeds) }));
}
