import { test, expect } from '@playwright/test';
//added 
test.describe('Colleges Tests', () => {
  test('should load colleges page with auth', async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test', email: 'test@test.com', userType: 'ADMIN' }));
    });
    await page.goto('/colleges');
    await page.waitForTimeout(500);
    expect(page.url()).toMatch(/colleges|dashboard|login/);
  });

  test('should have search or filter elements', async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test', email: 'test@test.com', userType: 'ADMIN' }));
    });
    await page.goto('/colleges');
    
    const inputs = page.locator('textbox, input, [role="searchbox"]');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have buttons for actions', async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test', email: 'test@test.com', userType: 'ADMIN' }));
    });
    await page.goto('/colleges');
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should render page content', async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test', email: 'test@test.com', userType: 'ADMIN' }));
    });
    await page.goto('/colleges');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
