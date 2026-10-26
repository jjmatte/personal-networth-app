import { describe, it, expect } from 'vitest';
import { buildYearlyReview } from './yearly';

describe('buildYearlyReview', () => {
  it('derives year-end from the latest snapshot in the year and overrides a manual row', () => {
    const rows = buildYearlyReview(
      [{ year: 2025, netWorth: 1 }],
      [
        { takenAt: '2025-12-31', total: 246 },
        { takenAt: '2025-03-31', total: 200 }
      ]
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ year: 2025, netWorth: 246, source: 'snapshot' });
  });

  it('uses manual value for years without snapshots', () => {
    const rows = buildYearlyReview([{ year: 2019, netWorth: 42047 }], []);
    expect(rows).toEqual([{ year: 2019, netWorth: 42047, source: 'manual', gain: null, monthly: null }]);
  });

  it('computes gain and monthly across the union, ascending', () => {
    const rows = buildYearlyReview(
      [
        { year: 2020, netWorth: 63920 },
        { year: 2019, netWorth: 42047 }
      ],
      []
    );
    expect(rows.map((r) => r.year)).toEqual([2019, 2020]);
    expect(rows[0].gain).toBeNull();
    expect(rows[1].gain).toBe(21873);
    expect(rows[1].monthly).toBe(21873 / 12);
  });

  it('supports a negative-gain year', () => {
    const rows = buildYearlyReview(
      [{ year: 2024, netWorth: 100 }],
      [{ takenAt: new Date('2025-06-01'), total: 80 }]
    );
    expect(rows[1]).toMatchObject({ year: 2025, netWorth: 80, source: 'snapshot', gain: -20, monthly: -20 / 12 });
  });

  it('returns [] for no inputs', () => {
    expect(buildYearlyReview([], [])).toEqual([]);
  });
});
