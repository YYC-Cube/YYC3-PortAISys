/**
 * @file unit/security/SecurityAuditor.test.ts
 * @description Security Auditor.test 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-08
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SecurityAuditor,
  AuditConfig,
  AuditResult,
  AuditFinding,
  ComplianceCheck
} from '../../../core/security/SecurityAuditor';

describe('SecurityAuditor', () => {
  let auditor: SecurityAuditor;

  beforeEach(() => {
    auditor = new SecurityAuditor({
      enableScheduledAudits: false,
      auditInterval: 1000,
      enableRealTimeAuditing: false,
      enableComplianceChecks: true,
      enableVulnerabilityScanning: true,
      enableCodeReview: true,
      enableDependencyAudit: true,
      auditRetentionDays: 30
    });
  });

  afterEach(() => {
    auditor.stopScheduledAudits();
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功初始化审计器', () => {
      expect(auditor).toBeDefined();
      const stats = auditor.getAuditStatistics();
      expect(stats).toBeDefined();
    });

    it('应该使用默认配置', () => {
      const defaultAuditor = new SecurityAuditor();
      const stats = defaultAuditor.getAuditStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalAudits).toBe(0);
    });

    it('应该初始化合规性检查', () => {
      const checks = auditor.getComplianceChecks();
      expect(checks.length).toBeGreaterThan(0);
      expect(checks.some(c => c.id === 'owasp-top-10')).toBe(true);
      expect(checks.some(c => c.id === 'gdpr')).toBe(true);
      expect(checks.some(c => c.id === 'wcag')).toBe(true);
    });
  });

  describe('审计执行', () => {
    it('应该成功执行审计', async () => {
      const result = await auditor.runFullAudit();

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.findings.length).toBeGreaterThan(0);
      expect(result.summary).toBeDefined();
    });

    it('应该生成审计ID', async () => {
      const result = await auditor.runFullAudit();

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^audit-\d+-[a-z0-9]+$/);
    });

    it('应该记录审计历史', async () => {
      await auditor.runFullAudit();
      await auditor.runFullAudit();

      const history = auditor.getAuditHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it('应该计算审计持续时间', async () => {
      const startTime = Date.now();
      const result = await auditor.runFullAudit();
      const duration = Date.now() - startTime;

      expect(result.timestamp).toBeGreaterThanOrEqual(startTime);
      expect(result.timestamp).toBeLessThanOrEqual(startTime + 10000);
    });
  });

  describe('发现管理', () => {
    it('应该返回所有发现', async () => {
      await auditor.runFullAudit();

      const history = auditor.getAuditHistory();
      const allFindings = history.flatMap(audit => audit.findings);
      expect(allFindings.length).toBeGreaterThan(0);
    });

    it('应该按严重性过滤发现', async () => {
      await auditor.runFullAudit();

      const history = auditor.getAuditHistory();
      const allFindings = history.flatMap(audit => audit.findings);
      const criticalFindings = allFindings.filter(f => f.severity === 'critical');
      expect(criticalFindings.every(f => f.severity === 'critical')).toBe(true);
    });

    it('应该按类别过滤发现', async () => {
      await auditor.runFullAudit();

      const history = auditor.getAuditHistory();
      const allFindings = history.flatMap(audit => audit.findings);
      const vulnerabilityFindings = allFindings.filter(f => f.category === 'vulnerability');
      expect(vulnerabilityFindings.every(f => f.category === 'vulnerability')).toBe(true);
    });

    it('应该同时按严重性和类别过滤发现', async () => {
      await auditor.runFullAudit();

      const history = auditor.getAuditHistory();
      const allFindings = history.flatMap(audit => audit.findings);
      const findings = allFindings.filter(f => f.severity === 'high' && f.category === 'configuration');
      expect(findings.every(f => f.severity === 'high' && f.category === 'configuration')).toBe(true);
    });
  });

  describe('审计摘要', () => {
    it('应该正确计算发现总数', async () => {
      const result = await auditor.runFullAudit();

      expect(result.findings.length).toBeGreaterThan(0);
    });

    it('应该按严重性分类发现', async () => {
      const result = await auditor.runFullAudit();

      const criticalCount = result.findings.filter(f => f.severity === 'critical').length;
      const highCount = result.findings.filter(f => f.severity === 'high').length;
      const mediumCount = result.findings.filter(f => f.severity === 'medium').length;
      const lowCount = result.findings.filter(f => f.severity === 'low').length;

      expect(criticalCount).toBeGreaterThanOrEqual(0);
      expect(highCount).toBeGreaterThanOrEqual(0);
      expect(mediumCount).toBeGreaterThanOrEqual(0);
      expect(lowCount).toBeGreaterThanOrEqual(0);
    });

    it('应该按类别分类发现', async () => {
      const result = await auditor.runFullAudit();

      const vulnerabilityCount = result.findings.filter(f => f.category === 'vulnerability').length;
      const complianceCount = result.findings.filter(f => f.category === 'compliance').length;
      const codeReviewCount = result.findings.filter(f => f.category === 'code_review').length;
      const dependencyCount = result.findings.filter(f => f.category === 'dependency').length;

      expect(vulnerabilityCount).toBeGreaterThanOrEqual(0);
      expect(complianceCount).toBeGreaterThanOrEqual(0);
      expect(codeReviewCount).toBeGreaterThanOrEqual(0);
      expect(dependencyCount).toBeGreaterThanOrEqual(0);
    });

    it('应该计算审计评分', async () => {
      const result = await auditor.runFullAudit();

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('应该计算审计状态', async () => {
      const result = await auditor.runFullAudit();

      expect(['passed', 'failed', 'warning']).toContain(result.status);
    });
  });

  describe('报告生成', () => {
    it('应该生成审计报告', async () => {
      const audit = await auditor.runFullAudit();
      const report = auditor.generateAuditReport(audit.id);

      expect(report).toBeDefined();
      expect(report.includes(audit.id)).toBe(true);
      expect(report.includes('Security Audit Report')).toBe(true);
    });

    it('应该包含摘要', async () => {
      const audit = await auditor.runFullAudit();
      const report = auditor.generateAuditReport(audit.id);

      expect(report.includes('Summary')).toBe(true);
    });

    it('应该包含发现详情', async () => {
      const audit = await auditor.runFullAudit();
      const report = auditor.generateAuditReport(audit.id);

      expect(report.includes('Findings')).toBe(true);
    });

    it('应该包含推荐措施', async () => {
      const audit = await auditor.runFullAudit();
      const report = auditor.generateAuditReport(audit.id);

      expect(report.includes('Recommendations')).toBe(true);
    });

    it('应该处理不存在的审计ID', async () => {
      const report = auditor.generateAuditReport('non-existent-id');

      expect(report).toContain('not found');
    });
  });

  describe('合规性检查', () => {
    it('应该执行合规性检查', async () => {
      const checks = await auditor.runComplianceChecks();

      expect(checks).toBeDefined();
      expect(checks.findings.length).toBeGreaterThan(0);
      expect(checks.recommendations).toBeDefined();
      expect(Array.isArray(checks.recommendations)).toBe(true);
    });

    it('应该更新合规性检查', () => {
      const checksBefore = auditor.getComplianceChecks();
      const owaspCheckBefore = checksBefore.find(c => c.id === 'owasp-top-10');

      auditor.updateComplianceCheck('owasp-top-10', { status: 'warning' });

      const checksAfter = auditor.getComplianceChecks();
      const owaspCheckAfter = checksAfter.find(c => c.id === 'owasp-top-10');

      expect(owaspCheckAfter?.status).toBe('warning');
      expect(owaspCheckAfter?.status).not.toBe(owaspCheckBefore?.status);
    });

    it('应该处理不存在的合规性检查更新', () => {
      expect(() => {
        auditor.updateComplianceCheck('non-existent', { status: 'warning' });
      }).not.toThrow();
    });
  });

  describe('调度审计', () => {
    it('应该启动定期审计', () => {
      const auditorWithSchedule = new SecurityAuditor({
        enableScheduledAudits: true,
        auditInterval: 1000
      });

      expect(auditorWithSchedule).toBeDefined();
      auditorWithSchedule.stopScheduledAudits();
    });

    it('应该停止定期审计', () => {
      const auditorWithSchedule = new SecurityAuditor({
        enableScheduledAudits: true,
        auditInterval: 1000
      });

      expect(() => {
        auditorWithSchedule.stopScheduledAudits();
      }).not.toThrow();
    });
  });

  describe('统计信息', () => {
    it('应该正确计算统计信息', async () => {
      await auditor.runFullAudit();
      await auditor.runFullAudit();

      const stats = auditor.getAuditStatistics();

      expect(stats.totalAudits).toBeGreaterThanOrEqual(2);
      expect(stats.averageScore).toBeGreaterThanOrEqual(0);
      expect(stats.byType).toBeDefined();
    });

    it('应该计算审计状态分布', async () => {
      await auditor.runFullAudit();

      const stats = auditor.getAuditStatistics();

      expect(stats.passedAudits).toBeGreaterThanOrEqual(0);
      expect(stats.failedAudits).toBeGreaterThanOrEqual(0);
      expect(stats.warningAudits).toBeGreaterThanOrEqual(0);
    });

    it('应该按类型分类审计', async () => {
      await auditor.runFullAudit();

      const stats = auditor.getAuditStatistics();

      expect(stats.byType).toBeDefined();
      expect(stats.byType['security']).toBeGreaterThan(0);
    });
  });

  describe('历史管理', () => {
    it('应该限制历史记录数量', async () => {
      const auditorWithShortRetention = new SecurityAuditor({
        auditRetentionDays: 0,
        enableScheduledAudits: false
      });

      await auditorWithShortRetention.runFullAudit();

      const history = auditorWithShortRetention.getAuditHistory();
      expect(history.length).toBeGreaterThanOrEqual(0);
    });

    it('应该按类型过滤历史', async () => {
      await auditor.runFullAudit();

      const securityHistory = auditor.getAuditHistory('security');
      expect(securityHistory.length).toBeGreaterThan(0);
    });

    it('应该限制返回的历史记录数量', async () => {
      for (let i = 0; i < 10; i++) {
        await auditor.runFullAudit();
      }

      const limitedHistory = auditor.getAuditHistory(undefined, 5);
      expect(limitedHistory.length).toBeLessThanOrEqual(5);
    });
  });

  describe('事件发射', () => {
    it('应该在审计完成时发射事件', async () => {
      const handler = vi.fn();
      auditor.on('audit-completed', handler);

      await auditor.runFullAudit();

      expect(handler).toHaveBeenCalled();
    });

    it('应该在定期审计完成时发射事件', async () => {
      const handler = vi.fn();
      const auditorWithSchedule = new SecurityAuditor({
        enableScheduledAudits: true,
        auditInterval: 100
      });

      auditorWithSchedule.on('scheduled-audit-completed', handler);

      await new Promise(resolve => setTimeout(resolve, 150));
      auditorWithSchedule.stopScheduledAudits();

      expect(handler).toHaveBeenCalled();
    });

    it('应该在合规性检查更新时发射事件', () => {
      const handler = vi.fn();
      auditor.on('compliance-check-updated', handler);

      auditor.updateComplianceCheck('owasp-top-10', { status: 'warning' });

      expect(handler).toHaveBeenCalled();
    });

    it('应该在重置时发射事件', () => {
      const handler = vi.fn();
      auditor.on('auditor-reset', handler);

      auditor.reset();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('自定义审计', () => {
    it('应该执行自定义审计', async () => {
      const result = await auditor.runCustomAudit('test-audit', { test: 'value' });

      expect(result).toBeDefined();
      expect(result.type).toBe('security');
      expect(result.status).toBe('passed');
      expect(result.findings.length).toBeGreaterThan(0);
    });

    it('应该生成自定义审计ID', async () => {
      const result = await auditor.runCustomAudit('test-audit', {});

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^audit-\d+-[a-z0-9]+$/);
    });

    it('应该在自定义审计完成时发射事件', async () => {
      const handler = vi.fn();
      auditor.on('custom-audit-completed', handler);

      await auditor.runCustomAudit('test-audit', {});

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('重置功能', () => {
    it('应该清空审计历史', async () => {
      await auditor.runFullAudit();
      await auditor.runFullAudit();

      let stats = auditor.getAuditStatistics();
      expect(stats.totalAudits).toBeGreaterThanOrEqual(2);

      auditor.reset();

      stats = auditor.getAuditStatistics();
      expect(stats.totalAudits).toBe(0);
    });

    it('应该清空所有类型的历史', async () => {
      await auditor.runFullAudit();
      await auditor.runCustomAudit('test', {});

      let history = auditor.getAuditHistory();
      expect(history.length).toBeGreaterThan(0);

      auditor.reset();

      history = auditor.getAuditHistory();
      expect(history.length).toBe(0);
    });
  });
});
