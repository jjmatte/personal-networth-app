import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import {
	listCategories,
	createCategory,
	updateCategory,
	deleteCategory,
	TargetWeightError
} from '$lib/server/repositories/categories';
import {
	listHoldings,
	createHolding,
	updateHolding,
	refreshHoldingValue
} from '$lib/server/repositories/holdings';
import { listLots, addLotAndRefresh } from '$lib/server/repositories/lots';
import { holdingHistory } from '$lib/server/repositories/history';
import { allocation, targetsSum, mostUnderweight } from '$lib/finance/allocation';
import { totalValue, overallGain, totalShares } from '$lib/finance/gains';
import { holdingSchema, categorySchema, lotSchema } from '$lib/schemas';
import type { Lot } from '$lib/finance/types';

export const load: PageServerLoad = async () => {
	const [categories, holdings] = await Promise.all([listCategories(), listHoldings()]);
	const cats = categories.map((c) => ({ id: c.id, name: c.name, targetWeight: c.targetWeight }));
	const forAlloc = holdings.map((h) => ({ categoryId: h.categoryId, currentValue: h.currentValue }));

	// Fetch every holding's lots and history in parallel rather than serially (was an N+1).
	const [lotsByHolding, historyByHolding] = await Promise.all([
		Promise.all(holdings.map((h) => listLots(h.id))),
		Promise.all(holdings.map((h) => holdingHistory(h.id)))
	]);

	const holdingInputs = holdings.map((h, i) => ({
		currentValue: h.currentValue,
		lots: lotsByHolding[i].map(
			(l): Lot => ({ shares: l.shares, pricePerShare: l.pricePerShare, fee: l.fee ?? undefined })
		)
	}));
	const sharesByHolding = new Map<number, number>(
		holdings.map((h, i) => [h.id, totalShares(holdingInputs[i].lots)])
	);
	const series = holdings.map((h, i) => ({
		symbol: h.symbol,
		points: historyByHolding[i].map((p) => ({ t: p.recordedAt, value: p.value }))
	}));

	const rows = allocation(cats, forAlloc);
	const recommended = mostUnderweight(rows);

	return {
		rows,
		series,
		categories,
		holdings: holdings.map((h) => ({
			id: h.id,
			symbol: h.symbol,
			name: h.name,
			kind: h.kind,
			categoryId: h.categoryId,
			currentValue: h.currentValue,
			shares: sharesByHolding.get(h.id) ?? 0
		})),
		recommended: recommended && { categoryId: recommended.categoryId, name: recommended.name },
		total: totalValue(holdings),
		overallGain: overallGain(holdingInputs),
		targetsSum: targetsSum(cats)
	};
};

export const actions: Actions = {
	refreshPrices: async () => {
		const holdings = await listHoldings();
		const refreshed: { symbol: string; price: number; value: number }[] = [];
		const errors: { symbol: string; message: string }[] = [];
		for (const h of holdings) {
			try {
				const r = await refreshHoldingValue(h.id);
				refreshed.push({ symbol: r.symbol, price: r.price, value: r.value });
			} catch (e) {
				errors.push({ symbol: h.symbol, message: e instanceof Error ? e.message : String(e) });
			}
		}
		return { refreshed, errors };
	},
	createHolding: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = holdingSchema.safeParse({ ...form, categoryId: form.categoryId || null });
		if (!parsed.success) return fail(400, { holdingError: 'Invalid holding' });
		await createHolding(parsed.data);
		return { success: true };
	},
	updateHolding: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = holdingSchema
			.omit({ currentValue: true })
			.safeParse({ ...form, categoryId: form.categoryId || null });
		if (!parsed.success) return fail(400, { holdingError: 'Invalid holding' });
		await updateHolding(Number(form.id), parsed.data);
		return { success: true };
	},
	refreshHolding: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		try {
			await refreshHoldingValue(Number(form.id));
			return { success: true };
		} catch {
			return { success: true, priceWarning: true };
		}
	},
	createCategory: async ({ request }) => {
		const parsed = categorySchema.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { categoryError: 'Invalid category' });
		try {
			await createCategory(parsed.data);
		} catch (e) {
			if (e instanceof TargetWeightError) return fail(400, { categoryError: e.message });
			throw e;
		}
		return { success: true };
	},
	updateCategory: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = categorySchema.safeParse(form);
		if (!parsed.success) return fail(400, { categoryError: 'Invalid category' });
		try {
			await updateCategory(Number(form.id), parsed.data);
		} catch (e) {
			if (e instanceof TargetWeightError) return fail(400, { categoryError: e.message });
			throw e;
		}
		return { success: true };
	},
	deleteCategory: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		await deleteCategory(Number(form.id));
		return { success: true };
	},
	buy: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = lotSchema.safeParse(form);
		if (!parsed.success) return fail(400, { buyError: 'Invalid purchase' });
		const { priced } = await addLotAndRefresh(parsed.data);
		return { success: true, buyWarning: !priced };
	}
};
