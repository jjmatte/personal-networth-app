import { describe, it, expect } from 'vitest';
import { fireNumber, milestoneTarget, ladderStatus } from './fire';

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
});
