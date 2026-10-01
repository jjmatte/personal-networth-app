import { describe, it, expect } from 'vitest';
import { allocation, targetsSum, distributeContribution } from './allocation';

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

  it('targetsSum adds target weights', () => {
    expect(targetsSum(cats)).toBe(100);
  });

  it('distributeContribution fills the underweight category first', () => {
    const rows = allocation(cats, [{ categoryId: 1, currentValue: 600 }, { categoryId: 2, currentValue: 400 }]);
    const plan = distributeContribution(rows, 200); // newTotal 1200, targets 600/600; need 0/200
    const bonds = plan.find((p) => p.categoryId === 2)!;
    expect(bonds.buy).toBeCloseTo(200);
  });
});
