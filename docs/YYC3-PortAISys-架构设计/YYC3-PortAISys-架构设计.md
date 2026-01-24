# ModelManager 架构设计

## 1. 设计目标

构建统一的多模型管理与调度系统，支持多提供商、多模型的智能选择、负载均衡、容错与性能优化。

## 2. 核心架构

```
┌─────────────────────────────────────────────────────────────┐
│                      ModelManager                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ Provider Registry│  │ Selection Engine │  │Load Balancer│ │
│  │  - OpenAI       │  │  - Performance   │  │ - RoundRobin│ │
│  │  - Anthropic    │  │  - Cost          │  │ - Weighted  │ │
│  │  │  Google       │  │  - Quality       │  │ - LeastConn│ │
│  │  - Custom       │  │  - Availability  │  └────────────┘ │
│  └─────────────────┘  └──────────────────┘                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ Fault Tolerance │  │ Performance Mon  │  │ Cache Layer│ │
│  │  - Circuit Break│  │  - Latency       │  │ - Response │ │
│  │  - Failover     │  │  - Token Usage   │  │ - Semantic │ │
│  │  - Retry        │  │  - Error Rate    │  └────────────┘ │
│  └─────────────────┘  └──────────────────┘                  │
│  ┌─────────────────┐  ┌──────────────────┐                  │
│  │ Quota & Limits  │  │ A/B Testing      │                  │
│  │  - Rate Limit   │  │  - Traffic Split │                  │
│  │  - Budget       │  │  - Metrics Comp  │                  │
│  └─────────────────┘  └──────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## 3. 核心接口设计

### 3.1 ModelProvider 接口

```typescript
interface ModelProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'custom';
  models: ModelInfo[];
  config: ProviderConfig;
  
  // 生命周期
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  
  // 核心能力
  generate(request: GenerationRequest): Promise<GenerationResponse>;
  generateStream(request: GenerationRequest, callback: StreamCallback): Promise<GenerationResponse>;
  
  // 健康检查
  healthCheck(): Promise<HealthStatus>;
}

interface ModelInfo {
  id: string;
  name: string;
  capabilities: string[];
  pricing: {
    inputCostPer1kTokens: number;
    outputCostPer1kTokens: number;
  };
  limits: {
    maxTokens: number;
    rateLimit: number;
  };
  performance: {
    avgLatency: number;
    p95Latency: number;
    p99Latency: number;
  };
}
```

### 3.2 ModelManager 主接口

```typescript
interface IModelManager {
  // Provider 管理
  registerProvider(provider: ModelProvider): void;
  unregisterProvider(providerId: string): void;
  getProvider(providerId: string): ModelProvider | undefined;
  listProviders(): ModelProvider[];
  
  // 模型选择
  selectModel(criteria: SelectionCriteria): ModelInfo;
  
  // 生成
  generate(request: GenerationRequest, options?: GenerationOptions): Promise<GenerationResponse>;
  generateStream(request: GenerationRequest, callback: StreamCallback, options?: GenerationOptions): Promise<GenerationResponse>;
  
  // 批量与比较
  batchGenerate(requests: GenerationRequest[]): Promise<GenerationResponse[]>;
  compareModels(request: GenerationRequest, modelIds: string[]): Promise<ComparisonResult>;
  
  // 性能监控
  getMetrics(): ModelMetrics;
  getProviderMetrics(providerId: string): ProviderMetrics;
  
  // 配额管理
  enforceRateLimit(providerId: string): boolean;
  trackQuota(providerId: string, tokens: number): void;
  
  // 生命周期
  shutdown(): Promise<void>;
}
```

### 3.3 选择策略接口

```typescript
interface SelectionCriteria {
  strategy: 'performance' | 'cost' | 'quality' | 'availability' | 'custom';
  weights?: {
    performance: number;
    cost: number;
    quality: number;
    availability: number;
  };
  constraints?: {
    maxLatency?: number;
    maxCost?: number;
    minQuality?: number;
    requiredCapabilities?: string[];
  };
}

