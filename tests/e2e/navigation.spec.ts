import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/IADE/);
  });

  test('should navigate to Dashboard', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should navigate to Knowledge Graph', async ({ page }) => {
    await page.goto('/');
    await page.goto('/knowledge-graph');
    await expect(page.locator('h1')).toContainText('Knowledge Graph');
  });
});

