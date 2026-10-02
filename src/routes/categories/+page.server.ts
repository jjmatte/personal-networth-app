import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import {
	listCategories,
	createCategory,
	updateCategory,
	deleteCategory,
	TargetWeightError
} from '$lib/server/repositories/categories';
import { categorySchema } from '$lib/schemas';
import { targetsSum } from '$lib/finance/allocation';

export const load: PageServerLoad = async () => {
	const categories = await listCategories();
	return {
		categories,
		targetsSum: targetsSum(categories.map((c) => ({ id: c.id, name: c.name, targetWeight: c.targetWeight })))
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const parsed = categorySchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { error: 'Invalid category' });
		try {
			await createCategory(parsed.data);
		} catch (e) {
			if (e instanceof TargetWeightError) return fail(400, { error: e.message });
			throw e;
		}
		return { success: true };
	},
	update: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = categorySchema.safeParse(form);
		if (!parsed.success) return fail(400, { error: 'Invalid category' });
		try {
			await updateCategory(Number(form.id), parsed.data);
		} catch (e) {
			if (e instanceof TargetWeightError) return fail(400, { error: e.message });
			throw e;
		}
		return { success: true };
	},
	delete: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		await deleteCategory(Number(form.id));
		return { success: true };
	}
};
