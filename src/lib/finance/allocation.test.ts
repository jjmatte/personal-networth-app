import { describe, it, expect } from 'vitest';
import { allocation, targetsSum, distributeContribution, mostUnderweight } from './allocation';
import type { AllocationRow } from './allocation';

function row(
	categoryId: number | null,
	name: string,
	targetWeight: number,
	actualPercent: number
): AllocationRow {
	return {
		categoryId,
		name,
		targetWeight,
		actualPercent,
		actualValue: 0,
		driftPercent: actualPercent - targetWeight,
		targetValue: 0,
		deltaValue: 0
	};
}

const cats = [
  { id: 1, name: 'US Large Cap', targetWeight: 50 },
  { id: 2, name: 'Bonds', targetWeight: 50 }
];

describe('allocation', () => {
  it('computes actual %, drift, target$ and delta$', () => {
    const holdings = [
      { categoryId: 1, currentValue: 600 },
      { categoryId: 2, currentValue: 400 }
    ];
    const rows = allocation(cats, holdings);
    expect(rows[0]).toMatchObject({ categoryId: 1, actualValue: 600, actualPercent: 60, driftPercent: 10, targetValue: 500, deltaValue: -100 });
    expect(rows[1]).toMatchObject({ categoryId: 2, actualPercent: 40, driftPercent: -10, deltaValue: 100 });
  });

  it('empty portfolio does not divide by zero', () => {
    const rows = allocation(cats, []);
    expect(rows[0].actualPercent).toBe(0);
    expect(rows[0].driftPercent).toBe(-50);
    expect(rows[0].targetValue).toBe(0);
  });

  it('adds an Uncategorized bucket for null-category holdings', () => {
    const rows = allocation(cats, [{ categoryId: null, currentValue: 100 }]);
    const uncat = rows.find((r) => r.categoryId === null);
    expect(uncat).toBeDefined();
    expect(uncat!.actualValue).toBe(100);
  });

  it('adds Uncategorized row even with zero-value null-category holding', () => {
    const rows = allocation(cats, [{ categoryId: null, currentValue: 0 }]);
    const uncat = rows.find((r) => r.categoryId === null);
    expect(uncat).toBeDefined();
    expect(uncat!.actualValue).toBe(0);
  });

  it('targetsSum adds target weights', () => {
    expect(targetsSum(cats)).toBe(100);
  });

  it('mostUnderweight ranks by relative deviation, not dollar gap', () => {
    // Big is 5% below target; Small is 60% below target → Small wins despite a smaller dollar gap.
    const rows = [row(1, 'Big', 80, 76), row(2, 'Small', 20, 8)];
    expect(mostUnderweight(rows)?.categoryId).toBe(2);
  });

  it('mostUnderweight picks the least overweight when everything is at/above target', () => {
    const rows = [row(1, 'A', 50, 60), row(2, 'B', 50, 55)];
    expect(mostUnderweight(rows)?.categoryId).toBe(2);
  });

  it('mostUnderweight breaks ties toward the higher target weight (e.g. empty portfolio)', () => {
    const rows = [row(1, 'A', 30, 0), row(2, 'B', 70, 0)];
    expect(mostUnderweight(rows)?.categoryId).toBe(2);
  });

  it('mostUnderweight ignores zero-target and Uncategorized rows', () => {
    const rows = [row(0 as number, 'Zero', 0, 0), row(2, 'Real', 50, 40), row(null, 'Uncategorized', 0, 100)];
    expect(mostUnderweight(rows)?.categoryId).toBe(2);
  });

  it('mostUnderweight returns null when no category has a positive target', () => {
    expect(mostUnderweight([])).toBeNull();
    expect(mostUnderweight([row(null, 'Uncategorized', 0, 100)])).toBeNull();
  });

  it('distributeContribution fills the underweight category first', () => {
    const rows = allocation(cats, [{ categoryId: 1, currentValue: 600 }, { categoryId: 2, currentValue: 400 }]);
    const plan = distributeContribution(rows, 200); // newTotal 1200, targets 600/600; need 0/200
    const bonds = plan.find((p) => p.categoryId === 2)!;
    expect(bonds.buy).toBeCloseTo(200);
  });
});
