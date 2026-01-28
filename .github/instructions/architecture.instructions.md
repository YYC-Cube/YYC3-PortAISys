# YYC³ PortAISys - Architecture & Design Pattern Guidelines

## Architectural Overview

YYC³ PortAISys implements a **Five-Dimensional Closed-Loop Architecture** designed for intelligent, adaptive, and reliable port operations management:

```
┌─────────────────────────────────────────────────────────────┐
│           Five-Dimensional Closed-Loop Architecture          │
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐ │
│  │ Analysis │ → │ Execution│ → │Optimiza- │ → │Learning │ │
│  │          │   │          │   │  tion    │   │         │ │
│  └──────────┘   └──────────┘   └──────────┘   └─────────┘ │
│       ↓              ↓               ↓              ↓       │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                    │
│                  ┌──────────┐                               │
│                  │Management│                               │
│                  │          │                               │
│                  └──────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

### The Five Dimensions

1. **Analysis**: Data collection, processing, and insight extraction
2. **Execution**: Action implementation through AI agents and workflows
3. **Optimization**: Performance tuning and efficiency improvements
4. **Learning**: Continuous model training and adaptation
5. **Management**: Orchestration, governance, and oversight

**Core Principle**: Each component feeds back into the loop, creating a self-improving system.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Web Dashboard                           │
│              (Next.js 16 + React 19 + Radix UI)             │
└───────────────────────┬─────────────────────────────────────┘
                        │ API Requests
┌───────────────────────┴─────────────────────────────────────┐
│                    API Layer (Next.js Routes)                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Auth       │  │ Users      │  │ Analytics  │  ...       │
│  └────────────┘  └────────────┘  └────────────┘            │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                    Core Services Layer                       │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │AI Agents│  │Workflows │  │Analytics │  │Security  │    │
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Plugins  │  │Monitor   │  │Cache     │  │Architecture│   │
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘    │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                   Data & Integration Layer                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │PostgreSQL│  │Redis     │  │OpenTel.  │  │External  │   │
│  │(Prisma)  │  │(Cache)   │  │(Tracing) │  │AI APIs   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Module Organization

```
core/                               # Core business logic (100+ modules)
├── ai/                            # AI & Agent systems
│   ├── agents/                    # AI agent implementations
│   │   ├── BaseAgent.ts          # Base class for all agents
│   │   ├── AssistantAgent.ts     # General assistant
│   │   ├── BehaviorAgent.ts      # Behavior analysis
│   │   └── [20+ specialized agents]
│   ├── orchestration/            # Agent coordination
│   │   ├── AgentOrchestrator.ts  # Multi-agent management
│   │   └── TaskScheduler.ts      # Task distribution
│   └── models/                   # AI model integrations
│       ├── ModelRouter.ts        # Model selection logic
│       └── providers/            # OpenAI, Anthropic, etc.
├── analytics/                    # Data analytics & insights
│   ├── AIAnalyticsEngine.ts     # Main analytics engine
│   ├── PredictiveAnalytics.ts   # Forecasting
│   └── AnomalyDetection.ts      # Outlier detection
├── security/                     # Security & compliance
│   ├── ComprehensiveSecurityCenter.ts
│   ├── ThreatDetector.ts
│   └── ComplianceManager.ts
├── workflows/                    # Business workflows
│   ├── IntelligentCallingWorkflow.ts
│   └── CallingWorkflowEngine.ts
├── plugin-system/                # Extensibility
│   ├── PluginManager.ts
│   └── PluginMarketplace.ts
├── cache/                        # Caching layer
│   ├── RedisCache.ts
│   └── LRUCache.ts
├── monitoring/                   # Observability
│   ├── MetricsCollector.ts
│   └── RealTimeMonitor.ts
└── [50+ other modules]          # Specialized capabilities

web-dashboard/                    # User interface
├── app/                         # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   ├── dashboard/               # Main dashboard
│   ├── api/                     # API routes
│   └── layout.tsx               # Root layout
├── components/                  # React components
│   ├── ui/                      # UI primitives (Radix)
│   ├── features/                # Feature-specific
│   └── shared/                  # Shared components
└── lib/                         # Client utilities

