const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function truncToCents(value: number): number {
  if (!Number.isFinite(value)) return value;
  // Round to kill IEEE-754 noise (10.07 * 100 = 1006.9999…) before truncating.
  // Math.trunc drops the fraction toward zero, so losses lose cents toward zero too
  // (−12.341 → −12.34), never away from it.
  const cents = Math.trunc(Number((value * 100).toFixed(6)));
  return cents === 0 ? 0 : cents / 100; // normalize -0 to 0
}

export function formatUsd(value: number): string {
  return usd.format(truncToCents(value));
}
