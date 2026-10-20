export type Milestone = { kind: 'fixed' | 'percent'; value: number; label: string; sortOrder: number };
export type LadderRung = { label: string; target: number; complete: boolean; amountToNext: number };

export function fireNumber(monthlySpend: number): number {
  return monthlySpend * 12 * 25;
}

export function milestoneTarget(m: { kind: 'fixed' | 'percent'; value: number }, fire: number): number {
  return m.kind === 'fixed' ? m.value : (m.value / 100) * fire;
}

export function ladderStatus(milestones: Milestone[], fire: number, netWorth: number): LadderRung[] {
  return milestones
    .map((m) => {
      const target = milestoneTarget(m, fire);
      // Percent rungs are pending (never complete) until monthly spend is set.
      const pending = m.kind === 'percent' && fire === 0;
      return {
        sortOrder: m.sortOrder,
        label: m.label,
        target,
        complete: !pending && netWorth >= target,
        amountToNext: Math.max(0, target - netWorth)
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.target - b.target)
    .map(({ sortOrder: _s, ...rung }) => rung);
}
