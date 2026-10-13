import type { PageServerLoad } from './$types';
import { portfolioSummary } from '$lib/server/repositories/portfolio';
import { listSnapshots } from '$lib/server/repositories/networth';

export const load: PageServerLoad = async () => {
  const investments = await portfolioSummary();
  const snaps = await listSnapshots(); // newest first
  const latest = snaps[0] ?? null;
  const prev = snaps[1] ?? null;
  return {
    investments,
    netWorth: latest
      ? { takenAt: latest.takenAt, total: latest.total, delta: prev ? latest.total - prev.total : null }
      : null
  };
};
