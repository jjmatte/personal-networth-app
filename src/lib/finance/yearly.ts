export type YearlyRow = {
  year: number;
  netWorth: number;
  source: 'snapshot' | 'manual';
  gain: number | null;
  monthly: number | null;
};

export function buildYearlyReview(
  manualYears: { year: number; netWorth: number }[],
  snapshots: { takenAt: Date | number | string; total: number }[]
): YearlyRow[] {
  const latest = new Map<number, { t: number; total: number }>();
  for (const s of snapshots) {
    const d = new Date(s.takenAt);
    const year = d.getUTCFullYear();
    const t = d.getTime();
    const cur = latest.get(year);
    if (!cur || t >= cur.t) latest.set(year, { t, total: s.total });
  }

  const byYear = new Map<number, { netWorth: number; source: 'snapshot' | 'manual' }>();
  for (const m of manualYears) byYear.set(m.year, { netWorth: m.netWorth, source: 'manual' });
  for (const [year, v] of latest) byYear.set(year, { netWorth: v.total, source: 'snapshot' });

  const years = [...byYear.keys()].sort((a, b) => a - b);
  return years.map((year, i) => {
    const { netWorth, source } = byYear.get(year)!;
    const gain = i === 0 ? null : netWorth - byYear.get(years[i - 1])!.netWorth;
    return { year, netWorth, source, gain, monthly: gain === null ? null : gain / 12 };
  });
}
