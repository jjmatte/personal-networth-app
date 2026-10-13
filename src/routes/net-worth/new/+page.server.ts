import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { buildPrefill, createSnapshot } from '$lib/server/repositories/networth';
import { netWorthSnapshotSchema } from '$lib/schemas';

export const load: PageServerLoad = async ({ url }) => {
  const fromId = url.searchParams.get('from');
  const pre = await buildPrefill(fromId ? Number(fromId) : undefined);
  return {
    rows: pre.rows,
    categories: pre.categories,
    takenAt: pre.takenAt.toISOString().slice(0, 10)
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const form = Object.fromEntries(await request.formData());
    let items: unknown;
    try {
      items = JSON.parse(String(form.items ?? '[]'));
    } catch {
      return fail(400, { error: 'Invalid items' });
    }
    const parsed = netWorthSnapshotSchema.safeParse({ takenAt: form.takenAt, note: form.note || undefined, items });
    if (!parsed.success) return fail(400, { error: 'Add at least one line item with a label and amount.' });
    const { id } = await createSnapshot(parsed.data);
    throw redirect(303, `/net-worth/${id}`);
  }
};
