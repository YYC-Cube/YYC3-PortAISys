# YYC³ PortAISys - 数据分析API

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

- [数据分析API概述](#数据分析api概述)
- [数据查询](#数据查询)
- [数据聚合](#数据聚合)
- [数据可视化](#数据可视化)
- [数据导出](#数据导出)
- [报表生成](#报表生成)

---

## 数据分析API概述

### API简介

YYC³ PortAISys数据分析API提供完整的数据分析功能，包括数据查询、聚合、可视化、导出和报表生成等功能。支持多种数据源，包括数据库、文件、API等。

### 支持的数据源

| 数据源 | 描述 | 支持的操作 |
|--------|------|-----------|
| **PostgreSQL** | 关系型数据库 | 查询、聚合 |
| **MySQL** | 关系型数据库 | 查询、聚合 |
| **MongoDB** | 文档数据库 | 查询、聚合 |
| **CSV** | CSV文件 | 查询、聚合 |
| **JSON** | JSON文件 | 查询、聚合 |
| **API** | 外部API | 查询、聚合 |

### 核心功能

- **数据查询**: 灵活的数据查询功能
- **数据聚合**: 多种聚合函数和分组
- **数据可视化**: 多种图表类型
- **数据导出**: 支持多种导出格式
- **报表生成**: 自动化报表生成
- **实时分析**: 实时数据分析

---

## 数据查询

### 执行查询

**端点**: `POST /v1/analytics/query`

**描述**: 执行数据查询。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "dataSource": "postgresql",
  "connection": {
    "host": "db.yyc3.com",
    "port": 5432,
    "database": "analytics",
    "table": "users"
  },
  "query": {
    "type": "select",
    "fields": ["id", "name", "email", "createdAt"],
    "filter": {
      "operator": "and",
      "conditions": [
        {
          "field": "status",
          "operator": "eq",
          "value": "active"
        },
        {
          "field": "createdAt",
          "operator": "gte",
          "value": "2026-01-01T00:00:00.000Z"
        }
      ]
    },
    "sort": [
      {
        "field": "createdAt",
        "order": "desc"
      }
    ],
    "limit": 100,
    "offset": 0
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **dataSource** | string | 是 | 数据源类型（postgresql、mysql、mongodb、csv、json、api） |
| **connection** | object | 是 | 数据源连接信息 |
| **query** | object | 是 | 查询配置 |
| **query.type** | string | 是 | 查询类型（select、count、distinct） |
| **query.fields** | array | 否 | 查询字段 |
| **query.filter** | object | 否 | 过滤条件 |
| **query.sort** | array | 否 | 排序配置 |
| **query.limit** | number | 否 | 返回数量限制 |
| **query.offset** | number | 否 | 偏移量 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "user-1",
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2026-02-03T12:00:00.000Z"
      },
      {
        "id": "user-2",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "createdAt": "2026-02-02T12:00:00.000Z"
      }
    ],
    "total": 150,
    "limit": 100,
    "offset": 0,
    "executionTime": 0.05
  },
  "message": "查询成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 高级查询

**端点**: `POST /v1/analytics/query/advanced`

**描述**: 执行高级数据查询，支持JOIN、子查询等。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "dataSource": "postgresql",
  "connection": {
    "host": "db.yyc3.com",
    "port": 5432,
    "database": "analytics"
  },
  "query": {
    "type": "select",
    "fields": [
      "users.id",
      "users.name",
      "users.email",
      "orders.id as orderId",
      "orders.total",
      "orders.createdAt as orderDate"
    ],
    "joins": [
      {
        "type": "left",
        "table": "orders",
        "on": {
          "left": "users.id",
          "right": "orders.userId"
        }
      }
    ],
    "filter": {
      "operator": "and",
      "conditions": [
        {
          "field": "users.status",
          "operator": "eq",
          "value": "active"
        },
        {
          "field": "orders.createdAt",
          "operator": "gte",
          "value": "2026-01-01T00:00:00.000Z"
        }
      ]
    },
    "sort": [
      {
        "field": "orders.createdAt",
        "order": "desc"
      }
    ],
    "limit": 100
  }
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "user-1",
        "name": "John Doe",
        "email": "john@example.com",
        "orderId": "order-1",
        "total": 100.00,
        "orderDate": "2026-02-03T12:00:00.000Z"
      }
    ],
    "total": 200,
    "limit": 100,
    "executionTime": 0.15
  },
  "message": "高级查询成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 数据聚合

### 执行聚合

**端点**: `POST /v1/analytics/aggregate`

**描述**: 执行数据聚合操作。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "dataSource": "postgresql",
  "connection": {
    "host": "db.yyc3.com",
    "port": 5432,
    "database": "analytics",
    "table": "orders"
  },
  "aggregation": {
    "type": "group",
    "groupBy": ["category"],
    "aggregations": [
      {
        "field": "total",
        "function": "sum",
        "alias": "totalSales"
      },
      {
        "field": "total",
        "function": "avg",
        "alias": "avgOrderValue"
      },
      {
        "field": "id",
        "function": "count",
        "alias": "orderCount"
      }
    ],
    "filter": {
      "operator": "and",
      "conditions": [
        {
          "field": "createdAt",
          "operator": "gte",
          "value": "2026-01-01T00:00:00.000Z"
        }
      ]
    },
    "sort": [
      {
        "field": "totalSales",
        "order": "desc"
      }
    ],
    "limit": 10
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **dataSource** | string | 是 | 数据源类型 |
| **connection** | object | 是 | 数据源连接信息 |
| **aggregation** | object | 是 | 聚合配置 |
| **aggregation.type** | string | 是 | 聚合类型（group、time） |
| **aggregation.groupBy** | array | 否 | 分组字段 |
| **aggregation.aggregations** | array | 是 | 聚合函数列表 |
| **aggregation.filter** | object | 否 | 过滤条件 |
| **aggregation.sort** | array | 否 | 排序配置 |
| **aggregation.limit** | number | 否 | 返回数量限制 |

**支持的聚合函数**:

| 函数 | 描述 | 适用类型 |
|------|------|----------|
| **sum** | 求和 | 数字 |
| **avg** | 平均值 | 数字 |
| **min** | 最小值 | 数字、日期 |
| **max** | 最大值 | 数字、日期 |
| **count** | 计数 | 任意 |
| **distinct** | 去重计数 | 任意 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "category": "electronics",
        "totalSales": 50000.00,
        "avgOrderValue": 250.00,
        "orderCount": 200
      },
      {
        "category": "clothing",
        "totalSales": 35000.00,
        "avgOrderValue": 175.00,
        "orderCount": 200
      }
    ],
    "total": 5,
    "limit": 10,
    "executionTime": 0.08
  },
  "message": "聚合成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 时间序列聚合

