import { expect, type Page } from '@playwright/test';

// Holdings and categories are managed from dashboard modals, not their own pages.
export async function addHolding(page: Page, symbol: string, name: string, categoryLabel?: string) {
	await page.goto('/investments');
	await page.getByRole('button', { name: 'Manage holdings' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.getByLabel('Symbol').fill(symbol);
	await dialog.getByLabel('Name').fill(name);
	if (categoryLabel) await dialog.getByLabel('Category').selectOption({ label: categoryLabel });
	await dialog.getByRole('button', { name: 'Add holding' }).click();
	await expect(dialog.getByRole('link', { name: symbol, exact: true })).toBeVisible();
	await dialog.getByRole('button', { name: 'Close' }).click();
}

export async function addCategory(page: Page, name: string, target: string) {
	await page.goto('/investments');
	await page.getByRole('button', { name: 'Manage categories' }).click();
	const dialog = page.getByRole('dialog');
	await dialog.getByLabel('Name').fill(name);
	await dialog.getByLabel('Target %').fill(target);
	await dialog.getByRole('button', { name: 'Add category' }).click();
	await expect(dialog.getByText(name)).toBeVisible();
	await dialog.getByRole('button', { name: 'Close' }).click();
}