interface SelectionEngine {
  selectModel(criteria: SelectionCriteria, availableModels: ModelInfo[]): ModelInfo;
  scoreModel(model: ModelInfo, criteria: SelectionCriteria): number;
}
```

## 4. 关键组件实现

### 4.1 Provider Registry

```typescript
class ProviderRegistry {
  private providers: Map<string, ModelProvider> = new Map();
  
  register(provider: ModelProvider): void {
    if (this.providers.has(provider.id)) {
      throw new Error(`Provider ${provider.id} already registered`);
    }
    this.providers.set(provider.id, provider);
    provider.initialize();
  }
  
  unregister(providerId: string): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.shutdown();
      this.providers.delete(providerId);
    }
  }
}
```

### 4.2 Selection Engine

```typescript
class ModelSelectionEngine implements SelectionEngine {
  selectModel(criteria: SelectionCriteria, models: ModelInfo[]): ModelInfo {
    const scored = models.map(model => ({
      model,
      score: this.scoreModel(model, criteria)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    return scored[0].model;
  }
  
  scoreModel(model: ModelInfo, criteria: SelectionCriteria): number {
    const weights = criteria.weights || {
      performance: 0.4,
      cost: 0.3,
      quality: 0.2,
      availability: 0.1
    };
    
    const scores = {
      performance: this.scorePerformance(model),
      cost: this.scoreCost(model),
      quality: this.scoreQuality(model),
      availability: this.scoreAvailability(model)
    };
    
    return Object.entries(weights).reduce(
      (total, [key, weight]) => total + scores[key] * weight,
      0
    );
  }
  
  private scorePerformance(model: ModelInfo): number {
    // Lower latency = higher score
    const maxLatency = 5000; // 5s
    return Math.max(0, 1 - model.performance.avgLatency / maxLatency);
  }
  
  private scoreCost(model: ModelInfo): number {
    // Lower cost = higher score
    const maxCost = 0.1; // $0.1 per 1k tokens
    const avgCost = (model.pricing.inputCostPer1kTokens + model.pricing.outputCostPer1kTokens) / 2;
    return Math.max(0, 1 - avgCost / maxCost);
  }
}
```

### 4.3 Circuit Breaker (容错)

```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime?: Date;
  private readonly threshold: number = 5;
  private readonly timeout: number = 60000; // 1min
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime!.getTime() > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

### 4.4 Load Balancer

```typescript
class LoadBalancer {
  private strategy: 'round-robin' | 'weighted' | 'least-conn';
  private currentIndex: number = 0;
  private connections: Map<string, number> = new Map();
  
  selectProvider(providers: ModelProvider[]): ModelProvider {
    switch (this.strategy) {
      case 'round-robin':
        return this.roundRobin(providers);
      case 'weighted':
        return this.weighted(providers);
      case 'least-conn':
        return this.leastConnection(providers);
    }
  }
  
  private roundRobin(providers: ModelProvider[]): ModelProvider {
    const provider = providers[this.currentIndex % providers.length];
    this.currentIndex++;
    return provider;
  }
  
  private leastConnection(providers: ModelProvider[]): ModelProvider {
    return providers.reduce((min, p) => 
      (this.connections.get(p.id) || 0) < (this.connections.get(min.id) || 0) ? p : min
    );
  }
}
```

## 5. 测试覆盖策略

### 5.1 测试目标

- 34个测试全绿（tests/integration/multi-model.test.ts）
- 覆盖率 >90%

### 5.2 测试重点

1. Provider注册与生命周期
2. 模型选择策略（性能/成本/质量/可用性）
3. 负载均衡与流量分配
4. 容错与故障转移
5. 性能监控与指标
6. 缓存与优化
7. A/B测试
8. 配额与限流
9. 安全与合规

## 6. 实施路线

### Phase 1: 基础框架（1周）

- Provider注册与管理
- 基础选择引擎
- 简单负载均衡

### Phase 2: 高级特性（1周）

- Circuit Breaker
- 性能监控
- 缓存层
- A/B测试

### Phase 3: 企业特性（3天）

- 配额管理
- 安全审计
- 合规检查

## 7. 性能目标

- 选择延迟 < 10ms
- 故障切换 < 100ms
- 缓存命中率 > 80%
- 可用性 > 99.9%

---
*设计版本: v1.0*  
*更新时间: 2026-01-21*  
*负责人: 架构团队*
