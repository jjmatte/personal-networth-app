import { test, expect } from '@playwright/test';
test('create a category and see it listed', async ({ page }) => {
  await page.goto('/categories');
  await page.getByLabel('Name').fill('Bitcoin');
  await page.getByLabel('Target %').fill('30');
  await page.getByRole('button', { name: 'Add category' }).click();
  await expect(page.getByText('Bitcoin')).toBeVisible();
});
test('warns when targets do not sum to 100', async ({ page }) => {
  await page.goto('/categories');
  await expect(page.getByText(/targets sum to/i)).toBeVisible();
});
