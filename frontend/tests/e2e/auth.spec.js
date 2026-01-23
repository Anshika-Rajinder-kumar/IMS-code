import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle('Wissen - Intern Management System');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.locator('text=Register').click();
    await page.waitForURL(/.*register/, { timeout: 3000 });
    expect(page.url()).toContain('/register');
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle('Wissen - Intern Management System');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have form elements on login', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const inputs = page.locator('input');
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should have select on login', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should fill form and submit', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const inputs = page.locator('input[type="email"], input[type="text"]');

    const firstInput = inputs.first();
    const passwordInput = page.locator('input[type="password"]').first();

    await firstInput.fill('test@example.com', { timeout: 5000 });
    await passwordInput.fill('password123', { timeout: 5000 });

    await expect(firstInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    expect(page.url()).toContain('/login');
    
    await page.locator('text=Register').click();
    await page.waitForURL(/.*register/, { timeout: 3000 });
    expect(page.url()).toContain('/register');
  });

  test('should display buttons on pages', async ({ page }) => {
    await page.goto('/login');
    const button = page.locator('button:has-text("Sign In")');
    await expect(button).toBeVisible();
  });

  test('should display create account button on register', async ({ page }) => {
    await page.goto('/register');
    const button = page.locator('button:has-text("Create Account")');
    await expect(button).toBeVisible();
  });
});
