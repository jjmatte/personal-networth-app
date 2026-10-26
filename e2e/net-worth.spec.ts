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
	await expect(page.locator('main').getByRole('link', { name: /net worth/i })).toContainText('$1,500');
});

test('net-worth-over-time chart renders once there are at least two snapshots', async ({ page }) => {
	// 1980 dates keep these unique and earliest in the shared e2e DB.
	const series = [
		{ date: '1980-01-01', amount: '2000' },
		{ date: '1980-04-01', amount: '2600' }
	];
	const rowFor = (label: string) => page.getByRole('link', { name: new RegExp(label) });

	try {
		for (const s of series) {
			await page.goto('/net-worth/new');
			for (const btn = page.getByRole('button', { name: 'Remove row' }); (await btn.count()) > 0; ) {
				await btn.first().click();
			}
			await page.getByRole('button', { name: 'Add asset' }).click();
			const row = page.locator('section', { hasText: 'Assets' }).locator('div.flex.items-center').last();
			await row.getByPlaceholder('Category').fill('Cash');
			await row.getByPlaceholder('Label').fill('Checking');
			await row.getByPlaceholder('Amount').fill(s.amount);
			await page.locator('#nw-date').fill(s.date);
			await page.getByRole('button', { name: 'Save snapshot' }).click();
			await expect(page).toHaveURL(/\/net-worth\/\d+$/);
		}

		await page.goto('/net-worth');
		const chart = page.getByTestId('net-worth-chart');
		await expect(chart).toBeVisible();
		await expect(chart.locator('canvas')).toBeVisible();
	} finally {
		page.on('dialog', (d) => d.accept());
		await page.goto('/net-worth');
		for (const label of ['Apr 1, 1980', 'Jan 1, 1980']) {
			if ((await rowFor(label).count()) === 0) continue;
			await rowFor(label).click();
			await page.getByRole('button', { name: 'Delete' }).click();
			await expect(page).toHaveURL(/\/net-worth$/);
		}
	}
});

test('history shows per-snapshot gain, running total, and first-snapshot marker', async ({ page }) => {
	// 1990 dates guarantee these are the earliest snapshots in the shared e2e DB.
	const series = [
		{ date: '1990-01-01', amount: '1000' },
		{ date: '1990-04-01', amount: '1700' },
		{ date: '1990-07-01', amount: '1500' }
	];
	const rowFor = (label: string) => page.getByRole('link', { name: new RegExp(label) });

	try {
		for (const s of series) {
			await page.goto('/net-worth/new');
			for (const btn = page.getByRole('button', { name: 'Remove row' }); (await btn.count()) > 0; ) {
				await btn.first().click();
			}
			await page.getByRole('button', { name: 'Add asset' }).click();
			const row = page.locator('section', { hasText: 'Assets' }).locator('div.flex.items-center').last();
			await row.getByPlaceholder('Category').fill('Cash');
			await row.getByPlaceholder('Label').fill('Checking');
			await row.getByPlaceholder('Amount').fill(s.amount);
			await page.locator('#nw-date').fill(s.date);
			await page.getByRole('button', { name: 'Save snapshot' }).click();
			await expect(page).toHaveURL(/\/net-worth\/\d+$/);
		}

		await page.goto('/net-worth');
		const first = rowFor('Jan 1, 1990');
		await expect(first).toContainText('First snapshot');
		await expect(first).not.toContainText('NaN');
		await expect(first.getByTestId('period-gain')).toHaveCount(0);

		const second = rowFor('Apr 1, 1990');
		await expect(second.getByTestId('period-gain')).toHaveText('+$700.00');
		await expect(second.getByTestId('running-gain')).toHaveText('+$700.00');

		const third = rowFor('Jul 1, 1990');
		await expect(third.getByTestId('period-gain')).toHaveText('-$200.00');
		await expect(third.getByTestId('running-gain')).toHaveText('+$500.00');

		await expect(page.getByTestId('best-period')).toContainText(/Best period gain:\s*\+?\$[\d,]+\.\d{2}/);

	} finally {
		// Clean up so later tests see only their own data, even if an assertion threw.
		page.on('dialog', (d) => d.accept());
		await page.goto('/net-worth');
		for (const label of ['Jul 1, 1990', 'Apr 1, 1990', 'Jan 1, 1990']) {
			if ((await rowFor(label).count()) === 0) continue;
			await rowFor(label).click();
			await page.getByRole('button', { name: 'Delete' }).click();
			await expect(page).toHaveURL(/\/net-worth$/);
		}
	}
});
