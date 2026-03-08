/**
 * @file setup/agent-test-setup.ts
 * @description Agent Test Setup 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

// tests/setup/agent-test-setup.ts
/**
 * Agent 测试设置文件
 * 为需要浏览器 API 的 Agent 测试提供 mock
 */

// Mock window 对象用于 Node.js 环境
if (typeof window === 'undefined') {
  (global as any).window = {
    innerWidth: 1024,
    innerHeight: 768,
    devicePixelRatio: 1,
    navigator: {
      userAgent: 'Node.js Test Environment',
      platform: 'darwin',
      language: 'zh-CN',
    },
  };
}

// Mock navigator 对象
if (typeof navigator === 'undefined') {
  (global as any).navigator = {
    userAgent: 'Node.js Test Environment',
    platform: 'darwin',
    language: 'zh-CN',
  };
}

export {};
