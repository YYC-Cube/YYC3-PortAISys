import { vi } from 'vitest';

// Mock window 对象用于 Node.js 环境（为 Agent 测试）
if (typeof window === 'undefined') {
  Object.defineProperty(global, 'window', {
    value: {
      innerWidth: 1024,
      innerHeight: 768,
      devicePixelRatio: 1,
      navigator: {
        userAgent: 'Node.js Test Environment',
        platform: 'darwin',
        language: 'zh-CN',
      },
      setInterval: vi.fn((callback, delay) => {
        return setTimeout(callback, delay);
      }),
      clearInterval: vi.fn((id) => {
        clearTimeout(id);
      }),
      setTimeout: vi.fn((callback, delay) => {
        return setTimeout(callback, delay || 0);
      }),
      clearTimeout: vi.fn((id) => {
        clearTimeout(id);
      }),
      requestAnimationFrame: vi.fn((callback) => {
        return setTimeout(callback, 0);
      }),
      cancelAnimationFrame: vi.fn((id) => {
        clearTimeout(id);
      }),
    },
    writable: true,
    configurable: true,
  });
}

// Mock navigator 对象
if (typeof navigator === 'undefined') {
  Object.defineProperty(global, 'navigator', {
    value: {
      userAgent: 'Node.js Test Environment',
      platform: 'darwin',
      language: 'zh-CN',
    },
    writable: true,
    configurable: true,
  });
}

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-12345',
  v5: () => 'test-uuid-v5-67890'
}));

// Mock React Native storage
vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => store.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        store.delete(key);
      }),
      clear: vi.fn(async () => {
        store.clear();
      }),
    },
  };
});

// Mock React Native NetInfo
vi.mock('@react-native-community/netinfo', () => {
  let listeners: Array<(state: any) => void> = [];
  const baseState = {
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
  };
  return {
    default: {
      fetch: vi.fn(async () => baseState),
      addEventListener: vi.fn((handler: (state: any) => void) => {
        listeners.push(handler);
        return () => {
          listeners = listeners.filter((h) => h !== handler);
        };
      }),
      __emit: (state: any) => listeners.forEach((h) => h(state)),
    },
  };
});

// Mock Expo Location
vi.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: vi.fn(async () => ({ status: 'granted', granted: true })),
  hasServicesEnabledAsync: vi.fn(async () => true),
  getCurrentPositionAsync: vi.fn(async () => ({
    coords: { latitude: 0, longitude: 0, accuracy: 1 },
    timestamp: Date.now(),
  })),
  Accuracy: {
    Lowest: 1,
    Low: 10,
    High: 100,
    Highest: 1000,
  },
}));

// Mock Expo Local Authentication
vi.mock('expo-local-authentication', () => ({
  hasHardwareAsync: vi.fn(async () => true),
  isEnrolledAsync: vi.fn(async () => true),
  authenticateAsync: vi.fn(async () => ({ success: true })),
}));

global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  log: vi.fn()
};

global.fetch = vi.fn((url: string, options?: RequestInit) => {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({
      content: '模拟的AI响应',
      toolUsed: false,
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150
      }
    })
  } as Response);
}) as any;

beforeEach(() => {
  vi.clearAllMocks();
});
