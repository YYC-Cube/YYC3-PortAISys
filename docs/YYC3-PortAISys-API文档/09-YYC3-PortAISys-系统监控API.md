# YYC³ PortAISys - 系统监控API

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

- [系统监控API概述](#系统监控api概述)
- [系统指标](#系统指标)
- [应用指标](#应用指标)
- [告警管理](#告警管理)
- [监控仪表板](#监控仪表板)
- [性能分析](#性能分析)

---

## 系统监控API概述

### API简介

YYC³ PortAISys系统监控API提供完整的系统监控功能，包括系统指标、应用指标、告警管理、监控仪表板和性能分析等功能。支持实时监控和历史数据分析。

### 核心功能

- **系统指标**: CPU、内存、磁盘、网络等系统指标
- **应用指标**: 请求量、响应时间、错误率等应用指标
- **告警管理**: 告警规则配置和告警通知
- **监控仪表板**: 可视化监控仪表板
- **性能分析**: 性能瓶颈分析和优化建议

### 监控指标分类

| 分类 | 指标 | 描述 |
|------|------|------|
| **系统指标** | CPU使用率 | CPU使用百分比 |
| **系统指标** | 内存使用率 | 内存使用百分比 |
| **系统指标** | 磁盘使用率 | 磁盘使用百分比 |
| **系统指标** | 网络流量 | 网络入站和出站流量 |
| **应用指标** | 请求量 | 每秒请求数 |
| **应用指标** | 响应时间 | API响应时间 |
| **应用指标** | 错误率 | 错误请求百分比 |
| **应用指标** | 并发用户数 | 当前在线用户数 |

---

## 系统指标

### 获取系统指标

**端点**: `GET /v1/monitoring/system-metrics`

**描述**: 获取系统指标。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **metrics** | string | 否 | 指标类型，逗号分隔（cpu、memory、disk、network） |
| **period** | string | 否 | 时间周期（1h、6h、24h、7d、30d），默认1h |
| **interval** | string | 否 | 数据间隔（1m、5m、15m、1h），默认5m |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "period": "1h",
    "interval": "5m",
    "metrics": {
      "cpu": [
        {
          "timestamp": "2026-02-03T11:00:00.000Z",
          "value": 45.5
        },
        {
          "timestamp": "2026-02-03T11:05:00.000Z",
          "value": 52.3
        },
        {
          "timestamp": "2026-02-03T11:10:00.000Z",
          "value": 48.7
        }
      ],
      "memory": [
        {
          "timestamp": "2026-02-03T11:00:00.000Z",
          "value": 65.2
        },
        {
          "timestamp": "2026-02-03T11:05:00.000Z",
          "value": 68.5
        },
        {
          "timestamp": "2026-02-03T11:10:00.000Z",
          "value": 66.8
        }
      ],
      "disk": [
        {
          "timestamp": "2026-02-03T11:00:00.000Z",
          "value": 72.1
        },
        {
          "timestamp": "2026-02-03T11:05:00.000Z",
          "value": 72.1
        },
        {
          "timestamp": "2026-02-03T11:10:00.000Z",
          "value": 72.2
        }
      ],
      "network": [
        {
          "timestamp": "2026-02-03T11:00:00.000Z",
          "inbound": 1024.5,
          "outbound": 512.3
        },
        {
          "timestamp": "2026-02-03T11:05:00.000Z",
          "inbound": 1536.7,
          "outbound": 768.4
        },
        {
          "timestamp": "2026-02-03T11:10:00.000Z",
          "inbound": 1280.2,
          "outbound": 640.1
        }
      ]
    },
    "summary": {
      "cpu": {
        "avg": 48.8,
        "max": 52.3,
        "min": 45.5
      },
      "memory": {
        "avg": 66.8,
        "max": 68.5,
        "min": 65.2
      },
      "disk": {
        "avg": 72.1,
        "max": 72.2,
        "min": 72.1
      },
      "network": {
        "avgInbound": 1280.5,
        "avgOutbound": 640.3,
        "maxInbound": 1536.7,
        "maxOutbound": 768.4
      }
    }
  },
  "message": "获取系统指标成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取系统状态

**端点**: `GET /v1/monitoring/system-status`

**描述**: 获取系统当前状态。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "overall": "healthy",
    "components": [
      {
        "name": "API Server",
        "status": "healthy",
        "uptime": 99.95,
        "lastCheck": "2026-02-03T12:00:00.000Z"
      },
      {
        "name": "Database",
        "status": "healthy",
        "uptime": 99.98,
        "lastCheck": "2026-02-03T12:00:00.000Z"
      },
      {
        "name": "Redis Cache",
        "status": "healthy",
        "uptime": 99.99,
        "lastCheck": "2026-02-03T12:00:00.000Z"
      },
      {
        "name": "AI Service",
        "status": "healthy",
        "uptime": 99.90,
        "lastCheck": "2026-02-03T12:00:00.000Z"
      },
      {
        "name": "Message Queue",
        "status": "degraded",
        "uptime": 98.50,
        "lastCheck": "2026-02-03T12:00:00.000Z",
        "message": "High latency detected"
      }
    ],
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "message": "获取系统状态成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 应用指标

### 获取应用指标

**端点**: `GET /v1/monitoring/app-metrics`

**描述**: 获取应用指标。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **metrics** | string | 否 | 指标类型，逗号分隔（requests、response_time、error_rate、concurrent_users） |
| **period** | string | 否 | 时间周期（1h、6h、24h、7d、30d），默认1h |
| **interval** | string | 否 | 数据间隔（1m、5m、15m、1h），默认5m |
| **endpoint** | string | 否 | API端点过滤 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "period": "1h",
    "interval": "5m",
    "metrics": {
      "requests": [
        {
          "timestamp": "2026-02-03T11:00:00.000Z",
          "value": 150
        },
        {
          "timestamp": "2026-02-03T11:05:00.000Z",
          "value": 180
        },
        {
          "timestamp": "2026-02-03T11:10:00.000Z",
          "value": 165
        }
      ],
      "response_time": [
        {
          "timestamp": "2026-02-03T11:00:00.000Z",
          "p50": 120,
          "p95": 250,
          "p99": 450
        },
        {
          "timestamp": "2026-02-03T11:05:00.000Z",
          "p50": 135,
          "p95": 280,
          "p99": 520
        },
        {
          "timestamp": "2026-02-03T11:10:00.000Z",
          "p50": 125,
          "p95": 260,
          "p99": 480
        }
      ],
      "error_rate": [
        {
          "timestamp": "2026-02-03T11:00:00.000Z",
          "value": 0.5
        },
        {
          "timestamp": "2026-02-03T11:05:00.000Z",
          "value": 0.8
        },
        {
          "timestamp": "2026-02-03T11:10:00.000Z",
          "value": 0.6
        }
      ],
      "concurrent_users": [
        {
          "timestamp": "2026-02-03T11:00:00.000Z",
          "value": 250
        },
        {
          "timestamp": "2026-02-03T11:05:00.000Z",
          "value": 280
        },
        {
          "timestamp": "2026-02-03T11:10:00.000Z",
          "value": 265
        }
      ]
    },
    "summary": {
      "requests": {
        "total": 495,
        "avg": 165,
        "max": 180,
        "min": 150
      },
      "response_time": {
        "avgP50": 126.7,
        "avgP95": 263.3,
        "avgP99": 483.3
      },
      "error_rate": {
        "avg": 0.63,
        "max": 0.8,
        "min": 0.5
      },
      "concurrent_users": {
        "avg": 265,
        "max": 280,
        "min": 250
      }
    }
  },
  "message": "获取应用指标成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取API端点性能

**端点**: `GET /v1/monitoring/api-performance`

**描述**: 获取API端点性能数据。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **page** | number | 否 | 页码，默认1 |
| **limit** | number | 否 | 每页数量，默认20 |
| **sort** | string | 否 | 排序字段（requests、avg_response_time、error_rate），默认avg_response_time |
| **order** | string | 否 | 排序方向（asc、desc），默认desc |
| **period** | string | 否 | 时间周期（1h、6h、24h、7d），默认24h |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "endpoint": "POST /v1/ai/chat",
        "method": "POST",
        "requests": 5000,
        "avgResponseTime": 250,
        "p95ResponseTime": 450,
        "p99ResponseTime": 800,
        "errorRate": 0.5,
        "throughput": 83.3
      },
      {
        "endpoint": "GET /v1/workflows",
        "method": "GET",
        "requests": 3000,
        "avgResponseTime": 80,
        "p95ResponseTime": 150,
        "p99ResponseTime": 250,
        "errorRate": 0.2,
        "throughput": 50.0
      },
      {
        "endpoint": "POST /v1/workflows/{id}/execute",
        "method": "POST",
        "requests": 2000,
        "avgResponseTime": 5000,
        "p95ResponseTime": 8000,
        "p99ResponseTime": 12000,
        "errorRate": 1.5,
        "throughput": 33.3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "获取API端点性能成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 告警管理

### 创建告警规则

**端点**: `POST /v1/monitoring/alert-rules`

**描述**: 创建新的告警规则。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "CPU使用率过高",
  "description": "当CPU使用率超过80%时触发告警",
  "metric": "cpu",
  "condition": {
    "operator": "gt",
    "threshold": 80,
    "duration": "5m"
  },
  "severity": "high",
  "enabled": true,
  "notifications": {
    "email": {
      "enabled": true,
      "recipients": ["admin@example.com"]
    },
    "webhook": {
      "enabled": true,
      "url": "https://your-app.com/webhook/alert"
    },
    "slack": {
      "enabled": false
    }
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **name** | string | 是 | 告警规则名称 |
| **description** | string | 否 | 告警规则描述 |
| **metric** | string | 是 | 监控指标 |
| **condition** | object | 是 | 告警条件 |
| **severity** | string | 是 | 严重程度（low、medium、high、critical） |
| **enabled** | boolean | 否 | 是否启用，默认true |
| **notifications** | object | 否 | 通知配置 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "alert-rule-123",
    "name": "CPU使用率过高",
    "description": "当CPU使用率超过80%时触发告警",
    "metric": "cpu",
    "condition": {
      "operator": "gt",
      "threshold": 80,
      "duration": "5m"
    },
    "severity": "high",
    "enabled": true,
    "notifications": {
      "email": {
        "enabled": true,
        "recipients": ["admin@example.com"]
      },
      "webhook": {
        "enabled": true,
        "url": "https://your-app.com/webhook/alert"
      },
      "slack": {
        "enabled": false
      }
    },
    "triggeredCount": 0,
    "lastTriggeredAt": null,
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "告警规则创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 列出告警规则

**端点**: `GET /v1/monitoring/alert-rules`

**描述**: 获取告警规则列表。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **page** | number | 否 | 页码，默认1 |
| **limit** | number | 否 | 每页数量，默认20 |
| **metric** | string | 否 | 监控指标 |
| **severity** | string | 否 | 严重程度 |
| **enabled** | boolean | 否 | 是否启用 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "alert-rule-123",
        "name": "CPU使用率过高",
        "description": "当CPU使用率超过80%时触发告警",
        "metric": "cpu",
        "condition": {
          "operator": "gt",
          "threshold": 80,
          "duration": "5m"
        },
        "severity": "high",
        "enabled": true,
        "triggeredCount": 15,
        "lastTriggeredAt": "2026-02-03T11:30:00.000Z",
        "createdAt": "2026-02-01T12:00:00.000Z"
      },
      {
        "id": "alert-rule-456",
        "name": "内存使用率过高",
        "description": "当内存使用率超过90%时触发告警",
        "metric": "memory",
        "condition": {
          "operator": "gt",
          "threshold": 90,
          "duration": "10m"
        },
        "severity": "critical",
        "enabled": true,
        "triggeredCount": 3,
        "lastTriggeredAt": "2026-02-03T10:00:00.000Z",
        "createdAt": "2026-02-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "获取告警规则列表成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取告警历史

**端点**: `GET /v1/monitoring/alerts`

**描述**: 获取告警历史记录。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **page** | number | 否 | 页码，默认1 |
| **limit** | number | 否 | 每页数量，默认20 |
| **ruleId** | string | 否 | 告警规则ID |
| **severity** | string | 否 | 严重程度 |
| **status** | string | 否 | 告警状态（open、acknowledged、resolved） |
| **startDate** | string | 否 | 开始日期 |
| **endDate** | string | 否 | 结束日期 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "alert-123",
        "ruleId": "alert-rule-123",
        "ruleName": "CPU使用率过高",
        "severity": "high",
        "status": "open",
        "value": 85.5,
        "threshold": 80,
        "message": "CPU使用率超过阈值80%，当前值85.5%",
        "triggeredAt": "2026-02-03T11:30:00.000Z",
        "acknowledgedAt": null,
        "resolvedAt": null
      },
      {
        "id": "alert-456",
        "ruleId": "alert-rule-456",
        "ruleName": "内存使用率过高",
        "severity": "critical",
        "status": "resolved",
        "value": 92.3,
        "threshold": 90,
        "message": "内存使用率超过阈值90%，当前值92.3%",
        "triggeredAt": "2026-02-03T10:00:00.000Z",
        "acknowledgedAt": "2026-02-03T10:05:00.000Z",
        "resolvedAt": "2026-02-03T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "message": "获取告警历史成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 确认告警

**端点**: `PUT /v1/monitoring/alerts/{alertId}/acknowledge`

**描述**: 确认告警。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "note": "已确认，正在处理"
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "alert-123",
    "status": "acknowledged",
    "acknowledgedBy": "admin@example.com",
    "acknowledgedAt": "2026-02-03T12:00:00.000Z",
    "note": "已确认，正在处理"
  },
  "message": "告警确认成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 监控仪表板

### 创建仪表板

**端点**: `POST /v1/monitoring/dashboards`

**描述**: 创建新的监控仪表板。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "系统健康仪表板",
  "description": "监控系统整体健康状况",
  "widgets": [
    {
      "id": "widget-1",
      "type": "metric",
      "title": "CPU使用率",
      "metric": "cpu",
      "period": "1h",
      "position": {
        "x": 0,
        "y": 0,
        "w": 6,
        "h": 4
      }
    },
    {
      "id": "widget-2",
      "type": "metric",
      "title": "内存使用率",
      "metric": "memory",
      "period": "1h",
      "position": {
        "x": 6,
        "y": 0,
        "w": 6,
        "h": 4
      }
    },
    {
      "id": "widget-3",
      "type": "chart",
      "title": "请求量趋势",
      "metric": "requests",
      "period": "24h",
      "chartType": "line",
      "position": {
        "x": 0,
        "y": 4,
        "w": 12,
        "h": 6
      }
    }
  ]
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **name** | string | 是 | 仪表板名称 |
| **description** | string | 否 | 仪表板描述 |
| **widgets** | array | 是 | 仪表板组件列表 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "dashboard-123",
    "name": "系统健康仪表板",
    "description": "监控系统整体健康状况",
    "widgets": [],
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "仪表板创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取仪表板

**端点**: `GET /v1/monitoring/dashboards/{dashboardId}`

**描述**: 获取指定仪表板的数据。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "dashboard-123",
    "name": "系统健康仪表板",
    "description": "监控系统整体健康状况",
    "widgets": [
      {
        "id": "widget-1",
        "type": "metric",
        "title": "CPU使用率",
        "metric": "cpu",
        "period": "1h",
        "data": {
          "current": 52.3,
          "avg": 48.8,
          "max": 65.2,
          "min": 42.1
        }
      },
      {
        "id": "widget-2",
        "type": "metric",
        "title": "内存使用率",
        "metric": "memory",
        "period": "1h",
        "data": {
          "current": 68.5,
          "avg": 66.8,
          "max": 72.3,
          "min": 62.5
        }
      },
      {
        "id": "widget-3",
        "type": "chart",
        "title": "请求量趋势",
        "metric": "requests",
        "period": "24h",
        "chartType": "line",
        "data": [
          {
            "timestamp": "2026-02-02T12:00:00.000Z",
            "value": 150
          },
          {
            "timestamp": "2026-02-02T13:00:00.000Z",
            "value": 180
          }
        ]
      }
    ],
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "获取仪表板成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 性能分析

### 执行性能分析

**端点**: `POST /v1/monitoring/performance-analysis`

**描述**: 执行系统性能分析。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "period": {
    "startDate": "2026-02-02T00:00:00.000Z",
    "endDate": "2026-02-03T23:59:59.999Z"
  },
  "scope": {
    "includeSystemMetrics": true,
    "includeAppMetrics": true,
    "includeAPIPerformance": true
  }
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "analysisId": "analysis-123",
    "period": {
      "startDate": "2026-02-02T00:00:00.000Z",
      "endDate": "2026-02-03T23:59:59.999Z"
    },
    "summary": {
      "overallHealth": "good",
      "score": 85,
      "issues": 2,
      "recommendations": 3
    },
    "findings": [
      {
        "category": "system",
        "severity": "medium",
        "title": "CPU使用率峰值过高",
        "description": "在2026-02-03 11:00-11:30期间，CPU使用率达到85%以上",
        "impact": "可能导致API响应时间增加",
        "recommendation": "考虑增加服务器资源或优化CPU密集型任务"
      },
      {
        "category": "api",
        "severity": "low",
        "title": "部分API端点响应时间较长",
        "description": "POST /v1/workflows/{id}/execute的平均响应时间为5秒",
        "impact": "用户体验可能受到影响",
        "recommendation": "优化工作流执行引擎或增加缓存"
      }
    ],
    "recommendations": [
      {
        "priority": "high",
        "category": "system",
        "title": "增加服务器资源",
        "description": "CPU使用率峰值过高，建议增加服务器资源",
        "estimatedImpact": "提升性能30%"
      },
      {
        "priority": "medium",
        "category": "api",
        "title": "优化慢查询",
        "description": "部分API端点响应时间较长，建议优化数据库查询",
        "estimatedImpact": "提升响应时间50%"
      },
      {
        "priority": "low",
        "category": "cache",
        "title": "增加缓存",
        "description": "增加缓存可以减少数据库查询次数",
        "estimatedImpact": "提升性能20%"
      }
    ],
    "analyzedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "性能分析完成",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 最佳实践

### 监控配置

1. **合理阈值**: 设置合理的告警阈值
2. **分级告警**: 根据严重程度分级告警
3. **多渠道通知**: 配置多种通知渠道
4. **定期审查**: 定期审查和优化监控规则
5. **测试告警**: 定期测试告警规则

### 性能优化

1. **持续监控**: 持续监控系统性能
2. **及时响应**: 及时响应性能问题
3. **根因分析**: 深入分析性能问题根因
4. **持续优化**: 持续优化系统性能
5. **容量规划**: 提前进行容量规划

### 告警管理

1. **快速响应**: 快速响应告警
2. **分类处理**: 按严重程度分类处理
3. **记录过程**: 详细记录处理过程
4. **总结经验**: 总结经验教训
5. **优化规则**: 根据实际情况优化告警规则

---

## 下一步

- [安全审计API](./08-安全审计API.md) - 学习安全审计API
- [数据存储API](./10-数据存储API.md) - 学习数据存储API
- [API使用指南](./22-API使用指南.md) - 学习API使用指南

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
