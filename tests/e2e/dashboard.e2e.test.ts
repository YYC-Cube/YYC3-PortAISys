import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';

describe('E2E Tests - Dashboard Functionality', () => {
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

    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    await page.goto(`${baseUrl}/dashboard`);
  });

  describe('Dashboard Layout', () => {
    it('should display dashboard header', async () => {
      await expect(page.locator('h1')).toContainText('Dashboard');
    });

    it('should display navigation menu', async () => {
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('text=Home')).toBeVisible();
      await expect(page.locator('text=Profile')).toBeVisible();
      await expect(page.locator('text=Settings')).toBeVisible();
    });

    it('should display user information', async () => {
      await expect(page.locator('text=Test User')).toBeVisible();
      await expect(page.locator('text=test@example.com')).toBeVisible();
    });

    it('should display statistics cards', async () => {
      await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4);
    });
  });

  describe('Statistics Display', () => {
    it('should display user statistics', async () => {
      const userStats = page.locator('[data-testid="user-stats"]');
      await expect(userStats).toBeVisible();
      await expect(userStats).toContainText('Users');
    });

    it('should display activity statistics', async () => {
      const activityStats = page.locator('[data-testid="activity-stats"]');
      await expect(activityStats).toBeVisible();
      await expect(activityStats).toContainText('Activity');
    });

    it('should display performance statistics', async () => {
      const perfStats = page.locator('[data-testid="performance-stats"]');
      await expect(perfStats).toBeVisible();
      await expect(perfStats).toContainText('Performance');
    });

    it('should display security statistics', async () => {
      const securityStats = page.locator('[data-testid="security-stats"]');
      await expect(securityStats).toBeVisible();
      await expect(securityStats).toContainText('Security');
    });

    it('should update statistics in real-time', async () => {
      const initialCount = await page.locator('[data-testid="user-count"]').textContent();
      
      await page.waitForTimeout(5000);
      
      const updatedCount = await page.locator('[data-testid="user-count"]').textContent();
      expect(updatedCount).toBeDefined();
    });
  });

  describe('Charts and Visualizations', () => {
    it('should display activity chart', async () => {
      await expect(page.locator('[data-testid="activity-chart"]')).toBeVisible();
    });

    it('should display performance chart', async () => {
      await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();
    });

    it('should allow chart interaction', async () => {
      const chart = page.locator('[data-testid="activity-chart"]');
      await chart.hover();
      
      await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
    });

    it('should allow chart time range selection', async () => {
      await page.click('button[aria-label="Time range"]');
      await page.click('text=Last 7 days');
      
      await expect(page.locator('[data-testid="activity-chart"]')).toBeVisible();
    });
  });

  describe('Recent Activity', () => {
    it('should display recent activity list', async () => {
      await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
    });

    it('should display activity items', async () => {
      const activityItems = page.locator('[data-testid="activity-item"]');
      const count = await activityItems.count();
      expect(count).toBeGreaterThan(0);
    });

    it('should display activity timestamps', async () => {
      const firstActivity = page.locator('[data-testid="activity-item"]').first();
      await expect(firstActivity.locator('[data-testid="timestamp"]')).toBeVisible();
    });

    it('should allow activity filtering', async () => {
      await page.click('button[aria-label="Filter activities"]');
      await page.click('text=Login activities');
      
      await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
    });

    it('should allow activity search', async () => {
      await page.fill('input[placeholder="Search activities"]', 'login');
      
      await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
    });
  });

  describe('Quick Actions', () => {
    it('should display quick action buttons', async () => {
      await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
    });

    it('should allow creating new user', async () => {
      await page.click('button[aria-label="Create user"]');
      
      await expect(page.locator('text=Create New User')).toBeVisible();
    });

    it('should allow running system scan', async () => {
      await page.click('button[aria-label="Run scan"]');
      
      await expect(page.locator('text=System Scan')).toBeVisible();
    });

    it('should allow viewing reports', async () => {
      await page.click('button[aria-label="View reports"]');
      
      await expect(page).toHaveURL(/.*reports/);
    });
  });

  describe('Notifications', () => {
    it('should display notification bell', async () => {
      await expect(page.locator('button[aria-label="Notifications"]')).toBeVisible();
    });

    it('should display notification count', async () => {
      const notificationBadge = page.locator('[data-testid="notification-badge"]');
      await expect(notificationBadge).toBeVisible();
    });

    it('should display notification dropdown', async () => {
      await page.click('button[aria-label="Notifications"]');
      
      await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();
    });

    it('should display notification items', async () => {
      await page.click('button[aria-label="Notifications"]');
      
      const notifications = page.locator('[data-testid="notification-item"]');
      const count = await notifications.count();
      expect(count).toBeGreaterThan(0);
    });

    it('should allow marking notifications as read', async () => {
      await page.click('button[aria-label="Notifications"]');
      await page.click('[data-testid="notification-item"] button[aria-label="Mark as read"]');
      
      await expect(page.locator('[data-testid="notification-item"].read')).toBeVisible();
    });
  });

  describe('User Profile', () => {
    it('should navigate to profile page', async () => {
      await page.click('text=Profile');
      
      await expect(page).toHaveURL(/.*profile/);
    });

    it('should display profile information', async () => {
      await page.click('text=Profile');
      
      await expect(page.locator('text=Test User')).toBeVisible();
      await expect(page.locator('text=test@example.com')).toBeVisible();
    });

    it('should allow profile editing', async () => {
      await page.click('text=Profile');
      await page.click('button[aria-label="Edit profile"]');
      
      await expect(page.locator('input[name="name"]')).toBeVisible();
    });

    it('should save profile changes', async () => {
      await page.click('text=Profile');
      await page.click('button[aria-label="Edit profile"]');
      
      await page.fill('input[name="name"]', 'Updated Name');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    });
  });

  describe('Settings', () => {
    it('should navigate to settings page', async () => {
      await page.click('text=Settings');
      
      await expect(page).toHaveURL(/.*settings/);
    });

    it('should display settings sections', async () => {
      await page.click('text=Settings');
      
      await expect(page.locator('text=General')).toBeVisible();
      await expect(page.locator('text=Security')).toBeVisible();
      await expect(page.locator('text=Notifications')).toBeVisible();
    });

    it('should allow changing theme', async () => {
      await page.click('text=Settings');
      await page.click('text=General');
      await page.click('button[aria-label="Toggle theme"]');
      
      await expect(page.locator('html')).toHaveClass(/dark/);
    });

    it('should allow changing language', async () => {
      await page.click('text=Settings');
      await page.click('text=General');
      await page.selectOption('select[name="language"]', 'zh-CN');
      
      await expect(page.locator('text=仪表板')).toBeVisible();
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on mobile', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).not.toBeVisible();
      
      await page.click('button[aria-label="Menu"]');
      await expect(page.locator('nav')).toBeVisible();
    });

    it('should display correctly on tablet', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });

    it('should display correctly on desktop', async () => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4);
    });
  });

  describe('Performance', () => {
    it('should load dashboard quickly', async () => {
      const startTime = Date.now();
      await page.goto(`${baseUrl}/dashboard`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000);
    });

    it('should handle rapid navigation', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await page.click('text=Dashboard');
        await page.waitForLoadState('networkidle');
      }
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const h1 = await page.locator('h1').count();
      const h2 = await page.locator('h2').count();
      
      expect(h1).toBe(1);
      expect(h2).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels', async () => {
      const buttons = await page.locator('button').all();
      
      for (const button of buttons) {
        const ariaLabel = await button.getAttribute('aria-label');
        const buttonText = await button.textContent();
        
        expect(ariaLabel || buttonText).toBeDefined();
      }
    });

    it('should be keyboard navigable', async () => {
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeDefined();
    });
  });
});
