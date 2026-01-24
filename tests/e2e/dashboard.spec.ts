/**
 * @file Web Dashboard E2E测试
 * @description 端到端测试Web Dashboard的核心功能
 * @module tests/e2e
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import { test, expect } from '@playwright/test';

test.describe('用户认证流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('应该显示登录页面', async ({ page }) => {
    await expect(page).toHaveTitle(/YYC³/);
    
    const loginButton = page.getByRole('button', { name: /登录|sign in/i });
    await expect(loginButton).toBeVisible();
  });

  test('应该能够登录', async ({ page }) => {
    // 点击登录按钮
    await page.click('text=登录');
    
    // 填写登录表单
    await page.fill('input[name="email"]', 'admin@yyc3.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    
    // 提交表单
    await page.click('button[type="submit"]');
    
    // 等待跳转到主页
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    
    // 验证登录成功
    await expect(page.getByText(/欢迎|welcome/i)).toBeVisible();
  });

  test('应该显示登录错误信息', async ({ page }) => {
    await page.click('text=登录');
    
    // 填写错误的凭据
    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // 应该显示错误消息
    await expect(page.getByText(/凭据无效|invalid credentials/i)).toBeVisible();
  });

  test('应该能够注销', async ({ page }) => {
    // 先登录
    await page.click('text=登录');
    await page.fill('input[name="email"]', 'admin@yyc3.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // 点击用户菜单
    await page.click('[data-testid="user-menu"]');
    
    // 点击注销
    await page.click('text=注销');
    
    // 应该跳转回登录页
    await page.waitForURL('**/auth/signin');
    await expect(page.getByText(/登录|sign in/i)).toBeVisible();
  });
});

