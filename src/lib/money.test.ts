import { describe, it, expect } from 'vitest';
import { truncToCents, formatUsd } from './money';

describe('truncToCents', () => {
  it('drops sub-cent fractions', () => {
    expect(truncToCents(10.999)).toBe(10.99);
    expect(truncToCents(10.991)).toBe(10.99);
    expect(truncToCents(0.009)).toBe(0);
  });
  it('leaves exact cents untouched', () => {
    expect(truncToCents(10.07)).toBe(10.07); // float-error trap: 10.07*100 = 1006.9999…
    expect(truncToCents(1234.56)).toBe(1234.56);
    expect(truncToCents(0)).toBe(0);
    expect(truncToCents(100)).toBe(100);
  });
  it('truncates toward zero for losses (not toward −∞)', () => {
    expect(truncToCents(-12.341)).toBe(-12.34);
    expect(truncToCents(-10.999)).toBe(-10.99);
    expect(truncToCents(-0.001)).toBe(0);
  });
  it('returns NaN untouched', () => {
    expect(truncToCents(NaN)).toBeNaN();
  });
});

describe('formatUsd', () => {
  it('truncates then formats to two decimals', () => {
    expect(formatUsd(1234.569)).toBe('$1,234.56');
    expect(formatUsd(1000)).toBe('$1,000.00');
    expect(formatUsd(0)).toBe('$0.00');
    expect(formatUsd(-12.341)).toBe('-$12.34');
  });
});
