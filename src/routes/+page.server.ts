import type { PageServerLoad } from './$types';
import { listCategories } from '$lib/server/repositories/categories';
import { listHoldings } from '$lib/server/repositories/holdings';
import { listLots } from '$lib/server/repositories/lots';
import { allocation, targetsSum, mostUnderweight } from '$lib/finance/allocation';
import { totalValue, overallGain } from '$lib/finance/gains';
import type { Lot } from '$lib/finance/types';

export const load: PageServerLoad = async () => {
	const categories = await listCategories();
	const holdings = await listHoldings();
	const cats = categories.map((c) => ({ id: c.id, name: c.name, targetWeight: c.targetWeight }));
	const forAlloc = holdings.map((h) => ({ categoryId: h.categoryId, currentValue: h.currentValue }));

	const holdingInputs = [];
	for (const h of holdings) {
		const rows = await listLots(h.id);
		const lots: Lot[] = rows.map((l) => ({ shares: l.shares, pricePerShare: l.pricePerShare, fee: l.fee ?? undefined }));
		holdingInputs.push({ currentValue: h.currentValue, lots });
	}

	const rows = allocation(cats, forAlloc);
	const recommended = mostUnderweight(rows);

	return {
		rows,
		recommended: recommended && { categoryId: recommended.categoryId, name: recommended.name },
		total: totalValue(holdings),
		overallGain: overallGain(holdingInputs),
		targetsSum: targetsSum(cats)
	};
};
