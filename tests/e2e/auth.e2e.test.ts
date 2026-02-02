import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';

describe('E2E Tests - User Authentication Flow', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  const baseUrl = 'http://localhost:3200';

  beforeAll(async () => {
    browser = await chromium.launch({
      headless: true,
    });
    context = await browser.newContext();
    page = await context.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    await page.goto(baseUrl);
  });

  describe('User Registration', () => {
    it('should display registration form', async () => {
      await page.click('text=Register');
      
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="name"]')).toBeVisible();
    });

    it('should register new user successfully', async () => {
      await page.click('text=Register');
      
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.fill('input[name="name"]', 'Test User');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Registration successful')).toBeVisible({ timeout: 5000 });
    });

    it('should validate email format', async () => {
      await page.click('text=Register');
      
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.fill('input[name="name"]', 'Test User');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Invalid email format')).toBeVisible();
    });

    it('should validate password strength', async () => {
      await page.click('text=Register');
      
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'weak');
      await page.fill('input[name="name"]', 'Test User');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
    });
  });

  describe('User Login', () => {
    it('should display login form', async () => {
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    it('should login with valid credentials', async () => {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'SecurePass123!');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Welcome, Test User')).toBeVisible({ timeout: 5000 });
    });

    it('should display error for invalid credentials', async () => {
      await page.fill('input[name="email"]', 'wrong@example.com');
      await page.fill('input[name="password"]', 'WrongPass123!');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });

    it('should redirect to dashboard after login', async () => {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'SecurePass123!');
      
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/.*dashboard/);
    });
  });

  describe('User Logout', () => {
    beforeEach(async () => {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/.*dashboard/);
    });

    it('should logout successfully', async () => {
      await page.click('button[aria-label="Logout"]');
      
      await expect(page).toHaveURL(/.*login/);
      await expect(page.locator('input[name="email"]')).toBeVisible();
    });

    it('should clear session data after logout', async () => {
      await page.click('button[aria-label="Logout"]');
      
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name === 'session');
      expect(sessionCookie).toBeUndefined();
    });
  });

  describe('Password Reset', () => {
    it('should display password reset form', async () => {
      await page.click('text=Forgot password?');
      
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    it('should send password reset email', async () => {
      await page.click('text=Forgot password?');
      
      await page.fill('input[name="email"]', 'test@example.com');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Password reset email sent')).toBeVisible();
    });

    it('should validate email format for reset', async () => {
      await page.click('text=Forgot password?');
      
      await page.fill('input[name="email"]', 'invalid-email');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Invalid email format')).toBeVisible();
    });
  });
});