tools/                           # Development tools
├── doc-code-sync/              # Documentation synchronization
└── [other tools]

tests/                          # Test suites
├── unit/                       # Unit tests
├── integration/                # Integration tests
├── security/                   # Security tests
├── performance/                # Performance benchmarks
└── e2e/                       # End-to-end tests
```

## Core Design Patterns

### 1. Agent Pattern (AI Agents)

**Purpose**: Standardize AI agent behavior and enable orchestration.

**Base Agent Pattern**:
```typescript
// core/ai/agents/BaseAgent.ts
abstract class BaseAgent {
  protected name: string;
  protected capabilities: string[];
  protected model: AIModel;
  
  abstract async execute(params: AgentParams): Promise<AgentResult>;
  
  async validate(params: AgentParams): Promise<boolean> {
    // Input validation
  }
  
  async preExecute(params: AgentParams): Promise<void> {
    // Pre-processing hook
  }
  
  async postExecute(result: AgentResult): Promise<AgentResult> {
    // Post-processing hook
  }
}

// ✅ Preferred: Extend BaseAgent
class PortAnalyticsAgent extends BaseAgent {
  constructor() {
    super('PortAnalytics', ['analysis', 'forecasting']);
  }
  
  async execute(params: AgentParams): Promise<AgentResult> {
    await this.validate(params);
    await this.preExecute(params);
    
    const analysis = await this.analyzePortData(params.data);
    const result = { analysis, confidence: 0.95 };
    
    return await this.postExecute(result);
  }
  
  private async analyzePortData(data: PortData): Promise<Analysis> {
    // Implementation
  }
}

// ❌ Discouraged: Custom agent without BaseAgent
class CustomAgent {
  async doSomething() { } // No standardization
}
```

**Agent Orchestration**:
```typescript
// ✅ Preferred: Use AgentOrchestrator for multi-agent tasks
import { AgentOrchestrator } from '@/core/ai/orchestration/AgentOrchestrator';

const orchestrator = new AgentOrchestrator();

orchestrator.addAgent(new PortAnalyticsAgent());
orchestrator.addAgent(new RiskAssessmentAgent());
orchestrator.addAgent(new OptimizationAgent());

const result = await orchestrator.execute({
  task: 'ANALYZE_PORT_EFFICIENCY',
  data: portOperationalData,
  coordination: 'parallel', // or 'sequential'
});

// ❌ Discouraged: Manual agent coordination
const agent1 = new Agent1();
const agent2 = new Agent2();
const result1 = await agent1.execute();
const result2 = await agent2.execute(); // Duplicated pattern
```

**When to Use**:
- Creating any AI-powered functionality
- Implementing intelligent automation
- Building multi-step reasoning systems
- Coordinating multiple AI models

**Action Items**:
- [ ] All AI agents extend `BaseAgent`
- [ ] Agent capabilities clearly defined
- [ ] Orchestration used for multi-agent tasks
- [ ] Error handling in execute methods
- [ ] Validation in validate methods

### 2. Model Router Pattern (AI Model Selection)

**Purpose**: Abstract model selection and enable multi-provider support.

```typescript
// ✅ Preferred: Use ModelRouter for AI calls
import { ModelRouter } from '@/core/ai/models/ModelRouter';

const router = new ModelRouter();

const response = await router.complete({
  prompt: 'Analyze port congestion',
  capabilities: ['analysis', 'reasoning'],
  constraints: {
    maxLatency: 3000, // 3s
    maxCost: 0.05,    // $0.05
  }
});

// Router automatically selects:
// - GPT-4 for complex reasoning
// - Claude for long-context analysis
// - Gemini for multimodal tasks
// - Internal models for cost-sensitive queries

// ❌ Discouraged: Direct model calls
import OpenAI from 'openai';
const openai = new OpenAI();
const response = await openai.chat.completions.create({
  model: 'gpt-4', // Hard-coded model
  messages: [{ role: 'user', content: prompt }]
});
```

**When to Use**:
- Any AI/LLM integration
- Multi-model deployments
- Cost optimization scenarios
- Fallback/redundancy requirements

**Action Items**:
- [ ] Use `ModelRouter` instead of direct API calls
- [ ] Define capability requirements
- [ ] Set appropriate constraints (latency/cost)
- [ ] Handle model failures gracefully

### 3. Caching Pattern (Performance)

**Purpose**: Implement dual-layer caching for optimal performance.

```typescript
// ✅ Preferred: Dual-layer caching
import { RedisCache } from '@/core/cache/RedisCache';
import { LRUCache } from '@/core/cache/LRUCache';

