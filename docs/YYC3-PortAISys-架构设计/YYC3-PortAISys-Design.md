# Plugin System 架构设计

## 1. 设计目标

构建安全、灵活、高性能的插件生态系统，支持动态加载、权限管理、依赖解析和热更新。

## 2. 核心架构

```
┌───────────────────────────────────────────────────────────┐
│                    PluginSystem                           │
├───────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Lifecycle Mgr│  │ Marketplace │  │Security Manager │  │
│  │  - Discover  │  │  - Search   │  │  - Permissions  │  │
│  │  - Install   │  │  - Rate     │  │  - Sandbox      │  │
│  │  - Update    │  │  - Publish  │  │  - Audit        │  │
│  │  - Disable   │  └─────────────┘  └─────────────────┘  │
│  └──────────────┘                                          │
│  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Dependency   │  │Performance  │  │  Event System   │  │
│  │  - Resolve   │  │  - HotReload│  │  - Hook Points  │  │
│  │  - Install   │  │  - Isolate  │  │  - Middleware   │  │
│  │  - Cycle Dtc │  │  - Monitor  │  └─────────────────┘  │
│  └──────────────┘  └─────────────┘                        │
│  ┌──────────────┐  ┌─────────────┐                        │
│  │ Version Mgr  │  │ Config Mgr  │                        │
│  │  - Compat    │  │  - Validate │                        │
│  │  - Rollback  │  │  - Override │                        │
│  └──────────────┘  └─────────────┘                        │
└───────────────────────────────────────────────────────────┘
```

## 3. 核心接口设计

### 3.1 Plugin 元数据

```typescript
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  
  // 依赖
  dependencies?: {
    [pluginId: string]: string; // semver range
  };
  peerDependencies?: {
    [pluginId: string]: string;
  };
  
  // 权限
  permissions: Permission[];
  
  // 能力
  capabilities: Capability[];
  
  // 配置
  config?: PluginConfigSchema;
  
  // 入口
  main: string;
  
  // 兼容性
  compatibleVersions: {
    system: string;
    node?: string;
  };
}

interface Permission {
  type: 'filesystem' | 'network' | 'storage' | 'process' | 'memory' | 'custom';
  scope: string;
  reason: string;
}

interface Capability {
  type: 'agent' | 'tool' | 'middleware' | 'ui' | 'analytics' | 'integration';
  name: string;
  config?: Record<string, any>;
}
```

### 3.2 PluginSystem 主接口

```typescript
interface IPluginSystem {
  // 生命周期
  discover(): Promise<PluginManifest[]>;
  install(pluginId: string, version?: string): Promise<void>;
  update(pluginId: string, version: string): Promise<void>;
  uninstall(pluginId: string): Promise<void>;
  enable(pluginId: string): Promise<void>;
  disable(pluginId: string): Promise<void>;
  
  // 查询
  getPlugin(pluginId: string): Plugin | undefined;
  listPlugins(filter?: PluginFilter): Plugin[];
  getPluginMetadata(pluginId: string): PluginManifest;
  
  // 依赖管理
  resolveDependencies(pluginId: string): Promise<ResolvedDependency[]>;
  checkDependencyConflicts(pluginId: string): ConflictReport;
  
  // Marketplace
  search(query: string): Promise<PluginSearchResult[]>;
  publish(manifest: PluginManifest, bundle: Buffer): Promise<void>;
  
  // 性能
  hotReload(pluginId: string): Promise<void>;
  isolate(pluginId: string): Promise<void>;
  
  // 安全
  validatePermissions(pluginId: string): boolean;
  enforcePermissions(pluginId: string, operation: Operation): Promise<void>;
  audit(pluginId: string): AuditReport;
  
  // 配置
  getPluginConfig(pluginId: string): PluginConfig;
  updatePluginConfig(pluginId: string, config: Partial<PluginConfig>): void;
  
  // 事件
  on(event: PluginEvent, handler: PluginEventHandler): void;
  off(event: PluginEvent, handler: PluginEventHandler): void;
}
```

### 3.3 Plugin 基类

```typescript
abstract class Plugin {
  readonly manifest: PluginManifest;
  protected config: PluginConfig;
  protected context: PluginContext;
  
  constructor(manifest: PluginManifest, context: PluginContext) {
    this.manifest = manifest;
    this.context = context;
  }
  
  // 生命周期钩子
  abstract onInstall(): Promise<void>;
  abstract onEnable(): Promise<void>;
  abstract onDisable(): Promise<void>;
  abstract onUninstall(): Promise<void>;
  abstract onUpdate(oldVersion: string): Promise<void>;
  
  // 核心方法
  abstract execute(input: any): Promise<any>;
  
  // 配置
  getConfig(): PluginConfig {
    return this.config;
  }
  
  updateConfig(config: Partial<PluginConfig>): void {
    this.config = { ...this.config, ...config };
    this.onConfigChange(config);
  }
  
  protected onConfigChange(config: Partial<PluginConfig>): void {
    // Override in subclass
  }
}
```

