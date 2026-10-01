import { test, expect } from '@playwright/test';
test('history page renders a chart after a value update', async ({ page }) => {
	await page.goto('/holdings');
	await page.getByLabel('Symbol').fill('HST');
	await page.getByLabel('Name').fill('History Test');
	await page.getByRole('button', { name: 'Add holding' }).click();
	await page.getByLabel('New value for HST').fill('1000');
	await page.getByRole('button', { name: 'Update HST value' }).click();

	await page.goto('/history');
	await expect(page.getByRole('heading', { name: /history/i })).toBeVisible();
	await expect(page.locator('canvas')).toBeVisible();
});