async function getPortData(portId: string): Promise<PortData> {
  const cacheKey = `port:${portId}`;
  
  // L1: In-memory LRU cache (fastest)
  let data = LRUCache.get(cacheKey);
  if (data) return data;
  
  // L2: Redis cache (fast)
  data = await RedisCache.get(cacheKey);
  if (data) {
    LRUCache.set(cacheKey, data);
    return data;
  }
  
  // L3: Database (slow)
  data = await db.port.findUnique({ where: { id: portId } });
  
  // Cache results
  await RedisCache.set(cacheKey, data, { ttl: 3600 });
  LRUCache.set(cacheKey, data);
  
  return data;
}

// ❌ Discouraged: No caching or single-layer
async function getPortData(portId: string): Promise<PortData> {
  return db.port.findUnique({ where: { id: portId } }); // Always hits DB
}
```

**Cache Invalidation**:
```typescript
// ✅ Preferred: Invalidate all layers
async function updatePortData(portId: string, data: PortData) {
  await db.port.update({ where: { id: portId }, data });
  
  const cacheKey = `port:${portId}`;
  LRUCache.delete(cacheKey);
  await RedisCache.delete(cacheKey);
}
```

**When to Use**:
- Frequently accessed data (port info, user profiles)
- Expensive computations (analytics, AI results)
- External API responses
- Static or semi-static data

**Action Items**:
- [ ] Implement caching for expensive operations
- [ ] Use dual-layer (LRU + Redis) for critical paths
- [ ] Invalidate cache on data mutations
- [ ] Set appropriate TTLs
- [ ] Monitor cache hit rates

### 4. Repository Pattern (Data Access)

**Purpose**: Abstract data access and enable testability.

```typescript
// ✅ Preferred: Repository pattern with Prisma
// core/data/repositories/PortRepository.ts
export class PortRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: string): Promise<Port | null> {
    return this.prisma.port.findUnique({
      where: { id },
      include: { location: true, operations: true }
    });
  }
  
  async findByRegion(region: string): Promise<Port[]> {
    return this.prisma.port.findMany({
      where: { location: { region } },
      orderBy: { capacity: 'desc' }
    });
  }
  
  async create(data: CreatePortData): Promise<Port> {
    return this.prisma.port.create({ data });
  }
  
  async update(id: string, data: UpdatePortData): Promise<Port> {
    return this.prisma.port.update({
      where: { id },
      data
    });
  }
}

// Usage in services
class PortService {
  constructor(private portRepo: PortRepository) {}
  
  async getPortDetails(portId: string) {
    const port = await this.portRepo.findById(portId);
    // Business logic
  }
}

// ❌ Discouraged: Direct Prisma calls in business logic
class PortService {
  async getPortDetails(portId: string) {
    const port = await prisma.port.findUnique({ where: { id: portId } });
    // Makes testing difficult
  }
}
```

**When to Use**:
- All database access
- Complex queries
- Data aggregations
- Testable code

**Action Items**:
- [ ] Use repository pattern for data access
- [ ] Inject repositories (dependency injection)
- [ ] Keep repositories focused (single entity)
- [ ] Mock repositories in tests

### 5. Service Layer Pattern (Business Logic)

**Purpose**: Encapsulate business logic and orchestrate operations.

```typescript
// ✅ Preferred: Service layer architecture
// core/services/PortOperationsService.ts
export class PortOperationsService {
  constructor(
    private portRepo: PortRepository,
    private analyticsEngine: AIAnalyticsEngine,
    private notificationService: NotificationService,
    private auditLogger: AuditLogger
  ) {}
  
