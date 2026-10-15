const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function floorToCents(value: number): number {
  if (!Number.isFinite(value)) return value;
  // Round to kill IEEE-754 noise (10.07 * 100 = 1006.9999…) before flooring.
  const cents = Math.floor(Number((value * 100).toFixed(6)));
  return cents / 100;
}

export function formatUsd(value: number): string {
  return usd.format(floorToCents(value));
}
