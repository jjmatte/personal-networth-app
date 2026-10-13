import { test, expect } from '@playwright/test';
import { addCategory, addHolding } from './helpers';

// Buy is category-driven: each category row on the dashboard opens a buy modal
// whose dropdown lists the holdings in that category.
test('buy from a category row picks a holding and records the purchase', async ({ page }) => {
	await addCategory(page, 'BuyCat', '10');
	await addHolding(page, 'BCAT', 'Buy Cat ETF', 'BuyCat');

	await page.goto('/investments');
	await page.getByRole('button', { name: 'Buy in BuyCat' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading', { name: 'Buy in BuyCat' })).toBeVisible();

	// The holding picker lists the category's holding; record a purchase.
	await dialog.getByLabel('Holding').selectOption({ label: 'BCAT - Buy Cat ETF' });
	await dialog.getByLabel('Shares').fill('4');
	await dialog.getByLabel('Price per share').fill('100');
	await dialog.getByRole('button', { name: 'Add purchase' }).click();

	// Modal closes; the purchase (4 x $100 = $400) lands on the purchases index.
	await page.goto('/purchases');
	await expect(page.getByRole('row').filter({ hasText: 'BCAT' })).toContainText('$400.00');
});
