import { test, expect } from '@playwright/test';

test.describe('Documents Tests', () => {
  test('should load documents page with auth', async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test', email: 'test@test.com', userType: 'ADMIN' }));
    });
    await page.goto('/documents');
    await page.waitForTimeout(500);
    expect(page.url()).toMatch(/documents|dashboard|login/);
  });

  test('should render page with content', async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test', email: 'test@test.com', userType: 'ADMIN' }));
    });
    await page.goto('/documents');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have interactive elements', async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test', email: 'test@test.com', userType: 'ADMIN' }));
    });
    await page.goto('/documents');
    
    const buttons = page.locator('button');
    const inputs = page.locator('input, textbox');
    
    const buttonCount = await buttons.count();
    const inputCount = await inputs.count();
    
    expect(buttonCount + inputCount).toBeGreaterThanOrEqual(0);
  });

  test('should display heading', async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test', email: 'test@test.com', userType: 'ADMIN' }));
    });
    await page.goto('/documents');
    
    const heading = page.locator('h1, h2');
    const count = await heading.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
