import type { PageServerLoad } from './$types';
import { portfolioSummary } from '$lib/server/repositories/portfolio';
import { listSnapshots } from '$lib/server/repositories/networth';
import { listCategories } from '$lib/server/repositories/categories';
import { listHoldings } from '$lib/server/repositories/holdings';
import { holdingHistory } from '$lib/server/repositories/history';
import { allocation } from '$lib/finance/allocation';
import { buildNetWorthSeries } from '$lib/finance/snapshot-stats';

export const load: PageServerLoad = async () => {
  const [investments, snaps, categories, holdings] = await Promise.all([
    portfolioSummary(),
    listSnapshots(), // newest first
    listCategories(),
    listHoldings()
  ]);

  const cats = categories.map((c) => ({ id: c.id, name: c.name, targetWeight: c.targetWeight }));
  const forAlloc = holdings.map((h) => ({ categoryId: h.categoryId, currentValue: h.currentValue }));

  const historyByHolding = await Promise.all(holdings.map((h) => holdingHistory(h.id)));
  const historySeries = holdings.map((h, i) => ({
    symbol: h.symbol,
    points: historyByHolding[i].map((p) => ({ t: p.recordedAt, value: p.value }))
  }));

  const latest = snaps[0] ?? null;
  const prev = snaps[1] ?? null;

  return {
    investments,
    netWorth: latest
      ? { takenAt: latest.takenAt, total: latest.total, delta: prev ? latest.total - prev.total : null }
      : null,
    netWorthSeries: buildNetWorthSeries(snaps),
    allocationRows: allocation(cats, forAlloc),
    historySeries
  };
};
