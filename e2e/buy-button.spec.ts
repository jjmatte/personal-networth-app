import { test, expect } from '@playwright/test';

// A per-holding "Buy" button on both the holdings manager and the Dashboard
// jumps straight to that holding's Add-purchase form.
test('Buy button links to the purchase form from the manager and the dashboard', async ({
	page
}) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'Manage holdings' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.getByLabel('Symbol').fill('BUYT');
	await dialog.getByLabel('Name').fill('Buy Button Test ETF');
	await dialog.getByRole('button', { name: 'Add holding' }).click();
	await expect(dialog.getByRole('link', { name: 'BUYT', exact: true })).toBeVisible();

	// Manager modal: Buy button -> its purchase form.
	await dialog.getByRole('link', { name: 'Buy BUYT' }).click();
	await expect(page).toHaveURL(/\/holdings\/\d+/);
	await expect(page.getByRole('heading', { name: 'Add purchase' })).toBeVisible();
	await expect(page.getByLabel('Shares')).toBeVisible();

	// Dashboard quick-list: Buy button -> same purchase form.
	await page.goto('/');
	await page.getByRole('link', { name: 'Buy BUYT' }).click();
	await expect(page).toHaveURL(/\/holdings\/\d+/);
	await expect(page.getByRole('heading', { name: 'Add purchase' })).toBeVisible();
});
