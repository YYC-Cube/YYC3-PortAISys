/**
 * @file 服务注册与发现机制
 * @description 实现微服务的注册、发现、健康检查等功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 * @updated 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

export interface ServiceInfo {
  id: string;
  name: string;
  type: string;
  version: string;
  url: string;
  healthCheckUrl: string;
  metadata?: Record<string, any>;
  tags?: string[];
  lastHeartbeat?: number;
  status: 'healthy' | 'unhealthy' | 'starting' | 'stopping';
}

export interface ServiceRegistryOptions {
  healthCheckInterval?: number;
  healthCheckTimeout?: number;
  deregisterCriticalAfter?: number;
  maxRetries?: number;
  retryInterval?: number;
}

export class ServiceRegistry {
  private services: Map<string, ServiceInfo> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private options: ServiceRegistryOptions;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor(options: ServiceRegistryOptions = {}) {
    this.options = {
      healthCheckInterval: 5000,
      healthCheckTimeout: 3000,
      deregisterCriticalAfter: 30000,
      maxRetries: 3,
      retryInterval: 2000,
      ...options
    };
  }

  /**
   * 注册服务
   */
  registerService(service: Omit<ServiceInfo, 'status' | 'lastHeartbeat'>): string {
    const serviceId = service.id || `service_${service.name}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const serviceInfo: ServiceInfo = {
      ...service,
      id: serviceId,
      status: 'starting',
      lastHeartbeat: Date.now()
    };

    this.services.set(serviceId, serviceInfo);
    this.startHealthCheck(serviceId);
    this.emit('serviceRegistered', serviceInfo);

    return serviceId;
  }

  /**
   * 注销服务
   */
  deregisterService(serviceId: string): boolean {
    const service = this.services.get(serviceId);
    if (service) {
      this.stopHealthCheck(serviceId);
      this.services.delete(serviceId);
      this.emit('serviceDeregistered', { serviceId });
      return true;
    }
    return false;
  }

  /**
   * 发现服务
   */
  discoverService(serviceType: string, tags?: string[]): ServiceInfo[] {
    let foundServices = Array.from(this.services.values())
      .filter(service => service.type === serviceType && service.status === 'healthy');

    if (tags && tags.length > 0) {
      foundServices = foundServices.filter(service => 
        service.tags && tags.every(tag => service.tags?.includes(tag))
      );
    }

    return foundServices;
  }

  /**
   * 获取所有服务
   */
  getAllServices(): ServiceInfo[] {
    return Array.from(this.services.values());
  }

  /**
   * 获取服务详情
   */
  getService(serviceId: string): ServiceInfo | undefined {
    return this.services.get(serviceId);
  }

  /**
   * 发送心跳
   */
  sendHeartbeat(serviceId: string): boolean {
    const service = this.services.get(serviceId);
    if (service) {
      service.lastHeartbeat = Date.now();
      service.status = 'healthy';
      this.services.set(serviceId, service);
      this.emit('serviceHeartbeat', { serviceId, timestamp: Date.now() });
      return true;
    }
    return false;
  }

  /**
   * 更新服务状态
   */
  updateServiceStatus(serviceId: string, status: ServiceInfo['status']): boolean {
    const service = this.services.get(serviceId);
    if (service) {
      service.status = status;
      service.lastHeartbeat = Date.now();
      this.services.set(serviceId, service);
      this.emit('serviceStatusUpdated', { serviceId, status });
      return true;
    }
    return false;
  }

  /**
   * 开始健康检查
   */
  private startHealthCheck(serviceId: string): void {
    this.stopHealthCheck(serviceId);

    const interval = setInterval(async () => {
      const service = this.services.get(serviceId);
      if (!service) {
        this.stopHealthCheck(serviceId);
        return;
      }

      // 检查心跳是否过期
      if (service.lastHeartbeat && Date.now() - service.lastHeartbeat > this.options.deregisterCriticalAfter!) {
        this.deregisterService(serviceId);
        this.emit('serviceCritical', { serviceId, reason: 'heartbeat_timeout' });
        return;
      }

      // 执行健康检查
      if (service.healthCheckUrl) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.options.healthCheckTimeout!);

          const response = await fetch(service.healthCheckUrl, {
            signal: controller.signal,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            service.status = 'healthy';
            service.lastHeartbeat = Date.now();
          } else {
            service.status = 'unhealthy';
          }
        } catch (error) {
          service.status = 'unhealthy';
          this.emit('serviceHealthCheckFailed', { serviceId, error: error.message });
        }

        this.services.set(serviceId, service);
      }
    }, this.options.healthCheckInterval!);

    this.healthCheckIntervals.set(serviceId, interval);
  }

  /**
   * 停止健康检查
   */
  private stopHealthCheck(serviceId: string): void {
    const interval = this.healthCheckIntervals.get(serviceId);
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(serviceId);
    }
  }

  /**
   * 订阅事件
   */
  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(listener);
  }

  /**
   * 取消订阅
   */
  off(event: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 关闭注册中心
   */
  shutdown(): void {
    // 停止所有健康检查
    for (const serviceId of this.healthCheckIntervals.keys()) {
      this.stopHealthCheck(serviceId);
    }
    
    // 清空服务
    this.services.clear();
    this.eventListeners.clear();
  }

  /**
   * 获取服务统计信息
   */
  getStats(): {
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    startingServices: number;
    stoppingServices: number;
    servicesByType: Record<string, number>;
  } {
    const stats = {
      totalServices: 0,
      healthyServices: 0,
      unhealthyServices: 0,
      startingServices: 0,
      stoppingServices: 0,
      servicesByType: {} as Record<string, number>
    };

    for (const service of this.services.values()) {
      stats.totalServices++;
      
      switch (service.status) {
        case 'healthy':
          stats.healthyServices++;
          break;
        case 'unhealthy':
          stats.unhealthyServices++;
          break;
        case 'starting':
          stats.startingServices++;
          break;
        case 'stopping':
          stats.stoppingServices++;
          break;
      }

      if (!stats.servicesByType[service.type]) {
        stats.servicesByType[service.type] = 0;
      }
      stats.servicesByType[service.type]++;
    }

    return stats;
  }
}
