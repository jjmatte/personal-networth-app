import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { getHolding } from '$lib/server/repositories/holdings';
import { listLots, addLotAndRefresh, removeLotAndRefresh } from '$lib/server/repositories/lots';
import { lotSchema } from '$lib/schemas';
import { holdingCostBasis, holdingGain, perLotGain } from '$lib/finance/gains';
import type { Lot } from '$lib/finance/types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const holding = await getHolding(id);
	if (!holding) throw error(404, 'Holding not found');
	const rows = await listLots(id);
	const lots: Lot[] = rows.map((l) => ({
		shares: l.shares,
		pricePerShare: l.pricePerShare,
		fee: l.fee ?? undefined
	}));
	return {
		holding,
		lots: rows.map((l, i) => ({ ...l, gain: perLotGain(lots[i], holding.currentValue, lots) })),
		costBasis: holdingCostBasis(lots),
		gain: holdingGain(holding.currentValue, lots)
	};
};

export const actions: Actions = {
	addLot: async ({ request, params }) => {
		const form = Object.fromEntries(await request.formData());
		const parsed = lotSchema.safeParse({ ...form, holdingId: params.id });
		if (!parsed.success) return fail(400, { error: 'Invalid purchase' });
		const { priced } = await addLotAndRefresh(parsed.data);
		return { success: true, priceWarning: !priced };
	},
	removeLot: async ({ request }) => {
		const form = Object.fromEntries(await request.formData());
		const { priced } = await removeLotAndRefresh(Number(form.lotId));
		return { success: true, priceWarning: !priced };
	}
};
