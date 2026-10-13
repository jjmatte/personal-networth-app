import { test, expect } from '@playwright/test';

test('home shows both cards and links into each section', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
	await expect(page.locator('main').getByRole('link', { name: /Investments/ })).toBeVisible();
	await expect(page.locator('main').getByRole('link', { name: /Net Worth/ })).toBeVisible();
	// Scope to <main> — the nav (in the layout) also has these link texts, which would
	// otherwise trip Playwright strict mode.
	await page.locator('main').getByRole('link', { name: /Investments/ }).click();
	await expect(page).toHaveURL(/\/investments$/);
});
