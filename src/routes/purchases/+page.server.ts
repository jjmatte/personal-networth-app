import type { PageServerLoad } from './$types';
import { listPurchases } from '$lib/server/repositories/lots';
import { lotCostBasis } from '$lib/finance/gains';

export const load: PageServerLoad = async () => {
	const purchases = await listPurchases();
	return {
		purchases: purchases.map((p) => ({
			...p,
			cost: lotCostBasis({ shares: p.shares, pricePerShare: p.pricePerShare, fee: p.fee ?? undefined })
		}))
	};
};
