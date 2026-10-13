import { test, expect } from '@playwright/test';

test('create a category and see it listed', async ({ page }) => {
	await page.goto('/investments');
	await page.getByRole('button', { name: 'Manage categories' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.getByLabel('Name').fill('Bitcoin');
	await dialog.getByLabel('Target %').fill('30');
	await dialog.getByRole('button', { name: 'Add category' }).click();
	await expect(dialog.getByText('Bitcoin')).toBeVisible();
});

test('warns when targets do not sum to 100', async ({ page }) => {
	await page.goto('/investments');
	await page.getByRole('button', { name: 'Manage categories' }).click();
	await expect(page.getByRole('dialog').getByText(/targets sum to/i)).toBeVisible();
});
