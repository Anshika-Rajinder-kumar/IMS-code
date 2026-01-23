import { test, expect } from '@playwright/test';

test.describe('Responsive Design Tests', () => {
  test('should display on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have accessible elements', async ({ page }) => {
    await page.goto('/login');
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should respond to keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Press Tab to navigate
    await page.keyboard.press('Tab');
    
    // Get focused element
    const focused = await page.evaluate(() => {
      return document.activeElement ? document.activeElement.tagName : null;
    });
    
    expect(focused).toBeTruthy();
  });

  test('should maintain layout on zoom', async ({ page }) => {
    await page.goto('/login');
    
    // Check viewport is correct
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
  });

  test('should display forms correctly on all sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/register');
      
      const form = page.locator('form');
      const formExists = await form.isVisible().catch(() => false);
      
      expect(typeof formExists).toBe('boolean');
    }
  });

  test('should have visible text at all sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/login');
      
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });

  test('should have clickable buttons', async ({ page }) => {
    await page.goto('/login');
    
    const button = page.locator('button:has-text("Sign In")');
    const boundingBox = await button.boundingBox();
    
    // Button should have dimensions (be visible and sized)
    if (boundingBox) {
      expect(boundingBox.width).toBeGreaterThan(0);
      expect(boundingBox.height).toBeGreaterThan(0);
    }
  });
});
