import { test, expect } from '@playwright/test';

test('upload page loads', async ({ page }) => {
  await page.goto('/upload');
  await expect(page.getByRole('heading', { name: 'Upload audio' })).toBeVisible();
});
