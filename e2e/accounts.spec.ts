import { test, expect } from '@playwright/test';

test('create an account and assign a holding to it', async ({ page }) => {
	await page.goto('/investments');
	await page.getByRole('button', { name: 'Manage accounts' }).click();
	let dialog = page.getByRole('dialog');
	await dialog.getByLabel('Name').fill('My Roth');
	await dialog.getByLabel('Type').selectOption('roth_ira');
	await dialog.getByLabel('Accessible').check();
	await dialog.getByRole('button', { name: 'Add account' }).click();
	await expect(dialog.getByText('My Roth')).toBeVisible();
	await dialog.getByRole('button', { name: 'Close' }).click();

	await page.getByRole('button', { name: 'Manage holdings' }).click();
	dialog = page.getByRole('dialog');
	await dialog.getByLabel('Symbol').fill('ACCT1');
	await dialog.getByLabel('Name').fill('Account Test Fund');
	await dialog.getByLabel('Account').selectOption({ label: 'My Roth' });
	await dialog.getByRole('button', { name: 'Add holding' }).click();
	const row = dialog.locator('div.flex.items-center', { has: page.getByRole('link', { name: 'ACCT1', exact: true }) });
	await expect(row.getByText('My Roth')).toBeVisible();
});
