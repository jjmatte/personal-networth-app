import { test, expect, type Page } from '@playwright/test';

async function addMilestone(page: Page, label: string, kind: 'fixed' | 'percent', value: string) {
	const add = page.getByTestId('add-milestone');
	await add.getByLabel('Label').fill(label);
	await add.getByLabel('Kind').selectOption(kind);
	await add.getByLabel('Value').fill(value);
	await add.getByRole('button', { name: 'Add milestone' }).click();
	await expect(page.getByTestId('rung').filter({ hasText: label })).toBeVisible();
}

test('fire ladder: spend drives percent rungs, net worth completes rungs, spend 0 is pending', async ({ page }) => {
	test.setTimeout(60_000);
	await page.goto('/fire');
	const originalSpend = await page.getByLabel('Monthly spend').inputValue();
	let snapshotUrl: string | undefined;

	try {
		// A far-future snapshot is the "latest" so net worth is deterministic in the shared e2e DB.
		await page.goto('/net-worth/new');
		for (const btn = page.getByRole('button', { name: 'Remove row' }); (await btn.count()) > 0; ) {
			await btn.first().click();
		}
		await page.getByRole('button', { name: 'Add asset' }).click();
		const row = page.locator('section', { hasText: 'Assets' }).locator('div.flex.items-center').last();
		await row.getByPlaceholder('Category').fill('Cash');
		await row.getByPlaceholder('Label').fill('Checking');
		await row.getByPlaceholder('Amount').fill('25000');
		await page.locator('#nw-date').fill('2999-01-01');
		await page.getByRole('button', { name: 'Save snapshot' }).click();
		await expect(page).toHaveURL(/\/net-worth\/\d+$/);
		snapshotUrl = page.url();

		await page.goto('/fire');
		await expect(page.getByRole('link', { name: 'FIRE' })).toBeVisible();
		await addMilestone(page, 'E2E Low', 'fixed', '1000');
		await addMilestone(page, 'E2E High', 'fixed', '100000');
		await addMilestone(page, 'E2E Half', 'percent', '50');

		await page.getByLabel('Monthly spend').fill('4000');
		await page.getByRole('button', { name: 'Save spend' }).click();
		await expect(page.getByTestId('fire-number')).toContainText('$1,200,000.00');

		const rung = (label: string) => page.getByTestId('rung').filter({ hasText: label });
		await expect(rung('E2E Half')).toContainText('$600,000.00');
		await expect(rung('E2E Low')).toContainText('Complete');
		await expect(rung('E2E High')).not.toContainText('Complete');
		await expect(rung('E2E High')).toContainText('$75,000.00 to go');

		await page.getByLabel('Monthly spend').fill('0');
		await page.getByRole('button', { name: 'Save spend' }).click();
		await expect(page.getByTestId('fire-number')).toContainText('$0.00');
		await expect(rung('E2E Half')).toContainText('Pending: set your monthly spend');
		await expect(rung('E2E Half')).not.toContainText('Complete');
		await expect(rung('E2E Half')).not.toContainText('to go');
		await expect(rung('E2E Low')).toContainText('Complete');

		// Edit then delete a milestone.
		const edit = page.locator('[data-testid="milestone-row"][data-label="E2E Low"]');
		await edit.getByLabel('Value').fill('2000');
		await edit.getByRole('button', { name: 'Save' }).click();
		await expect(rung('E2E Low')).toContainText('$2,000.00');
	} finally {
		try {
			await page.goto('/fire');
			for (const label of ['E2E Low', 'E2E High', 'E2E Half']) {
				const r = page.locator(`[data-testid="milestone-row"][data-label="${label}"]`);
				if ((await r.count()) > 0) {
					await r.getByRole('button', { name: 'Delete' }).click();
					await expect(r).toHaveCount(0);
				}
			}
			await page.getByLabel('Monthly spend').fill(originalSpend);
			await page.getByRole('button', { name: 'Save spend' }).click();
			await expect(page.getByTestId('fire-number')).toBeVisible();
		} finally {
			if (snapshotUrl) {
				await page.goto(snapshotUrl);
				page.on('dialog', (d) => d.accept());
				await page.getByRole('button', { name: 'Delete' }).click();
				await expect(page).toHaveURL(/\/net-worth$/);
			}
		}
	}
});
