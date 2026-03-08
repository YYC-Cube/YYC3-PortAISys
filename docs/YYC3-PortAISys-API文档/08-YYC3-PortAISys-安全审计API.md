---
@file: 08-YYC3-PortAISys-安全审计API.md
@description: YYC³ PortAISys 安全审计 API 文档，提供安全事件记录、审计日志和合规检查功能
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: api,restful,critical,zh-CN
@category: api
@language: zh-CN
@base_url: https://api.yyc3.com/v1
@authentication: oauth2
@audience: developers
@complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ PortAISys - 安全审计API


## 📋 目录

- [安全审计API概述](#安全审计api概述)
- [审计日志](#审计日志)
- [安全事件](#安全事件)
- [合规报告](#合规报告)
- [风险评估](#风险评估)
- [审计配置](#审计配置)

---

## 安全审计API概述

### API简介

YYC³ PortAISys安全审计API提供完整的安全审计功能，包括审计日志、安全事件、合规报告、风险评估和审计配置等功能。支持多种合规标准，包括GDPR、SOC 2、ISO 27001等。

### 核心功能

- **审计日志**: 记录所有系统操作
- **安全事件**: 检测和响应安全事件
- **合规报告**: 生成合规性报告
- **风险评估**: 评估系统安全风险
- **审计配置**: 配置审计策略

### 支持的合规标准

| 标准 | 描述 | 适用场景 |
|------|------|----------|
| **GDPR** | 通用数据保护条例 | 欧洲数据保护 |
| **SOC 2** | 服务组织控制2 | 美国数据安全 |
| **ISO 27001** | 信息安全管理体系 | 国际信息安全 |
| **HIPAA** | 健康保险便携性和责任法案 | 医疗数据保护 |
| **PCI DSS** | 支付卡行业数据安全标准 | 支付数据处理 |

---

## 审计日志

### 查询审计日志

**端点**: `GET /v1/audit/logs`

**描述**: 查询审计日志。

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
| **userId** | string | 否 | 用户ID |
| **action** | string | 否 | 操作类型 |
| **resource** | string | 否 | 资源类型 |
| **startDate** | string | 否 | 开始日期 |
| **endDate** | string | 否 | 结束日期 |
| **ip** | string | 否 | IP地址 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "audit-1",
        "userId": "user-123",
        "userName": "John Doe",
        "action": "create",
        "resource": "workflow",
        "resourceId": "workflow-456",
        "resourceName": "AI内容生成工作流",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "result": "success",
        "details": {
          "workflowName": "AI内容生成工作流",
          "nodeCount": 4
        },
        "createdAt": "2026-02-03T12:00:00.000Z"
      },
      {
        "id": "audit-2",
        "userId": "user-123",
        "userName": "John Doe",
        "action": "delete",
        "resource": "user",
        "resourceId": "user-789",
        "resourceName": "Jane Doe",
        "ip": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "result": "success",
        "details": {},
        "createdAt": "2026-02-03T11:30:00.000Z"
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
  "message": "查询审计日志成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取审计日志详情

**端点**: `GET /v1/audit/logs/{auditId}`

**描述**: 获取指定审计日志的详细信息。

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
    "id": "audit-1",
    "userId": "user-123",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "action": "create",
    "resource": "workflow",
    "resourceId": "workflow-456",
    "resourceName": "AI内容生成工作流",
    "ip": "192.168.1.1",
    "location": {
      "country": "China",
      "city": "Beijing"
    },
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "result": "success",
    "details": {
      "workflowName": "AI内容生成工作流",
      "nodeCount": 4,
      "edgesCount": 3
    },
    "request": {
      "method": "POST",
      "url": "/v1/workflows",
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "response": {
      "statusCode": 201,
      "body": {
        "success": true,
        "data": {
          "id": "workflow-456"
        }
      }
    },
    "duration": 150,
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "获取审计日志详情成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 导出审计日志

**端点**: `POST /v1/audit/logs/export`

**描述**: 导出审计日志。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "filter": {
    "startDate": "2026-02-01T00:00:00.000Z",
    "endDate": "2026-02-03T23:59:59.999Z",
    "action": "create"
  },
  "format": "csv",
  "includeDetails": false
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **filter** | object | 否 | 过滤条件 |
| **format** | string | 否 | 导出格式（csv、json、excel），默认csv |
| **includeDetails** | boolean | 否 | 是否包含详细信息，默认false |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "exportId": "export-123",
    "format": "csv",
    "recordCount": 1500,
    "downloadUrl": "https://api.yyc3.com/v1/audit/exports/export-123/download",
    "expiresAt": "2026-02-03T13:00:00.000Z"
  },
  "message": "审计日志导出成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 安全事件

### 查询安全事件

**端点**: `GET /v1/security/events`

**描述**: 查询安全事件。

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
| **severity** | string | 否 | 严重程度（low、medium、high、critical） |
| **type** | string | 否 | 事件类型 |
| **status** | string | 否 | 事件状态（open、investigating、resolved、closed） |
| **startDate** | string | 否 | 开始日期 |
| **endDate** | string | 否 | 结束日期 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "event-1",
        "type": "unusual_login",
        "severity": "high",
        "status": "investigating",
        "title": "异常登录检测",
        "description": "用户从异常位置登录",
        "userId": "user-123",
        "userName": "John Doe",
        "ip": "192.168.1.1",
        "location": {
          "country": "China",
          "city": "Beijing"
        },
        "details": {
          "previousLocation": "United States, New York",
          "distance": 11000,
          "timeDifference": 2
        },
        "createdAt": "2026-02-03T12:00:00.000Z",
        "updatedAt": "2026-02-03T12:30:00.000Z"
      },
      {
        "id": "event-2",
        "type": "permission_change",
        "severity": "medium",
        "status": "open",
        "title": "权限变更",
        "description": "用户权限被修改",
        "userId": "user-456",
        "userName": "Jane Doe",
        "changedBy": "admin@example.com",
        "details": {
          "addedPermissions": ["user:delete"],
          "removedPermissions": []
        },
        "createdAt": "2026-02-03T11:00:00.000Z",
        "updatedAt": "2026-02-03T11:00:00.000Z"
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
  "message": "查询安全事件成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取安全事件详情

**端点**: `GET /v1/security/events/{eventId}`

**描述**: 获取指定安全事件的详细信息。

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
    "id": "event-1",
    "type": "unusual_login",
    "severity": "high",
    "status": "investigating",
    "title": "异常登录检测",
    "description": "用户从异常位置登录",
    "userId": "user-123",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "ip": "192.168.1.1",
    "location": {
      "country": "China",
      "city": "Beijing",
      "latitude": 39.9042,
      "longitude": 116.4074
    },
    "details": {
      "previousLocation": "United States, New York",
      "previousLatitude": 40.7128,
      "previousLongitude": -74.0060,
      "distance": 11000,
      "timeDifference": 2,
      "device": {
        "type": "desktop",
        "os": "Windows",
        "browser": "Chrome"
      }
    },
    "investigation": {
      "assignedTo": "security@example.com",
      "notes": [
        {
          "author": "security@example.com",
          "content": "已联系用户确认",
          "createdAt": "2026-02-03T12:30:00.000Z"
        }
      ],
      "status": "in_progress"
    },
    "createdAt": "2026-02-03T12:00:00.000Z",
    "updatedAt": "2026-02-03T12:30:00.000Z"
  },
  "message": "获取安全事件详情成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 更新安全事件状态

**端点**: `PUT /v1/security/events/{eventId}/status`

**描述**: 更新安全事件状态。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "status": "resolved",
  "resolution": "用户确认是本人登录，误报",
  "note": "已与用户确认，登录行为正常"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **status** | string | 是 | 事件状态（open、investigating、resolved、closed） |
| **resolution** | string | 否 | 解决方案 |
| **note** | string | 否 | 备注 |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "event-1",
    "status": "resolved",
    "resolution": "用户确认是本人登录，误报",
    "updatedAt": "2026-02-03T13:00:00.000Z"
  },
  "message": "安全事件状态更新成功",
  "timestamp": "2026-02-03T13:00:00.000Z"
}
```

---

## 合规报告

### 生成合规报告

**端点**: `POST /v1/compliance/reports`

**描述**: 生成合规性报告。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "standard": "GDPR",
  "reportType": "full",
  "period": {
    "startDate": "2026-01-01T00:00:00.000Z",
    "endDate": "2026-01-31T23:59:59.999Z"
  },
  "scope": {
    "includeUsers": true,
    "includeWorkflows": true,
    "includeAuditLogs": true,
    "includeSecurityEvents": true
  }
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| **standard** | string | 是 | 合规标准（GDPR、SOC2、ISO27001、HIPAA、PCIDSS） |
| **reportType** | string | 是 | 报告类型（summary、full） |
| **period** | object | 是 | 报告周期 |
| **scope** | object | 否 | 报告范围 |

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "reportId": "report-123",
    "standard": "GDPR",
    "reportType": "full",
    "period": {
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-01-31T23:59:59.999Z"
    },
    "status": "generating",
    "createdAt": "2026-02-03T12:00:00.000Z",
    "estimatedCompletionAt": "2026-02-03T12:05:00.000Z"
  },
  "message": "合规报告生成中",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 获取合规报告

**端点**: `GET /v1/compliance/reports/{reportId}`

**描述**: 获取指定合规报告。

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
    "reportId": "report-123",
    "standard": "GDPR",
    "reportType": "full",
    "period": {
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-01-31T23:59:59.999Z"
    },
    "status": "completed",
    "summary": {
      "overallCompliance": 95,
      "dataProtection": 98,
      "accessControl": 92,
      "auditLogging": 100,
      "incidentResponse": 90
    },
    "findings": [
      {
        "id": "finding-1",
        "category": "data_protection",
        "severity": "medium",
        "description": "部分用户数据未加密存储",
        "recommendation": "对敏感数据实施加密存储",
        "affectedResources": [
          "users.phone",
          "users.address"
        ]
      },
      {
        "id": "finding-2",
        "category": "access_control",
        "severity": "low",
        "description": "部分用户拥有过多权限",
        "recommendation": "定期审查用户权限",
        "affectedUsers": [
          "user-123",
          "user-456"
        ]
      }
    ],
    "downloadUrl": "https://api.yyc3.com/v1/compliance/reports/report-123/download",
    "createdAt": "2026-02-03T12:00:00.000Z",
    "completedAt": "2026-02-03T12:05:00.000Z"
  },
  "message": "获取合规报告成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 风险评估

### 执行风险评估

**端点**: `POST /v1/security/risk-assessment`

**描述**: 执行系统安全风险评估。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "scope": {
    "includeUsers": true,
    "includeWorkflows": true,
    "includePermissions": true,
    "includeAuditLogs": true
  },
  "options": {
    "checkVulnerabilities": true,
    "checkCompliance": true,
    "checkBestPractices": true
  }
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "assessmentId": "assessment-123",
    "overallRisk": "medium",
    "riskScore": 65,
    "categories": [
      {
        "name": "access_control",
        "risk": "medium",
        "score": 60,
        "findings": [
          {
            "severity": "medium",
            "description": "部分用户拥有过多权限",
            "affectedUsers": 5
          }
        ]
      },
      {
        "name": "data_protection",
        "risk": "low",
        "score": 85,
        "findings": [
          {
            "severity": "low",
            "description": "部分数据未加密",
            "affectedFields": 2
          }
        ]
      },
      {
        "name": "audit_logging",
        "risk": "low",
        "score": 90,
        "findings": []
      },
      {
        "name": "vulnerability",
        "risk": "medium",
        "score": 55,
        "findings": [
          {
            "severity": "high",
            "description": "发现2个高危漏洞",
            "cves": ["CVE-2024-1234", "CVE-2024-5678"]
          }
        ]
      }
    ],
    "recommendations": [
      {
        "priority": "high",
        "category": "vulnerability",
        "description": "修复高危漏洞",
        "actions": [
          "更新系统到最新版本",
          "应用安全补丁"
        ]
      },
      {
        "priority": "medium",
        "category": "access_control",
        "description": "优化权限分配",
        "actions": [
          "审查用户权限",
          "移除不必要的权限"
        ]
      }
    ],
    "assessedAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "风险评估完成",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

---

## 审计配置

### 获取审计配置

**端点**: `GET /v1/audit/config`

**描述**: 获取审计配置。

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
    "logging": {
      "enabled": true,
      "level": "info",
      "retentionDays": 90,
      "logAllActions": false,
      "logSensitiveData": false
    },
    "monitoring": {
      "enabled": true,
      "realTimeAlerts": true,
      "alertThresholds": {
        "failedLoginAttempts": 5,
        "unusualActivity": true,
        "permissionChanges": true
      }
    },
    "compliance": {
      "standards": [
        "GDPR",
        "SOC2"
      ],
      "autoReports": true,
      "reportFrequency": "monthly"
    },
    "storage": {
      "type": "database",
      "backupEnabled": true,
      "backupFrequency": "daily",
      "encryptionEnabled": true
    }
  },
  "message": "获取审计配置成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 更新审计配置

**端点**: `PUT /v1/audit/config`

**描述**: 更新审计配置。

**请求头**:

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

**请求体**:

```json
{
  "logging": {
    "enabled": true,
    "level": "debug",
    "retentionDays": 180,
    "logAllActions": true,
    "logSensitiveData": false
  },
  "monitoring": {
    "enabled": true,
    "realTimeAlerts": true,
    "alertThresholds": {
      "failedLoginAttempts": 3,
      "unusualActivity": true,
      "permissionChanges": true
    }
  }
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "logging": {
      "enabled": true,
      "level": "debug",
      "retentionDays": 180,
      "logAllActions": true,
      "logSensitiveData": false
    },
    "monitoring": {
      "enabled": true,
      "realTimeAlerts": true,
      "alertThresholds": {
        "failedLoginAttempts": 3,
        "unusualActivity": true,
        "permissionChanges": true
      }
    },
    "updatedAt": "2026-02-03T12:30:00.000Z"
  },
  "message": "审计配置更新成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

---

## 最佳实践

### 审计日志

1. **完整记录**: 记录所有关键操作
2. **定期审查**: 定期审查审计日志
3. **长期保存**: 根据合规要求保存日志
4. **加密存储**: 敏感日志加密存储
5. **备份日志**: 定期备份审计日志

### 安全事件

1. **快速响应**: 快速响应安全事件
2. **分类处理**: 按严重程度分类处理
3. **记录过程**: 详细记录处理过程
4. **总结经验**: 总结经验教训
5. **持续改进**: 持续改进安全措施

### 合规报告

1. **定期生成**: 定期生成合规报告
2. **全面覆盖**: 确保覆盖所有合规要求
3. **及时整改**: 及时整改发现的问题
4. **文档记录**: 详细记录整改过程
5. **持续监控**: 持续监控合规状态

---

## 下一步

- [权限管理API](./07-权限管理API.md) - 学习权限管理API
- [系统监控API](./09-系统监控API.md) - 学习系统监控API
- [API使用指南](./22-API使用指南.md) - 学习API使用指南

---
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
