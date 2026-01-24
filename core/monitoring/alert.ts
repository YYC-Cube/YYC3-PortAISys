import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../../utils/logger';
import {
  AlertSystem,
  AlertRule,
  Alert,
  AlertSeverity,
  AlertStatus,
  AlertRuleQuery,
  AlertQuery,
  AlertStatistics,
  AlertStatisticsQuery,
  AlertRuleCondition,
  Metric
} from './types';

export class AlertSystemImpl extends EventEmitter implements AlertSystem {
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private logger: Logger;
  private dataDirectory: string;
  private suppressionWindow: number = 5 * 60 * 1000;
  private suppressionMap: Map<string, number> = new Map();
  private deduplicationWindow: number = 10 * 60 * 1000;
  private deduplicationMap: Map<string, Alert> = new Map();

  constructor(logger: Logger, dataDirectory: string = './data/monitoring') {
    super();
    this.logger = logger;
    this.dataDirectory = dataDirectory;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.ensureDataDirectory();
      await this.loadRules();
      await this.loadAlerts();
      this.logger.info('告警系统初始化完成', { 
        rulesCount: this.rules.size,
        alertsCount: this.alerts.size 
      });
    } catch (error) {
      this.logger.error('告警系统初始化失败', error as Error);
      throw error;
    }
  }

  private async ensureDataDirectory(): Promise<void> {
    const dirs = [
      this.dataDirectory,
      path.join(this.dataDirectory, 'alerts'),
      path.join(this.dataDirectory, 'rules')
    ];
    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  private async loadRules(): Promise<void> {
    try {
      const rulesDir = path.join(this.dataDirectory, 'rules');
      const files = await fs.readdir(rulesDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(rulesDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const rule = JSON.parse(content) as AlertRule;
          this.rules.set(rule.id, rule);
        }
      }
      
      this.logger.info('加载告警规则', { count: this.rules.size });
    } catch (error) {
      this.logger.warn('加载告警规则失败', error as Error);
    }
  }

  private async loadAlerts(): Promise<void> {
    try {
      const alertsDir = path.join(this.dataDirectory, 'alerts');
      const files = await fs.readdir(alertsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(alertsDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const alert = JSON.parse(content) as Alert;
          this.alerts.set(alert.id, alert);
          this.alertHistory.push(alert);
        }
      }
      
      this.alertHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      this.logger.info('加载历史告警', { count: this.alerts.size });
    } catch (error) {
      this.logger.warn('加载历史告警失败', error as Error);
    }
  }

  async createAlertRule(rule: AlertRule): Promise<AlertRule> {
    this.logger.info('创建告警规则', { ruleId: rule.id, name: rule.name });
    
    if (this.rules.has(rule.id)) {
      throw new Error(`告警规则 ${rule.id} 已存在`);
    }

    rule.createdAt = new Date();
    rule.updatedAt = new Date();
    rule.enabled = rule.enabled ?? true;
    rule.triggeredCount = 0;
    
    this.rules.set(rule.id, rule);
    await this.saveRule(rule);
    
    this.emit('rule:created', rule);
    this.logger.info('告警规则创建成功', { ruleId: rule.id });
    
    return rule;
  }

  async updateAlertRule(ruleId: string, rule: Partial<AlertRule>): Promise<AlertRule> {
    this.logger.info('更新告警规则', { ruleId });
    
    const existingRule = this.rules.get(ruleId);
    if (!existingRule) {
      throw new Error(`告警规则 ${ruleId} 不存在`);
    }

    const updatedRule = {
      ...existingRule,
      ...rule,
      id: ruleId,
      updatedAt: new Date()
    };
    
    this.rules.set(ruleId, updatedRule);
    await this.saveRule(updatedRule);
    
    this.emit('rule:updated', updatedRule);
    this.logger.info('告警规则更新成功', { ruleId });
    
    return updatedRule;
  }

  async deleteAlertRule(ruleId: string): Promise<void> {
    this.logger.info('删除告警规则', { ruleId });
    
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`告警规则 ${ruleId} 不存在`);
    }

    this.rules.delete(ruleId);
    
    try {
      const filePath = path.join(this.dataDirectory, 'rules', `${ruleId}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.warn('删除告警规则文件失败', error as Error);
    }
    
    this.emit('rule:deleted', rule);
    this.logger.info('告警规则删除成功', { ruleId });
  }

  async getAlertRules(query?: AlertRuleQuery): Promise<AlertRule[]> {
    let rules = Array.from(this.rules.values());
    
    if (query) {
      if (query.enabled !== undefined) {
        rules = rules.filter(r => r.enabled === query.enabled);
      }
      if (query.severity !== undefined) {
        rules = rules.filter(r => r.severity === query.severity);
      }
      if (query.metricName !== undefined) {
        rules = rules.filter(r => r.metricName === query.metricName);
      }
    }
    
    return rules;
  }

  async getAlerts(query?: AlertQuery): Promise<Alert[]> {
    let alerts = Array.from(this.alerts.values());
    
    if (query) {
      if (query.status !== undefined) {
        alerts = alerts.filter(a => a.status === query.status);
      }
      if (query.severity !== undefined) {
        alerts = alerts.filter(a => a.severity === query.severity);
      }
      if (query.ruleId !== undefined) {
        alerts = alerts.filter(a => a.ruleId === query.ruleId);
      }
      if (query.startTime !== undefined) {
        alerts = alerts.filter(a => a.timestamp >= query.startTime!);
      }
      if (query.endTime !== undefined) {
        alerts = alerts.filter(a => a.timestamp <= query.endTime!);
      }
    }
    
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return alerts;
  }

  async acknowledgeAlert(alertId: string, comment?: string): Promise<void> {
    this.logger.info('确认告警', { alertId, comment });
    
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`告警 ${alertId} 不存在`);
    }

    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = comment || 'system';
    alert.updatedAt = new Date();
    
    await this.saveAlert(alert);
    
    this.emit('alert:acknowledged', alert);
    this.logger.info('告警确认成功', { alertId });
  }

  async closeAlert(alertId: string, comment?: string): Promise<void> {
    this.logger.info('关闭告警', { alertId, comment });
    
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`告警 ${alertId} 不存在`);
    }

    alert.status = AlertStatus.CLOSED;
    alert.closedAt = new Date();
    alert.closedBy = comment || 'system';
    alert.updatedAt = new Date();
    
    await this.saveAlert(alert);
    
    this.emit('alert:closed', alert);
    this.logger.info('告警关闭成功', { alertId });
  }

  async getAlertStatistics(query?: AlertStatisticsQuery): Promise<AlertStatistics> {
    const alerts = Array.from(this.alerts.values());
    
    let filteredAlerts = alerts;
    if (query) {
      if (query.startTime !== undefined) {
        filteredAlerts = filteredAlerts.filter(a => a.timestamp >= query.startTime!);
      }
      if (query.endTime !== undefined) {
        filteredAlerts = filteredAlerts.filter(a => a.timestamp <= query.endTime!);
      }
    }

    const statistics: AlertStatistics = {
      total: filteredAlerts.length,
      byStatus: {
        [AlertStatus.OPEN]: 0,
        [AlertStatus.ACKNOWLEDGED]: 0,
        [AlertStatus.CLOSED]: 0
      },
      bySeverity: {
        [AlertSeverity.INFO]: 0,
        [AlertSeverity.WARNING]: 0,
        [AlertSeverity.ERROR]: 0,
        [AlertSeverity.CRITICAL]: 0
      },
      avgResolutionTime: 0,
      triggeredCount: 0,
      acknowledgedCount: 0,
      closedCount: 0
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    for (const alert of filteredAlerts) {
      statistics.byStatus[alert.status]++;
      statistics.bySeverity[alert.severity]++;
      
      if (alert.status === AlertStatus.ACKNOWLEDGED) {
        statistics.acknowledgedCount++;
      }
      if (alert.status === AlertStatus.CLOSED) {
        statistics.closedCount++;
        if (alert.closedAt && alert.acknowledgedAt) {
          totalResolutionTime += alert.closedAt.getTime() - alert.acknowledgedAt.getTime();
          resolvedCount++;
        }
      }
      
      if (alert.triggeredAt) {
        statistics.triggeredCount++;
      }
    }

    if (resolvedCount > 0) {
      statistics.avgResolutionTime = totalResolutionTime / resolvedCount;
    }

    return statistics;
  }

  evaluateMetrics(metrics: Metric[]): void {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) {
        continue;
      }

      try {
        const ruleMetrics = metrics.filter(m => m.name === rule.metricName);
        if (ruleMetrics.length === 0) {
          continue;
        }

        for (const metric of ruleMetrics) {
          if (this.evaluateCondition(metric, rule.condition)) {
            this.triggerAlert(rule, metric);
          }
        }
      } catch (error) {
        this.logger.error('评估告警规则失败', error as Error, { ruleId: rule.id });
      }
    }
  }

  private evaluateCondition(metric: Metric, condition: AlertRuleCondition): boolean {
    switch (condition.operator) {
      case '>':
        return metric.value > condition.threshold;
      case '<':
        return metric.value < condition.threshold;
      case '>=':
        return metric.value >= condition.threshold;
      case '<=':
        return metric.value <= condition.threshold;
      case '==':
        return metric.value === condition.threshold;
      case '!=':
        return metric.value !== condition.threshold;
      default:
        return false;
    }
  }

  private triggerAlert(rule: AlertRule, metric: Metric): void {
    const suppressionKey = `${rule.id}:${metric.labels?.host || 'default'}`;
    const now = Date.now();
    
    if (this.suppressionMap.has(suppressionKey)) {
      const lastTriggered = this.suppressionMap.get(suppressionKey)!;
      if (now - lastTriggered < this.suppressionWindow) {
        this.logger.debug('告警被抑制', { ruleId: rule.id, suppressionKey });
        return;
      }
    }

    const deduplicationKey = `${rule.id}:${metric.labels?.host || 'default'}:${metric.name}`;
    if (this.deduplicationMap.has(deduplicationKey)) {
      const existingAlert = this.deduplicationMap.get(deduplicationKey)!;
      if (now - existingAlert.timestamp.getTime() < this.deduplicationWindow) {
        existingAlert.count++;
        existingAlert.lastOccurrence = new Date();
        this.logger.debug('告警去重', { alertId: existingAlert.id, count: existingAlert.count });
        return;
      }
    }

    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      status: AlertStatus.OPEN,
      message: rule.message || `告警规则 ${rule.name} 触发`,
      metricName: metric.name,
      metricValue: metric.value,
      labels: metric.labels,
      timestamp: new Date(),
      triggeredAt: new Date(),
      count: 1,
      lastOccurrence: new Date()
    };

    this.alerts.set(alert.id, alert);
    this.alertHistory.push(alert);
    this.suppressionMap.set(suppressionKey, now);
    this.deduplicationMap.set(deduplicationKey, alert);
    
    rule.triggeredCount = (rule.triggeredCount || 0) + 1;
    rule.lastTriggeredAt = new Date();
    
    this.saveAlert(alert);
    this.saveRule(rule);
    
    this.emit('alert:triggered', alert);
    this.logger.warn('告警触发', { 
      alertId: alert.id, 
      ruleId: rule.id, 
      severity: alert.severity,
      message: alert.message 
    });
  }

  private async saveRule(rule: AlertRule): Promise<void> {
    try {
      const filePath = path.join(this.dataDirectory, 'rules', `${rule.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(rule, null, 2), 'utf-8');
    } catch (error) {
      this.logger.error('保存告警规则失败', error as Error, { ruleId: rule.id });
      throw error;
    }
  }

  private async saveAlert(alert: Alert): Promise<void> {
    try {
      const filePath = path.join(this.dataDirectory, 'alerts', `${alert.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(alert, null, 2), 'utf-8');
    } catch (error) {
      this.logger.error('保存告警失败', error as Error, { alertId: alert.id });
      throw error;
    }
  }

  getAlertHistory(limit: number = 100): Alert[] {
    return this.alertHistory.slice(0, limit);
  }

  clearSuppression(): void {
    this.suppressionMap.clear();
    this.logger.info('清除告警抑制');
  }

  clearDeduplication(): void {
    this.deduplicationMap.clear();
    this.logger.info('清除告警去重');
  }
}
