import { describe, it, expect } from 'vitest';
import { filterPurchases, sortPurchases, type PurchaseRow } from './purchases';

const rows: PurchaseRow[] = [
	{ id: 1, holdingId: 1, symbol: 'VOO', name: 'Vanguard S&P 500', tradeDate: new Date('2025-01-15'), shares: 10, pricePerShare: 400, fee: 0, cost: 4000 },
	{ id: 2, holdingId: 2, symbol: 'AVUV', name: 'Avantis Small Cap', tradeDate: new Date('2026-05-01'), shares: 5, pricePerShare: 100, fee: 1, cost: 501 },
	{ id: 3, holdingId: 1, symbol: 'VOO', name: 'Vanguard S&P 500', tradeDate: new Date('2024-06-01'), shares: 2, pricePerShare: 380, fee: 0, cost: 760 }
];

describe('filterPurchases', () => {
	it('matches symbol case-insensitively', () => {
		expect(filterPurchases(rows, 'voo').map((r) => r.id)).toEqual([1, 3]);
	});
	it('matches name', () => {
		expect(filterPurchases(rows, 'avantis').map((r) => r.id)).toEqual([2]);
	});
	it('returns all rows for a blank query', () => {
		expect(filterPurchases(rows, '  ')).toHaveLength(3);
	});
});

describe('sortPurchases', () => {
	it('sorts by date descending (newest first)', () => {
		expect(sortPurchases(rows, 'date', 'desc').map((r) => r.id)).toEqual([2, 1, 3]);
	});
	it('sorts by date ascending', () => {
		expect(sortPurchases(rows, 'date', 'asc').map((r) => r.id)).toEqual([3, 1, 2]);
	});
	it('sorts by cost descending', () => {
		expect(sortPurchases(rows, 'cost', 'desc').map((r) => r.id)).toEqual([1, 3, 2]);
	});
	it('sorts by symbol ascending', () => {
		expect(sortPurchases(rows, 'symbol', 'asc').map((r) => r.symbol)).toEqual(['AVUV', 'VOO', 'VOO']);
	});
	it('does not mutate the input array', () => {
		const copy = [...rows];
		sortPurchases(rows, 'shares', 'asc');
		expect(rows).toEqual(copy);
	});
});