**端点**: `POST /v1/analytics/aggregate/time-series`

**描述**: 执行时间序列聚合。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "dataSource": "postgresql",
  "connection": {
    "host": "db.yyc3.com",
    "port": 5432,
    "database": "analytics",
    "table": "orders"
  },
  "aggregation": {
    "type": "time",
    "timeField": "createdAt",
    "interval": "day",
    "aggregations": [
      {
        "field": "total",
        "function": "sum",
        "alias": "totalSales"
      },
      {
        "field": "id",
        "function": "count",
        "alias": "orderCount"
      }
    ],
    "filter": {
      "operator": "and",
      "conditions": [
        {
          "field": "createdAt",
          "operator": "gte",
          "value": "2026-01-01T00:00:00.000Z"
        },
        {
          "field": "createdAt",
          "operator": "lte",
          "value": "2026-01-31T23:59:59.999Z"
        }
      ]
    },
    "sort": [
      {
        "field": "time",
        "order": "asc"
      }
    ]
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **aggregation.type** | string | 是 | 聚合类型，固定为"time" |
| **aggregation.timeField** | string | 是 | 时间字段 |
| **aggregation.interval** | string | 是 | 时间间隔（minute、hour、day、week、month、year） |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "time": "2026-01-01T00:00:00.000Z",
        "totalSales": 1500.00,
        "orderCount": 10
      },
      {
        "time": "2026-01-02T00:00:00.000Z",
        "totalSales": 1800.00,
        "orderCount": 12
      }
    ],
    "total": 31,
    "executionTime": 0.12
  },
  "message": "时间序列聚合成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 数据可视化

### 创建图表

**端点**: `POST /v1/analytics/visualizations`

