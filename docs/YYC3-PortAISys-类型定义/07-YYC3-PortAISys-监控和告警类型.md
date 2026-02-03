# YYC³ PortAISys - 监控和告警类型

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 监控和告警类型定义包含所有监控指标和告警相关的数据类型和接口。

## 概述

监控和告警类型定义提供了 YYC³ PortAISys 系统中监控指标、告警规则、通知渠道等相关类型。

---

## 监控指标类型

### IMetric

监控指标接口。

```typescript
interface IMetric extends IBaseEntity {
  /**
   * 指标名称
   */
  name: string;

  /**
   * 指标类型
   */
  type: MetricType;

  /**
   * 指标值
   */
  value: number;

  /**
   * 指标单位
   */
  unit?: string;

  /**
   * 指标标签
   */
  labels?: Record<string, string>;

  /**
   * 指标时间戳
   */
  timestamp: Timestamp;

  /**
   * 指标元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const metric: IMetric = {
  id: 'metric-123',
  name: 'cpu_usage',
  type: MetricType.GAUGE,
  value: 75.5,
  unit: '%',
  labels: {
    host: 'server-1',
    region: 'us-east-1'
  },
  timestamp: '2026-02-03T10:00:00.000Z',
  metadata: {
    source: 'prometheus'
  },
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### MetricType

指标类型枚举。

```typescript
enum MetricType {
  /**
   * 仪表盘类型（当前值）
   */
  GAUGE = 'gauge',

  /**
   * 计数器类型（累计值）
   */
  COUNTER = 'counter',

  /**
   * 直方图类型（分布）
   */
  HISTOGRAM = 'histogram',

  /**
   * 摘要类型（统计摘要）
   */
  SUMMARY = 'summary'
}

/**
 * 示例
 */
const metricType: MetricType = MetricType.GAUGE;
```

---

## 告警规则类型

### IAlertRule

告警规则接口。

```typescript
interface IAlertRule extends IBaseEntity {
  /**
   * 规则名称
   */
  name: string;

  /**
   * 规则描述
   */
  description?: string;

  /**
   * 规则条件
   */
  condition: IAlertCondition;

  /**
   * 规则严重级别
   */
  severity: AlertSeverity;

  /**
   * 告警操作列表
   */
  actions: IAlertAction[];

  /**
   * 规则状态
   */
  status: AlertRuleStatus;

  /**
   * 规则标签
   */
  tags?: string[];

  /**
   * 冷却时间（秒）
   */
  cooldown?: number;

  /**
   * 规则元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const alertRule: IAlertRule = {
  id: 'rule-123',
  name: 'CPU 使用率过高告警',
  description: '当 CPU 使用率超过 80% 时触发告警',
  condition: {
    metric: 'cpu_usage',
    operator: 'gt',
    threshold: 80,
    duration: 300
  },
  severity: AlertSeverity.HIGH,
  actions: [
    {
      type: 'email',
      recipients: ['admin@example.com']
    }
  ],
  status: AlertRuleStatus.ACTIVE,
  tags: ['cpu', 'performance'],
  cooldown: 300,
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### IAlertCondition

告警条件接口。

```typescript
interface IAlertCondition {
  /**
   * 指标名称
   */
  metric: string;

  /**
   * 操作符
   */
  operator: AlertOperator;

  /**
   * 阈值
   */
  threshold: number;

  /**
   * 持续时间（秒）
   */
  duration?: number;

  /**
   * 条件标签
   */
  labels?: Record<string, string>;
}

/**
 * 示例
 */
const alertCondition: IAlertCondition = {
  metric: 'cpu_usage',
  operator: AlertOperator.GT,
  threshold: 80,
  duration: 300,
  labels: {
    host: 'server-1'
  }
};
```

### AlertOperator

告警操作符枚举。

```typescript
enum AlertOperator {
  /**
   * 大于
   */
  GT = 'gt',

  /**
   * 大于等于
   */
  GTE = 'gte',

