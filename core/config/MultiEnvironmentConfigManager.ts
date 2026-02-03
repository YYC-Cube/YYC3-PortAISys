/**
 * @file 多环境配置管理系统
 * @description 提供全面的多环境配置管理功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import EventEmitter from 'eventemitter3';
import * as fs from 'fs';
import * as path from 'path';

export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface EnvironmentConfig {
  name: string;
  environment: Environment;
  version: string;
  description: string;
  variables: Map<string, any>;
  secrets: Map<string, string>;
  features: Map<string, boolean>;
  services: Map<string, ServiceConfig>;
  database: DatabaseConfig;
  cache: CacheConfig;
  logging: LoggingConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
}

export interface ServiceConfig {
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'ws' | 'wss';
  timeout: number;
  retries: number;
  enabled: boolean;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  ssl: boolean;
  poolSize: number;
  connectionTimeout: number;
  queryTimeout: number;
}

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  ttl: number;
  maxSize: number;
  enabled: boolean;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  output: 'console' | 'file' | 'both';
  filePath?: string;
  maxSize?: number;
  maxFiles?: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsEnabled: boolean;
  tracingEnabled: boolean;
  alertingEnabled: boolean;
  endpoint?: string;
  apiKey?: string;
}

export interface SecurityConfig {
  encryptionEnabled: boolean;
  authenticationEnabled: boolean;
  rateLimitingEnabled: boolean;
  corsEnabled: boolean;
  csrfProtectionEnabled: boolean;
  allowedOrigins: string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class MultiEnvironmentConfigManager extends EventEmitter {
  private currentEnvironment: Environment;
  private configs: Map<Environment, EnvironmentConfig> = new Map();
  private configPath: string;
  private secretsPath: string;
  private configLoaded: boolean = false;
  private validationRules: Map<string, (value: any) => boolean> = new Map();

  constructor(
    configPath: string = 'config',
    secretsPath: string = 'secrets'
  ) {
    super();
    this.configPath = configPath;
    this.secretsPath = secretsPath;
    this.currentEnvironment = this.detectEnvironment();
    this.initializeValidationRules();
  }

  private detectEnvironment(): Environment {
    const env = process.env.NODE_ENV || process.env.ENVIRONMENT || 'development';
    
    if (env === 'production') return 'production';
    if (env === 'staging') return 'staging';
    if (env === 'test') return 'test';
    return 'development';
  }

  private initializeValidationRules(): void {
    this.validationRules.set('port', (value: any) => {
      return typeof value === 'number' && value > 0 && value < 65536;
    });

    this.validationRules.set('host', (value: any) => {
      return typeof value === 'string' && value.length > 0;
    });

    this.validationRules.set('timeout', (value: any) => {
      return typeof value === 'number' && value > 0;
    });

    this.validationRules.set('enabled', (value: any) => {
      return typeof value === 'boolean';
    });

    this.validationRules.set('level', (value: any) => {
      return ['debug', 'info', 'warn', 'error'].includes(value);
    });
  }

  async loadConfig(environment?: Environment): Promise<void> {
    const env = environment || this.currentEnvironment;
    
    try {
      const configFilePath = path.join(this.configPath, `${env}.json`);
      const secretsFilePath = path.join(this.secretsPath, `${env}.secrets.json`);

      let configData: any = {};
      let secretsData: any = {};

      if (fs.existsSync(configFilePath)) {
        const fileContent = fs.readFileSync(configFilePath, 'utf-8');
        configData = JSON.parse(fileContent);
      }

      if (fs.existsSync(secretsFilePath)) {
        const fileContent = fs.readFileSync(secretsFilePath, 'utf-8');
        secretsData = JSON.parse(fileContent);
      }

      const config = this.createConfigFromData(configData, secretsData, env);
      this.configs.set(env, config);
      this.configLoaded = true;

      this.emit('config:loaded', { environment: env, config });
    } catch (error) {
      this.emit('config:load-error', { environment: env, error });
      throw new Error(`Failed to load config for ${env}: ${error}`);
    }
  }

  private createConfigFromData(
    configData: any,
    secretsData: any,
    environment: Environment
  ): EnvironmentConfig {
    return {
      name: configData.name || `${environment} Environment`,
      environment,
      version: configData.version || '1.0.0',
      description: configData.description || `${environment} environment configuration`,
      variables: new Map(Object.entries(configData.variables || {})),
      secrets: new Map(Object.entries(secretsData || {})),
      features: new Map(Object.entries(configData.features || {})),
      services: this.createServicesConfig(configData.services),
      database: this.createDatabaseConfig(configData.database, secretsData.database),
      cache: this.createCacheConfig(configData.cache, secretsData.cache),
      logging: this.createLoggingConfig(configData.logging),
      monitoring: this.createMonitoringConfig(configData.monitoring, secretsData.monitoring),
      security: this.createSecurityConfig(configData.security)
    };
  }

  private createServicesConfig(servicesData: any): Map<string, ServiceConfig> {
    return new Map(
      Object.entries(servicesData || {}).map(([key, value]: [string, any]) => [
        key,
        {
          host: value.host || 'localhost',
          port: value.port || 3201,
          protocol: value.protocol || 'http',
          timeout: value.timeout || 30000,
          retries: value.retries || 3,
          enabled: value.enabled !== false
        }
      ])
    );
  }

  private createDatabaseConfig(dbData: any, secretsDb: any): DatabaseConfig {
    return {
      host: dbData?.host || 'localhost',
      port: dbData?.port || 5432,
      database: dbData?.database || 'yyc3',
      username: dbData?.username || 'postgres',
      password: secretsDb?.password,
      ssl: dbData?.ssl || false,
      poolSize: dbData?.poolSize || 10,
      connectionTimeout: dbData?.connectionTimeout || 10000,
      queryTimeout: dbData?.queryTimeout || 30000
    };
  }

  private createCacheConfig(cacheData: any, secretsCache: any): CacheConfig {
    return {
      host: cacheData?.host || 'localhost',
      port: cacheData?.port || 6379,
      password: secretsCache?.password,
      ttl: cacheData?.ttl || 3600,
      maxSize: cacheData?.maxSize || 1000,
      enabled: cacheData?.enabled !== false
    };
  }

  private createLoggingConfig(loggingData: any): LoggingConfig {
    return {
      level: loggingData?.level || 'info',
      format: loggingData?.format || 'json',
      output: loggingData?.output || 'console',
      filePath: loggingData?.filePath,
      maxSize: loggingData?.maxSize || 10485760,
      maxFiles: loggingData?.maxFiles || 5
    };
  }

  private createMonitoringConfig(monitoringData: any, secretsMonitoring: any): MonitoringConfig {
    return {
      enabled: monitoringData?.enabled !== false,
      metricsEnabled: monitoringData?.metricsEnabled !== false,
      tracingEnabled: monitoringData?.tracingEnabled !== false,
      alertingEnabled: monitoringData?.alertingEnabled !== false,
      endpoint: monitoringData?.endpoint,
      apiKey: secretsMonitoring?.apiKey
    };
  }

  private createSecurityConfig(securityData: any): SecurityConfig {
    return {
      encryptionEnabled: securityData?.encryptionEnabled !== false,
      authenticationEnabled: securityData?.authenticationEnabled !== false,
      rateLimitingEnabled: securityData?.rateLimitingEnabled !== false,
      corsEnabled: securityData?.corsEnabled !== false,
      csrfProtectionEnabled: securityData?.csrfProtectionEnabled !== false,
      allowedOrigins: securityData?.allowedOrigins || ['*'],
      rateLimit: {
        windowMs: securityData?.rateLimit?.windowMs || 900000,
        maxRequests: securityData?.rateLimit?.maxRequests || 100
      }
    };
  }

  async loadAllConfigs(): Promise<void> {
    const environments: Environment[] = ['development', 'staging', 'production', 'test'];
    
    for (const env of environments) {
      try {
        await this.loadConfig(env);
      } catch (error) {
        this.emit('config:load-warning', { 
          environment: env, 
          error: `Failed to load config: ${error}` 
        });
      }
    }
  }

  async saveConfig(environment: Environment): Promise<void> {
    const config = this.configs.get(environment);
    if (!config) {
      throw new Error(`No config found for environment: ${environment}`);
    }

    try {
      const configFilePath = path.join(this.configPath, `${environment}.json`);
      const secretsFilePath = path.join(this.secretsPath, `${environment}.secrets.json`);

      const configData = this.configToData(config);
      const secretsData = this.secretsToData(config);

      if (!fs.existsSync(this.configPath)) {
        fs.mkdirSync(this.configPath, { recursive: true });
      }

      if (!fs.existsSync(this.secretsPath)) {
        fs.mkdirSync(this.secretsPath, { recursive: true });
      }

      fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2), 'utf-8');
      fs.writeFileSync(secretsFilePath, JSON.stringify(secretsData, null, 2), 'utf-8');

      this.emit('config:saved', { environment, config });
    } catch (error) {
      this.emit('config:save-error', { environment, error });
      throw new Error(`Failed to save config for ${environment}: ${error}`);
    }
  }

  private configToData(config: EnvironmentConfig): any {
    return {
      name: config.name,
      environment: config.environment,
      version: config.version,
      description: config.description,
      variables: Object.fromEntries(config.variables),
      features: Object.fromEntries(config.features),
      services: Object.fromEntries(
        Array.from(config.services.entries()).map(([key, value]) => [key, value])
      ),
      database: config.database,
      cache: config.cache,
      logging: {
        level: config.logging.level,
        format: config.logging.format,
        output: config.logging.output,
        filePath: config.logging.filePath,
        maxSize: config.logging.maxSize,
        maxFiles: config.logging.maxFiles
      },
      monitoring: {
        enabled: config.monitoring.enabled,
        metricsEnabled: config.monitoring.metricsEnabled,
        tracingEnabled: config.monitoring.tracingEnabled,
        alertingEnabled: config.monitoring.alertingEnabled,
        endpoint: config.monitoring.endpoint
      },
      security: {
        encryptionEnabled: config.security.encryptionEnabled,
        authenticationEnabled: config.security.authenticationEnabled,
        rateLimitingEnabled: config.security.rateLimitingEnabled,
        corsEnabled: config.security.corsEnabled,
        csrfProtectionEnabled: config.security.csrfProtectionEnabled,
        allowedOrigins: config.security.allowedOrigins,
        rateLimit: config.security.rateLimit
      }
    };
  }

  private secretsToData(config: EnvironmentConfig): any {
    const secrets: any = {};

    if (config.database.password) {
      secrets.database = { password: config.database.password };
    }

    if (config.cache.password) {
      secrets.cache = { password: config.cache.password };
    }

    if (config.monitoring.apiKey) {
      secrets.monitoring = { apiKey: config.monitoring.apiKey };
    }

    Array.from(config.secrets.entries()).forEach(([key, value]) => {
      secrets[key] = value;
    });

    return secrets;
  }

  switchEnvironment(environment: Environment): void {
    if (environment === this.currentEnvironment) {
      return;
    }

    const config = this.configs.get(environment);
    if (!config) {
      throw new Error(`No config found for environment: ${environment}`);
    }

    this.currentEnvironment = environment;
    this.applyEnvironmentVariables(config);
    this.emit('environment:switched', { from: this.currentEnvironment, to: environment });
  }

  private applyEnvironmentVariables(config: EnvironmentConfig): void {
    if (typeof process !== 'undefined') {
      Array.from(config.variables.entries()).forEach(([key, value]) => {
        process.env[key] = String(value);
      });
    }
  }

  getCurrentEnvironment(): Environment {
    return this.currentEnvironment;
  }

  getConfig(environment?: Environment): EnvironmentConfig | undefined {
    const env = environment || this.currentEnvironment;
    return this.configs.get(env);
  }

  getAllConfigs(): Map<Environment, EnvironmentConfig> {
    return new Map(this.configs);
  }

  getVariable(key: string, environment?: Environment): any {
    const config = this.getConfig(environment);
    return config?.variables.get(key);
  }

  setVariable(key: string, value: any, environment?: Environment): void {
    const env = environment || this.currentEnvironment;
    const config = this.configs.get(env);
    
    if (!config) {
      throw new Error(`No config found for environment: ${env}`);
    }

    config.variables.set(key, value);
    this.emit('variable:updated', { environment: env, key, value });
  }

  getSecret(key: string, environment?: Environment): string | undefined {
    const config = this.getConfig(environment);
    return config?.secrets.get(key);
  }

  setSecret(key: string, value: string, environment?: Environment): void {
    const env = environment || this.currentEnvironment;
    const config = this.configs.get(env);
    
    if (!config) {
      throw new Error(`No config found for environment: ${env}`);
    }

    config.secrets.set(key, value);
    this.emit('secret:updated', { environment: env, key });
  }

  isFeatureEnabled(feature: string, environment?: Environment): boolean {
    const config = this.getConfig(environment);
    return config?.features.get(feature) || false;
  }

  enableFeature(feature: string, environment?: Environment): void {
    const env = environment || this.currentEnvironment;
    const config = this.configs.get(env);
    
    if (!config) {
      throw new Error(`No config found for environment: ${env}`);
    }

    config.features.set(feature, true);
    this.emit('feature:enabled', { environment: env, feature });
  }

  disableFeature(feature: string, environment?: Environment): void {
    const env = environment || this.currentEnvironment;
    const config = this.configs.get(env);
    
    if (!config) {
      throw new Error(`No config found for environment: ${env}`);
    }

    config.features.set(feature, false);
    this.emit('feature:disabled', { environment: env, feature });
  }

  getService(serviceName: string, environment?: Environment): ServiceConfig | undefined {
    const config = this.getConfig(environment);
    return config?.services.get(serviceName);
  }

  validateConfig(environment?: Environment): ConfigValidationResult {
    const env = environment || this.currentEnvironment;
    const config = this.configs.get(env);

    if (!config) {
      return {
        valid: false,
        errors: [`No config found for environment: ${env}`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.validationRules.get('port')!(config.database.port)) {
      errors.push(`Invalid database port: ${config.database.port}`);
    }

    if (!this.validationRules.get('host')!(config.database.host)) {
      errors.push(`Invalid database host: ${config.database.host}`);
    }

    if (!this.validationRules.get('port')!(config.cache.port)) {
      errors.push(`Invalid cache port: ${config.cache.port}`);
    }

    if (!this.validationRules.get('level')!(config.logging.level)) {
      errors.push(`Invalid logging level: ${config.logging.level}`);
    }

    if (environment === 'production' && !config.security.encryptionEnabled) {
      warnings.push('Encryption is disabled in production environment');
    }

    if (environment === 'production' && !config.security.authenticationEnabled) {
      warnings.push('Authentication is disabled in production environment');
    }

    if (environment === 'production' && config.security.allowedOrigins.includes('*')) {
      warnings.push('Wildcard CORS origin is used in production environment');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  compareEnvironments(env1: Environment, env2: Environment): Map<string, any> {
    const config1 = this.configs.get(env1);
    const config2 = this.configs.get(env2);

    if (!config1 || !config2) {
      throw new Error('Both environments must have loaded configs');
    }

    const differences: Map<string, any> = new Map();

    const compareMaps = (name: string, map1: Map<string, any>, map2: Map<string, any>) => {
      const keys = new Set([...map1.keys(), ...map2.keys()]);
      keys.forEach(key => {
        const value1 = map1.get(key);
        const value2 = map2.get(key);
        if (JSON.stringify(value1) !== JSON.stringify(value2)) {
          differences.set(`${name}.${key}`, { [env1]: value1, [env2]: value2 });
        }
      });
    };

    compareMaps('variables', config1.variables, config2.variables);
    compareMaps('features', config1.features, config2.features);

    return differences;
  }

  exportConfig(environment: Environment, format: 'json' | 'env' = 'json'): string {
    const config = this.configs.get(environment);
    if (!config) {
      throw new Error(`No config found for environment: ${environment}`);
    }

    if (format === 'json') {
      return JSON.stringify(this.configToData(config), null, 2);
    } else {
      const envLines: string[] = [];
      envLines.push(`NODE_ENV=${environment}`);
      
      Array.from(config.variables.entries()).forEach(([key, value]) => {
        envLines.push(`${key}=${value}`);
      });

      return envLines.join('\n');
    }
  }

  async importConfig(environment: Environment, configData: string): Promise<void> {
    try {
      const data = JSON.parse(configData);
      const config = this.createConfigFromData(data, {}, environment);
      this.configs.set(environment, config);
      this.emit('config:imported', { environment, config });
    } catch (error) {
      this.emit('config:import-error', { environment, error });
      throw new Error(`Failed to import config for ${environment}: ${error}`);
    }
  }

  createTemplate(environment: Environment): EnvironmentConfig {
    return {
      name: `${environment} Template`,
      environment,
      version: '1.0.0',
      description: `Template configuration for ${environment}`,
      variables: new Map([
        ['PORT', 3201],
        ['HOST', 'localhost'],
        ['TIMEOUT', 30000]
      ]),
      secrets: new Map(),
      features: new Map([
        ['feature1', false],
        ['feature2', false]
      ]),
      services: new Map([
        ['api', {
          host: 'localhost',
          port: 3201,
          protocol: 'http',
          timeout: 30000,
          retries: 3,
          enabled: true
        }]
      ]),
      database: {
        host: 'localhost',
        port: 5432,
        database: 'yyc3',
        username: 'postgres',
        ssl: false,
        poolSize: 10,
        connectionTimeout: 10000,
        queryTimeout: 30000
      },
      cache: {
        host: 'localhost',
        port: 6379,
        ttl: 3600,
        maxSize: 1000,
        enabled: true
      },
      logging: {
        level: 'info',
        format: 'json',
        output: 'console',
        maxSize: 10485760,
        maxFiles: 5
      },
      monitoring: {
        enabled: true,
        metricsEnabled: true,
        tracingEnabled: true,
        alertingEnabled: true
      },
      security: {
        encryptionEnabled: true,
        authenticationEnabled: true,
        rateLimitingEnabled: true,
        corsEnabled: true,
        csrfProtectionEnabled: true,
        allowedOrigins: ['*'],
        rateLimit: {
          windowMs: 900000,
          maxRequests: 100
        }
      }
    };
  }

  isLoaded(): boolean {
    return this.configLoaded;
  }

  destroy(): void {
    this.configs.clear();
    this.validationRules.clear();
    this.removeAllListeners();
  }
}
