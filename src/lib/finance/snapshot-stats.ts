export type SnapshotPoint = { id: number; takenAt: Date; total: number };

export function gainVsPrevious(snapshots: SnapshotPoint[], id: number): number | null {
  const i = snapshots.findIndex((s) => s.id === id);
  return i > 0 ? snapshots[i].total - snapshots[i - 1].total : null;
}

export function runningTotalGain(snapshots: SnapshotPoint[], id: number): number {
  const s = snapshots.find((x) => x.id === id);
  return s && snapshots.length > 0 ? s.total - snapshots[0].total : 0;
}

export function bestQuarterGain(snapshots: SnapshotPoint[]): number | null {
  if (snapshots.length < 2) return null;
  let best = -Infinity;
  for (let i = 1; i < snapshots.length; i++) {
    best = Math.max(best, snapshots[i].total - snapshots[i - 1].total);
  }
  return best;
}

export type NetWorthSeriesPoint = { t: Date; value: number };

// Chart-ready points for net worth over time, ascending by date. Accepts Date,
// epoch-ms, or ISO-string takenAt so it tolerates values serialized across the
// SvelteKit load boundary.
export function buildNetWorthSeries(
  snapshots: { takenAt: Date | number | string; total: number }[]
): NetWorthSeriesPoint[] {
  return [...snapshots]
    .map((s) => ({ t: new Date(s.takenAt), value: s.total }))
    .sort((a, b) => a.t.getTime() - b.t.getTime());
}