  /**
   * 小于
   */
  LT = 'lt',

  /**
   * 小于等于
   */
  LTE = 'lte',

  /**
   * 等于
   */
  EQ = 'eq',

  /**
   * 不等于
   */
  NE = 'ne',

  /**
   * 包含
   */
  CONTAINS = 'contains',

  /**
   * 不包含
   */
  NOT_CONTAINS = 'not_contains'
}

/**
 * 示例
 */
const alertOperator: AlertOperator = AlertOperator.GT;
```

### AlertSeverity

告警严重级别枚举。

```typescript
enum AlertSeverity {
  /**
   * 信息级别
   */
  INFO = 'info',

  /**
   * 警告级别
   */
  WARNING = 'warning',

  /**
   * 错误级别
   */
  ERROR = 'error',

  /**
   * 严重级别
   */
  CRITICAL = 'critical',

  /**
   * 紧急级别
   */
  EMERGENCY = 'emergency'
}

/**
 * 示例
 */
const alertSeverity: AlertSeverity = AlertSeverity.CRITICAL;
```

### AlertRuleStatus

告警规则状态枚举。

```typescript
enum AlertRuleStatus {
  /**
   * 活跃状态
   */
  ACTIVE = 'active',

  /**
   * 非活跃状态
   */
  INACTIVE = 'inactive',

  /**
   * 已删除状态
   */
  DELETED = 'deleted',

  /**
   * 暂停状态
   */
  PAUSED = 'paused',

  /**
   * 错误状态
   */
  ERROR = 'error'
}

/**
 * 示例
 */
const alertRuleStatus: AlertRuleStatus = AlertRuleStatus.ACTIVE;
```

---

## 告警操作类型

### IAlertAction

告警操作接口。

```typescript
interface IAlertAction {
  /**
   * 操作类型
   */
  type: AlertActionType;

  /**
   * 操作配置
   */
  config: {
    /**
     * 收件人列表
     */
    recipients?: string[];

    /**
     * Webhook URL
     */
    webhookUrl?: URL;

    /**
     * 消息模板
     */
    template?: string;

    /**
     * 操作参数
     */
    params?: Record<string, any>;
  };

  /**
   * 操作状态
   */
  status: ActionStatus;

  /**
   * 操作元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const alertAction: IAlertAction = {
  type: AlertActionType.EMAIL,
  config: {
    recipients: ['admin@example.com', 'ops@example.com'],
    template: 'alert-email-template'
  },
  status: ActionStatus.ENABLED,
  metadata: {
    priority: 'high'
  }
};
```

### AlertActionType

告警操作类型枚举。

```typescript
enum AlertActionType {
  /**
   * 邮件通知
   */
  EMAIL = 'email',

  /**
   * 短信通知
   */
  SMS = 'sms',

  /**
   * Webhook 通知
   */
  WEBHOOK = 'webhook',

  /**
   * Slack 通知
   */
  SLACK = 'slack',

  /**
   * 钉钉通知
   */
  DINGTALK = 'dingtalk',

  /**
   * 企业微信通知
   */
  WEWORK = 'wework',

  /**
   * 自定义通知
   */
  CUSTOM = 'custom'
}

/**
 * 示例
 */
const alertActionType: AlertActionType = AlertActionType.EMAIL;
```

### ActionStatus

操作状态枚举。

```typescript
enum ActionStatus {
  /**
   * 启用状态
   */
  ENABLED = 'enabled',

  /**
   * 禁用状态
   */
  DISABLED = 'disabled',

  /**
   * 错误状态
   */
  ERROR = 'error'
}

/**
 * 示例
 */
const actionStatus: ActionStatus = ActionStatus.ENABLED;
```

---

## 告警事件类型

### IAlertEvent

告警事件接口。

```typescript
interface IAlertEvent extends IBaseEntity {
  /**
   * 告警规则 ID
   */
  ruleId: ID;

  /**
   * 告警规则名称
   */
  ruleName: string;

