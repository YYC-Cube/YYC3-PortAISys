/**
 * @file 生态系统集成系统
 * @description 提供全面的第三方集成和生态系统支持
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import EventEmitter from 'eventemitter3';

export interface IntegrationManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'ai' | 'data' | 'communication' | 'analytics' | 'security' | 'productivity' | 'custom';
  type: 'api' | 'webhook' | 'sdk' | 'plugin' | 'service';
  capabilities: string[];
  permissions: string[];
  endpoints?: Record<string, string>;
  authentication?: AuthenticationConfig;
  configuration?: Record<string, any>;
  dependencies?: string[];
  compatibility: {
    minVersion: string;
    maxVersion: string;
  };
}

export interface AuthenticationConfig {
  type: 'none' | 'api-key' | 'oauth2' | 'jwt' | 'custom';
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  authUrl?: string;
  tokenUrl?: string;
  scopes?: string[];
  customAuth?: (config: any) => Promise<any>;
}

export interface IntegrationInstance {
  manifest: IntegrationManifest;
  status: IntegrationStatus;
  config: Record<string, any>;
  metadata: IntegrationMetadata;
  connections: Map<string, Connection>;
}

export interface IntegrationMetadata {
  installedAt: Date;
  enabledAt?: Date;
  lastUsed?: Date;
  lastSync?: Date;
  version: string;
}

export interface Connection {
  id: string;
  name: string;
  type: 'inbound' | 'outbound' | 'bidirectional';
  status: ConnectionStatus;
  config: Record<string, any>;
  metrics: ConnectionMetrics;
}

export interface ConnectionMetrics {
  requests: number;
  errors: number;
  lastRequest: Date;
  averageResponseTime: number;
  successRate: number;
}

export enum IntegrationStatus {
  INSTALLED = 'installed',
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  ERROR = 'error',
  UPDATING = 'updating'
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  ERROR = 'error'
}

export interface IntegrationEvent {
  type: string;
  integrationId: string;
  timestamp: Date;
  data: any;
}

export interface IntegrationHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  lastCheck: Date;
  issues: string[];
}

export interface IntegrationMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  totalConnections: number;
  activeConnections: number;
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  successRate: number;
}

export class EcosystemIntegrationSystem extends EventEmitter {
  private integrations: Map<string, IntegrationInstance> = new Map();
  private connections: Map<string, Connection> = new Map();
  private eventHandlers: Map<string, Set<Function>> = new Map();
  private healthChecks: Map<string, NodeJS.Timeout> = new Map();
  private metrics: IntegrationMetrics = {
    totalIntegrations: 0,
    activeIntegrations: 0,
    totalConnections: 0,
    activeConnections: 0,
    totalRequests: 0,
    totalErrors: 0,
    averageResponseTime: 0,
    successRate: 100
  };

  constructor() {
    super();
    this.initializeDefaultIntegrations();
  }

  private initializeDefaultIntegrations(): void {
    const defaultIntegrations: IntegrationManifest[] = [
      {
        id: 'openai-integration',
        name: 'OpenAI Integration',
        version: '1.0.0',
        description: 'OpenAI API integration for AI capabilities',
        author: 'YYC³',
        category: 'ai',
        type: 'api',
        capabilities: ['text-generation', 'image-generation', 'embedding', 'fine-tuning'],
        permissions: ['api:read', 'api:write'],
        endpoints: {
          api: 'https://api.openai.com/v1',
          chat: 'https://api.openai.com/v1/chat/completions',
          embedding: 'https://api.openai.com/v1/embeddings'
        },
        authentication: {
          type: 'api-key'
        },
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      },
      {
        id: 'slack-integration',
        name: 'Slack Integration',
        version: '1.0.0',
        description: 'Slack integration for team communication',
        author: 'YYC³',
        category: 'communication',
        type: 'webhook',
        capabilities: ['messaging', 'notifications', 'file-sharing', 'channels'],
        permissions: ['channels:read', 'channels:write', 'chat:write'],
        endpoints: {
          api: 'https://slack.com/api',
          webhook: 'https://hooks.slack.com/services'
        },
        authentication: {
          type: 'oauth2',
          authUrl: 'https://slack.com/oauth/authorize',
          tokenUrl: 'https://slack.com/api/oauth.v2.access',
          scopes: ['channels:read', 'channels:write', 'chat:write']
        },
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      },
      {
        id: 'github-integration',
        name: 'GitHub Integration',
        version: '1.0.0',
        description: 'GitHub integration for code management',
        author: 'YYC³',
        category: 'productivity',
        type: 'api',
        capabilities: ['repository-management', 'issues', 'pull-requests', 'actions'],
        permissions: ['repo:read', 'repo:write', 'issues:read', 'issues:write'],
        endpoints: {
          api: 'https://api.github.com',
          webhook: 'https://api.github.com/hub'
        },
        authentication: {
          type: 'oauth2',
          authUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token',
          scopes: ['repo', 'issues']
        },
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      },
      {
        id: 'aws-integration',
        name: 'AWS Integration',
        version: '1.0.0',
        description: 'AWS integration for cloud services',
        author: 'YYC³',
        category: 'data',
        type: 'sdk',
        capabilities: ['storage', 'compute', 'database', 'messaging', 'analytics'],
        permissions: ['s3:read', 's3:write', 'ec2:read', 'ec2:write'],
        endpoints: {
          api: 'https://aws.amazon.com',
          s3: 'https://s3.amazonaws.com',
          ec2: 'https://ec2.amazonaws.com'
        },
        authentication: {
          type: 'custom',
          customAuth: async (config) => {
            return { accessKeyId: config.accessKey, secretKey: config.secretKey };
          }
        },
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      },
      {
        id: 'google-analytics-integration',
        name: 'Google Analytics Integration',
        version: '1.0.0',
        description: 'Google Analytics integration for analytics',
        author: 'YYC³',
        category: 'analytics',
        type: 'api',
        capabilities: ['page-tracking', 'event-tracking', 'user-analytics', 'conversion-tracking'],
        permissions: ['analytics:read', 'analytics:write'],
        endpoints: {
          api: 'https://analyticsreporting.googleapis.com/v4',
          data: 'https://www.googleapis.com/analytics/v3/data'
        },
        authentication: {
          type: 'oauth2',
          authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          scopes: ['https://www.googleapis.com/auth/analytics.readonly']
        },
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      },
      {
        id: 'stripe-integration',
        name: 'Stripe Integration',
        version: '1.0.0',
        description: 'Stripe integration for payment processing',
        author: 'YYC³',
        category: 'productivity',
        type: 'api',
        capabilities: ['payments', 'subscriptions', 'invoices', 'customers'],
        permissions: ['payments:read', 'payments:write', 'customers:read'],
        endpoints: {
          api: 'https://api.stripe.com/v1',
          webhook: 'https://api.stripe.com/v1/webhooks'
        },
        authentication: {
          type: 'api-key'
        },
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0'
        }
      }
    ];

    defaultIntegrations.forEach(manifest => {
      this.registerIntegration(manifest);
    });
  }

  registerIntegration(manifest: IntegrationManifest): void {
    const instance: IntegrationInstance = {
      manifest,
      status: IntegrationStatus.INSTALLED,
      config: manifest.configuration || {},
      metadata: {
        installedAt: new Date(),
        version: manifest.version
      },
      connections: new Map()
    };

    this.integrations.set(manifest.id, instance);
    this.metrics.totalIntegrations++;

    this.emitEvent('integration:registered', manifest);
  }

  unregisterIntegration(integrationId: string): void {
    const instance = this.integrations.get(integrationId);
    if (!instance) {
      return;
    }

    if (instance.status === IntegrationStatus.ENABLED) {
      this.disableIntegration(integrationId);
    }

    instance.connections.forEach((_connection, connectionId) => {
      this.disconnect(connectionId);
    });

    this.integrations.delete(integrationId);
    this.metrics.totalIntegrations--;

    this.emitEvent('integration:unregistered', integrationId);
  }

  async enableIntegration(integrationId: string, config: Record<string, any> = {}): Promise<void> {
    const instance = this.integrations.get(integrationId);
    if (!instance) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    instance.config = { ...instance.config, ...config };
    instance.status = IntegrationStatus.ENABLED;
    instance.metadata.enabledAt = new Date();
    this.metrics.activeIntegrations++;

    this.emitEvent('integration:enabled', { integrationId, config });

    await this.startHealthCheck(integrationId);
  }

  async disableIntegration(integrationId: string): Promise<void> {
    const instance = this.integrations.get(integrationId);
    if (!instance) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    instance.status = IntegrationStatus.DISABLED;
    this.metrics.activeIntegrations--;

    this.stopHealthCheck(integrationId);

    this.emitEvent('integration:disabled', integrationId);
  }

  async connect(
    integrationId: string,
    connectionName: string,
    type: 'inbound' | 'outbound' | 'bidirectional',
    config: Record<string, any>
  ): Promise<string> {
    const instance = this.integrations.get(integrationId);
    if (!instance) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    if (instance.status !== IntegrationStatus.ENABLED) {
      throw new Error(`Integration not enabled: ${integrationId}`);
    }

    const connectionId = `${integrationId}-${connectionName}-${Date.now()}`;
    const connection: Connection = {
      id: connectionId,
      name: connectionName,
      type,
      status: ConnectionStatus.CONNECTING,
      config,
      metrics: {
        requests: 0,
        errors: 0,
        lastRequest: new Date(),
        averageResponseTime: 0,
        successRate: 100
      }
    };

    this.connections.set(connectionId, connection);
    instance.connections.set(connectionId, connection);
    this.metrics.totalConnections++;

    this.emitEvent('connection:created', { integrationId, connectionId, connection });

    await this.establishConnection(connection);

    return connectionId;
  }

  private async establishConnection(connection: Connection): Promise<void> {
    try {
      connection.status = ConnectionStatus.CONNECTED;
      this.metrics.activeConnections++;

      this.emitEvent('connection:established', connection);
    } catch (error) {
      connection.status = ConnectionStatus.ERROR;
      connection.metrics.errors++;

      this.emitEvent('connection:error', { connection, error });
      throw error;
    }
  }

  async disconnect(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return;
    }

    connection.status = ConnectionStatus.DISCONNECTED;
    this.metrics.activeConnections--;

    this.connections.delete(connectionId);

    this.emitEvent('connection:closed', connectionId);
  }

  async executeRequest<T = any>(
    integrationId: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    data?: any,
    config?: Record<string, any>
  ): Promise<T> {
    const instance = this.integrations.get(integrationId);
    if (!instance) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    if (instance.status !== IntegrationStatus.ENABLED) {
      throw new Error(`Integration not enabled: ${integrationId}`);
    }

    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const response = await this.makeRequest(instance, endpoint, method, data, config);

      const responseTime = Date.now() - startTime;
      this.updateConnectionMetrics(instance, responseTime, true);

      this.emitEvent('request:success', { integrationId, endpoint, responseTime });

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.metrics.totalErrors++;
      this.updateConnectionMetrics(instance, responseTime, false);

      this.emitEvent('request:error', { integrationId, endpoint, error, responseTime });

      throw error;
    }
  }

  private async makeRequest<T = any>(
    instance: IntegrationInstance,
    endpoint: string,
    method: string,
    data?: any,
    config?: Record<string, any>
  ): Promise<T> {
    const url = instance.manifest.endpoints?.[endpoint] || endpoint;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (instance.manifest.authentication?.type === 'api-key' && instance.manifest.authentication.apiKey) {
      headers['Authorization'] = `Bearer ${instance.manifest.authentication.apiKey}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...config
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private updateConnectionMetrics(instance: IntegrationInstance, responseTime: number, success: boolean): void {
    instance.connections.forEach(connection => {
      connection.metrics.requests++;
      connection.metrics.lastRequest = new Date();

      if (success) {
        const totalResponseTime = connection.metrics.averageResponseTime * (connection.metrics.requests - 1) + responseTime;
        connection.metrics.averageResponseTime = totalResponseTime / connection.metrics.requests;
        connection.metrics.successRate = ((connection.metrics.requests - connection.metrics.errors) / connection.metrics.requests) * 100;
      } else {
        connection.metrics.errors++;
        connection.metrics.successRate = ((connection.metrics.requests - connection.metrics.errors) / connection.metrics.requests) * 100;
      }
    });

    this.updateGlobalMetrics(responseTime, success);
  }

  private updateGlobalMetrics(responseTime: number, _success: boolean): void {
    const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime;
    this.metrics.averageResponseTime = totalResponseTime / this.metrics.totalRequests;
    this.metrics.successRate = ((this.metrics.totalRequests - this.metrics.totalErrors) / this.metrics.totalRequests) * 100;
  }

  emitEvent(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }

    super.emit(event, data);
  }

  async startHealthCheck(integrationId: string, interval: number = 60000): Promise<void> {
    this.stopHealthCheck(integrationId);

    const checkHealth = async () => {
      const health = await this.checkIntegrationHealth(integrationId);
      this.emitEvent('health:check', { integrationId, health });
    };

    await checkHealth();

    this.healthChecks.set(
      integrationId,
      setInterval(checkHealth, interval)
    );
  }

  stopHealthCheck(integrationId: string): void {
    const interval = this.healthChecks.get(integrationId);
    if (interval) {
      clearInterval(interval);
      this.healthChecks.delete(integrationId);
    }
  }

  async checkIntegrationHealth(integrationId: string): Promise<IntegrationHealth> {
    const instance = this.integrations.get(integrationId);
    if (!instance) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (instance.status !== IntegrationStatus.ENABLED) {
      status = 'unhealthy';
      issues.push(`Integration is ${instance.status}`);
    }

    const activeConnections = Array.from(instance.connections.values()).filter(
      conn => conn.status === ConnectionStatus.CONNECTED
    ).length;

    if (activeConnections === 0 && instance.connections.size > 0) {
      status = 'degraded';
      issues.push('No active connections');
    }

    const errorRate = instance.connections.size > 0
      ? Array.from(instance.connections.values()).reduce((sum, conn) => sum + conn.metrics.errors, 0) / instance.connections.size
      : 0;

    if (errorRate > 10) {
      status = 'degraded';
      issues.push(`High error rate: ${errorRate}`);
    }

    return {
      status,
      uptime: this.calculateUptime(instance),
      lastCheck: new Date(),
      issues
    };
  }

  private calculateUptime(instance: IntegrationInstance): number {
    if (!instance.metadata.enabledAt) {
      return 0;
    }

    const now = new Date();
    const enabledTime = instance.metadata.enabledAt.getTime();
    const totalUptime = now.getTime() - enabledTime;

    return (totalUptime / (1000 * 60 * 60 * 24)) * 100;
  }

  getIntegration(integrationId: string): IntegrationInstance | undefined {
    return this.integrations.get(integrationId);
  }

  getIntegrations(): IntegrationInstance[] {
    return Array.from(this.integrations.values());
  }

  getIntegrationsByCategory(category: IntegrationManifest['category']): IntegrationInstance[] {
    return Array.from(this.integrations.values()).filter(
      instance => instance.manifest.category === category
    );
  }

  getConnection(connectionId: string): Connection | undefined {
    return this.connections.get(connectionId);
  }

  getConnections(integrationId?: string): Connection[] {
    if (integrationId) {
      const instance = this.integrations.get(integrationId);
      return instance ? Array.from(instance.connections.values()) : [];
    }

    return Array.from(this.connections.values());
  }

  getMetrics(): IntegrationMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      totalIntegrations: this.integrations.size,
      activeIntegrations: 0,
      totalConnections: this.connections.size,
      activeConnections: 0,
      totalRequests: 0,
      totalErrors: 0,
      averageResponseTime: 0,
      successRate: 100
    };

    this.integrations.forEach(instance => {
      if (instance.status === IntegrationStatus.ENABLED) {
        this.metrics.activeIntegrations++;
      }
    });

    this.connections.forEach(connection => {
      if (connection.status === ConnectionStatus.CONNECTED) {
        this.metrics.activeConnections++;
      }
    });

    this.emitEvent('metrics:reset');
  }

  async syncIntegration(integrationId: string): Promise<void> {
    const instance = this.integrations.get(integrationId);
    if (!instance) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    this.emitEvent('sync:started', integrationId);

    try {
      await this.performSync(instance);
      instance.metadata.lastSync = new Date();

      this.emitEvent('sync:completed', integrationId);
    } catch (error) {
      this.emitEvent('sync:error', { integrationId, error });
      throw error;
    }
  }

  private async performSync(instance: IntegrationInstance): Promise<void> {
    const syncPromises = Array.from(instance.connections.values()).map(async connection => {
      if (connection.status === ConnectionStatus.CONNECTED) {
        await this.syncConnection(connection);
      }
    });

    await Promise.all(syncPromises);
  }

  private async syncConnection(connection: Connection): Promise<void> {
    this.emitEvent('connection:sync', connection.id);
  }

  destroy(): void {
    this.healthChecks.forEach(interval => clearInterval(interval));
    this.healthChecks.clear();
    this.integrations.clear();
    this.connections.clear();
    this.eventHandlers.clear();
    this.removeAllListeners();
  }
}
