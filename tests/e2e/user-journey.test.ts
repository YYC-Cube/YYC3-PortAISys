import { test, expect } from '@playwright/test';

test.skip.describe('用户完整旅程', () => {
  test('新用户注册到使用完整流程', async ({ page }) => {
    // 1. 访问首页
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/YYC³ PortAISys/);

    // 2. 注册
    await page.click('text=注册');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    // 3. 验证登录成功
    await expect(page.locator('text=欢迎')).toBeVisible();

    // 4. 发送查询
    await page.fill('textarea[placeholder*="输入"]', '你好，请介绍一下系统功能');
    await page.click('button:has-text("发送")');

    // 5. 验证响应
    await expect(page.locator('.message.assistant')).toBeVisible();

    // 6. 查看历史记录
    await page.click('text=历史记录');
    await expect(page.locator('.history-item')).toHaveCount.greaterThan(0);
  });

  test('用户反馈流程', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 发送查询
    await page.fill('textarea', '测试查询');
    await page.click('button:has-text("发送")');

    // 等待响应
    await expect(page.locator('.message.assistant')).toBeVisible();

    // 提供反馈
    await page.click('button[aria-label="有帮助"]');

    // 验证反馈已记录
    await expect(page.locator('text=感谢反馈')).toBeVisible();
  });

  test('多模态交互', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 上传图片
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');

    // 添加文本描述
    await page.fill('textarea', '分析这张图片');
    await page.click('button:has-text("发送")');

    // 验证分析结果
    await expect(page.locator('.image-analysis')).toBeVisible();
  });
});