import { test, expect } from '@playwright/test';
import { addHolding } from './helpers';

test('dashboard renders the history chart after a purchase', async ({ page }) => {
	await addHolding(page, 'HST', 'History Test');

	// A purchase prices the holding (stub $100), recording a value snapshot.
	await page.getByRole('link', { name: 'HST', exact: true }).click();
	await page.getByLabel('Shares').fill('5');
	await page.getByLabel('Price per share').fill('100');
	await page.getByRole('button', { name: 'Add purchase' }).click();
	await expect(page.getByText(/cost basis/i)).toContainText('$500');

	await page.goto('/investments');
	const chart = page
		.getByRole('heading', { name: 'History' })
		.locator('xpath=following-sibling::canvas[1]');
	await expect(chart).toBeVisible();
});
