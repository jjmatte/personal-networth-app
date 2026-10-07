import { test, expect } from '@playwright/test';
test('record a purchase; value is derived from the live price', async ({ page }) => {
	await page.goto('/holdings');
	await page.getByLabel('Symbol').fill('AAPL');
	await page.getByLabel('Name').fill('Apple');
	await page.getByRole('button', { name: 'Add holding' }).click();
	await page.getByRole('link', { name: 'AAPL' }).click();

	await page.getByLabel('Shares').fill('10');
	await page.getByLabel('Price per share').fill('100');
	await page.getByRole('button', { name: 'Add purchase' }).click();
	await expect(page.getByText(/cost basis/i)).toContainText('$1,000');

	// The purchase auto-refreshed the price (stub $100), so value = 10 x $100.
	await page.goto('/holdings');
	await expect(page.getByRole('link', { name: 'AAPL' }).locator('xpath=..')).toContainText('$1,000');
});
