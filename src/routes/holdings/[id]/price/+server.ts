import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getHolding } from '$lib/server/repositories/holdings';
import { fetchPrice } from '$lib/server/pricing';

export const GET: RequestHandler = async ({ params }) => {
	const holding = await getHolding(Number(params.id));
	if (!holding) throw error(404, 'Holding not found');
	try {
		const price = await fetchPrice(holding.symbol);
		return json({ price });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Could not fetch price' });
	}
};
