/**
 * @file ServiceBoundaries 单元测试
 * @description 测试微服务边界定义的正确性和完整性
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceBoundaries } from '../../../../core/architecture/service-registry/ServiceBoundaries';

describe('ServiceBoundaries', () => {
  let serviceBoundaries: ServiceBoundaries;

  beforeEach(() => {
    serviceBoundaries = new ServiceBoundaries();
  });

  describe('getBoundary', () => {
    it('should return the correct boundary for an existing service', () => {
      const boundary = serviceBoundaries.getBoundary('customer-management');
      expect(boundary).toBeDefined();
      expect(boundary?.name).toBe('Customer Management Service');
      expect(boundary?.type).toBe('core');
      expect(boundary?.description).toBe('管理客户信息和客户生命周期');
    });

    it('should return undefined for a non-existent service', () => {
      const boundary = serviceBoundaries.getBoundary('non-existent-service');
      expect(boundary).toBeUndefined();
    });
  });

  describe('getAllBoundaries', () => {
    it('should return all service boundaries', () => {
      const boundaries = serviceBoundaries.getAllBoundaries();
      expect(boundaries).toBeInstanceOf(Array);
      expect(boundaries.length).toBeGreaterThan(0);
      
      // 检查关键服务是否存在
      const serviceNames = boundaries.map(b => b.name);
      expect(serviceNames).toContain('Customer Management Service');
      expect(serviceNames).toContain('Form Service');
      expect(serviceNames).toContain('Workflow Service');
      expect(serviceNames).toContain('Cache Service');
      expect(serviceNames).toContain('Message Queue Service');
      expect(serviceNames).toContain('Monitoring Service');
    });
  });

  describe('getDependencyGraph', () => {
    it('should return a valid dependency graph', () => {
      const graph = serviceBoundaries.getDependencyGraph();
      expect(graph).toHaveProperty('nodes');
      expect(graph).toHaveProperty('links');
      expect(graph.nodes).toBeInstanceOf(Array);
      expect(graph.links).toBeInstanceOf(Array);
      
      // 检查节点和链接的结构
      graph.nodes.forEach(node => {
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('name');
        expect(node).toHaveProperty('type');
      });
      
      graph.links.forEach(link => {
        expect(link).toHaveProperty('source');
        expect(link).toHaveProperty('target');
        expect(link).toHaveProperty('type');
      });
    });
  });

  describe('validateBoundaries', () => {
    it('should validate all boundaries successfully', () => {
      const validation = serviceBoundaries.validateBoundaries();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toBeInstanceOf(Array);
      expect(validation.errors.length).toBe(0);
    });
  });

  describe('service boundaries structure', () => {
    it('should have consistent structure for all services', () => {
      const boundaries = serviceBoundaries.getAllBoundaries();
      
      boundaries.forEach(boundary => {
        // 检查必需字段
        expect(boundary).toHaveProperty('name');
        expect(boundary).toHaveProperty('type');
        expect(boundary).toHaveProperty('description');
        expect(boundary).toHaveProperty('responsibilities');
        expect(boundary).toHaveProperty('dependencies');
        expect(boundary).toHaveProperty('apiEndpoints');
        expect(boundary).toHaveProperty('dataOwnership');
        expect(boundary).toHaveProperty('performanceSLAs');
        expect(boundary).toHaveProperty('scalingStrategy');
        expect(boundary).toHaveProperty('healthCheckEndpoint');
        
        // 检查数组字段
        expect(Array.isArray(boundary.responsibilities)).toBe(true);
        expect(Array.isArray(boundary.dependencies)).toBe(true);
        expect(Array.isArray(boundary.apiEndpoints)).toBe(true);
        expect(Array.isArray(boundary.dataOwnership)).toBe(true);
        
        // 检查性能SLAs结构
        expect(boundary.performanceSLAs).toHaveProperty('responseTime');
        expect(boundary.performanceSLAs).toHaveProperty('availability');
        expect(boundary.performanceSLAs).toHaveProperty('throughput');
        
        // 检查API端点结构
        boundary.apiEndpoints.forEach(endpoint => {
          expect(endpoint).toHaveProperty('method');
          expect(endpoint).toHaveProperty('path');
          expect(endpoint).toHaveProperty('description');
          expect(endpoint).toHaveProperty('authentication');
        });
      });
    });
  });

  describe('newly added services', () => {
    it('should include cache service with correct boundaries', () => {
      const boundary = serviceBoundaries.getBoundary('cache');
      expect(boundary).toBeDefined();
      expect(boundary?.name).toBe('Cache Service');
      expect(boundary?.type).toBe('support');
      expect(boundary?.description).toBe('提供分布式缓存能力');
      expect(boundary?.responsibilities).toContain('缓存数据的存储和检索');
      expect(boundary?.apiEndpoints).toHaveLength(4);
    });

    it('should include message queue service with correct boundaries', () => {
      const boundary = serviceBoundaries.getBoundary('message-queue');
      expect(boundary).toBeDefined();
      expect(boundary?.name).toBe('Message Queue Service');
      expect(boundary?.type).toBe('support');
      expect(boundary?.description).toBe('提供异步消息传递能力');
      expect(boundary?.responsibilities).toContain('消息的发布和订阅');
      expect(boundary?.apiEndpoints).toHaveLength(3);
    });

    it('should include monitoring service with correct boundaries', () => {
      const boundary = serviceBoundaries.getBoundary('monitoring');
      expect(boundary).toBeDefined();
      expect(boundary?.name).toBe('Monitoring Service');
      expect(boundary?.type).toBe('support');
      expect(boundary?.description).toBe('提供系统监控和告警能力');
      expect(boundary?.responsibilities).toContain('系统指标的收集和存储');
      expect(boundary?.apiEndpoints).toHaveLength(3);
    });
  });
});
