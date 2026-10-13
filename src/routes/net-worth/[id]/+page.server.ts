import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { getSnapshot, deleteSnapshot, updateSnapshot } from '$lib/server/repositories/networth';
import { netWorthSnapshotSchema } from '$lib/schemas';
import { netWorthTotals } from '$lib/finance/networth';

export const load: PageServerLoad = async ({ params }) => {
  const got = await getSnapshot(Number(params.id));
  if (!got) throw error(404, 'Snapshot not found');
  const totals = netWorthTotals(got.items.map((i) => ({ side: i.side as 'asset' | 'liability', amount: i.amount })));
  return { snapshot: got.snapshot, items: got.items, totals };
};

export const actions: Actions = {
  update: async ({ params, request }) => {
    const form = Object.fromEntries(await request.formData());
    let items: unknown;
    try {
      items = JSON.parse(String(form.items ?? '[]'));
    } catch {
      return fail(400, { error: 'Invalid items' });
    }
    const parsed = netWorthSnapshotSchema.safeParse({ takenAt: form.takenAt, note: form.note || undefined, items });
    if (!parsed.success) return fail(400, { error: 'Add at least one line item with a label and amount.' });
    await updateSnapshot(Number(params.id), parsed.data);
    return { success: true };
  },
  delete: async ({ params }) => {
    await deleteSnapshot(Number(params.id));
    throw redirect(303, '/net-worth');
  }
};
