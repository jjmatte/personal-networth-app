import { test, expect } from '@playwright/test';
import { addHolding } from './helpers';

test('dashboard recommends the most out-of-sync category for a contribution', async ({ page }) => {
	// The e2e DB is shared across specs, so start from a known-clean category list.
	await page.goto('/investments');
	await page.getByRole('button', { name: 'Manage categories' }).click();
	const cats = page.getByRole('dialog');
	for (let n = await cats.getByRole('button', { name: 'Delete' }).count(); n > 0; n--) {
		await cats.getByRole('button', { name: 'Delete' }).first().click();
		await expect(cats.getByRole('button', { name: 'Delete' })).toHaveCount(n - 1);
	}

	await cats.getByLabel('Name').fill('Alpha');
	await cats.getByLabel('Target %').fill('40');
	await cats.getByRole('button', { name: 'Add category' }).click();
	await expect(cats.getByText('Alpha')).toBeVisible();
	await cats.getByLabel('Name').fill('Beta');
	await cats.getByLabel('Target %').fill('60');
	await cats.getByRole('button', { name: 'Add category' }).click();
	await expect(cats.getByText('Beta')).toBeVisible();
	await cats.getByRole('button', { name: 'Close' }).click();

	// Fund only Alpha, leaving Beta at 0% — Beta is the most underweight.
	await addHolding(page, 'ALP', 'Alpha Fund', 'Alpha');
	await page.getByRole('link', { name: 'ALP', exact: true }).click();
	await page.getByLabel('Shares').fill('10');
	await page.getByLabel('Price per share').fill('100');
	await page.getByRole('button', { name: 'Add purchase' }).click();
	await expect(page.getByText(/cost basis/i)).toContainText('$1,000');

	await page.goto('/investments');
	await page.getByLabel('Monthly contribution').fill('500');
	await expect(page.getByText(/put \$500\.00 into/i)).toContainText('Beta');
});
