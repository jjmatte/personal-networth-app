import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getSnapshot, deleteSnapshot } from '$lib/server/repositories/networth';
import { netWorthTotals } from '$lib/finance/networth';

export const load: PageServerLoad = async ({ params }) => {
  const got = await getSnapshot(Number(params.id));
  if (!got) throw error(404, 'Snapshot not found');
  const totals = netWorthTotals(got.items.map((i) => ({ side: i.side as 'asset' | 'liability', amount: i.amount })));
  return { snapshot: got.snapshot, items: got.items, totals };
};

export const actions: Actions = {
  delete: async ({ params }) => {
    await deleteSnapshot(Number(params.id));
    throw redirect(303, '/net-worth');
  }
};
