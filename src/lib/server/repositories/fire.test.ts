import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from './test-harness';
import {
  getSettings, setMonthlySpend,
  listMilestones, createMilestone, updateMilestone, deleteMilestone
} from './fire';

beforeEach(() => makeTestDb());

describe('fire settings', () => {
  it('returns a default when no row exists', async () => {
    expect(await getSettings()).toEqual({ monthlySpend: 0 });
  });

  it('persists monthly spend', async () => {
    await setMonthlySpend(4200);
    expect(await getSettings()).toEqual({ monthlySpend: 4200 });
    await setMonthlySpend(5000);
    expect((await getSettings()).monthlySpend).toBe(5000);
  });
});

describe('fire milestones', () => {
  it('creates, lists in sortOrder, updates and deletes', async () => {
    const b = await createMilestone({ label: 'B', kind: 'fixed', value: 10, sortOrder: 2 });
    await createMilestone({ label: 'A', kind: 'percent', value: 25, sortOrder: 1 });
    expect((await listMilestones()).map((m) => m.label)).toEqual(['A', 'B']);

    const upd = await updateMilestone(b.id, { label: 'B2', kind: 'percent', value: 50, sortOrder: 0 });
    expect(upd).toMatchObject({ label: 'B2', kind: 'percent', value: 50, sortOrder: 0 });
    expect((await listMilestones()).map((m) => m.label)).toEqual(['B2', 'A']);

    await deleteMilestone(b.id);
    expect((await listMilestones()).map((m) => m.label)).toEqual(['A']);
  });
});
