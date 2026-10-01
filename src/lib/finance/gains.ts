import type { Lot, HoldingInput } from './types';

export function lotCostBasis(lot: Lot): number {
  return lot.shares * lot.pricePerShare + (lot.fee ?? 0);
}
export function totalShares(lots: Lot[]): number {
  return lots.reduce((s, l) => s + l.shares, 0);
}
export function holdingCostBasis(lots: Lot[]): number {
  return lots.reduce((s, l) => s + lotCostBasis(l), 0);
}
export function derivedPricePerShare(currentValue: number, lots: Lot[]): number | null {
  const sh = totalShares(lots);
  return sh > 0 ? currentValue / sh : null;
}
export function holdingGain(currentValue: number, lots: Lot[]): { amount: number; percent: number | null } {
  const cost = holdingCostBasis(lots);
  const amount = currentValue - cost;
  return { amount, percent: cost > 0 ? amount / cost : null };
}
export function perLotGain(lot: Lot, currentValue: number, lots: Lot[]): number | null {
  const price = derivedPricePerShare(currentValue, lots);
  return price === null ? null : lot.shares * price - lotCostBasis(lot);
}
export function overallGain(holdings: HoldingInput[]): number {
  return holdings.reduce((s, h) => s + holdingGain(h.currentValue, h.lots).amount, 0);
}
export function totalValue(holdings: { currentValue: number }[]): number {
  return holdings.reduce((s, h) => s + h.currentValue, 0);
}
