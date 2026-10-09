import { test, expect } from '@playwright/test';

// "Use today's price" fills the Price per share field from the live price API
// (the e2e price stub returns $100). The field stays editable.
test("Use today's price fills price per share from the API", async ({ page }) => {
	await page.goto('/holdings');
	await page.getByLabel('Symbol').fill('PFIL');
	await page.getByLabel('Name').fill('Price Fill ETF');
	await page.getByRole('button', { name: 'Add holding' }).click();
	await page.getByRole('link', { name: 'PFIL', exact: true }).click();

	// Starts empty, gets filled with the stub price on click.
	await expect(page.getByLabel('Price per share')).toHaveValue('');
	await page.getByRole('button', { name: /use today's price/i }).click();
	await expect(page.getByLabel('Price per share')).toHaveValue('100');
});
