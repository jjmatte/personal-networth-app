import { test, expect } from '@playwright/test';
test('history page renders a chart after a purchase', async ({ page }) => {
	await page.goto('/holdings');
	await page.getByLabel('Symbol').fill('HST');
	await page.getByLabel('Name').fill('History Test');
	await page.getByRole('button', { name: 'Add holding' }).click();

	// A purchase prices the holding (stub $100), recording a value snapshot.
	await page.getByRole('link', { name: 'HST', exact: true }).click();
	await page.getByLabel('Shares').fill('5');
	await page.getByLabel('Price per share').fill('100');
	await page.getByRole('button', { name: 'Add purchase' }).click();
	await expect(page.getByText(/cost basis/i)).toContainText('$500');

	await page.goto('/history');
	await expect(page.getByRole('heading', { name: /history/i })).toBeVisible();
	await expect(page.locator('canvas')).toBeVisible();
});
