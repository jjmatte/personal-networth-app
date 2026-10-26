import { describe, it, expect } from 'vitest';
import { buildIncomeReview } from './income';

describe('buildIncomeReview', () => {
  it('sums persons into actualIncome and derives monthly', () => {
    const rows = buildIncomeReview(
      [],
      [
        { year: 2024, name: 'Deona', amount: 63953 },
        { year: 2024, name: 'Jack', amount: 69061 }
      ]
    );
    expect(rows[0].persons).toEqual([
      { name: 'Deona', amount: 63953 },
      { name: 'Jack', amount: 69061 }
    ]);
    expect(rows[0].actualIncome).toBe(133014);
    expect(rows[0].actualMonthly).toBeCloseTo(133014 / 12);
  });

  it('derives estimated/investment monthly as annual/12', () => {
    const rows = buildIncomeReview(
      [{ year: 2024, estimatedIncome: 110000, investmentIncome: 1775.56, netMonthlyMargin: 500 }],
      []
    );
    expect(rows[0].estimatedMonthly).toBeCloseTo(110000 / 12);
    expect(rows[0].investmentMonthly).toBeCloseTo(1775.56 / 12);
    expect(rows[0].netMonthlyMargin).toBe(500);
  });

  it('includes a year that has persons but no income_year row', () => {
    const rows = buildIncomeReview(
      [],
      [
        { year: 2022, name: 'A', amount: 1000 },
        { year: 2022, name: 'B', amount: 2000 }
      ]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].year).toBe(2022);
    expect(rows[0].estimatedIncome).toBe(0);
    expect(rows[0].investmentIncome).toBe(0);
    expect(rows[0].netMonthlyMargin).toBe(0);
    expect(rows[0].actualIncome).toBe(3000);
  });

  it('includes a year that has an income_year row but no persons', () => {
    const rows = buildIncomeReview(
      [{ year: 2023, estimatedIncome: 50000, investmentIncome: 0, netMonthlyMargin: 0 }],
      []
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].actualIncome).toBe(0);
    expect(rows[0].actualMonthly).toBe(0);
    expect(rows[0].persons).toEqual([]);
  });

  it('orders rows ascending by year', () => {
    const rows = buildIncomeReview(
      [{ year: 2025, estimatedIncome: 1, investmentIncome: 1, netMonthlyMargin: 1 }],
      [
        { year: 2024, name: 'A', amount: 1 },
        { year: 2022, name: 'A', amount: 1 }
      ]
    );
    expect(rows.map((r) => r.year)).toEqual([2022, 2024, 2025]);
  });
});
