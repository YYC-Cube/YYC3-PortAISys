/**
 * @file 定期安全审计系统测试
 * @description 测试定期安全审计系统的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SecurityAuditor,
  AuditConfig,
  SecurityAuditResult,
  AuditFinding,
  AuditReport,
  ComplianceCheck
} from '../../../core/security/SecurityAuditor';

describe('SecurityAuditor', () => {
  let auditor: SecurityAuditor;

  beforeEach(() => {
    auditor = new SecurityAuditor({
      enabled: true,
      schedule: {
        interval: 1,
        unit: 'hours'
      },
      scope: ['all'],
      severityThreshold: 'medium',
      autoRemediation: false,
      notificationChannels: ['email'],
      retentionDays: 30
    });
  });

  afterEach(() => {
    auditor.stopScheduledAudits();
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功初始化审计器', () => {
      expect(auditor).toBeDefined();
      const config = auditor.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.severityThreshold).toBe('medium');
    });

    it('应该使用默认配置', () => {
      const defaultAuditor = new SecurityAuditor();
      const config = defaultAuditor.getConfig();

      expect(config.enabled).toBe(true);
      expect(config.schedule.interval).toBe(24);
      expect(config.schedule.unit).toBe('hours');
      expect(config.severityThreshold).toBe('medium');
    });

    it('应该初始化合规性检查', () => {
      const checks = auditor['complianceChecks'];
      expect(checks.size).toBeGreaterThan(0);
      expect(checks.has('OWASP')).toBe(true);
      expect(checks.has('NIST')).toBe(true);
      expect(checks.has('ISO27001')).toBe(true);
    });
  });

  describe('审计执行', () => {
    it('应该成功执行审计', async () => {
      const result = await auditor.runAudit();

      expect(result).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.findings.length).toBeGreaterThan(0);
      expect(result.summary.totalFindings).toBeGreaterThan(0);
    });

    it('应该生成审计ID', async () => {
      const result = await auditor.runAudit();

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^audit-\d+-[a-z0-9]+$/);
    });

    it('应该记录审计历史', async () => {
      await auditor.runAudit();
      await auditor.runAudit();

      const history = auditor.getAuditHistory();
      expect(history.length).toBe(2);
    });

    it('应该支持指定审计范围', async () => {
      const result = await auditor.runAudit(['api', 'database']);

      expect(result.scope).toContain('api');
      expect(result.scope).toContain('database');
    });

    it('应该计算审计持续时间', async () => {
      const result = await auditor.runAudit();

      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.duration).toBeLessThan(10000);
    });
  });

  describe('发现管理', () => {
    it('应该返回所有发现', async () => {
      await auditor.runAudit();

      const findings = auditor.getFindings();
      expect(findings.length).toBeGreaterThan(0);
    });

    it('应该按严重性过滤发现', async () => {
      await auditor.runAudit();

      const criticalFindings = auditor.getFindings('critical');
      expect(criticalFindings.every(f => f.severity === 'critical')).toBe(true);
    });

    it('应该按类别过滤发现', async () => {
      await auditor.runAudit();

      const vulnerabilityFindings = auditor.getFindings(undefined, 'vulnerability');
      expect(vulnerabilityFindings.every(f => f.category === 'vulnerability')).toBe(true);
    });

    it('应该同时按严重性和类别过滤发现', async () => {
      await auditor.runAudit();

      const findings = auditor.getFindings('high', 'configuration');
      expect(findings.every(f => f.severity === 'high' && f.category === 'configuration')).toBe(true);
    });
  });

  describe('审计摘要', () => {
    it('应该正确计算发现总数', async () => {
      const result = await auditor.runAudit();

      expect(result.summary.totalFindings).toBe(result.findings.length);
    });

    it('应该按严重性分类发现', async () => {
      const result = await auditor.runAudit();

      expect(result.summary.bySeverity).toBeDefined();
      expect(result.summary.bySeverity.critical).toBeGreaterThanOrEqual(0);
      expect(result.summary.bySeverity.high).toBeGreaterThanOrEqual(0);
      expect(result.summary.bySeverity.medium).toBeGreaterThanOrEqual(0);
      expect(result.summary.bySeverity.low).toBeGreaterThanOrEqual(0);
    });

    it('应该按类别分类发现', async () => {
      const result = await auditor.runAudit();

      expect(result.summary.byCategory).toBeDefined();
      expect(result.summary.byCategory.vulnerability).toBeGreaterThanOrEqual(0);
      expect(result.summary.byCategory.compliance).toBeGreaterThanOrEqual(0);
      expect(result.summary.byCategory.configuration).toBeGreaterThanOrEqual(0);
      expect(result.summary.byCategory.access_control).toBeGreaterThanOrEqual(0);
      expect(result.summary.byCategory.data_protection).toBeGreaterThanOrEqual(0);
    });

    it('应该计算风险评分', async () => {
      const result = await auditor.runAudit();

      expect(result.summary.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.summary.riskScore).toBeLessThanOrEqual(100);
    });

    it('应该计算合规性评分', async () => {
      const result = await auditor.runAudit();

      expect(result.summary.complianceScore).toBeGreaterThanOrEqual(0);
      expect(result.summary.complianceScore).toBeLessThanOrEqual(100);
    });
  });

  describe('报告生成', () => {
    it('应该生成审计报告', async () => {
      const audit = await auditor.runAudit();
      const report = await auditor.generateReport(audit.id);

      expect(report).toBeDefined();
      expect(report.auditId).toBe(audit.id);
      expect(report.summary).toEqual(audit.summary);
      expect(report.findings).toEqual(audit.findings);
    });

    it('应该包含趋势分析', async () => {
      await auditor.runAudit();
      const audit = await auditor.runAudit();
      const report = await auditor.generateReport(audit.id);

      expect(report.trends).toBeDefined();
      expect(Array.isArray(report.trends)).toBe(true);
    });

    it('应该生成建议', async () => {
      const audit = await auditor.runAudit();
      const report = await auditor.generateReport(audit.id);

      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('修复管理', () => {
    it('应该更新修复状态', async () => {
      const audit = await auditor.runAudit();
      const findingId = audit.findings[0].id;

      auditor.updateRemediationStatus(findingId, 'in_progress', 'user1');

      const updatedAudit = auditor.getAudit(audit.id);
      expect(updatedAudit?.findings[0].remediation?.status).toBe('in_progress');
      expect(updatedAudit?.findings[0].remediation?.assignedTo).toBe('user1');
    });

    it('应该标记修复为完成', async () => {
      const audit = await auditor.runAudit();
      const findingId = audit.findings[0].id;

      auditor.updateRemediationStatus(findingId, 'completed', 'user1');

      const updatedAudit = auditor.getAudit(audit.id);
      expect(updatedAudit?.findings[0].remediation?.status).toBe('completed');
      expect(updatedAudit?.findings[0].remediation?.completedAt).toBeDefined();
    });
  });

  describe('合规性检查', () => {
    it('应该执行OWASP合规性检查', async () => {
      const checks = await auditor.runComplianceCheck('OWASP');

      expect(checks).toBeDefined();
      expect(checks.length).toBeGreaterThan(0);
      expect(checks.every(c => c.framework === 'OWASP')).toBe(true);
    });

    it('应该执行NIST合规性检查', async () => {
      const checks = await auditor.runComplianceCheck('NIST');

      expect(checks).toBeDefined();
      expect(checks.length).toBeGreaterThan(0);
      expect(checks.every(c => c.framework === 'NIST')).toBe(true);
    });

    it('应该执行ISO27001合规性检查', async () => {
      const checks = await auditor.runComplianceCheck('ISO27001');

      expect(checks).toBeDefined();
      expect(checks.length).toBeGreaterThan(0);
      expect(checks.every(c => c.framework === 'ISO27001')).toBe(true);
    });

    it('应该更新检查状态', async () => {
      const checksBefore = auditor['complianceChecks'].get('OWASP') || [];
      const lastCheckedBefore = checksBefore[0].lastChecked;

      await new Promise(resolve => setTimeout(resolve, 10));
      await auditor.runComplianceCheck('OWASP');

      const checksAfter = auditor['complianceChecks'].get('OWASP') || [];
      const lastCheckedAfter = checksAfter[0].lastChecked;

      expect(lastCheckedAfter).toBeGreaterThan(lastCheckedBefore);
    });
  });

  describe('调度审计', () => {
    it('应该启动定期审计', () => {
      auditor.startScheduledAudits();

      expect(auditor['auditSchedule']).not.toBeNull();
    });

    it('应该停止定期审计', () => {
      auditor.startScheduledAudits();
      auditor.stopScheduledAudits();

      expect(auditor['auditSchedule']).toBeNull();
    });

    it('应该重新启动审计调度', () => {
      auditor.startScheduledAudits();
      const firstSchedule = auditor['auditSchedule'];

      auditor.startScheduledAudits();
      const secondSchedule = auditor['auditSchedule'];

      expect(firstSchedule).not.toBe(secondSchedule);
    });
  });

  describe('配置管理', () => {
    it('应该成功更新配置', () => {
      auditor.updateConfig({
        severityThreshold: 'high',
        autoRemediation: true
      });

      const config = auditor.getConfig();
      expect(config.severityThreshold).toBe('high');
      expect(config.autoRemediation).toBe(true);
    });

    it('应该保持其他配置不变', () => {
      const originalRetention = auditor.getConfig().retentionDays;

      auditor.updateConfig({
        severityThreshold: 'high'
      });

      const config = auditor.getConfig();
      expect(config.retentionDays).toBe(originalRetention);
    });

    it('应该在更新配置后重新调度审计', () => {
      auditor.startScheduledAudits();
      const firstSchedule = auditor['auditSchedule'];

      auditor.updateConfig({
        schedule: { interval: 2, unit: 'hours' }
      });

      const secondSchedule = auditor['auditSchedule'];
      expect(firstSchedule).not.toBe(secondSchedule);
    });
  });

  describe('统计信息', () => {
    it('应该正确计算统计信息', async () => {
      await auditor.runAudit();
      await auditor.runAudit();

      const stats = auditor.getStatistics();

      expect(stats.totalAudits).toBe(2);
      expect(stats.totalFindings).toBeGreaterThan(0);
      expect(stats.averageDuration).toBeGreaterThanOrEqual(0);
    });

    it('应该计算开放发现数量', async () => {
      const audit = await auditor.runAudit();
      const findingId = audit.findings[0].id;

      const statsBefore = auditor.getStatistics();
      const openBefore = statsBefore.openFindings;

      auditor.updateRemediationStatus(findingId, 'completed', 'user1');

      const statsAfter = auditor.getStatistics();
      expect(statsAfter.openFindings).toBeLessThan(openBefore);
    });

    it('应该计算合规率', async () => {
      await auditor.runComplianceCheck('OWASP');

      const stats = auditor.getStatistics();
      expect(stats.complianceRate).toBeGreaterThan(0);
      expect(stats.complianceRate).toBeLessThanOrEqual(100);
    });
  });

  describe('历史清理', () => {
    it('应该清理过期的审计记录', async () => {
      const auditorWithShortRetention = new SecurityAuditor({
        retentionDays: 0
      });

      await auditorWithShortRetention.runAudit();

      const historyBefore = auditorWithShortRetention.getAuditHistory();
      expect(historyBefore.length).toBeGreaterThanOrEqual(0);

      await new Promise(resolve => setTimeout(resolve, 100));
      await auditorWithShortRetention.runAudit();

      const historyAfter = auditorWithShortRetention.getAuditHistory();
      expect(historyAfter.length).toBeLessThanOrEqual(historyBefore.length);
    });

    it('应该限制历史记录数量', async () => {
      const auditorWithShortRetention = new SecurityAuditor({
        retentionDays: 1
      });

      for (let i = 0; i < 5; i++) {
        await auditorWithShortRetention.runAudit();
      }

      const history = auditorWithShortRetention.getAuditHistory();
      expect(history.length).toBe(5);
    });
  });

  describe('事件发射', () => {
    it('应该在审计开始时发射事件', async () => {
      const handler = vi.fn();
      auditor.on('audit-started', handler);

      await auditor.runAudit();

      expect(handler).toHaveBeenCalled();
    });

    it('应该在审计完成时发射事件', async () => {
      const handler = vi.fn();
      auditor.on('audit-completed', handler);

      await auditor.runAudit();

      expect(handler).toHaveBeenCalled();
    });

    it('应该在报告生成时发射事件', async () => {
      const handler = vi.fn();
      auditor.on('report-generated', handler);

      const audit = await auditor.runAudit();
      await auditor.generateReport(audit.id);

      expect(handler).toHaveBeenCalled();
    });

    it('应该在修复状态更新时发射事件', async () => {
      const handler = vi.fn();
      auditor.on('remediation-updated', handler);

      const audit = await auditor.runAudit();
      const findingId = audit.findings[0].id;

      auditor.updateRemediationStatus(findingId, 'in_progress', 'user1');

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('严重性过滤', () => {
    it('应该根据阈值过滤发现', async () => {
      const auditorWithLowThreshold = new SecurityAuditor({
        severityThreshold: 'critical'
      });

      const result = await auditorWithLowThreshold.runAudit();

      expect(result.findings.every(f => f.severity === 'critical')).toBe(true);
    });

    it('应该包含所有严重性高于阈值的发现', async () => {
      const auditorWithLowThreshold = new SecurityAuditor({
        severityThreshold: 'high'
      });

      const result = await auditorWithLowThreshold.runAudit();

      expect(result.findings.every(f => f.severity === 'high' || f.severity === 'critical')).toBe(true);
    });
  });

  describe('自动修复', () => {
    it('应该在启用时自动修复低严重性发现', async () => {
      const auditorWithAutoRemediation = new SecurityAuditor({
        autoRemediation: true,
        severityThreshold: 'low'
      });

      const result = await auditorWithAutoRemediation.runAudit();

      const lowSeverityFindings = result.findings.filter(f => f.severity === 'low');
      const autoRemediated = lowSeverityFindings.filter(f => f.remediation?.status === 'completed');

      expect(autoRemediated.length).toBeGreaterThan(0);
    }, 10000);
  });
});
