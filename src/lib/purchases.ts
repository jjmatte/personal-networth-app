export type SortKey = 'date' | 'symbol' | 'shares' | 'price' | 'cost';
export type SortDir = 'asc' | 'desc';

export interface PurchaseRow {
	id: number;
	holdingId: number;
	symbol: string;
	name: string;
	tradeDate: string | Date;
	shares: number;
	pricePerShare: number;
	fee: number | null;
	cost: number;
}

export function filterPurchases(rows: PurchaseRow[], query: string): PurchaseRow[] {
	const q = query.trim().toLowerCase();
	if (!q) return rows;
	return rows.filter(
		(r) => r.symbol.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
	);
}

export function sortPurchases(rows: PurchaseRow[], key: SortKey, dir: SortDir): PurchaseRow[] {
	const sign = dir === 'asc' ? 1 : -1;
	const value = (r: PurchaseRow): number | string => {
		switch (key) {
			case 'date':
				return new Date(r.tradeDate).getTime();
			case 'symbol':
				return r.symbol.toLowerCase();
			case 'shares':
				return r.shares;
			case 'price':
				return r.pricePerShare;
			case 'cost':
				return r.cost;
		}
	};
	return [...rows].sort((a, b) => {
		const av = value(a);
		const bv = value(b);
		if (av < bv) return -sign;
		if (av > bv) return sign;
		return 0;
	});
}
