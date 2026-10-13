import { listHoldings } from './holdings';
import { listLots } from './lots';
import { totalValue, overallGain } from '$lib/finance/gains';
import type { Lot } from '$lib/finance/types';

export async function portfolioSummary(): Promise<{ total: number; overallGain: number }> {
  const holdings = await listHoldings();
  const inputs = [];
  for (const h of holdings) {
    const rows = await listLots(h.id);
    const lots: Lot[] = rows.map((l) => ({ shares: l.shares, pricePerShare: l.pricePerShare, fee: l.fee ?? undefined }));
    inputs.push({ currentValue: h.currentValue, lots });
  }
  return { total: totalValue(holdings), overallGain: overallGain(inputs) };
}
