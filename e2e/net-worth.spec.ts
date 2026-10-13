import { test, expect } from '@playwright/test';

test('create a net-worth snapshot, view it, and delete it', async ({ page }) => {
	await page.goto('/net-worth/new');
	// The form prefills (incl. an auto-seeded Investments line whose amount depends on the
	// shared e2e DB's accumulated holdings). Clear every prefilled row first so the total is
	// deterministic, then add exactly the rows we assert on.
	for (const btn = page.getByRole('button', { name: 'Remove row' }); (await btn.count()) > 0; ) {
		await btn.first().click();
	}
	await page.getByRole('button', { name: 'Add asset' }).click();
	let assetRow = page.locator('section', { hasText: 'Assets' }).locator('div.flex.items-center').last();
	await assetRow.getByPlaceholder('Category').fill('Cash');
	await assetRow.getByPlaceholder('Label').fill('Checking');
	await assetRow.getByPlaceholder('Amount').fill('8400');

	await page.getByRole('button', { name: 'Add liability' }).click();
	let liabRow = page.locator('section', { hasText: 'Liabilities' }).locator('div.flex.items-center').last();
	await liabRow.getByPlaceholder('Category').fill('Loans');
	await liabRow.getByPlaceholder('Label').fill('Car');
	await liabRow.getByPlaceholder('Amount').fill('400');

	await page.getByRole('button', { name: 'Save snapshot' }).click();

	await expect(page).toHaveURL(/\/net-worth\/\d+$/);
	await expect(page.getByText('Net worth:')).toContainText('$8,000');

	// Delete (auto-accept the confirm dialog).
	page.on('dialog', (d) => d.accept());
	await page.getByRole('button', { name: 'Delete' }).click();
	await expect(page).toHaveURL(/\/net-worth$/);
});

test('history lists snapshots, edit updates the total, home shows latest', async ({ page }) => {
	await page.goto('/net-worth/new');
	for (const btn = page.getByRole('button', { name: 'Remove row' }); (await btn.count()) > 0; ) {
		await btn.first().click();
	}
	await page.getByRole('button', { name: 'Add asset' }).click();
	const r = page.locator('section', { hasText: 'Assets' }).locator('div.flex.items-center').last();
	await r.getByPlaceholder('Category').fill('Cash');
	await r.getByPlaceholder('Label').fill('Checking');
	await r.getByPlaceholder('Amount').fill('1000');
	await page.getByRole('button', { name: 'Save snapshot' }).click();
	await expect(page).toHaveURL(/\/net-worth\/\d+$/);

	await page.goto('/net-worth');
	await expect(page.getByText('$1,000').first()).toBeVisible();

	await page.getByRole('link', { name: /\$1,000/ }).first().click();
	await page.getByRole('button', { name: 'Edit' }).click();
	const amount = page.getByPlaceholder('Amount').first();
	await amount.fill('1500');
	await page.getByRole('button', { name: 'Save changes' }).click();
	await expect(page.getByText('Net worth:')).toContainText('$1,500');

	await page.goto('/');
	await expect(page.locator('main').getByRole('link', { name: /Net Worth/ })).toContainText('$1,500');
});
