---
@file: 13-YYC3-PortAISys-监控和告警系统.md
@description: YYC3-PortAISys-监控和告警系统 文档
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: general,documentation,zh-CN
@category: general
@language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ PortAISys - 监控和告警系统


## 📋 目录

- [系统概述](#系统概述)
- [监控配置](#监控配置)
- [告警配置](#告警配置)
- [指标说明](#指标说明)
- [仪表盘](#仪表盘)
- [最佳实践](#最佳实践)

---

## 系统概述

### 监控架构

YYC³ 监控系统基于Prometheus + Grafana架构，提供全方位的系统监控和告警能力。

```
┌─────────────────────────────────────────────────────────────┐
│                  YYC³ 监控系统架构                           │
├─────────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐│
│  │  应用监控    │───▶│  Prometheus  │───▶│   Grafana   ││
│  │  OpenTelemetry│   │   时序数据库   │   │   可视化     ││
│  └──────────────┘    └──────────────┘    └──────────────┘│
│         │                    │                    │           │
│  ┌──────────────┐         │                    │           │
│  │  系统监控    │─────────┘                    │           │
│  │  Node Exporter│                              │           │
│  └──────────────┘                              │           │
│         │                                        │           │
│  ┌──────────────┐                               │           │
│  │  数据库监控   │────────────────────────────────┘           │
│  │  PostgreSQL   │                                           │
│  └──────────────┘                                           │
│         │                                                       │
│  ┌──────────────┐                                             │
│  │  缓存监控    │                                             │
│  │  Redis       │                                             │
│  └──────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────┐                                             │
│  │  告警管理    │                                             │
│  │  AlertManager│                                             │
│  └──────────────┘                                             │
│                                                         │
└─────────────────────────────────────────────────────────────┘
```

### 核心特性

- 📊 **全方位监控**: 应用、系统、数据库、缓存全方位监控
- 🚨 **智能告警**: 基于规则的智能告警
- 📈 **实时可视化**: 实时数据可视化展示
- 🔍 **深度分析**: 历史数据分析和趋势预测
- 📱 **多渠道通知**: 邮件、短信、Webhook多渠道通知
- 🔒 **安全可靠**: 企业级安全保障

---

## 监控配置

### 应用监控

#### OpenTelemetry配置

```typescript
import { trace, metrics, logs } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';

// 配置资源
const resource = new Resource({
  'service.name': 'yyc3-portaisys',
  'service.version': '1.0.0',
  'deployment.environment': process.env.NODE_ENV || 'development'
});

// 配置追踪
const tracerProvider = new NodeTracerProvider({ resource });
tracerProvider.register();

// 配置指标
const metricsExporter = new PrometheusExporter({
  port: 9090,
  endpoint: '/metrics'
});

const meterProvider = new MeterProvider({
  resource,
  readers: [metricsExporter]
});

metrics.setGlobalMeterProvider(meterProvider);

// 创建指标
const meter = metrics.getMeter('yyc3-portaisys');

// HTTP请求计数器
const httpRequestsCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests'
});

// HTTP请求持续时间
const httpRequestDuration = meter.createHistogram('http_request_duration_ms', {
  description: 'HTTP request duration in milliseconds',
  unit: 'ms'
});

// 数据库查询计数器
const dbQueriesCounter = meter.createCounter('db_queries_total', {
  description: 'Total number of database queries'
});

// 数据库查询持续时间
const dbQueryDuration = meter.createHistogram('db_query_duration_ms', {
  description: 'Database query duration in milliseconds',
  unit: 'ms'
});

// AI调用计数器
const aiCallsCounter = meter.createCounter('ai_calls_total', {
  description: 'Total number of AI calls'
});

// AI调用持续时间
const aiCallDuration = meter.createHistogram('ai_call_duration_ms', {
  description: 'AI call duration in milliseconds',
  unit: 'ms'
});

// 导出指标
export {
  httpRequestsCounter,
  httpRequestDuration,
  dbQueriesCounter,
  dbQueryDuration,
  aiCallsCounter,
  aiCallDuration
};
```

#### 使用示例

```typescript
import { httpRequestsCounter, httpRequestDuration } from './monitoring';

// 记录HTTP请求
function recordHttpRequest(method: string, path: string, statusCode: number, duration: number) {
  httpRequestsCounter.add(1, {
    method,
    path,
    status_code: statusCode.toString()
  });

  httpRequestDuration.record(duration, {
    method,
    path,
    status_code: statusCode.toString()
  });
}

// 在Express中间件中使用
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    recordHttpRequest(req.method, req.path, res.statusCode, duration);
  });

  next();
});
```

### 系统监控

#### Node Exporter配置

```bash
# 安装Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.1.linux-amd64.tar.gz
cd node_exporter-1.6.1.linux-amd64
./node_exporter

# 或使用systemd管理
sudo vim /etc/systemd/system/node_exporter.service
```

**systemd服务配置**:
```ini
[Unit]
Description=Node Exporter
After=network.target

[Service]
Type=simple
User=prometheus
ExecStart=/usr/local/bin/node_exporter
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 启动服务
sudo systemctl start node_exporter
sudo systemctl enable node_exporter

# 验证
curl http://localhost:9100/metrics
```

#### Prometheus配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'yyc3-cluster'
    environment: 'production'

scrape_configs:
  # 应用监控
  - job_name: 'yyc3-portaisys'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          service: 'yyc3-portaisys'
          environment: 'production'

  # 系统监控
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
        labels:
          service: 'node-exporter'
          environment: 'production'

  # PostgreSQL监控
  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['localhost:9187']
        labels:
          service: 'postgres'
          environment: 'production'

  # Redis监控
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['localhost:9121']
        labels:
          service: 'redis'
          environment: 'production'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']
```

### 数据库监控

#### PostgreSQL Exporter配置

```bash
# 安装PostgreSQL Exporter
docker run -d \
  --name postgres-exporter \
  -p 9187:9187 \
  -e DATA_SOURCE_NAME="postgresql://yyc3:password@localhost:5432/yyc3_prod?sslmode=disable" \
  prometheuscommunity/postgres-exporter

# 验证
curl http://localhost:9187/metrics
```

#### 关键指标

| 指标名称 | 描述 | 告警阈值 |
| --------- | ---- | -------- |
| **pg_stat_database_numbackends** | 活跃连接数 | > 180 |
| **pg_stat_activity_count** | 总连接数 | > 190 |
| **pg_stat_database_blks_hit** | 缓存命中数 | - |
| **pg_stat_database_blks_read** | 缓存未命中数 | - |
| **pg_stat_database_xact_commit** | 提交事务数 | - |
| **pg_stat_database_xact_rollback** | 回滚事务数 | > 100/min |

### 缓存监控

#### Redis Exporter配置

```bash
# 安装Redis Exporter
docker run -d \
  --name redis-exporter \
  -p 9121:9121 \
  -e REDIS_ADDR=redis://localhost:6379 \
  -e REDIS_PASSWORD=your_password \
  oliver006/redis_exporter

# 验证
curl http://localhost:9121/metrics
```

#### 关键指标

| 指标名称 | 描述 | 告警阈值 |
| --------- | ---- | -------- |
| **redis_up** | Redis是否在线 | = 0 |
| **redis_connected_clients** | 连接的客户端数 | > 1000 |
| **redis_used_memory_bytes** | 已使用内存 | > 4GB |
| **redis_keyspace_hits** | 缓存命中数 | - |
| **redis_keyspace_misses** | 缓存未命中数 | - |
| **redis_commands_processed_total** | 处理的命令总数 | - |

---

## 告警配置

### AlertManager配置

```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@your-domain.com'
  smtp_auth_username: 'alerts@your-domain.com'
  smtp_auth_password: 'your-password'

templates:
  - '/etc/alertmanager/templates/*.tmpl'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'

  routes:
    - match:
        severity: 'critical'
      receiver: 'critical-alerts'
      continue: false

    - match:
        severity: 'warning'
      receiver: 'warning-alerts'
      continue: false

receivers:
  - name: 'default'
    email_configs:
      - to: 'admin@your-domain.com'
        headers:
          Subject: '[YYC³ Alert] {{ .GroupLabels.alertname }}'

  - name: 'critical-alerts'
    email_configs:
      - to: 'admin@your-domain.com'
        headers:
          Subject: '[CRITICAL] {{ .GroupLabels.alertname }}'
    webhook_configs:
      - url: 'https://hooks.slack.com/services/xxxxx'
        send_resolved: true

  - name: 'warning-alerts'
    email_configs:
      - to: 'ops@your-domain.com'
        headers:
          Subject: '[WARNING] {{ .GroupLabels.alertname }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'cluster', 'service']
```

### 告警规则

```yaml
# alerts.yml
groups:
  - name: application
    interval: 30s
    rules:
      # 应用宕机
      - alert: ApplicationDown
        expr: up{job="yyc3-portaisys"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "应用 {{ $labels.instance }} 宕机"
          description: "应用 {{ $labels.instance }} 已宕机超过1分钟"

      # 高错误率
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(http_requests_total{status_code=~"5.."}[5m])) by (instance)
            /
            sum(rate(http_requests_total[5m])) by (instance)
          ) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "实例 {{ $labels.instance }} 错误率过高"
          description: "实例 {{ $labels.instance }} 的错误率超过5%"

      # 响应时间过长
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_ms_bucket[5m])) by (le, instance)
          ) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "实例 {{ $labels.instance }} 响应时间过长"
          description: "实例 {{ $labels.instance }} 的95分位响应时间超过1秒"

  - name: database
    interval: 30s
    rules:
      # 数据库连接数过高
      - alert: HighDatabaseConnections
        expr: pg_stat_activity_count > 180
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "数据库连接数过高"
          description: "数据库连接数为 {{ $value }}，超过阈值180"

      # 数据库宕机
      - alert: DatabaseDown
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "数据库宕机"
          description: "数据库 {{ $labels.instance }} 已宕机"

  - name: cache
    interval: 30s
    rules:
      # Redis宕机
      - alert: RedisDown
        expr: redis_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis宕机"
          description: "Redis {{ $labels.instance }} 已宕机"

      # Redis内存使用过高
      - alert: HighRedisMemoryUsage
        expr: |
          (redis_used_memory_bytes / redis_memory_max_bytes) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis内存使用过高"
          description: "Redis {{ $labels.instance }} 内存使用率为 {{ $value | humanizePercentage }}"

  - name: system
    interval: 30s
    rules:
      # CPU使用率过高
      - alert: HighCPUUsage
        expr: |
          100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU使用率过高"
          description: "实例 {{ $labels.instance }} CPU使用率为 {{ $value }}%"

      # 内存使用率过高
      - alert: HighMemoryUsage
        expr: |
          (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "内存使用率过高"
          description: "实例 {{ $labels.instance }} 内存使用率为 {{ $value }}%"

      # 磁盘使用率过高
      - alert: HighDiskUsage
        expr: |
          (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "磁盘使用率过高"
          description: "实例 {{ $labels.instance }} 磁盘使用率为 {{ $value }}%"
```

---

## 指标说明

### 应用指标

#### HTTP请求指标

| 指标名称 | 类型 | 描述 |
| --------- | ---- | ---- |
| **http_requests_total** | Counter | HTTP请求总数 |
| **http_request_duration_ms** | Histogram | HTTP请求持续时间 |
| **http_requests_in_flight** | Gauge | 当前正在处理的请求数 |

#### 数据库指标

| 指标名称 | 类型 | 描述 |
| --------- | ---- | ---- |
| **db_queries_total** | Counter | 数据库查询总数 |
| **db_query_duration_ms** | Histogram | 数据库查询持续时间 |
| **db_connections_active** | Gauge | 活跃数据库连接数 |

#### AI调用指标

| 指标名称 | 类型 | 描述 |
| --------- | ---- | ---- |
| **ai_calls_total** | Counter | AI调用总数 |
| **ai_call_duration_ms** | Histogram | AI调用持续时间 |
| **ai_call_errors_total** | Counter | AI调用错误总数 |

### 系统指标

#### CPU指标

| 指标名称 | 类型 | 描述 |
| --------- | ---- | ---- |
| **node_cpu_seconds_total** | Counter | CPU时间累计 |
| **node_load1** | Gauge | 1分钟平均负载 |
| **node_load5** | Gauge | 5分钟平均负载 |
| **node_load15** | Gauge | 15分钟平均负载 |

#### 内存指标

| 指标名称 | 类型 | 描述 |
| --------- | ---- | ---- |
| **node_memory_MemTotal_bytes** | Gauge | 总内存 |
| **node_memory_MemAvailable_bytes** | Gauge | 可用内存 |
| **node_memory_MemUsed_bytes** | Gauge | 已用内存 |

#### 磁盘指标

| 指标名称 | 类型 | 描述 |
| --------- | ---- | ---- |
| **node_filesystem_size_bytes** | Gauge | 文件系统总大小 |
| **node_filesystem_avail_bytes** | Gauge | 文件系统可用空间 |
| **node_filesystem_used_bytes** | Gauge | 文件系统已用空间 |

---

## 仪表盘

### Grafana配置

#### 导入仪表盘

```bash
# 下载YYC³仪表盘
wget https://raw.githubusercontent.com/YYC-Cube/YYC3-PortAISys/main/grafana/dashboards/yyc3-overview.json

# 通过Grafana UI导入
# Grafana -> Dashboards -> Import -> Upload JSON file
```

#### 自定义仪表盘

```json
{
  "dashboard": {
    "title": "YYC³ 应用监控",
    "panels": [
      {
        "title": "HTTP请求速率",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (status_code)"
          }
        ],
        "type": "graph"
      },
      {
        "title": "HTTP请求持续时间",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (le))"
          }
        ],
        "type": "graph"
      },
      {
        "title": "数据库连接数",
        "targets": [
          {
            "expr": "pg_stat_activity_count"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Redis命中率",
        "targets": [
          {
            "expr": "redis_keyspace_hits / (redis_keyspace_hits + redis_keyspace_misses)"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
```

---

## 最佳实践

### 监控策略

1. **分层监控**: 应用、系统、网络分层监控
2. **关键指标**: 聚焦关键业务指标
3. **合理阈值**: 设置合理的告警阈值
4. **告警分级**: 按严重程度分级告警
5. **定期审查**: 定期审查和优化监控规则

### 告警管理

1. **告警聚合**: 相似告警聚合处理
2. **告警抑制**: 抑制重复告警
3. **告警路由**: 合理路由告警到不同接收者
4. **告警确认**: 及时确认和处理告警
5. **告警回顾**: 定期回顾告警处理情况

### 性能优化

1. **采样率**: 合理设置指标采样率
2. **数据保留**: 合理设置数据保留时间
3. **查询优化**: 优化Prometheus查询
4. **缓存**: 使用缓存提高查询性能
5. **分片**: 大规模部署使用分片

---

## 下一步

- [故障排除指南](./24-故障排除指南.md) - 故障排除
- [性能优化指南](./21-性能优化指南.md) - 性能优化
- [安全管理指南](./19-安全管理指南.md) - 安全管理

---
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
