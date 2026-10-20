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
