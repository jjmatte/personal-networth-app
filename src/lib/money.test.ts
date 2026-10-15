import { describe, it, expect } from 'vitest';
import { floorToCents, formatUsd } from './money';

describe('floorToCents', () => {
  it('drops sub-cent fractions', () => {
    expect(floorToCents(10.999)).toBe(10.99);
    expect(floorToCents(10.991)).toBe(10.99);
    expect(floorToCents(0.009)).toBe(0);
  });
  it('leaves exact cents untouched', () => {
    expect(floorToCents(10.07)).toBe(10.07); // float-error trap: 10.07*100 = 1006.9999…
    expect(floorToCents(1234.56)).toBe(1234.56);
    expect(floorToCents(0)).toBe(0);
    expect(floorToCents(100)).toBe(100);
  });
  it('rounds down toward negative infinity for losses', () => {
    expect(floorToCents(-12.341)).toBe(-12.35);
    expect(floorToCents(-0.001)).toBe(-0.01);
  });
  it('returns NaN untouched', () => {
    expect(floorToCents(NaN)).toBeNaN();
  });
});

describe('formatUsd', () => {
  it('floors then formats to two decimals', () => {
    expect(formatUsd(1234.569)).toBe('$1,234.56');
    expect(formatUsd(1000)).toBe('$1,000.00');
    expect(formatUsd(0)).toBe('$0.00');
  });
});
