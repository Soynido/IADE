import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should display progress dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Tableau de Bord')).toBeVisible();
  });

  test('should display KG recommendations', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Recommandations Intelligentes')).toBeVisible();
  });

  test('should display stats cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Streak')).toBeVisible();
    await expect(page.locator('text=Score Moyen')).toBeVisible();
  });
});

