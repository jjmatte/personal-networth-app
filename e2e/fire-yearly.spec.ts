import { test, expect } from '@playwright/test';

test('add manual years, see the gain, and delete them', async ({ page }) => {
	// Far-past years stay clear of snapshot-derived rows in the shared e2e DB.
	const years = [
		{ year: '2001', amount: '10000' },
		{ year: '2002', amount: '25000' }
	];
	const manualRow = (year: string) =>
		page.locator(`[data-testid="manual-year-row"][data-year="${year}"]`);

	try {
		await page.goto('/fire');
		for (const y of years) {
			const add = page.getByTestId('add-year');
			await add.getByLabel('Year').fill(y.year);
			await add.getByLabel('Net worth').fill(y.amount);
			await add.getByRole('button', { name: 'Add year' }).click();
			await expect(manualRow(y.year)).toBeVisible();
		}

		const row2002 = page.locator('[data-testid="yearly-row"][data-year="2002"]');
		await expect(row2002.getByTestId('yearly-gain')).toHaveText('+$15,000.00');
	} finally {
		await page.goto('/fire');
		for (const y of years) {
			if ((await manualRow(y.year).count()) === 0) continue;
			await manualRow(y.year).getByRole('button', { name: 'Delete' }).click();
			await expect(manualRow(y.year)).toHaveCount(0);
		}
	}
});
