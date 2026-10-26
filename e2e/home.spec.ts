import { test, expect } from '@playwright/test';

test('home shows both cards and links into each section', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
	await expect(page.locator('main').getByRole('link', { name: /investments/i })).toBeVisible();
	await expect(page.locator('main').getByRole('link', { name: /net worth/i })).toBeVisible();
	// Scope to <main> — the nav (in the layout) also has these link texts, which would
	// otherwise trip Playwright strict mode.
	await page.locator('main').getByRole('link', { name: /investments/i }).click();
	await expect(page).toHaveURL(/\/investments$/);
});
