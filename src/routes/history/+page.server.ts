import type { PageServerLoad } from './$types';
import { listHoldings } from '$lib/server/repositories/holdings';
import { holdingHistory } from '$lib/server/repositories/history';

export const load: PageServerLoad = async () => {
	const holdings = await listHoldings();
	const series = [];
	for (const h of holdings) {
		const points = await holdingHistory(h.id);
		series.push({ symbol: h.symbol, points: points.map((p) => ({ t: p.recordedAt, value: p.value })) });
	}
	return { series };
};
