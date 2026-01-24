import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E测试配置
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* 运行测试的最大时间 */
  timeout: 30 * 1000,
  
  /* 每个测试的expect超时时间 */
  expect: {
    timeout: 5000
  },
  
  /* 失败时自动重试 */
  fullyParallel: true,
  
  /* 在CI上失败时重试 */
  retries: process.env.CI ? 2 : 0,
  
  /* 并行worker数量 */
  workers: process.env.CI ? 1 : undefined,
  
  /* 测试报告配置 */
  reporter: [
    ['html', { outputFolder: 'test-reports/playwright' }],
    ['json', { outputFile: 'test-reports/playwright/results.json' }],
    ['junit', { outputFile: 'test-reports/playwright/results.xml' }],
    ['list']
  ],
  
  /* 所有测试的共享设置 */
  use: {
    /* 基础URL */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /* 失败时收集追踪信息 */
    trace: 'on-first-retry',
    
    /* 失败时截图 */
    screenshot: 'only-on-failure',
    
    /* 失败时录制视频 */
    video: 'retain-on-failure',
    
    /* 浏览器上下文选项 */
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
  },

  /* 配置不同的浏览器项目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* 移动设备测试 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* 平板设备测试 */
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  /* 在测试开始前运行开发服务器 */
  webServer: process.env.CI ? undefined : {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