**描述**: 创建数据可视化图表。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "销售趋势图",
  "description": "按日期显示销售趋势",
  "type": "line",
  "dataSource": "postgresql",
  "connection": {
    "host": "db.yyc3.com",
    "port": 5432,
    "database": "analytics",
    "table": "orders"
  },
  "query": {
    "aggregation": {
      "type": "time",
      "timeField": "createdAt",
      "interval": "day",
      "aggregations": [
        {
          "field": "total",
          "function": "sum",
          "alias": "totalSales"
        }
      ],
      "filter": {
        "operator": "and",
        "conditions": [
          {
            "field": "createdAt",
            "operator": "gte",
            "value": "2026-01-01T00:00:00.000Z"
          },
          {
            "field": "createdAt",
            "operator": "lte",
            "value": "2026-01-31T23:59:59.999Z"
          }
        ]
      }
    }
  },
  "config": {
    "xAxis": {
      "field": "time",
      "label": "日期",
      "type": "datetime"
    },
    "yAxis": {
      "field": "totalSales",
      "label": "销售额",
      "type": "number"
    },
    "series": [
      {
        "name": "销售额",
        "color": "#3b82f6",
        "lineWidth": 2
      }
    ],
    "options": {
      "showLegend": true,
      "showGrid": true,
      "showTooltip": true
    }
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **name** | string | 是 | 图表名称 |
| **description** | string | 否 | 图表描述 |
| **type** | string | 是 | 图表类型（line、bar、pie、scatter、area） |
| **dataSource** | string | 是 | 数据源类型 |
| **connection** | object | 是 | 数据源连接信息 |
| **query** | object | 是 | 查询配置 |
| **config** | object | 是 | 图表配置 |

**支持的图表类型**:

| 类型 | 描述 | 适用场景 |
|------|------|----------|
| **line** | 折线图 | 趋势分析 |
| **bar** | 柱状图 | 对比分析 |
| **pie** | 饼图 | 占比分析 |
| **scatter** | 散点图 | 相关性分析 |
| **area** | 面积图 | 趋势分析 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "viz-123",
    "name": "销售趋势图",
    "description": "按日期显示销售趋势",
    "type": "line",
    "config": {},
    "data": [
      {
        "time": "2026-01-01T00:00:00.000Z",
        "totalSales": 1500.00
      },
      {
        "time": "2026-01-02T00:00:00.000Z",
        "totalSales": 1800.00
      }
    ],
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "图表创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取图表

**端点**: `GET /v1/analytics/visualizations/{vizId}`

**描述**: 获取指定图表的数据和配置。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**查询参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **refresh** | boolean | 否 | 是否刷新数据，默认false |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "viz-123",
    "name": "销售趋势图",
    "description": "按日期显示销售趋势",
    "type": "line",
    "config": {
      "xAxis": {
        "field": "time",
        "label": "日期",
        "type": "datetime"
      },
      "yAxis": {
        "field": "totalSales",
        "label": "销售额",
        "type": "number"
      },
      "series": [
        {
          "name": "销售额",
          "color": "#3b82f6",
          "lineWidth": 2
        }
      ]
    },
    "data": [
      {
        "time": "2026-01-01T00:00:00.000Z",
        "totalSales": 1500.00
      },
      {
        "time": "2026-01-02T00:00:00.000Z",
        "totalSales": 1800.00
      }
    ],
    "updatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "获取图表成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 数据导出

### 导出数据

**端点**: `POST /v1/analytics/export`

**描述**: 导出查询结果。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "dataSource": "postgresql",
  "connection": {
    "host": "db.yyc3.com",
    "port": 5432,
    "database": "analytics",
    "table": "orders"
  },
  "query": {
    "type": "select",
    "fields": ["id", "total", "createdAt"],
    "filter": {
      "operator": "and",
      "conditions": [
        {
          "field": "createdAt",
          "operator": "gte",
          "value": "2026-01-01T00:00:00.000Z"
        }
      ]
    },
    "limit": 10000
  },
  "export": {
    "format": "csv",
    "filename": "orders-export",
    "includeHeader": true,
    "delimiter": ",",
    "encoding": "utf-8"
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **dataSource** | string | 是 | 数据源类型 |
| **connection** | object | 是 | 数据源连接信息 |
| **query** | object | 是 | 查询配置 |
| **export** | object | 是 | 导出配置 |
| **export.format** | string | 是 | 导出格式（csv、json、excel、parquet） |
| **export.filename** | string | 是 | 文件名 |
| **export.includeHeader** | boolean | 否 | 是否包含表头，默认true |
| **export.delimiter** | string | 否 | 分隔符，默认"," |
| **export.encoding** | string | 否 | 编码，默认"utf-8" |

**支持的导出格式**:

| 格式 | 描述 | 文件扩展名 |
|------|------|-----------|
| **csv** | CSV格式 | .csv |
| **json** | JSON格式 | .json |
| **excel** | Excel格式 | .xlsx |
| **parquet** | Parquet格式 | .parquet |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "exportId": "export-123",
    "filename": "orders-export.csv",
    "format": "csv",
    "size": 1024000,
    "rowCount": 10000,
    "downloadUrl": "https://api.yyc3.com/v1/analytics/exports/export-123/download",
    "expiresAt": "2026-02-03T13:00:00.000Z"
  },
  "message": "导出成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 下载导出文件

**端点**: `GET /v1/analytics/exports/{exportId}/download`

**描述**: 下载导出的文件。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
X-Request-ID: <unique-request-id>
```

**成功响应** (200):

```
id,total,createdAt
order-1,100.00,2026-01-01T12:00:00.000Z
order-2,150.00,2026-01-02T12:00:00.000Z
```

---

## 报表生成

### 创建报表

**端点**: `POST /v1/analytics/reports`

**描述**: 创建新的报表。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "name": "月度销售报表",
  "description": "每月销售数据汇总",
  "type": "scheduled",
  "schedule": {
    "frequency": "monthly",
    "dayOfMonth": 1,
    "time": "09:00"
  },
  "visualizations": [
    {
      "type": "line",
      "name": "销售趋势",
      "dataSource": "postgresql",
      "connection": {
        "host": "db.yyc3.com",
        "port": 5432,
        "database": "analytics",
        "table": "orders"
      },
      "query": {
        "aggregation": {
          "type": "time",
          "timeField": "createdAt",
          "interval": "day",
          "aggregations": [
            {
              "field": "total",
              "function": "sum",
              "alias": "totalSales"
            }
          ]
        }
      }
    },
    {
      "type": "bar",
      "name": "分类销售",
      "dataSource": "postgresql",
      "connection": {
        "host": "db.yyc3.com",
        "port": 5432,
        "database": "analytics",
        "table": "orders"
      },
      "query": {
        "aggregation": {
          "type": "group",
          "groupBy": ["category"],
          "aggregations": [
            {
              "field": "total",
              "function": "sum",
              "alias": "totalSales"
            }
          ]
        }
      }
    }
  ],
  "notifications": {
    "email": {
      "enabled": true,
      "recipients": ["admin@example.com"],
      "subject": "月度销售报表"
    },
    "webhook": {
      "enabled": true,
      "url": "https://your-app.com/webhook/report"
    }
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **name** | string | 是 | 报表名称 |
| **description** | string | 否 | 报表描述 |
| **type** | string | 是 | 报表类型（manual、scheduled） |
| **schedule** | object | 否 | 调度配置（type=scheduled时必填） |
| **visualizations** | array | 是 | 可视化图表列表 |
| **notifications** | object | 否 | 通知配置 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "report-123",
    "name": "月度销售报表",
    "description": "每月销售数据汇总",
    "type": "scheduled",
    "schedule": {
      "frequency": "monthly",
      "dayOfMonth": 1,
      "time": "09:00",
      "nextRunAt": "2026-03-01T09:00:00.000Z"
    },
    "visualizations": [],
    "notifications": {
      "email": {
        "enabled": true,
        "recipients": ["admin@example.com"],
        "subject": "月度销售报表"
      },
      "webhook": {
        "enabled": true,
        "url": "https://your-app.com/webhook/report"
      }
    },
    "status": "active",
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "报表创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 生成报表

**端点**: `POST /v1/analytics/reports/{reportId}/generate`

**描述**: 手动生成报表。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "params": {
    "startDate": "2026-01-01T00:00:00.000Z",
    "endDate": "2026-01-31T23:59:59.999Z"
  }
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "reportId": "report-123",
    "generationId": "gen-456",
    "status": "completed",
    "visualizations": [
      {
        "id": "viz-1",
        "type": "line",
        "name": "销售趋势",
        "data": []
      },
      {
        "id": "viz-2",
        "type": "bar",
        "name": "分类销售",
        "data": []
      }
    ],
    "summary": {
      "totalSales": 50000.00,
      "totalOrders": 200,
      "averageOrderValue": 250.00
    },
    "downloadUrl": "https://api.yyc3.com/v1/analytics/reports/report-123/generations/gen-456/download",
    "generatedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "报表生成成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 最佳实践

### 查询优化

1. **使用索引**: 为常用查询字段创建索引
2. **限制结果**: 使用limit限制返回结果数量
3. **过滤数据**: 在查询前尽可能过滤数据
4. **避免SELECT ***: 只查询需要的字段
5. **使用聚合**: 使用聚合函数减少数据传输

### 性能优化

1. **缓存结果**: 缓存常用查询结果
2. **异步执行**: 对于长时间运行的查询使用异步执行
3. **分页查询**: 使用分页避免一次性加载大量数据
4. **批量操作**: 使用批量操作减少API调用
5. **监控性能**: 监控查询性能，优化慢查询

### 安全考虑

1. **输入验证**: 验证所有查询参数
2. **访问控制**: 实施适当的访问控制
3. **数据脱敏**: 敏感数据脱敏处理
4. **审计日志**: 记录所有查询操作
5. **限制资源**: 限制查询资源使用

---

## 下一步

- [AI智能体API](./03-AI智能体API.md) - 学习AI相关API
- [工作流API](./04-工作流API.md) - 学习工作流相关API
- [用户管理API](./06-用户管理API.md) - 学习用户管理API

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
