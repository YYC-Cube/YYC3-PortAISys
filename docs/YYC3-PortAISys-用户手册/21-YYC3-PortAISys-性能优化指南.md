# YYC³ PortAISys - 性能优化指南

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> **文档版本**: v1.0
> **创建日期**: 2026-02-03
> **文档状态**: ✅ 已完成
> **维护团队**: YYC³ 产品团队

---

## 📋 目录

- [优化概述](#优化概述)
- [应用性能优化](#应用性能优化)
- [数据库优化](#数据库优化)
- [缓存优化](#缓存优化)
- [网络优化](#网络优化)
- [AI性能优化](#ai性能优化)
- [监控与调优](#监控与调优)

---

## 优化概述

### 性能目标

| 指标 | 目标值 | 当前值 | 状态 |
| ---- | ------ | ------ | ---- |
| **API响应时间** | < 200ms | - | 🟡 |
| **数据库查询时间** | < 100ms | - | 🟡 |
| **缓存命中率** | > 90% | - | 🟡 |
| **并发处理能力** | > 1000 RPS | - | 🟡 |
| **系统可用性** | > 99.9% | - | 🟡 |

### 优化策略

```
┌─────────────────────────────────────────────────────────────┐
│                  YYC³ 性能优化策略                          │
├─────────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐                                       │
│  │  应用层优化  │───▶ 代码优化、算法优化                  │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │  数据库优化  │───▶ 查询优化、索引优化                  │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │  缓存优化    │───▶ 多级缓存、缓存预热                  │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │  网络优化    │───▶ 压缩、CDN、HTTP/2                 │
│  └──────┬───────┘                                       │
│         │                                               │
│         ▼                                               │
│  ┌──────────────┐                                       │
│  │  AI优化      │───▶ 模型优化、批处理                    │
│  └──────────────┘                                       │
│                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 应用性能优化

### 代码优化

#### 1. 异步处理

```typescript
// 优化前：同步处理
async function processOrders(orders: Order[]) {
  const results = [];
  for (const order of orders) {
    const result = await processOrder(order);
    results.push(result);
  }
  return results;
}

// 优化后：并行处理
async function processOrders(orders: Order[]) {
  return Promise.all(orders.map(order => processOrder(order)));
}

// 更优：批量并行处理
async function processOrders(orders: Order[], batchSize = 10) {
  const results = [];
  for (let i = 0; i < orders.length; i += batchSize) {
    const batch = orders.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(order => processOrder(order))
    );
    results.push(...batchResults);
  }
  return results;
}
```

#### 2. 内存优化

```typescript
// 优化前：创建大量临时对象
function processLargeData(data: any[]) {
  const results = [];
  for (const item of data) {
    const processed = {
      id: item.id,
      name: item.name,
      value: item.value,
      timestamp: new Date()
    };
    results.push(processed);
  }
  return results;
}

// 优化后：使用对象池
class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 100) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T {
    return this.pool.pop() || this.factory();
  }

  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }
}

// 使用对象池
const resultPool = new ObjectPool(
  () => ({ id: '', name: '', value: 0, timestamp: new Date() }),
  (obj) => { obj.id = ''; obj.name = ''; obj.value = 0; }
);

function processLargeData(data: any[]) {
  const results = [];
  for (const item of data) {
    const processed = resultPool.acquire();
    processed.id = item.id;
    processed.name = item.name;
    processed.value = item.value;
    processed.timestamp = new Date();
    results.push({ ...processed });
    resultPool.release(processed);
  }
  return results;
}
```

#### 3. 算法优化

```typescript
// 优化前：O(n²) 复杂度
function findDuplicates(arr: string[]): string[] {
  const duplicates: string[] = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}

// 优化后：O(n) 复杂度
function findDuplicates(arr: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }

  return Array.from(duplicates);
}
```

### React优化

#### 1. 组件优化

```typescript
// 优化前：每次渲染都重新创建函数
function ExpensiveComponent({ items }: { items: Item[] }) {
  const handleClick = (id: string) => {
    console.log('Clicked:', id);
  };

  return (
    <div>
      {items.map(item => (
        <Item key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
}

// 优化后：使用useMemo和useCallback
function OptimizedComponent({ items }: { items: Item[] }) {
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);

  const memoizedItems = useMemo(() => {
    return items.map(item => (
      <MemoizedItem key={item.id} item={item} onClick={handleClick} />
    ));
  }, [items, handleClick]);

  return <div>{memoizedItems}</div>;
}

const MemoizedItem = React.memo(function Item({ item, onClick }: { item: Item; onClick: (id: string) => void }) {
  return <div onClick={() => onClick(item.id)}>{item.name}</div>;
});
```

#### 2. 虚拟滚动

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  });

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 数据库优化

### 查询优化

#### 1. 索引优化

```sql
-- 优化前：全表扫描
SELECT * FROM orders WHERE customer_id = 123 AND status = 'completed';

-- 优化后：创建复合索引
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

-- 查看索引使用情况
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 123 AND status = 'completed';
```

#### 2. 查询重写

```typescript
// 优化前：N+1查询问题
async function getOrdersWithItems(orderIds: string[]) {
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } }
  });

  const results = [];
  for (const order of orders) {
    const items = await prisma.orderItem.findMany({
      where: { orderId: order.id }
    });
    results.push({ ...order, items });
  }

  return results;
}

// 优化后：使用JOIN
async function getOrdersWithItems(orderIds: string[]) {
  return prisma.order.findMany({
    where: { id: { in: orderIds } },
    include: {
      items: true
    }
  });
}

// 更优：批量查询
async function getOrdersWithItems(orderIds: string[]) {
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } }
  });

  const orderIdsList = orders.map(o => o.id);
  const items = await prisma.orderItem.findMany({
    where: { orderId: { in: orderIdsList } }
  });

  const itemsMap = new Map<string, OrderItem[]>();
  items.forEach(item => {
    if (!itemsMap.has(item.orderId)) {
      itemsMap.set(item.orderId, []);
    }
    itemsMap.get(item.orderId)!.push(item);
  });

  return orders.map(order => ({
    ...order,
    items: itemsMap.get(order.id) || []
  }));
}
```

#### 3. 分页优化

```typescript
// 优化前：OFFSET分页（性能差）
async function getOrders(page: number, pageSize: number) {
  const skip = (page - 1) * pageSize;
  return prisma.order.findMany({
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' }
  });
}

