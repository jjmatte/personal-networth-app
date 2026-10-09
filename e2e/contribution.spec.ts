import { test, expect } from '@playwright/test';

test('dashboard recommends the most out-of-sync category for a contribution', async ({ page }) => {
	// The e2e DB is shared across specs, so start from a known-clean category list.
	await page.goto('/categories');
	for (let n = await page.getByRole('button', { name: 'Delete' }).count(); n > 0; n--) {
		await page.getByRole('button', { name: 'Delete' }).first().click();
		await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(n - 1);
	}

	await page.getByLabel('Name').fill('Alpha');
	await page.getByLabel('Target %').fill('40');
	await page.getByRole('button', { name: 'Add category' }).click();
	await expect(page.getByText('Alpha')).toBeVisible();
	await page.getByLabel('Name').fill('Beta');
	await page.getByLabel('Target %').fill('60');
	await page.getByRole('button', { name: 'Add category' }).click();
	await expect(page.getByText('Beta')).toBeVisible();

	// Fund only Alpha, leaving Beta at 0% — Beta is the most underweight.
	await page.goto('/holdings');
	await page.getByLabel('Symbol').fill('ALP');
	await page.getByLabel('Name').fill('Alpha Fund');
	await page.getByLabel('Category').selectOption({ label: 'Alpha' });
	await page.getByRole('button', { name: 'Add holding' }).click();
	// A purchase prices Alpha (stub $100 x 10 shares = $1,000).
	await page.getByRole('link', { name: 'ALP', exact: true }).click();
	await page.getByLabel('Shares').fill('10');
	await page.getByLabel('Price per share').fill('100');
	await page.getByRole('button', { name: 'Add purchase' }).click();
	await expect(page.getByText(/cost basis/i)).toContainText('$1,000');

	await page.goto('/');
	await page.getByLabel('Monthly contribution').fill('500');
	await expect(page.getByText(/put \$500 into/i)).toContainText('Beta');
});