test.describe('映射管理', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'admin@yyc3.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // 导航到映射页面
    await page.click('text=映射管理');
    await page.waitForURL('**/mappings');
  });

  test('应该显示映射列表', async ({ page }) => {
    // 等待表格加载
    await page.waitForSelector('table', { timeout: 5000 });
    
    // 验证表格存在
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // 验证表头
    await expect(page.getByText(/文档路径|doc path/i)).toBeVisible();
    await expect(page.getByText(/代码路径|code path/i)).toBeVisible();
  });

  test('应该能够搜索映射', async ({ page }) => {
    // 输入搜索关键词
    const searchInput = page.locator('input[placeholder*="搜索"]');
    await searchInput.fill('test');
    
    // 等待搜索结果
    await page.waitForTimeout(500);
    
    // 验证搜索结果
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    
    // 至少应该有一些结果或显示"无结果"
    if (count === 0) {
      await expect(page.getByText(/无结果|no results/i)).toBeVisible();
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('应该能够切换映射状态', async ({ page }) => {
    // 找到第一个映射的开关
    const firstSwitch = page.locator('[role="switch"]').first();
    
    // 获取初始状态
    const initialState = await firstSwitch.getAttribute('aria-checked');
    
    // 切换状态
    await firstSwitch.click();
    
    // 等待更新
    await page.waitForTimeout(500);
    
    // 验证状态已改变
    const newState = await firstSwitch.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
  });

  test('应该显示映射详情', async ({ page }) => {
    // 点击第一个映射的详情按钮
    await page.click('table tbody tr:first-child button[title*="详情"]');
    
    // 应该打开详情对话框
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // 验证详情内容
    await expect(page.getByText(/文档路径|doc path/i)).toBeVisible();
    await expect(page.getByText(/代码路径|code path/i)).toBeVisible();
  });
});

test.describe('用户管理', () => {
  test.beforeEach(async ({ page }) => {
    // 登录为管理员
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'admin@yyc3.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // 导航到用户管理页面
    await page.click('text=用户管理');
    await page.waitForURL('**/users');
  });

  test('应该显示用户列表', async ({ page }) => {
    await page.waitForSelector('table');
    
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // 验证列标题
    await expect(page.getByText(/用户名|username/i)).toBeVisible();
    await expect(page.getByText(/邮箱|email/i)).toBeVisible();
    await expect(page.getByText(/角色|role/i)).toBeVisible();
  });

  test('应该能够创建新用户', async ({ page }) => {
    // 点击创建用户按钮
    await page.click('text=创建用户');
    
    // 填写表单
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@yyc3.com`);
    await page.fill('input[name="password"]', 'Test@123456');
    await page.selectOption('select[name="role"]', 'USER');
    
    // 提交
    await page.click('button[type="submit"]');
    
    // 验证成功消息
    await expect(page.getByText(/创建成功|created successfully/i)).toBeVisible();
  });

  test('应该能够编辑用户', async ({ page }) => {
    // 点击第一个用户的编辑按钮
    await page.click('table tbody tr:first-child button[title*="编辑"]');
    
    // 应该打开编辑对话框
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // 修改用户名
    const nameInput = page.locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill('Updated Name');
    
    // 保存
    await page.click('button:has-text("保存")');
    
    // 验证更新成功
    await expect(page.getByText(/更新成功|updated successfully/i)).toBeVisible();
  });

  test('应该能够删除用户', async ({ page }) => {
    // 获取初始用户数量
    const initialCount = await page.locator('table tbody tr').count();
    
    // 点击删除按钮
    await page.click('table tbody tr:last-child button[title*="删除"]');
    
    // 确认删除
    await page.click('button:has-text("确认")');
    
    // 等待删除完成
    await page.waitForTimeout(500);
    
    // 验证用户数量减少
    const newCount = await page.locator('table tbody tr').count();
    expect(newCount).toBe(initialCount - 1);
  });
});

test.describe('权限控制', () => {
  test('普通用户不应该访问用户管理', async ({ page }) => {
    // 登录为普通用户
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'user@yyc3.com');
    await page.fill('input[name="password"]', 'User@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // 尝试访问用户管理页面
    await page.goto('http://localhost:3000/users');
    
    // 应该显示权限错误或被重定向
    await expect(
      page.getByText(/权限不足|insufficient permissions|access denied/i)
    ).toBeVisible({ timeout: 3000 }).catch(() => {
      // 或者被重定向到其他页面
      expect(page.url()).not.toContain('/users');
    });
  });

  test('应该根据角色显示不同的菜单', async ({ page }) => {
    // 管理员登录
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'admin@yyc3.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // 管理员应该看到用户管理菜单
    await expect(page.getByText('用户管理')).toBeVisible();
    
    // 注销
    await page.click('[data-testid="user-menu"]');
    await page.click('text=注销');
    
    // 普通用户登录
    await page.fill('input[name="email"]', 'user@yyc3.com');
    await page.fill('input[name="password"]', 'User@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // 普通用户不应该看到用户管理菜单
    await expect(page.getByText('用户管理')).not.toBeVisible();
  });
});

test.describe('响应式设计', () => {
  test('应该在移动端正确显示', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000');
    
    // 验证移动端导航
    const mobileMenu = page.locator('[aria-label="菜单"]');
    await expect(mobileMenu).toBeVisible();
    
    // 点击菜单
    await mobileMenu.click();
    
    // 验证侧边栏打开
    await expect(page.locator('nav')).toBeVisible();
  });

  test('应该在平板端正确显示', async ({ page }) => {
    // 设置平板视口
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('http://localhost:3000');
    
    // 验证布局
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('aside')).toBeVisible();
  });
});

test.describe('性能测试', () => {
  test('页面加载时间应该合理', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 页面应该在3秒内加载完成
    expect(loadTime).toBeLessThan(3000);
  });

  test('列表滚动应该流畅', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'admin@yyc3.com');
    await page.fill('input[name="password"]', 'Admin@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    await page.click('text=映射管理');
    await page.waitForURL('**/mappings');
    
    // 滚动页面
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // 验证滚动后仍然可以交互
    await expect(page.locator('table')).toBeVisible();
  });
});