// 优化后：游标分页（性能好）
async function getOrders(cursor?: string, pageSize: number) {
  return prisma.order.findMany({
    take: pageSize,
    ...(cursor && { cursor: { id: cursor } }),
    orderBy: { createdAt: 'desc' }
  });
}
```

### 连接池优化

```typescript
// 优化连接池配置
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['query', 'error', 'warn'],
  // 连接池配置
  connectionLimit: 20,              // 最大连接数
  connectionTimeout: 10000,        // 连接超时（毫秒）
  // 查询优化
  queryTimeout: 30000,             // 查询超时（毫秒）
  // 批量操作
  batchOperations: true,          // 启用批量操作
  // 预编译语句
  statementCacheSize: 100          // 语句缓存大小
});
```

---

## 缓存优化

### 多级缓存

```typescript
/**
 * 多级缓存实现
 */
class MultiLevelCache {
  private l1Cache: Map<string, CacheEntry>;  // L1: 内存缓存
  private l2Cache: Redis;                    // L2: Redis缓存
  private l3Cache: Database;                 // L3: 数据库

  constructor(redis: Redis, database: Database) {
    this.l1Cache = new Map();
    this.l2Cache = redis;
    this.l3Cache = database;
  }

  async get<T>(key: string): Promise<T | null> {
    // L1缓存
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry && !this.isExpired(l1Entry)) {
      return l1Entry.value as T;
    }

    // L2缓存
    const l2Value = await this.l2Cache.get(key);
    if (l2Value) {
      const value = JSON.parse(l2Value) as T;
      // 回填L1缓存
      this.l1Cache.set(key, {
        value,
        expiresAt: Date.now() + 60000  // 1分钟
      });
      return value;
    }

    // L3数据库
    const dbValue = await this.l3Cache.get(key);
    if (dbValue) {
      const value = dbValue as T;
      // 回填L2和L1缓存
      await this.l2Cache.set(key, JSON.stringify(value), 'EX', 3600);  // 1小时
      this.l1Cache.set(key, {
        value,
        expiresAt: Date.now() + 60000
      });
      return value;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    // 写入所有层级
    this.l1Cache.set(key, {
      value,
      expiresAt: Date.now() + Math.min(ttl * 1000, 60000)
    });

    await this.l2Cache.set(key, JSON.stringify(value), 'EX', ttl);

    // L3由业务逻辑控制
  }

  private isExpired(entry: CacheEntry): boolean {
    return entry.expiresAt < Date.now();
  }
}

interface CacheEntry {
  value: any;
  expiresAt: number;
}
```

### 缓存预热

```typescript
/**
 * 缓存预热器
 */
class CacheWarmer {
  private cache: MultiLevelCache;
  private warmupTasks: WarmupTask[] = [];

  constructor(cache: MultiLevelCache) {
    this.cache = cache;
  }

  registerTask(task: WarmupTask): void {
    this.warmupTasks.push(task);
  }

  async warmup(): Promise<void> {
    console.log('开始缓存预热...');

    const promises = this.warmupTasks.map(task => this.warmupTask(task));
    await Promise.all(promises);

    console.log('缓存预热完成');
  }

