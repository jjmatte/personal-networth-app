import { describe, it, expect } from 'vitest';
import { fireNumber, milestoneTarget, ladderStatus, accessibilitySplit } from './fire';

const ms = [
  { kind: 'percent' as const, value: 50, label: 'Half', sortOrder: 2 },
  { kind: 'fixed' as const, value: 0, label: 'Zero', sortOrder: 0 },
  { kind: 'fixed' as const, value: 100000, label: '100k', sortOrder: 1 },
  { kind: 'percent' as const, value: 100, label: 'FIRE', sortOrder: 3 }
];

describe('fire', () => {
  it('fireNumber = spend * 12 * 25', () => {
    expect(fireNumber(4000)).toBe(1_200_000);
    expect(fireNumber(0)).toBe(0);
  });

  it('milestoneTarget fixed and percent', () => {
    expect(milestoneTarget({ kind: 'fixed', value: 50000 }, 1_000_000)).toBe(50000);
    expect(milestoneTarget({ kind: 'percent', value: 25 }, 1_000_000)).toBe(250000);
  });

  it('completes at and above threshold, sorted', () => {
    const s = ladderStatus(ms, 1_000_000, 500000);
    expect(s.map((r) => r.label)).toEqual(['Zero', '100k', 'Half', 'FIRE']);
    expect(s.map((r) => r.complete)).toEqual([true, true, true, false]);
    expect(s[2].target).toBe(500000);
    expect(s[3].amountToNext).toBe(500000);
  });

  it('amountToNext floors at 0 for completed rungs', () => {
    const s = ladderStatus(ms, 1_000_000, 2_000_000);
    expect(s.every((r) => r.complete && r.amountToNext === 0)).toBe(true);
  });

  it('monthlySpend = 0 leaves percent rungs incomplete', () => {
    const s = ladderStatus(ms, fireNumber(0), 5_000_000);
    const half = s.find((r) => r.label === 'Half')!;
    const fire = s.find((r) => r.label === 'FIRE')!;
    expect(half.target).toBe(0);
    expect(half.complete).toBe(false);
    expect(fire.complete).toBe(false);
    expect(s.find((r) => r.label === '100k')!.complete).toBe(true);
  });

  it('negative net worth completes only sub-zero fixed rungs', () => {
    const rungs = [{ kind: 'fixed' as const, value: -5000, label: 'Debt free-ish', sortOrder: 0 }, ...ms];
    const s = ladderStatus(rungs, 1_000_000, -1000);
    expect(s.filter((r) => r.complete).map((r) => r.label)).toEqual(['Debt free-ish']);
    expect(s.find((r) => r.label === 'Zero')!.amountToNext).toBe(1000);
  });

  describe('accessibilitySplit', () => {
    const accounts = [
      { id: 1, accessible: true },
      { id: 2, accessible: false }
    ];

    it('splits holdings by account accessibility', () => {
      const holdings = [
        { accountId: 1, currentValue: 1000 },
        { accountId: 2, currentValue: 5000 },
        { accountId: 1, currentValue: 250 }
      ];
      expect(accessibilitySplit(accounts, holdings)).toEqual({ accessible: 1250, locked: 5000 });
    });

    it('counts null-account holdings as locked', () => {
      expect(accessibilitySplit(accounts, [{ accountId: null, currentValue: 700 }])).toEqual({
        accessible: 0,
        locked: 700
      });
    });

    it('counts orphan accountId as locked so the total is preserved', () => {
      const holdings = [
        { accountId: 1, currentValue: 100 },
        { accountId: 99, currentValue: 400 }
      ];
      const r = accessibilitySplit(accounts, holdings);
      expect(r).toEqual({ accessible: 100, locked: 400 });
      expect(r.accessible + r.locked).toBe(500);
    });
  });
});
