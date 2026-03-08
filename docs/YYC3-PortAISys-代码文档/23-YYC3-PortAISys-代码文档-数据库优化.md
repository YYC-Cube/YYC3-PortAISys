---
@file: 23-YYC3-PortAISys-代码文档-数据库优化.md
@description: YYC3-PortAISys-代码文档-数据库优化 文档
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: technical,code,documentation,zh-CN
@category: code
@language: zh-CN
@audience: developers
@complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ PortAISys 数据库优化技术文档

| 项目 | 内容 |
|------|------|
| 文档名称 | YYC³ PortAISys 数据库优化技术文档 |
| 文档版本 | v1.0.0 |
| 创建日期 | 2026-01-07 |
| 最后更新 | 2026-01-07 |
| 文档状态 | ✅ 已完成 |
| 负责人 | YYC³ Team |

## 🎯 文档目标

本文档旨在为 YYC³ PortAISys 项目提供全面的数据库优化方案，包括索引优化、查询优化和分库分表策略，确保系统在高并发、大数据量场景下保持高性能和高可用性。

## 📑 目录

- [1. 概述](#1-概述)
- [2. 索引优化](#2-索引优化)
- [3. 查询优化](#3-查询优化)
- [4. 分库分表](#4-分库分表)
- [5. 数据库性能监控](#5-数据库性能监控)
- [6. 最佳实践](#6-最佳实践)
- [7. 实施计划](#7-实施计划)

---

## 1. 概述

### 1.1 优化目标

基于"五高五标五化"核心机制，数据库优化旨在实现：

- **高性能**：查询响应时间 < 100ms（P95）
- **高可用**：系统可用性 ≥ 99.99%
- **高并发**：支持 10,000+ QPS
- **高扩展**：支持水平扩展至 100+ 节点
- **高可靠**：数据一致性保障，零数据丢失

### 1.2 数据库选型

| 数据库类型 | 用途 | 版本 | 部署方式 |
|-----------|------|------|---------|
| PostgreSQL | 主数据库（关系型数据） | 15.x | 主从复制 |
| MongoDB | 文档数据库（非结构化数据） | 6.x | 副本集 |
| Redis | 缓存数据库（热点数据） | 7.x | 哨兵模式 |

### 1.3 优化策略概览

```
数据库优化策略
├── 索引优化
│   ├── B-Tree 索引
│   ├── 复合索引
│   ├── 部分索引
│   ├── 表达式索引
│   └── 覆盖索引
├── 查询优化
│   ├── 查询重写
│   ├── 执行计划优化
│   ├── 连接优化
│   ├── 子查询优化
│   └── 批量操作优化
└── 分库分表
    ├── 垂直分库
    ├── 水平分表
    ├── 读写分离
    └── 数据迁移
```

---

## 2. 索引优化

### 2.1 索引类型选择

#### 2.1.1 B-Tree 索引（默认）

**适用场景**：
- 等值查询（=, IN）
- 范围查询（>, <, BETWEEN）
- 排序查询（ORDER BY）

**创建示例**：

```sql
-- 单列索引
CREATE INDEX idx_users_email ON users(email);

-- 复合索引（注意列顺序）
CREATE INDEX idx_users_status_created ON users(status, created_at DESC);

-- 唯一索引
CREATE UNIQUE INDEX idx_users_username ON users(username);
```

**最佳实践**：
- 选择性高的列（distinct/count > 0.1）优先建索引
- 复合索引遵循"最左前缀原则"
- 避免在小表上建索引（< 1000 行）

#### 2.1.2 Hash 索引

**适用场景**：
- 等值查询（=, IN）
- 不支持范围查询

**创建示例**：

```sql
-- PostgreSQL 使用 Hash 索引
CREATE INDEX idx_sessions_token ON sessions USING HASH(token);
```

#### 2.1.3 GIN 索引（通用倒排索引）

**适用场景**：
- JSONB 数据查询
- 全文搜索
- 数组包含查询

**创建示例**：

```sql
-- JSONB 数据索引
CREATE INDEX idx_users_metadata ON users USING GIN(metadata);

-- 全文搜索索引
CREATE INDEX idx_posts_content ON posts USING GIN(to_tsvector('english', content));

-- 数组索引
CREATE INDEX idx_users_tags ON users USING GIN(tags);
```

#### 2.1.4 GiST 索引（通用搜索树）

**适用场景**：
- 几何数据查询
- 范围查询
- 全文搜索

**创建示例**：

```sql
-- 几何数据索引
CREATE INDEX idx_locations_geometry ON locations USING GIST(geometry);

-- 范围查询索引
CREATE INDEX idx_events_time_range ON events USING GIST(time_range);
```

### 2.2 高级索引策略

#### 2.2.1 部分索引（Partial Index）

**适用场景**：
- 只索引满足条件的行
- 减少索引大小，提升查询性能

**创建示例**：

```sql
-- 只索引活跃用户
CREATE INDEX idx_active_users_email 
ON users(email) 
WHERE status = 'active';

-- 只索引最近30天的订单
CREATE INDEX idx_recent_orders_user_id 
ON orders(user_id) 
WHERE created_at >= NOW() - INTERVAL '30 days';
```

**性能提升**：
- 索引大小减少 60-80%
- 查询性能提升 30-50%

#### 2.2.2 表达式索引（Expression Index）

**适用场景**：
- 基于函数/表达式的查询
- 避免全表扫描

**创建示例**：

```sql
-- 大小写不敏感查询
CREATE INDEX idx_users_lower_email 
ON users(LOWER(email));

-- 计算字段索引
CREATE INDEX idx_orders_total_amount 
ON orders((quantity * unit_price));

-- 日期函数索引
CREATE INDEX idx_logs_created_month 
ON logs(EXTRACT(MONTH FROM created_at));
```

**查询示例**：

```sql
-- 使用表达式索引
SELECT * FROM users WHERE LOWER(email) = 'test@example.com';

-- 使用计算字段索引
SELECT * FROM orders WHERE quantity * unit_price > 1000;
```

#### 2.2.3 覆盖索引（Covering Index）

**适用场景**：
- 查询只涉及索引列
- 避免回表操作

**创建示例**：

```sql
-- 覆盖索引包含所有查询列
CREATE INDEX idx_orders_covering 
ON orders(user_id, status, created_at) 
INCLUDE (id, total_amount);

-- 查询可以直接从索引获取数据，无需回表
SELECT id, user_id, status, total_amount, created_at 
FROM orders 
WHERE user_id = ? AND status = ?;
```

**性能提升**：
- 查询性能提升 50-80%
- 减少 I/O 操作

### 2.3 索引维护策略

#### 2.3.1 定期重建索引

```sql
-- 重建单个索引
REINDEX INDEX idx_users_email;

-- 重建表的所有索引
REINDEX TABLE users;

-- 并发重建（不阻塞写入）
REINDEX INDEX CONCURRENTLY idx_users_email;
```

#### 2.3.2 索引监控

```sql
-- 查看索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- 查看索引大小
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- 查找未使用的索引
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

#### 2.3.3 索引优化建议

```sql
-- 查找需要优化的慢查询
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- 分析查询执行计划
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM users WHERE email = 'test@example.com';
```

### 2.4 索引设计原则

| 原则 | 说明 | 示例 |
|------|------|------|
| 选择性原则 | 选择性高的列优先建索引 | email > status |
| 最左前缀 | 复合索引遵循最左前缀原则 | (a, b, c) 支持 a, ab, abc |
| 避免过度索引 | 索引不是越多越好，维护成本高 | 单表索引 < 10 个 |
| 定期维护 | 定期重建和清理无用索引 | 每月一次 REINDEX |
| 监控使用 | 监控索引使用情况，删除无用索引 | idx_scan = 0 删除 |

---

## 3. 查询优化

### 3.1 查询重写优化

#### 3.1.1 避免 SELECT *

**问题**：
```sql
-- ❌ 不推荐：查询所有列
SELECT * FROM users WHERE id = 1;
```

**优化**：
```sql
-- ✅ 推荐：只查询需要的列
SELECT id, name, email FROM users WHERE id = 1;
```

**性能提升**：
- 减少网络传输 50-80%
- 减少内存占用 30-50%

#### 3.1.2 避免 OR 条件

**问题**：
```sql
-- ❌ 不推荐：使用 OR 条件
SELECT * FROM orders 
WHERE user_id = 1 OR status = 'pending';
```

**优化**：
```sql
-- ✅ 推荐：使用 UNION ALL
SELECT * FROM orders WHERE user_id = 1
UNION ALL
SELECT * FROM orders WHERE status = 'pending';

-- ✅ 推荐：使用 IN
SELECT * FROM orders 
WHERE user_id IN (SELECT id FROM users WHERE status = 'active');
```

#### 3.1.3 避免 LIKE 前缀通配符

**问题**：
```sql
-- ❌ 不推荐：前缀通配符无法使用索引
SELECT * FROM users WHERE name LIKE '%张%';
```

**优化**：
```sql
-- ✅ 推荐：使用全文搜索
SELECT * FROM users 
WHERE to_tsvector('chinese', name) @@ to_tsquery('chinese', '张');

-- ✅ 推荐：后缀匹配可以使用索引
SELECT * FROM users WHERE name LIKE '张%';
```

#### 3.1.4 优化子查询

**问题**：
```sql
-- ❌ 不推荐：相关子查询
SELECT * FROM users u 
WHERE EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.user_id = u.id 
    AND o.status = 'completed'
);
```

**优化**：
```sql
-- ✅ 推荐：使用 JOIN
SELECT DISTINCT u.* 
FROM users u
INNER JOIN orders o ON o.user_id = u.id
WHERE o.status = 'completed';

-- ✅ 推荐：使用 IN 子查询
SELECT * FROM users 
WHERE id IN (
    SELECT DISTINCT user_id FROM orders WHERE status = 'completed'
);
```

### 3.2 执行计划优化

#### 3.2.1 分析执行计划

```sql
-- 基础执行计划
EXPLAIN 
SELECT * FROM users WHERE email = 'test@example.com';

-- 详细执行计划（包含实际执行时间）
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM users WHERE email = 'test@example.com';

-- 执行计划示例输出
-- Seq Scan on users  (cost=0.00..1000.00 rows=1 width=100)
--   Filter: (email = 'test@example.com'::text)
--   Buffers: shared hit=10 read=5
-- Planning Time: 0.123 ms
-- Execution Time: 2.456 ms
```

#### 3.2.2 执行计划关键指标

| 指标 | 说明 | 优化目标 |
|------|------|---------|
| cost | 预估成本 | 越低越好 |
| rows | 预估行数 | 越接近实际越好 |
| time | 实际执行时间 | < 100ms |
| buffers | 缓冲区使用 | shared hit 越多越好 |

#### 3.2.3 常见执行计划问题

**问题 1：全表扫描（Seq Scan）**

```sql
-- 问题：全表扫描
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
-- Seq Scan on users  (cost=0.00..1000.00 rows=1 width=100)

-- 解决：添加索引
CREATE INDEX idx_users_email ON users(email);

-- 验证：使用索引扫描
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
-- Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 width=100)
```

**问题 2：嵌套循环连接（Nested Loop）**

```sql
-- 问题：嵌套循环连接性能差
EXPLAIN SELECT * FROM users u 
INNER JOIN orders o ON o.user_id = u.id;
-- Nested Loop  (cost=0.42..100000.00 rows=1000000 width=200)

-- 解决：添加索引或使用 Hash Join
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- 验证：使用 Hash Join
EXPLAIN SELECT * FROM users u 
INNER JOIN orders o ON o.user_id = u.id;
-- Hash Join  (cost=1000.00..5000.00 rows=1000000 width=200)
```

### 3.3 连接优化

#### 3.3.1 连接类型选择

| 连接类型 | 适用场景 | 性能 |
|---------|---------|------|
| INNER JOIN | 只匹配两表都存在的行 | 最快 |
| LEFT JOIN | 保留左表所有行 | 较快 |
| RIGHT JOIN | 保留右表所有行 | 较快 |
| FULL OUTER JOIN | 保留两表所有行 | 最慢 |

#### 3.3.2 连接优化技巧

```sql
-- ✅ 技巧 1：小表驱动大表
SELECT * FROM small_table s
INNER JOIN large_table l ON l.id = s.large_id;

-- ✅ 技巧 2：先过滤再连接
SELECT * FROM users u
INNER JOIN (
    SELECT user_id, COUNT(*) as order_count
    FROM orders
    WHERE status = 'completed'
    GROUP BY user_id
) o ON o.user_id = u.id;

-- ✅ 技巧 3：使用索引列连接
CREATE INDEX idx_orders_user_id ON orders(user_id);
SELECT * FROM users u
INNER JOIN orders o ON o.user_id = u.id;
```

### 3.4 批量操作优化

#### 3.4.1 批量插入

```sql
-- ❌ 不推荐：逐条插入
INSERT INTO users (name, email) VALUES ('张三', 'zhangsan@example.com');
INSERT INTO users (name, email) VALUES ('李四', 'lisi@example.com');
INSERT INTO users (name, email) VALUES ('王五', 'wangwu@example.com');

-- ✅ 推荐：批量插入
INSERT INTO users (name, email) VALUES
    ('张三', 'zhangsan@example.com'),
    ('李四', 'lisi@example.com'),
    ('王五', 'wangwu@example.com');

-- ✅ 推荐：使用 COPY 命令（PostgreSQL）
COPY users(name, email) FROM '/path/to/users.csv' DELIMITER ',' CSV;
```

**性能提升**：
- 批量插入性能提升 10-50 倍
- 减少事务开销

#### 3.4.2 批量更新

```sql
-- ❌ 不推荐：逐条更新
UPDATE users SET status = 'active' WHERE id = 1;
UPDATE users SET status = 'active' WHERE id = 2;
UPDATE users SET status = 'active' WHERE id = 3;

-- ✅ 推荐：批量更新
UPDATE users SET status = 'active' WHERE id IN (1, 2, 3);

-- ✅ 推荐：使用 CASE WHEN
UPDATE users SET status = CASE 
    WHEN id = 1 THEN 'active'
    WHEN id = 2 THEN 'inactive'
    WHEN id = 3 THEN 'pending'
    ELSE status
END
WHERE id IN (1, 2, 3);
```

#### 3.4.3 批量删除

```sql
-- ❌ 不推荐：逐条删除
DELETE FROM users WHERE id = 1;
DELETE FROM users WHERE id = 2;
DELETE FROM users WHERE id = 3;

-- ✅ 推荐：批量删除
DELETE FROM users WHERE id IN (1, 2, 3);

-- ✅ 推荐：分批删除（避免锁表）
DELETE FROM users WHERE created_at < '2020-01-01' LIMIT 1000;
-- 重复执行直到删除完成
```

### 3.5 查询缓存优化

#### 3.5.1 Redis 查询缓存

```typescript
import { Redis } from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  db: 0
});

interface CacheOptions {
  ttl?: number; // 缓存过期时间（秒）
  keyPrefix?: string; // 缓存键前缀
}

class QueryCache {
  private readonly defaultTTL = 3600; // 默认 1 小时
  private readonly keyPrefix = 'query:';

  async get<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const cacheKey = `${this.keyPrefix}${key}`;
    
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('缓存读取失败:', error);
    }

    const data = await fetcher();
    
    try {
      await redis.setex(
        cacheKey,
        options?.ttl ?? this.defaultTTL,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('缓存写入失败:', error);
    }

    return data;
  }

  async invalidate(key: string): Promise<void> {
    const cacheKey = `${this.keyPrefix}${key}`;
    await redis.del(cacheKey);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(`${this.keyPrefix}${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export const queryCache = new QueryCache();
```

**使用示例**：

```typescript
// 缓存用户查询
const user = await queryCache.get(
  `user:${userId}`,
  async () => {
    return await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  },
  { ttl: 1800 } // 30 分钟
);

// 缓存失效
await queryCache.invalidate(`user:${userId}`);

// 批量失效
await queryCache.invalidatePattern('user:*');
```

#### 3.5.2 查询缓存策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| Cache-Aside | 先查缓存，缓存没有再查数据库 | 读多写少 |
| Write-Through | 写入时同时更新缓存和数据库 | 读写均衡 |
| Write-Behind | 先写缓存，异步写数据库 | 写多读少 |
| Refresh-Ahead | 缓存即将过期时主动刷新 | 热点数据 |

---

## 4. 分库分表

### 4.1 垂直分库

#### 4.1.1 按业务模块分库

```
yyc3_main          # 主数据库（用户、权限等）
yyc3_orders        # 订单数据库
yyc3_products      # 产品数据库
yyc3_analytics     # 分析数据库
yyc3_logs          # 日志数据库
```

**优势**：
- 业务隔离，互不影响
- 便于独立扩展和优化
- 降低单库压力

**劣势**：
- 跨库事务复杂
- 数据一致性保障困难

#### 4.1.2 垂直分表

```sql
-- 用户基础信息表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 用户扩展信息表
CREATE TABLE user_profiles (
    user_id BIGSERIAL PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nickname VARCHAR(50),
    avatar_url VARCHAR(255),
    bio TEXT,
    phone VARCHAR(20),
    address TEXT,
    preferences JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**优势**：
- 减少单表字段数量
- 提升查询性能
- 便于灵活扩展

### 4.2 水平分表

#### 4.2.1 分表策略

| 策略 | 说明 | 优点 | 缺点 |
|------|------|------|------|
| 范围分片 | 按数据范围分片 | 查询范围数据高效 | 数据分布不均 |
| 哈希分片 | 按哈希值分片 | 数据分布均匀 | 范围查询效率低 |
| 一致性哈希 | 使用一致性哈希算法 | 扩容影响小 | 实现复杂 |
| 地理位置分片 | 按地理位置分片 | 就近访问 | 数据迁移复杂 |

#### 4.2.2 哈希分表实现

```typescript
interface ShardingConfig {
  shardCount: number; // 分片数量
  shardKey: string; // 分片键
  shardTables: string[]; // 分片表名
}

class HashSharding {
  private readonly config: ShardingConfig;

  constructor(config: ShardingConfig) {
    this.config = config;
  }

  getShardId(value: string): number {
    const hash = this.hash(value);
    return hash % this.config.shardCount;
  }

  getShardTable(value: string): string {
    const shardId = this.getShardId(value);
    return this.config.shardTables[shardId];
  }

  private hash(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

export const orderSharding = new HashSharding({
  shardCount: 16,
  shardKey: 'user_id',
  shardTables: Array.from({ length: 16 }, (_, i) => `orders_${i}`)
});

export const userSharding = new HashSharding({
  shardCount: 8,
  shardKey: 'id',
  shardTables: Array.from({ length: 8 }, (_, i) => `users_${i}`)
});
```

**使用示例**：

```typescript
// 根据用户 ID 查询订单
const userId = '123456';
const shardTable = orderSharding.getShardTable(userId);
const query = `SELECT * FROM ${shardTable} WHERE user_id = $1`;
const orders = await db.query(query, [userId]);

// 插入订单
const orderId = generateOrderId();
const shardTable = orderSharding.getShardTable(userId);
const query = `INSERT INTO ${shardTable} (id, user_id, ...) VALUES ($1, $2, ...)`;
await db.query(query, [orderId, userId, ...]);
```

#### 4.2.3 范围分表实现

```typescript
interface RangeShardingConfig {
  shardKey: string;
  shardRanges: Array<{
    min: number;
    max: number;
    table: string;
  }>;
}

class RangeSharding {
  private readonly config: RangeShardingConfig;

  constructor(config: RangeShardingConfig) {
    this.config = config;
  }

  getShardTable(value: number): string {
    for (const range of this.config.shardRanges) {
      if (value >= range.min && value < range.max) {
        return range.table;
      }
    }
    throw new Error(`No shard found for value: ${value}`);
  }
}

export const logSharding = new RangeSharding({
  shardKey: 'id',
  shardRanges: [
    { min: 0, max: 1000000, table: 'logs_2024_01' },
    { min: 1000000, max: 2000000, table: 'logs_2024_02' },
    { min: 2000000, max: 3000000, table: 'logs_2024_03' },
    { min: 3000000, max: 4000000, table: 'logs_2024_04' },
    { min: 4000000, max: 5000000, table: 'logs_2024_05' },
    { min: 5000000, max: 6000000, table: 'logs_2024_06' },
    { min: 6000000, max: 7000000, table: 'logs_2024_07' },
    { min: 7000000, max: 8000000, table: 'logs_2024_08' },
    { min: 8000000, max: 9000000, table: 'logs_2024_09' },
    { min: 9000000, max: 10000000, table: 'logs_2024_10' },
    { min: 10000000, max: 11000000, table: 'logs_2024_11' },
    { min: 11000000, max: 12000000, table: 'logs_2024_12' }
  ]
});
```

### 4.3 读写分离

#### 4.3.1 主从复制架构

```
                    应用层
                      |
            +---------+---------+
            |                   |
         主库（写）           从库（读）
            |                   |
            +---------+---------+
                      |
                从库（读）
```

#### 4.3.2 读写分离实现

```typescript
import { Pool, PoolConfig } from 'pg';

interface DatabaseConfig {
  master: PoolConfig;
  slaves: PoolConfig[];
}

class ReadWriteSplitting {
  private masterPool: Pool;
  private slavePools: Pool[];
  private currentSlaveIndex = 0;

  constructor(config: DatabaseConfig) {
    this.masterPool = new Pool(config.master);
    this.slavePools = config.slaves.map(config => new Pool(config));
  }

  getMasterPool(): Pool {
    return this.masterPool;
  }

  getSlavePool(): Pool {
    const pool = this.slavePools[this.currentSlaveIndex];
    this.currentSlaveIndex = (this.currentSlaveIndex + 1) % this.slavePools.length;
    return pool;
  }

  async executeWrite(query: string, params?: any[]): Promise<any> {
    const pool = this.getMasterPool();
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async executeRead(query: string, params?: any[]): Promise<any> {
    const pool = this.getSlavePool();
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async executeTransaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const pool = this.getMasterPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export const db = new ReadWriteSplitting({
  master: {
    host: process.env.POSTGRES_MASTER_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_MASTER_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'yyc3',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    max: 20
  },
  slaves: [
    {
      host: process.env.POSTGRES_SLAVE1_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_SLAVE1_PORT || '5433'),
      database: process.env.POSTGRES_DB || 'yyc3',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
      max: 20
    },
    {
      host: process.env.POSTGRES_SLAVE2_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_SLAVE2_PORT || '5434'),
      database: process.env.POSTGRES_DB || 'yyc3',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
      max: 20
    }
  ]
});
```

**使用示例**：

```typescript
// 写操作（使用主库）
await db.executeWrite(
  'INSERT INTO users (name, email) VALUES ($1, $2)',
  ['张三', 'zhangsan@example.com']
);

// 读操作（使用从库）
const users = await db.executeRead('SELECT * FROM users WHERE status = $1', ['active']);

// 事务操作（使用主库）
await db.executeTransaction(async (client) => {
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, 1]);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, 2]);
});
```

### 4.4 数据迁移

#### 4.4.1 在线数据迁移

```typescript
interface MigrationConfig {
  sourceTable: string;
  targetTable: string;
  batchSize: number;
  maxRetries: number;
}

class DataMigrator {
  private readonly config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
  }

  async migrate(): Promise<void> {
    let offset = 0;
    let hasMoreData = true;
    let retryCount = 0;

    while (hasMoreData) {
      try {
        const batch = await this.fetchBatch(offset, this.config.batchSize);
        
        if (batch.length === 0) {
          hasMoreData = false;
          break;
        }

        await this.insertBatch(batch);
        
        offset += batch.length;
        retryCount = 0;

        console.log(`已迁移 ${offset} 条数据`);
      } catch (error) {
        retryCount++;
        
        if (retryCount >= this.config.maxRetries) {
          console.error('迁移失败，达到最大重试次数:', error);
          throw error;
        }

        console.warn(`迁移失败，第 ${retryCount} 次重试...`, error);
        await this.sleep(1000 * retryCount);
      }
    }

    console.log('数据迁移完成！');
  }

  private async fetchBatch(offset: number, limit: number): Promise<any[]> {
    const query = `
      SELECT * FROM ${this.config.sourceTable}
      ORDER BY id
      LIMIT $1 OFFSET $2
    `;
    const result = await db.executeRead(query, [limit, offset]);
    return result;
  }

  private async insertBatch(batch: any[]): Promise<void> {
    const query = `
      INSERT INTO ${this.config.targetTable} (${Object.keys(batch[0]).join(', ')})
      VALUES ${batch.map((_, i) => `($${i + 1}, $${i + 2}, ...)`).join(', ')}
    `;
    const values = batch.flatMap(item => Object.values(item));
    await db.executeWrite(query, values);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const dataMigrator = new DataMigrator({
  sourceTable: 'users',
  targetTable: 'users_v2',
  batchSize: 1000,
  maxRetries: 3
});
```

#### 4.4.2 双写迁移策略

```typescript
class DualWriteMigrator {
  private readonly sourceTable: string;
  private readonly targetTable: string;

  constructor(sourceTable: string, targetTable: string) {
    this.sourceTable = sourceTable;
    this.targetTable = targetTable;
  }

  async insert(data: any): Promise<void> {
    try {
      await Promise.all([
        db.executeWrite(
          `INSERT INTO ${this.sourceTable} (...) VALUES (...)`,
          [...]
        ),
        db.executeWrite(
          `INSERT INTO ${this.targetTable} (...) VALUES (...)`,
          [...]
        )
      ]);
    } catch (error) {
      console.error('双写失败:', error);
      throw error;
    }
  }

  async update(id: string, data: any): Promise<void> {
    try {
      await Promise.all([
        db.executeWrite(
          `UPDATE ${this.sourceTable} SET ... WHERE id = $1`,
          [id, ...]
        ),
        db.executeWrite(
          `UPDATE ${this.targetTable} SET ... WHERE id = $1`,
          [id, ...]
        )
      ]);
    } catch (error) {
      console.error('双写失败:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await Promise.all([
        db.executeWrite(
          `DELETE FROM ${this.sourceTable} WHERE id = $1`,
          [id]
        ),
        db.executeWrite(
          `DELETE FROM ${this.targetTable} WHERE id = $1`,
          [id]
        )
      ]);
    } catch (error) {
      console.error('双写失败:', error);
      throw error;
    }
  }
}
```

---

## 5. 数据库性能监控

### 5.1 监控指标

#### 5.1.1 核心性能指标

| 指标 | 说明 | 阈值 |
|------|------|------|
| QPS | 每秒查询数 | > 1000 |
| TPS | 每秒事务数 | > 100 |
| 查询响应时间 | P95 响应时间 | < 100ms |
| 慢查询数 | 慢查询数量 | < 10/min |
| 连接数 | 活跃连接数 | < 80% 最大连接数 |
| 缓存命中率 | 缓存命中率 | > 90% |
| 死锁数 | 死锁数量 | = 0 |

#### 5.1.2 资源使用指标

| 指标 | 说明 | 阈值 |
|------|------|------|
| CPU 使用率 | CPU 使用率 | < 70% |
| 内存使用率 | 内存使用率 | < 80% |
| 磁盘 I/O | 磁盘读写速率 | < 80% |
| 磁盘使用率 | 磁盘空间使用率 | < 80% |
| 网络流量 | 网络吞吐量 | < 80% |

### 5.2 监控实现

```typescript
import { prometheus } from 'prom-client';

class DatabaseMonitor {
  private readonly metrics = {
    queryDuration: new prometheus.Histogram({
      name: 'db_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10]
    }),

    queryCount: new prometheus.Counter({
      name: 'db_query_count_total',
      help: 'Total number of database queries',
      labelNames: ['operation', 'table', 'status']
    }),

    slowQueryCount: new prometheus.Counter({
      name: 'db_slow_query_count_total',
      help: 'Total number of slow database queries',
      labelNames: ['operation', 'table']
    }),

    connectionCount: new prometheus.Gauge({
      name: 'db_connection_count',
      help: 'Number of active database connections',
      labelNames: ['type']
    }),

    cacheHitRate: new prometheus.Gauge({
      name: 'db_cache_hit_rate',
      help: 'Database cache hit rate',
      labelNames: ['type']
    })
  };

  recordQuery(operation: string, table: string, duration: number, status: 'success' | 'error'): void {
    this.metrics.queryDuration.observe({ operation, table }, duration);
    this.metrics.queryCount.inc({ operation, table, status });

    if (duration > 1) {
      this.metrics.slowQueryCount.inc({ operation, table });
    }
  }

  updateConnectionCount(type: string, count: number): void {
    this.metrics.connectionCount.set({ type }, count);
  }

  updateCacheHitRate(type: string, rate: number): void {
    this.metrics.cacheHitRate.set({ type }, rate);
  }

  async getMetrics(): Promise<string> {
    return await prometheus.register.metrics();
  }
}

export const dbMonitor = new DatabaseMonitor();
```

### 5.3 告警规则

```yaml
groups:
  - name: database_alerts
    rules:
      - alert: HighQueryLatency
        expr: histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m])) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "数据库查询延迟过高"
          description: "P95 查询延迟超过 100ms"

      - alert: HighSlowQueryRate
        expr: rate(db_slow_query_count_total[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "慢查询率过高"
          description: "慢查询率超过 10/min"

      - alert: HighConnectionCount
        expr: db_connection_count{type="active"} > 80
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "数据库连接数过高"
          description: "活跃连接数超过 80"

      - alert: LowCacheHitRate
        expr: db_cache_hit_rate < 0.9
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "缓存命中率过低"
          description: "缓存命中率低于 90%"
```

---

## 6. 最佳实践

### 6.1 设计原则

1. **索引设计**
   - 为高频查询字段创建索引
   - 避免过度索引（单表索引 < 10 个）
   - 定期清理无用索引
   - 使用复合索引优化多条件查询

2. **查询优化**
   - 避免 SELECT *
   - 避免 OR 条件，使用 UNION ALL
   - 避免 LIKE 前缀通配符
   - 使用批量操作替代循环操作

3. **分库分表**
   - 根据业务特点选择分片策略
   - 预留足够的分片空间
   - 实现平滑扩容方案
   - 做好数据迁移准备

4. **读写分离**
   - 读操作使用从库
   - 写操作使用主库
   - 事务操作使用主库
   - 实现从库负载均衡

### 6.2 性能优化清单

```markdown
## 数据库性能优化清单

### 索引优化
- [ ] 为高频查询字段创建索引
- [ ] 为外键字段创建索引
- [ ] 为排序字段创建索引
- [ ] 使用复合索引优化多条件查询
- [ ] 定期清理无用索引
- [ ] 定期重建索引

### 查询优化
- [ ] 避免 SELECT *
- [ ] 避免 OR 条件
- [ ] 避免 LIKE 前缀通配符
- [ ] 优化子查询为 JOIN
- [ ] 使用批量操作
- [ ] 添加查询缓存

### 分库分表
- [ ] 选择合适的分片策略
- [ ] 实现分片路由
- [ ] 实现读写分离
- [ ] 实现数据迁移方案
- [ ] 实现双写策略

### 监控告警
- [ ] 配置性能监控
- [ ] 配置慢查询监控
- [ ] 配置连接数监控
- [ ] 配置缓存命中率监控
- [ ] 配置告警规则
```

---

## 7. 实施计划

### 7.1 阶段一：索引优化（1-2 周）

**目标**：
- 识别慢查询
- 创建必要的索引
- 清理无用索引

**任务**：
1. 启用慢查询日志
2. 分析慢查询
3. 创建索引
4. 验证索引效果

### 7.2 阶段二：查询优化（2-3 周）

**目标**：
- 优化慢查询
- 实现查询缓存
- 优化批量操作

**任务**：
1. 重写慢查询
2. 实现查询缓存
3. 优化批量操作
4. 性能测试

### 7.3 阶段三：分库分表（4-6 周）

**目标**：
- 实现垂直分库
- 实现水平分表
- 实现读写分离

**任务**：
1. 设计分片方案
2. 实现分片路由
3. 实现读写分离
4. 数据迁移

### 7.4 阶段四：监控告警（1-2 周）

**目标**：
- 配置性能监控
- 配置告警规则
- 实现自动化运维

**任务**：
1. 配置 Prometheus 监控
2. 配置 Grafana 可视化
3. 配置告警规则
4. 实现自动化运维

---

## 📚 参考资料

- PostgreSQL 官方文档: https://www.postgresql.org/docs/
- MongoDB 官方文档: https://docs.mongodb.com/
- Redis 官方文档: https://redis.io/docs/
- 数据库性能优化最佳实践

---

**文档结束** 🌹

---
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
