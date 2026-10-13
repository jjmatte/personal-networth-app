import type { PageServerLoad } from './$types';
import { listSnapshots } from '$lib/server/repositories/networth';

export const load: PageServerLoad = async () => {
  const snaps = await listSnapshots(); // newest first
  return {
    snapshots: snaps.map((s, i) => ({
      ...s,
      delta: i + 1 < snaps.length ? s.total - snaps[i + 1].total : null
    }))
  };
};
