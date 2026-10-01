import { describe, it, expect } from 'vitest';
import {
  lotCostBasis, totalShares, holdingCostBasis, derivedPricePerShare,
  holdingGain, perLotGain, overallGain, totalValue
} from './gains';

const lots = [
  { shares: 10, pricePerShare: 100 },           // cost 1000
  { shares: 5, pricePerShare: 120, fee: 5 }      // cost 605
];

describe('gains', () => {
  it('lotCostBasis includes fee', () => {
    expect(lotCostBasis(lots[0])).toBe(1000);
    expect(lotCostBasis(lots[1])).toBe(605);
  });
  it('totals shares and cost basis', () => {
    expect(totalShares(lots)).toBe(15);
    expect(holdingCostBasis(lots)).toBe(1605);
  });
  it('derives price/share, null when no shares', () => {
    expect(derivedPricePerShare(1800, lots)).toBe(120);
    expect(derivedPricePerShare(1800, [])).toBeNull();
  });
  it('holding gain amount and percent', () => {
    expect(holdingGain(1800, lots)).toEqual({ amount: 195, percent: 195 / 1605 });
  });
  it('holding with value but no lots → percent null, gain = value', () => {
    expect(holdingGain(500, [])).toEqual({ amount: 500, percent: null });
  });
  it('per-lot gain, null without shares', () => {
    expect(perLotGain(lots[0], 1800, lots)).toBe(200); // 10*120 - 1000
    expect(perLotGain({ shares: 1, pricePerShare: 1 }, 100, [])).toBeNull();
  });
  it('overall gain and total value sum holdings', () => {
    const holdings = [{ currentValue: 1800, lots }, { currentValue: 500, lots: [] }];
    expect(overallGain(holdings)).toBe(695); // 195 + 500
    expect(totalValue(holdings)).toBe(2300);
  });
});
