import { test, expect } from '@playwright/test';
test('record a purchase and see cost basis', async ({ page }) => {
	await page.goto('/holdings');
	await page.getByLabel('Symbol').fill('AAPL');
	await page.getByLabel('Name').fill('Apple');
	await page.getByRole('button', { name: 'Add holding' }).click();
	await page.getByRole('link', { name: 'AAPL' }).click();

	await page.getByLabel('Shares').fill('10');
	await page.getByLabel('Price per share').fill('100');
	await page.getByRole('button', { name: 'Add purchase' }).click();
	await expect(page.getByText(/cost basis/i)).toContainText('$1,000');
});