  async scheduleShipmentUnload(
    portId: string,
    shipmentId: string,
    userId: string
  ): Promise<UnloadSchedule> {
    // Validate
    const port = await this.portRepo.findById(portId);
    if (!port) throw new NotFoundError('Port not found');
    
    if (port.capacityUsed >= port.capacityMax) {
      throw new BusinessError('Port at capacity');
    }
    
    // Analyze optimal timing
    const analysis = await this.analyticsEngine.analyzeBestTime({
      portId,
      shipmentSize: shipment.size,
      currentLoad: port.capacityUsed
    });
    
    // Create schedule
    const schedule = await this.portRepo.createUnloadSchedule({
      portId,
      shipmentId,
      scheduledTime: analysis.optimalTime,
      estimatedDuration: analysis.estimatedDuration
    });
    
    // Notify stakeholders
    await this.notificationService.notifyScheduleCreated(schedule);
    
    // Audit log
    await this.auditLogger.log({
      action: 'UNLOAD_SCHEDULED',
      userId,
      resource: schedule.id
    });
    
    return schedule;
  }
}

// ❌ Discouraged: Business logic in API routes
export async function POST(request: Request) {
  const body = await request.json();
  const port = await prisma.port.findUnique({ where: { id: body.portId } });
  if (port.capacityUsed >= port.capacityMax) {
    return Response.json({ error: 'At capacity' }, { status: 400 });
  }
  // Business logic mixed with API handling
}
```

**When to Use**:
- Complex business logic
- Multi-step operations
- Cross-cutting concerns (logging, caching, notifications)
- Reusable functionality across multiple endpoints

**Action Items**:
- [ ] Extract business logic to service layer
- [ ] Keep API routes thin (validation + service call)
- [ ] Use dependency injection for services
- [ ] Service methods are testable in isolation

### 6. Plugin Pattern (Extensibility)

**Purpose**: Enable third-party extensions without modifying core code.

```typescript
// ✅ Preferred: Plugin architecture
// core/plugin-system/Plugin.ts
interface Plugin {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  
  initialize(context: PluginContext): Promise<void>;
  execute(action: string, params: any): Promise<any>;
  cleanup(): Promise<void>;
}

// Example plugin
class CustomAnalyticsPlugin implements Plugin {
  id = 'custom-analytics';
  name = 'Custom Analytics Plugin';
  version = '1.0.0';
  capabilities = ['analytics', 'reporting'];
  
  async initialize(context: PluginContext) {
    // Setup
  }
  
  async execute(action: string, params: any) {
    switch (action) {
      case 'analyze':
        return this.performAnalysis(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }
  
  async cleanup() {
    // Cleanup resources
  }
}

// Plugin manager usage
const pluginManager = new PluginManager();
await pluginManager.register(new CustomAnalyticsPlugin());

const result = await pluginManager.execute('custom-analytics', 'analyze', {
  data: analyticsData
});
```

**When to Use**:
- Third-party integrations
- Optional features
- Customer-specific customizations
- Marketplace extensions

**Action Items**:
- [ ] Plugins implement the Plugin interface
- [ ] Plugin lifecycle properly managed (init/cleanup)
- [ ] Security validation before loading plugins
- [ ] Sandboxing for untrusted plugins

### 7. Event-Driven Pattern (Async Communication)

**Purpose**: Decouple components and enable reactive architecture.

```typescript
// ✅ Preferred: Event-driven architecture
import { EventEmitter } from 'events';

// Define events
enum PortEvents {
  SHIPMENT_ARRIVED = 'shipment:arrived',
  UNLOAD_STARTED = 'unload:started',
  UNLOAD_COMPLETED = 'unload:completed',
  CAPACITY_ALERT = 'capacity:alert'
}

// Event emitter
class PortEventBus extends EventEmitter {
  emit(event: PortEvents, data: any): boolean {
    logger.info(`Event emitted: ${event}`, { data });
    return super.emit(event, data);
  }
}

const eventBus = new PortEventBus();

// Publishers
class PortOperationsService {
  async completeUnload(unloadId: string) {
    const unload = await this.updateUnloadStatus(unloadId, 'COMPLETED');
    
    eventBus.emit(PortEvents.UNLOAD_COMPLETED, {
      unloadId,
      portId: unload.portId,
      timestamp: new Date()
    });
  }
}

// Subscribers
eventBus.on(PortEvents.UNLOAD_COMPLETED, async (data) => {
  // Update analytics
  await analyticsEngine.recordCompletion(data);
  
  // Trigger next scheduled unload
  await workflowEngine.triggerNext(data.portId);
  
  // Notify stakeholders
  await notificationService.notifyCompletion(data.unloadId);
});

// ❌ Discouraged: Tight coupling
class PortOperationsService {
  async completeUnload(unloadId: string) {
    const unload = await this.updateUnloadStatus(unloadId, 'COMPLETED');
    
    // Directly calling dependent services
    await analyticsEngine.recordCompletion({ unloadId });
    await workflowEngine.triggerNext(unload.portId);
    await notificationService.notifyCompletion(unloadId);
    // Tightly coupled, hard to test, error-prone
  }
}
```

**When to Use**:
- Asynchronous workflows
- Multi-step processes
- Notification systems
- Audit logging
- Decoupled microservices

**Action Items**:
- [ ] Use events for cross-module communication
- [ ] Event names are descriptive constants
- [ ] Event data includes necessary context
- [ ] Error handling in event listeners
- [ ] Consider event replay/persistence for critical events

### 8. Worker Thread Pattern (CPU-Intensive Tasks)

**Purpose**: Offload heavy computations to prevent blocking the event loop.

```typescript
// ✅ Preferred: Worker threads for CPU-intensive work
import { Worker } from 'worker_threads';

async function processLargeDataset(data: LargeDataset): Promise<Result> {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./workers/dataProcessor.js', {
      workerData: data
    });
    
