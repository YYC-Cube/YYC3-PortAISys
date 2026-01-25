/**
 * @file API模拟管理器单元测试
 * @description 测试ApiMockManager的功能可靠性和正确性
 * @module tests/unit/testing/ApiMockManager
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiMockManager, ApiMockConfig } from '../../../core/testing/ApiMockManager';

describe('ApiMockManager', () => {
  beforeEach(() => {
    // 清理所有模拟
    apiMockManager.cleanup();
  });

  describe('基本功能', () => {
    it('应该能够创建和获取模拟实例', () => {
      const config: ApiMockConfig = {
        name: 'test-mock',
        response: 'test response'
      };

      const mock = apiMockManager.createMock('test-key', config);
      expect(mock).toBeDefined();
      expect(mock.config.name).toBe('test-mock');

      const retrievedMock = apiMockManager.getMock('test-key');
      expect(retrievedMock).toBeDefined();
      expect(retrievedMock?.config.name).toBe('test-mock');
    });

    it('应该能够移除模拟实例', () => {
      const config: ApiMockConfig = {
        name: 'test-mock',
        response: 'test response'
      };

      apiMockManager.createMock('test-key', config);
      expect(apiMockManager.getMock('test-key')).toBeDefined();

      apiMockManager.removeMock('test-key');
      expect(apiMockManager.getMock('test-key')).toBeUndefined();
    });

    it('应该能够重置所有模拟', () => {
      const config: ApiMockConfig = {
        name: 'test-mock',
        response: 'test response'
      };

      const mock = apiMockManager.createMock('test-key', config);
      
      // 模拟调用
      mock.mock('test');
      expect(mock.callCount).toBe(1);

      // 重置所有模拟
      apiMockManager.resetAll();
      expect(mock.callCount).toBe(0);
    });

    it('应该能够清理所有模拟', () => {
      const config: ApiMockConfig = {
        name: 'test-mock',
        response: 'test response'
      };

      apiMockManager.createMock('test-key', config);
      expect(apiMockManager.getMock('test-key')).toBeDefined();

      apiMockManager.cleanup();
      expect(apiMockManager.getMock('test-key')).toBeUndefined();
    });
  });

  describe('模拟行为', () => {
    it('应该返回正确的模拟响应', async () => {
      const config: ApiMockConfig = {
        name: 'test-mock',
        response: 'test response'
      };

      const mock = apiMockManager.createMock('test-key', config);
      const result = await mock.mock();
      expect(result).toBe('test response');
      expect(mock.callCount).toBe(1);
    });

    it('应该模拟错误', async () => {
      const config: ApiMockConfig = {
        name: 'test-mock',
        response: 'test response',
        error: true,
        errorMessage: 'Test error'
      };

      const mock = apiMockManager.createMock('test-key', config);
      await expect(mock.mock()).rejects.toThrow('Test error');
      expect(mock.callCount).toBe(1);
    });

    it('应该模拟延迟', async () => {
      const config: ApiMockConfig = {
        name: 'test-mock',
        response: 'test response',
        delay: 100
      };

      const mock = apiMockManager.createMock('test-key', config);

      const startTime = Date.now();
      await mock.mock();
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(50); // 允许一些误差
      expect(mock.callCount).toBe(1);
    });

    it('应该遵守调用次数限制', async () => {
      const config: ApiMockConfig = {
        name: 'test-mock',
        response: 'test response',
        callLimit: 2
      };

      const mock = apiMockManager.createMock('test-key', config);

      // 第一次调用
      await mock.mock();
      expect(mock.callCount).toBe(1);

      // 第二次调用
      await mock.mock();
      expect(mock.callCount).toBe(2);

      // 第三次调用应该失败
      await expect(mock.mock()).rejects.toThrow('Call limit exceeded for mock: test-key');
    });
  });

  describe('特殊模拟', () => {
    it('应该创建OpenAI API模拟', () => {
      const openAIMock = apiMockManager.createOpenAIMock();
      expect(openAIMock).toBeDefined();
      expect(openAIMock.config.name).toBe('openai-api');
      expect(openAIMock.config.response).toBeDefined();
    });

    it('应该创建流式响应模拟', () => {
      const streamingMock = apiMockManager.createStreamingMock();
      expect(streamingMock).toBeDefined();
      expect(streamingMock.config.name).toBe('streaming-api');
      expect(streamingMock.config.response).toBeDefined();
      expect(streamingMock.config.response.createReadStream).toBeDefined();
    });
  });

  describe('模拟实例方法', () => {
    it('应该能够重置模拟实例', () => {
      const config: ApiMockConfig = {
        name: 'test-mock',
        response: 'test response'
      };

      const mock = apiMockManager.createMock('test-key', config);
      
      // 模拟调用
      mock.mock('test');
      expect(mock.callCount).toBe(1);

      // 重置模拟
      mock.reset();
      expect(mock.callCount).toBe(0);
    });

    it('应该能够验证模拟调用', () => {
      const config: ApiMockConfig = {
        name: 'test-mock',
        response: 'test response'
      };

      const mock = apiMockManager.createMock('test-key', config);
      
      // 模拟调用
      mock.mock('test');

      // 验证调用
      const result = mock.verify();
      expect(result).toBeDefined();
    });
  });
});