  private async warmupTask(task: WarmupTask): Promise<void> {
    try {
      const value = await task.fetch();
      await this.cache.set(task.key, value, task.ttl);
      console.log(`预热缓存: ${task.key}`);
    } catch (error) {
      console.error(`预热失败: ${task.key}`, error);
    }
  }
}

interface WarmupTask {
  key: string;
  fetch: () => Promise<any>;
  ttl: number;
}

// 使用示例
const cacheWarmer = new CacheWarmer(cache);

cacheWarmer.registerTask({
  key: 'hot-products',
  fetch: () => fetchHotProducts(),
  ttl: 3600
});

cacheWarmer.registerTask({
  key: 'user-stats',
  fetch: () => fetchUserStats(),
  ttl: 1800
});

// 启动时预热
cacheWarmer.warmup();
```

---

## 网络优化

### HTTP优化

#### 1. 启用压缩

```typescript
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024,              // 只压缩大于1KB的响应
  level: 6,                     // 压缩级别（1-9）
  memLevel: 8                   // 内存级别（1-9）
}));
```

#### 2. 启用HTTP/2

```typescript
import spdy from 'spdy';

const options = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};

spdy.createServer(options, app).listen(443, () => {
  console.log('HTTP/2 server running on port 443');
});
```

#### 3. CDN加速

```typescript
// 配置CDN
const CDN_URL = process.env.CDN_URL || 'https://cdn.your-domain.com';

function getCDNUrl(path: string): string {
  return `${CDN_URL}${path}`;
}

// 使用CDN
app.use(express.static('public', {
  setHeaders: (res, path) => {
    // 静态资源使用CDN
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));
```

### WebSocket优化

```typescript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      level: 3,
      memLevel: 7
    },
    zlibInflateOptions: {
      level: 3,
      memLevel: 7
    },
    threshold: 1024,            // 只压缩大于1KB的消息
    concurrencyLimit: 10        // 并发压缩限制
  }
});

wss.on('connection', (ws) => {
  // 心跳检测
  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on('pong', () => {
    // 心跳响应
  });

  ws.on('close', () => {
    clearInterval(heartbeat);
  });
});
```

---

## AI性能优化

### 批处理

```typescript
// 优化前：逐个处理
async function processTexts(texts: string[]): Promise<string[]> {
  const results = [];
  for (const text of texts) {
    const result = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: text }]
    });
    results.push(result.choices[0].message.content);
  }
  return results;
}

// 优化后：批处理
async function processTextsBatch(texts: string[]): Promise<string[]> {
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchPromises = batch.map(text =>
      openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: text }]
      })
    );
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.map(r => r.choices[0].message.content));
  }

  return results;
}
```

### 模型选择

```typescript
/**
 * 智能模型选择器
 */
class ModelSelector {
  private models = {
    'gpt-4': { cost: 0.03, speed: 1.0, quality: 1.0 },
    'gpt-3.5-turbo': { cost: 0.001, speed: 2.0, quality: 0.8 },
    'claude-3-opus': { cost: 0.015, speed: 0.8, quality: 1.0 },
    'claude-3-sonnet': { cost: 0.003, speed: 1.5, quality: 0.9 }
  };

  selectModel(requirements: {
    maxCost?: number;
    minSpeed?: number;
    minQuality?: number;
  }): string {
    let bestModel = 'gpt-4';
    let bestScore = 0;

    for (const [model, metrics] of Object.entries(this.models)) {
      let score = 0;

      if (requirements.maxCost && metrics.cost <= requirements.maxCost) {
        score += 1;
      }
      if (requirements.minSpeed && metrics.speed >= requirements.minSpeed) {
        score += 1;
      }
      if (requirements.minQuality && metrics.quality >= requirements.minQuality) {
        score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    }

    return bestModel;
  }
}

// 使用示例
const modelSelector = new ModelSelector();

// 快速响应场景
const fastModel = modelSelector.selectModel({
  minSpeed: 1.5
});

// 成本敏感场景
const cheapModel = modelSelector.selectModel({
  maxCost: 0.005
});
```

---

## 监控与调优

### 性能监控

```typescript
import { performance } from 'perf_hooks';

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    });
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // 只保留最近1000个数据点
    const values = this.metrics.get(name)!;
    if (values.length > 1000) {
      values.shift();
    }
  }

  getStats(name: string) {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }
}

// 使用示例
const monitor = new PerformanceMonitor();

async function processRequest(req: Request) {
  return monitor.measure('request-processing', async () => {
    // 处理请求
    const result = await doSomething();
    return result;
  });
}

// 定期输出统计
setInterval(() => {
  const stats = monitor.getStats('request-processing');
  if (stats) {
    console.log('Performance stats:', stats);
  }
}, 60000);
```

---

## 下一步

- [监控和告警系统](./13-监控和告警系统.md) - 监控配置
- [故障排除指南](./24-故障排除指南.md) - 故障排除
- [最佳实践](./25-最佳实践.md) - 更多最佳实践

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
