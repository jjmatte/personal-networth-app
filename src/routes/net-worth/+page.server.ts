import type { PageServerLoad } from './$types';
import { listSnapshots } from '$lib/server/repositories/networth';
import { gainVsPrevious, runningTotalGain, bestQuarterGain } from '$lib/finance/snapshot-stats';

export const load: PageServerLoad = async () => {
  const newestFirst = await listSnapshots();
  const ascending = [...newestFirst].reverse(); // takenAt asc, id asc
  return {
    snapshots: newestFirst.map((s) => ({
      ...s,
      delta: gainVsPrevious(ascending, s.id),
      runningGain: runningTotalGain(ascending, s.id)
    })),
    bestPeriodGain: bestQuarterGain(ascending)
  };
};