  /**
   * 告警严重级别
   */
  severity: AlertSeverity;

  /**
   * 告警状态
   */
  status: AlertEventStatus;

  /**
   * 告警消息
   */
  message: string;

  /**
   * 触发指标值
   */
  value: number;

  /**
   * 阈值
   */
  threshold: number;

  /**
   * 告警开始时间
   */
  startedAt: Timestamp;

  /**
   * 告警结束时间
   */
  endedAt?: Timestamp;

  /**
   * 告警持续时间（秒）
   */
  duration?: number;

  /**
   * 告警标签
   */
  labels?: Record<string, string>;

  /**
   * 告警元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const alertEvent: IAlertEvent = {
  id: 'event-abc123',
  ruleId: 'rule-123',
  ruleName: 'CPU 使用率过高告警',
  severity: AlertSeverity.CRITICAL,
  status: AlertEventStatus.RESOLVED,
  message: 'CPU 使用率超过阈值',
  value: 85.5,
  threshold: 80,
  startedAt: '2026-02-03T10:00:00.000Z',
  endedAt: '2026-02-03T10:05:00.000Z',
  duration: 300,
  labels: {
    host: 'server-1',
    region: 'us-east-1'
  },
  metadata: {
    source: 'prometheus'
  },
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:05:00.000Z'
};
```

### AlertEventStatus

告警事件状态枚举。

```typescript
enum AlertEventStatus {
  /**
   * 触发状态
   */
  TRIGGERED = 'triggered',

  /**
   * 确认状态
   */
  ACKNOWLEDGED = 'acknowledged',

  /**
   * 解决状态
   */
  RESOLVED = 'resolved',

  /**
   * 自动解决状态
   */
  AUTO_RESOLVED = 'auto_resolved',

  /**
   * 忽略状态
   */
  IGNORED = 'ignored',

  /**
   * 错误状态
   */
  ERROR = 'error'
}

/**
 * 示例
 */
const alertEventStatus: AlertEventStatus = AlertEventStatus.RESOLVED;
```

---

## 仪表板类型

### IDashboard

仪表板接口。

```typescript
interface IDashboard extends INamedEntity {
  /**
   * 仪表板布局
   */
  layout: IDashboardLayout;

  /**
   * 仪表板刷新间隔（秒）
   */
  refreshInterval?: number;

  /**
   * 仪表板时间范围
   */
  timeRange?: {
    /**
     * 起始时间
     */
    start?: Timestamp;

    /**
     * 结束时间
     */
    end?: Timestamp;

    /**
     * 相对时间范围
     */
    relative?: '1h' | '6h' | '24h' | '7d' | '30d';
  };

  /**
   * 仪表板标签
   */
  tags?: string[];

  /**
   * 仪表板元数据
   */
  metadata?: Record<string, any>;
}

/**
 * 示例
 */
const dashboard: IDashboard = {
  id: 'dashboard-123',
  name: '系统监控仪表板',
  description: '系统整体监控视图',
  layout: {
    panels: [
      {
        id: 'panel-1',
        type: 'graph',
        title: 'CPU 使用率',
        metrics: ['cpu_usage']
      }
    ]
  },
  refreshInterval: 60,
  timeRange: {
    relative: '24h'
  },
  tags: ['system', 'monitoring'],
  createdAt: '2026-02-03T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z'
};
```

### IDashboardLayout

仪表板布局接口。

```typescript
interface IDashboardLayout {
  /**
   * 面板列表
   */
  panels: IDashboardPanel[];

  /**
   * 布局配置
   */
  grid?: {
    /**
     * 列数
     */
    columns?: number;

    /**
     * 行高
     */
    rowHeight?: number;

    /**
     * 间距
     */
    gap?: number;
  };
}

/**
 * 示例
 */
