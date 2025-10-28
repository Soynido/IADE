import { test, expect } from '@playwright/test';

test.describe('Quiz Flow', () => {
  test('should start training mode', async ({ page }) => {
    await page.goto('/entrainement');
    await expect(page.locator('text=Mode Entraînement')).toBeVisible();
  });

  test('should display questions', async ({ page }) => {
    await page.goto('/entrainement');
    // Wait for questions to load
    await page.waitForSelector('.question-card', { timeout: 5000 });
    const questionCard = page.locator('.question-card').first();
    await expect(questionCard).toBeVisible();
  });
});

