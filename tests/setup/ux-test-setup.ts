/**
 * @file UX测试设置文件
 * @description 为需要浏览器API的UX测试提供mock
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { vi } from 'vitest';

// Mock document对象
if (typeof document === 'undefined') {
  (global as any).document = {
    createElement: vi.fn((tagName: string) => ({
      tagName: tagName.toUpperCase(),
      className: '',
      id: '',
      innerHTML: '',
      textContent: '',
      style: {},
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      insertBefore: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      getBoundingClientRect: vi.fn(() => ({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0
      })),
      focus: vi.fn(),
      blur: vi.fn()
    })),
    body: {
      insertBefore: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn()
    },
    head: {
      insertBefore: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn()
    },
    documentElement: {
      style: {},
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn()
      }
    },
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => [])
  };
}

// Mock window对象
if (typeof window === 'undefined') {
  (global as any).window = {
    innerWidth: 1024,
    innerHeight: 768,
    devicePixelRatio: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    performance: {
      getEntriesByType: vi.fn(() => []),
      now: vi.fn(() => Date.now())
    },
    scrollTo: vi.fn(),
    scrollBy: vi.fn()
  };
}

// Mock navigator对象
if (typeof navigator === 'undefined') {
  (global as any).navigator = {
    userAgent: 'Node.js Test Environment',
    platform: 'darwin',
    language: 'zh-CN'
  };
}

export {};