const dashboardLayout: IDashboardLayout = {
  panels: [
    {
      id: 'panel-1',
      type: 'graph',
      title: 'CPU 使用率',
      metrics: ['cpu_usage']
    }
  ],
  grid: {
    columns: 3,
    rowHeight: 200,
    gap: 10
  }
};
```

### IDashboardPanel

仪表板面板接口。

```typescript
interface IDashboardPanel {
  /**
   * 面板 ID
   */
  id: ID;

  /**
   * 面板类型
   */
  type: PanelType;

  /**
   * 面板标题
   */
  title: string;

  /**
   * 面板描述
   */
  description?: string;

  /**
   * 指标列表
   */
  metrics: string[];

  /**
   * 面板配置
   */
  config?: {
    /**
     * 图表类型
     */
    chartType?: 'line' | 'bar' | 'pie' | 'gauge';

    /**
     * 颜色配置
     */
    colors?: string[];

    /**
     * 阈值配置
     */
    thresholds?: {
      value: number;
      color: string;
    }[];
  };

  /**
   * 面板位置
   */
  position?: {
    /**
     * X 坐标
     */
    x: number;

    /**
     * Y 坐标
     */
    y: number;

    /**
     * 宽度
     */
    width?: number;

    /**
     * 高度
     */
    height?: number;
  };
}

/**
 * 示例
 */
const dashboardPanel: IDashboardPanel = {
  id: 'panel-1',
  type: PanelType.GRAPH,
  title: 'CPU 使用率',
  metrics: ['cpu_usage'],
  config: {
    chartType: 'line',
    colors: ['#3b82f6', '#ef4444'],
    thresholds: [
      { value: 70, color: '#fbbf24' },
      { value: 90, color: '#ef4444' }
    ]
  },
  position: {
    x: 0,
    y: 0,
    width: 6,
    height: 4
  }
};
```

### PanelType

面板类型枚举。

```typescript
enum PanelType {
  /**
   * 图表面板
   */
  GRAPH = 'graph',

  /**
   * 仪表盘面板
   */
  GAUGE = 'gauge',

  /**
   * 统计数字面板
   */
  STAT = 'stat',

  /**
   * 表格面板
   */
  TABLE = 'table',

  /**
   * 热力图面板
   */
  HEATMAP = 'heatmap',

  /**
   * 日志面板
   */
  LOGS = 'logs',

  /**
   * 自定义面板
   */
  CUSTOM = 'custom'
}

/**
 * 示例
 */
const panelType: PanelType = PanelType.GRAPH;
```

---

## 使用示例

### 创建告警规则

```typescript
import { IAlertRule, AlertSeverity, AlertOperator } from '@yyc3/types';

const alertRule: IAlertRule = {
  name: 'CPU 使用率过高告警',
  description: '当 CPU 使用率超过 80% 时触发告警',
  condition: {
    metric: 'cpu_usage',
    operator: AlertOperator.GT,
    threshold: 80,
    duration: 300
  },
  severity: AlertSeverity.CRITICAL,
  actions: [
    {
      type: 'email',
      config: {
        recipients: ['admin@example.com']
      }
    }
  ],
  cooldown: 300
};

const rule = await alertService.createRule(alertRule);
```

### 查询告警事件

```typescript
import { IAlertEvent, AlertEventStatus } from '@yyc3/types';

const events = await alertService.getEvents({
  status: AlertEventStatus.TRIGGERED,
  severity: AlertSeverity.CRITICAL
});

events.forEach(event => {
  console.log('告警事件:', {
    rule: event.ruleName,
    message: event.message,
    value: event.value,
    threshold: event.threshold
  });
});
```

### 创建仪表板

```typescript
import { IDashboard, PanelType } from '@yyc3/types';

const dashboard: IDashboard = {
  name: '系统监控仪表板',
  description: '系统整体监控视图',
  layout: {
    panels: [
      {
        id: 'panel-1',
        type: PanelType.GRAPH,
        title: 'CPU 使用率',
        metrics: ['cpu_usage']
      }
    ]
  },
  refreshInterval: 60,
  timeRange: {
    relative: '24h'
  }
};

const result = await dashboardService.create(dashboard);
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
