import { test, expect } from '@playwright/test';

test('add a holding; value is derived, never typed', async ({ page }) => {
  await page.goto('/holdings');
  await page.getByLabel('Symbol').fill('RFSH');
  await page.getByLabel('Name').fill('Refresh Test ETF');
  await page.getByRole('button', { name: 'Add holding' }).click();
  await expect(page.getByRole('link', { name: 'RFSH', exact: true })).toBeVisible();

  // No manual dollar entry exists anymore — value only comes from a price refresh.
  await expect(page.getByLabel('New value for RFSH')).toHaveCount(0);

  // Refresh works (priced against the local stub); with no shares yet it stays $0.
  await page.getByRole('button', { name: 'Refresh RFSH price' }).click();
  await expect(page.getByText(/couldn't refresh/i)).toHaveCount(0);
});
