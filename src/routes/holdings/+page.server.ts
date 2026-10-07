import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { listHoldings, createHolding, updateHolding, refreshHoldingValue } from '$lib/server/repositories/holdings';
import { listCategories } from '$lib/server/repositories/categories';
import { holdingSchema } from '$lib/schemas';

export const load: PageServerLoad = async () => ({
	holdings: await listHoldings(),
	categories: await listCategories()
});

export const actions: Actions = {
	create: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = holdingSchema.safeParse({ ...form, categoryId: form.categoryId || null });
		if (!parsed.success) return fail(400, { error: 'Invalid holding' });
		await createHolding(parsed.data);
		return { success: true };
	},
	update: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = holdingSchema.omit({ currentValue: true }).safeParse({ ...form, categoryId: form.categoryId || null });
		if (!parsed.success) return fail(400, { error: 'Invalid holding' });
		await updateHolding(Number(form.id), parsed.data);
		return { success: true };
	},
	refresh: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		try {
			await refreshHoldingValue(Number(form.id));
			return { success: true };
		} catch {
			return { success: true, priceWarning: true };
		}
	}
};
