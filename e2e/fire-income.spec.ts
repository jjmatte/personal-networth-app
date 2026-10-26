import { test, expect } from '@playwright/test';

test('add an income year and person lines, see actual vs estimated, and clean up', async ({ page }) => {
	// Far-past year stays clear of other data in the shared e2e DB.
	const year = '2001';
	const incomeRow = page.locator(`[data-testid="income-row"][data-year="${year}"]`);
	const yearEditor = page.locator(`[data-testid="income-year-row"][data-year="${year}"]`);
	const personRows = page.locator(`[data-testid="person-income-row"][data-year="${year}"]`);

	try {
		await page.goto('/fire');
		const addYear = page.getByTestId('add-income-year');
		await addYear.getByLabel('Year').fill(year);
		await addYear.getByLabel('Estimated income').fill('100000');
		await addYear.getByLabel('Investment income').fill('0');
		await addYear.getByLabel('Net monthly margin').fill('0');
		await addYear.getByRole('button', { name: 'Add income year' }).click();
		await expect(yearEditor).toBeVisible();

		const people = [
			{ name: 'Person A', amount: '40000' },
			{ name: 'Person B', amount: '35000' }
		];
		for (const [i, p] of people.entries()) {
			const add = page.getByTestId('add-person-income');
			await add.getByLabel('Year').fill(year);
			await add.getByLabel('Name').fill(p.name);
			await add.getByLabel('Amount').fill(p.amount);
			await add.getByRole('button', { name: 'Add person income' }).click();
			await expect(personRows).toHaveCount(i + 1);
		}

		await expect(incomeRow.getByTestId('income-actual')).toContainText('$75,000.00');
		await expect(incomeRow.getByTestId('income-estimated')).toContainText('$100,000.00');
	} finally {
		await page.goto('/fire');
		while ((await personRows.count()) > 0) {
			const before = await personRows.count();
			await personRows.first().getByRole('button', { name: 'Delete' }).click();
			await expect(personRows).toHaveCount(before - 1);
		}
		if ((await yearEditor.count()) > 0) {
			await yearEditor.getByRole('button', { name: 'Delete' }).click();
			await expect(yearEditor).toHaveCount(0);
		}
	}
});
