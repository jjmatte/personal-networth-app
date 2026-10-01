import { test, expect } from '@playwright/test';
test('add a holding and update its value', async ({ page }) => {
  await page.goto('/holdings');
  await page.getByLabel('Symbol').fill('VOO');
  await page.getByLabel('Name').fill('S&P 500 ETF');
  await page.getByRole('button', { name: 'Add holding' }).click();
  await expect(page.getByText('VOO')).toBeVisible();

  await page.getByLabel('New value for VOO').fill('1500');
  await page.getByRole('button', { name: 'Update VOO value' }).click();
  await expect(page.getByText('$1,500')).toBeVisible();
});
test('rejects a negative value', async ({ page }) => {
  await page.goto('/holdings');
  await page.getByLabel('Symbol').fill('BAD');
  await page.getByLabel('Name').fill('Bad');
  await page.getByRole('button', { name: 'Add holding' }).click();
  await page.getByLabel('New value for BAD').fill('-10');
  await page.getByRole('button', { name: 'Update BAD value' }).click();
  await expect(page.getByText(/invalid value/i)).toBeVisible();
});
