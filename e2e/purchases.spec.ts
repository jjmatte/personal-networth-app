import { test, expect } from '@playwright/test';
import { addHolding } from './helpers';

test('record a purchase; value is derived from the live price', async ({ page }) => {
	await addHolding(page, 'AAPL', 'Apple');
	await page.getByRole('link', { name: 'AAPL', exact: true }).click();

	await page.getByLabel('Shares').fill('10');
	await page.getByLabel('Price per share').fill('100');
	await page.getByRole('button', { name: 'Add purchase' }).click();
	await expect(page.getByText(/cost basis/i)).toContainText('$1,000');

	// The purchase auto-refreshed the price (stub $100), so value = 10 x $100.
	await page.goto('/');
	await expect(
		page.getByRole('link', { name: 'AAPL', exact: true }).locator('xpath=..')
	).toContainText('$1,000');
});