    worker.on('message', (result) => {
      resolve(result);
    });
    
    worker.on('error', (error) => {
      reject(error);
    });
    
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// workers/dataProcessor.js
const { parentPort, workerData } = require('worker_threads');

const result = performExpensiveComputation(workerData);
parentPort.postMessage(result);

// ❌ Discouraged: CPU-intensive work on main thread
function processLargeDataset(data: LargeDataset): Result {
  // Blocks event loop for seconds/minutes
  return expensiveComputation(data);
}
```

**When to Use**:
- Heavy data processing
- Complex algorithms
- Image/video processing
- Large file parsing
- ML inference (if not delegated to external service)

**Action Items**:
- [ ] CPU-intensive tasks use worker threads
- [ ] Worker communication is type-safe
- [ ] Worker error handling implemented
- [ ] Workers properly terminated after use

## Architectural Principles

### 1. Separation of Concerns

**Layers**:
- **Presentation**: Web dashboard (Next.js/React)
- **API**: API routes (Next.js API)
- **Service**: Business logic (core/services)
- **Data**: Data access (core/data/repositories)
- **Infrastructure**: External services (cache, DB, AI)

**Rules**:
- Each layer only depends on the layer below
- No presentation logic in services
- No business logic in API routes
- No direct DB access from presentation

### 2. Dependency Injection

**Preferred**:
```typescript
class PortService {
  constructor(
    private portRepo: PortRepository,
    private cache: CacheService,
    private logger: Logger
  ) {}
}

// In factory/container
const portService = new PortService(
  portRepository,
  cacheService,
  logger
);
```

**Benefit**: Testable, flexible, loosely coupled

### 3. Interface-Based Design

**Preferred**:
```typescript
interface CacheService {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

class RedisCache implements CacheService {
  // Implementation
}

class LRUCache implements CacheService {
  // Implementation
}

// Services depend on interface, not implementation
class PortService {
  constructor(private cache: CacheService) {}
}
```

### 4. Fail Fast

**Preferred**:
```typescript
async function processPort(portId: string) {
  if (!portId) throw new ValidationError('Port ID required');
  
  const port = await getPort(portId);
  if (!port) throw new NotFoundError('Port not found');
  
  if (port.status === 'INACTIVE') {
    throw new BusinessError('Cannot process inactive port');
  }
  
  // Proceed with processing
}
```

**Benefit**: Early error detection, clear error messages

### 5. Immutability

**Preferred**:
```typescript
// Immutable data structures
const newState = {
  ...oldState,
  portCapacity: updatedCapacity
};

// Pure functions
function calculateEfficiency(data: PortData): number {
  // No side effects
  return data.throughput / data.capacity;
}
```

### 6. Observability

**Required**:
- **Logging**: Structured logging with context
- **Tracing**: OpenTelemetry distributed tracing
- **Metrics**: Prometheus metrics collection
- **Monitoring**: Real-time alerting

```typescript
import { trace } from '@opentelemetry/api';

async function processShipment(shipmentId: string) {
  const span = trace.getTracer('port-operations')
    .startSpan('process-shipment');
  
  span.setAttribute('shipment.id', shipmentId);
  
  try {
    const result = await performProcessing(shipmentId);
    span.setStatus({ code: 0 }); // Success
    return result;
  } catch (error) {
    span.setStatus({ code: 2, message: error.message }); // Error
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
```

## Architecture Review Checklist

### Module Design
- [ ] Module follows single responsibility principle
- [ ] Module has clear, well-defined interface
- [ ] Module dependencies are explicit
- [ ] Module can be tested in isolation

### Data Flow
- [ ] Data flows through proper layers (Presentation → API → Service → Data)
- [ ] No layer skipping
- [ ] Cross-cutting concerns properly handled (logging, caching)
- [ ] Async operations properly managed

### Error Handling
- [ ] Errors propagate correctly through layers
- [ ] User-facing errors are informative
- [ ] System errors are logged with context
- [ ] Critical errors trigger alerts

### Performance
- [ ] Expensive operations cached
- [ ] Database queries optimized (no N+1)
- [ ] CPU-intensive work offloaded to workers
- [ ] Proper pagination for large datasets

### Scalability
- [ ] Stateless design (horizontal scaling)
- [ ] Resource pooling (DB connections, etc.)
- [ ] Rate limiting on expensive operations
- [ ] Load balancing considerations

### Testability
- [ ] Dependencies injected (not hard-coded)
- [ ] Pure functions where possible
- [ ] Mocks/stubs available for external dependencies
- [ ] Test coverage >80%

## Common Anti-Patterns to Avoid

### ❌ God Objects

```typescript
// ❌ Bad: One class does everything
class PortManager {
  async createPort() { }
  async scheduleUnload() { }
  async processPayment() { }
  async sendNotifications() { }
  async generateReports() { }
  // 1000+ lines of unrelated functionality
}
```

**Solution**: Split into focused services.

### ❌ Tight Coupling

```typescript
// ❌ Bad: Direct dependency on implementation
class PortService {
  private redis = new RedisClient(); // Hard-coded
  
  async getPort(id: string) {
    return this.redis.get(`port:${id}`);
  }
}
```

**Solution**: Depend on interfaces, inject dependencies.

### ❌ Leaky Abstractions

```typescript
// ❌ Bad: Exposing implementation details
async function getUsers() {
  // Returns Prisma model directly
  return prisma.user.findMany();
}

// Now consumers depend on Prisma's User type
const users: PrismaUser[] = await getUsers();
```

**Solution**: Return domain models, not ORM models.

### ❌ Circular Dependencies

```typescript
// ❌ Bad: A imports B, B imports A
// moduleA.ts
import { funcB } from './moduleB';

// moduleB.ts
import { funcA } from './moduleA';
```

**Solution**: Extract shared code to third module.

## Related Documentation

- [Five-Dimensional Architecture Whitepaper](../../docs/architecture.md)
- [Service Design Guidelines](../../docs/service-design.md)
- [Plugin Development Guide](../../docs/plugin-development.md)

## Summary

**Key Architectural Principles**:
1. **Five-Dimensional Closed-Loop** - All components fit into the analysis-execution-optimization-learning-management cycle
2. **Agent-Based Architecture** - AI agents as first-class citizens
3. **Layered Design** - Clear separation between presentation, API, service, and data layers
4. **Dependency Injection** - Testable, flexible, loosely coupled
5. **Event-Driven** - Reactive, scalable, decoupled
6. **Performance-First** - Caching, worker threads, optimization
7. **Observability** - Logging, tracing, metrics, monitoring
8. **Extensibility** - Plugin architecture for third-party integrations

**When Reviewing Architecture**:
- Does it fit the five-dimensional model?
- Are layers properly separated?
- Is it testable and maintainable?
- Will it scale under load?
- Is it observable and debuggable?
- Does it follow established patterns?

Remember: Good architecture enables velocity. Make decisions that allow the team to move fast without breaking things.
