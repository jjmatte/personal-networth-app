import { test, expect } from '@playwright/test';
import { addHolding } from './helpers';

test('purchases index lists, searches, and sorts purchases', async ({ page }) => {
	await addHolding(page, 'PIDX', 'Purchase Index ETF');
	await page.getByRole('link', { name: 'PIDX', exact: true }).click();
	await page.getByLabel('Shares').fill('3');
	await page.getByLabel('Price per share').fill('100');
	await page.getByRole('button', { name: 'Add purchase' }).click();
	await expect(page.getByText(/cost basis/i)).toContainText('$300');

	await page.goto('/purchases');
	// The purchase row shows its cost (3 x $100).
	await expect(page.getByRole('row').filter({ hasText: 'PIDX' })).toContainText('$300.00');

	// Search filters the table.
	await page.getByLabel('Search purchases').fill('zzzz');
	await expect(page.getByRole('row').filter({ hasText: 'PIDX' })).toHaveCount(0);
	await page.getByLabel('Search purchases').fill('pidx');
	await expect(page.getByRole('row').filter({ hasText: 'PIDX' })).toHaveCount(1);

	// Default sort is Date descending; clicking the header flips it to ascending.
	await expect(page.getByRole('button', { name: /Date ▼/ })).toBeVisible();
	await page.getByRole('button', { name: /Date/ }).click();
	await expect(page.getByRole('button', { name: /Date ▲/ })).toBeVisible();
});