### 3.4 PluginContext

```typescript
interface PluginContext {
  system: {
    version: string;
    platform: string;
  };
  
  logger: Logger;
  storage: Storage;
  http: HttpClient;
  
  // API 访问
  getApi<T>(apiName: string): T;
  
  // 事件
  emit(event: string, data: any): void;
  on(event: string, handler: EventHandler): void;
  
  // 插件间通信
  sendMessage(targetPlugin: string, message: any): Promise<any>;
}
```

## 4. 关键组件实现

### 4.1 Lifecycle Manager

```typescript
class PluginLifecycleManager {
  private plugins: Map<string, Plugin> = new Map();
  private states: Map<string, PluginState> = new Map();
  
  async install(manifest: PluginManifest): Promise<void> {
    // 1. 验证签名和权限
    await this.validatePlugin(manifest);
    
    // 2. 解析依赖
    const deps = await this.resolveDependencies(manifest);
    await this.installDependencies(deps);
    
    // 3. 加载插件
    const plugin = await this.loadPlugin(manifest);
    
    // 4. 初始化
    await plugin.onInstall();
    
    // 5. 注册
    this.plugins.set(manifest.id, plugin);
    this.states.set(manifest.id, 'installed');
    
    // 6. 触发事件
    this.emit('plugin:installed', { plugin: manifest.id });
  }
  
  async enable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
    
    // 1. 检查依赖
    await this.checkDependencies(pluginId);
    
    // 2. 激活
    await plugin.onEnable();
    
    // 3. 更新状态
    this.states.set(pluginId, 'enabled');
    
    // 4. 触发事件
    this.emit('plugin:enabled', { plugin: pluginId });
  }
  
  async disable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
    
    // 1. 停用
    await plugin.onDisable();
    
    // 2. 更新状态
    this.states.set(pluginId, 'disabled');
    
    // 3. 触发事件
    this.emit('plugin:disabled', { plugin: pluginId });
  }
  
  async hotReload(pluginId: string): Promise<void> {
    // 1. 保存状态
    const state = await this.captureState(pluginId);
    
    // 2. 禁用旧版本
    await this.disable(pluginId);
    
    // 3. 卸载旧版本
    await this.unload(pluginId);
    
    // 4. 重新加载
    const manifest = await this.getManifest(pluginId);
    const plugin = await this.loadPlugin(manifest);
    
    // 5. 恢复状态
    await this.restoreState(pluginId, state);
    
    // 6. 启用新版本
    await this.enable(pluginId);
  }
}
```

### 4.2 Dependency Resolver

```typescript
class DependencyResolver {
  async resolve(manifest: PluginManifest): Promise<ResolvedDependency[]> {
    const resolved: ResolvedDependency[] = [];
    const visited = new Set<string>();
    
    await this.resolveRecursive(manifest, resolved, visited);
    
    // 检测循环依赖
    this.detectCycles(resolved);
    
    // 拓扑排序
    return this.topologicalSort(resolved);
  }
  
  private async resolveRecursive(
    manifest: PluginManifest,
    resolved: ResolvedDependency[],
    visited: Set<string>
  ): Promise<void> {
    if (visited.has(manifest.id)) return;
    visited.add(manifest.id);
    
    if (!manifest.dependencies) return;
    
    for (const [depId, versionRange] of Object.entries(manifest.dependencies)) {
      const depManifest = await this.findCompatibleVersion(depId, versionRange);
      
      if (!depManifest) {
        throw new Error(`Cannot resolve dependency ${depId}@${versionRange}`);
      }
      
      resolved.push({
        id: depId,
        version: depManifest.version,
        requiredBy: manifest.id
      });
      
      // 递归解析
      await this.resolveRecursive(depManifest, resolved, visited);
    }
  }
  
  private detectCycles(dependencies: ResolvedDependency[]): void {
    const graph = this.buildDependencyGraph(dependencies);
    const visited = new Set<string>();
    const stack = new Set<string>();
    
    for (const node of graph.keys()) {
      if (this.hasCycle(node, graph, visited, stack)) {
        throw new Error('Circular dependency detected');
      }
    }
  }
  
  private hasCycle(
    node: string,
    graph: Map<string, string[]>,
    visited: Set<string>,
    stack: Set<string>
  ): boolean {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;
    
    visited.add(node);
    stack.add(node);
    
    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (this.hasCycle(neighbor, graph, visited, stack)) {
        return true;
      }
    }
    
    stack.delete(node);
    return false;
  }
}
```

### 4.3 Permission Manager

