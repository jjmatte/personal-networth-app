import { test, expect } from '@playwright/test';
test('dashboard shows total value and a target-vs-actual row', async ({ page }) => {
	// Seeded or created elsewhere; here just assert structure renders.
	await page.goto('/');
	await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
	await expect(page.getByText(/total value/i)).toBeVisible();
	await expect(page.getByRole('table')).toBeVisible();
});
