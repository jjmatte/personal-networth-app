import { test, expect } from '@playwright/test';

// A per-holding "Buy" button on both the Holdings list and the Dashboard
// jumps straight to that holding's Add-purchase form.
test('Buy button links to the holding purchase form from Holdings and Dashboard', async ({
	page
}) => {
	// Create a holding (value stays $0 — no lots yet).
	await page.goto('/holdings');
	await page.getByLabel('Symbol').fill('BUYT');
	await page.getByLabel('Name').fill('Buy Button Test ETF');
	await page.getByRole('button', { name: 'Add holding' }).click();
	await expect(page.getByRole('link', { name: 'BUYT', exact: true })).toBeVisible();

	// Holdings screen: Buy button for that holding -> its purchase form.
	await page.getByRole('link', { name: 'Buy BUYT' }).click();
	await expect(page).toHaveURL(/\/holdings\/\d+/);
	await expect(page.getByRole('heading', { name: 'Add purchase' })).toBeVisible();
	await expect(page.getByLabel('Shares')).toBeVisible();

	// Dashboard: holdings quick-list Buy button -> same purchase form.
	await page.goto('/');
	await page.getByRole('link', { name: 'Buy BUYT' }).click();
	await expect(page).toHaveURL(/\/holdings\/\d+/);
	await expect(page.getByRole('heading', { name: 'Add purchase' })).toBeVisible();
});