```typescript
class PermissionManager {
  private permissions: Map<string, Set<Permission>> = new Map();
  
  async enforce(pluginId: string, operation: Operation): Promise<void> {
    const required = this.getRequiredPermission(operation);
    const granted = this.permissions.get(pluginId) || new Set();
    
    if (!this.hasPermission(granted, required)) {
      throw new PermissionError(
        `Plugin ${pluginId} does not have permission ${required.type}:${required.scope}`
      );
    }
    
    // 审计
    await this.audit(pluginId, operation, required);
  }
  
  private hasPermission(granted: Set<Permission>, required: Permission): boolean {
    for (const perm of granted) {
      if (this.matches(perm, required)) {
        return true;
      }
    }
    return false;
  }
  
  private matches(granted: Permission, required: Permission): boolean {
    if (granted.type !== required.type) return false;
    
    // 检查作用域
    if (granted.scope === '*') return true;
    if (granted.scope === required.scope) return true;
    
    // 检查通配符匹配
    return this.matchesWildcard(granted.scope, required.scope);
  }
  
  async audit(pluginId: string, operation: Operation, permission: Permission): Promise<void> {
    const auditLog = {
      timestamp: new Date(),
      pluginId,
      operation: operation.type,
      permission: `${permission.type}:${permission.scope}`,
      result: 'allowed'
    };
    
    await this.writeAuditLog(auditLog);
  }
}
```

### 4.4 Sandbox (隔离环境)

```typescript
class PluginSandbox {
  private vm: any; // Node.js VM or Worker
  
  async execute(plugin: Plugin, input: any): Promise<any> {
    const context = this.createContext(plugin);
    
    try {
      // 在隔离环境中执行
      const result = await this.vm.run(
        plugin.execute.bind(plugin),
        [input],
        {
          timeout: 30000,
          memory: 512 * 1024 * 1024, // 512MB
          sandbox: context
        }
      );
      
      return result;
    } catch (error) {
      // 错误处理与恢复
      await this.handleError(plugin, error);
      throw error;
    }
  }
  
  private createContext(plugin: Plugin): any {
    return {
      console: this.createSafeConsole(plugin),
      setTimeout: this.createSafeTimer(plugin),
      require: this.createSafeRequire(plugin),
      // 限制的全局对象
    };
  }
  
  private createSafeRequire(plugin: Plugin): Function {
    return (moduleName: string) => {
      // 检查权限
      if (!this.canRequire(plugin, moduleName)) {
        throw new Error(`Plugin ${plugin.manifest.id} cannot require ${moduleName}`);
      }
      
      // 白名单模块
      const whitelisted = ['path', 'util', 'events'];
      if (whitelisted.includes(moduleName)) {
        return require(moduleName);
      }
      
      throw new Error(`Module ${moduleName} is not whitelisted`);
    };
  }
}
```

### 4.5 Marketplace Client

```typescript
class PluginMarketplace {
  private apiClient: HttpClient;
  
  async search(query: string, filters?: SearchFilters): Promise<PluginSearchResult[]> {
    const response = await this.apiClient.get('/api/plugins/search', {
      params: { q: query, ...filters }
    });
    
    return response.data.results;
  }
  
  async getDetails(pluginId: string): Promise<PluginDetails> {
    const response = await this.apiClient.get(`/api/plugins/${pluginId}`);
    return response.data;
  }
  
  async download(pluginId: string, version: string): Promise<Buffer> {
    const response = await this.apiClient.get(
      `/api/plugins/${pluginId}/versions/${version}/download`,
      { responseType: 'arraybuffer' }
    );
    
    return Buffer.from(response.data);
  }
  
  async publish(manifest: PluginManifest, bundle: Buffer): Promise<void> {
    const formData = new FormData();
    formData.append('manifest', JSON.stringify(manifest));
    formData.append('bundle', bundle, `${manifest.id}-${manifest.version}.zip`);
    
    await this.apiClient.post('/api/plugins/publish', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });
  }
  
  async rate(pluginId: string, rating: number, review?: string): Promise<void> {
    await this.apiClient.post(`/api/plugins/${pluginId}/ratings`, {
      rating,
      review
    });
  }
}
```

## 5. 测试覆盖策略

### 5.1 测试目标

- 12个测试全绿（tests/integration/plugin-system.test.ts）
- 覆盖率 >85%

### 5.2 测试重点

1. 插件生命周期（安装/启用/禁用/卸载）
2. 依赖解析与循环检测
3. 权限验证与审计
4. 热重载与隔离
5. Marketplace 搜索与发布
6. 版本兼容与回滚
7. 配置验证与覆盖
8. 性能与资源限制
9. 安全与沙箱逃逸

## 6. 实施路线

### Phase 1: 核心框架（1周）

- 生命周期管理
- 依赖解析
- 基础权限系统

### Phase 2: 高级特性（1周）

- Marketplace集成
- 热重载
- 沙箱隔离
- 配置管理

### Phase 3: 企业特性（3天）

- 审计与合规
- 性能监控
- 版本回滚

## 7. 性能目标

- 插件加载 < 100ms
- 热重载 < 500ms
- 权限检查 < 1ms
- 隔离开销 < 10%

## 8. 安全考量

- 所有插件默认在沙箱中运行
- 权限最小化原则
- 签名验证（manifest + bundle）
- 审计日志完整性
- 定期安全扫描

---
*设计版本: v1.0*  
*更新时间: 2026-01-21*  
*负责人: 架构团队*
