import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComplianceManager } from '../../../core/security/ComplianceManager';

describe('ComplianceManager', () => {
  let complianceManager: ComplianceManager;

  beforeEach(() => {
    complianceManager = new ComplianceManager();
  });

  describe('初始化', () => {
    it('应该正确初始化合规框架', () => {
      const frameworks = complianceManager['frameworks'];
      expect(frameworks.size).toBeGreaterThan(0);
      expect(frameworks.has('GDPR')).toBe(true);
      expect(frameworks.has('ISO 27001')).toBe(true);
      expect(frameworks.has('SOC 2')).toBe(true);
      expect(frameworks.has('HIPAA')).toBe(true);
      expect(frameworks.has('PCI DSS')).toBe(true);
    });

    it('应该正确初始化合规规则', () => {
      const rules = complianceManager['complianceRules'];
      expect(rules.length).toBeGreaterThan(0);
      expect(rules[0].framework).toBeDefined();
      expect(rules[0].requirement).toBeDefined();
      expect(rules[0].severity).toBeDefined();
    });

    it('应该正确初始化审计跟踪', () => {
      const auditTrail = complianceManager['auditTrail'];
      expect(auditTrail.enabled).toBe(true);
      expect(auditTrail.events).toBeDefined();
      expect(auditTrail.retention).toBe(2555);
    });

    it('应该正确初始化报告配置', () => {
      const reporting = complianceManager['reporting'];
      expect(reporting.frequency).toBe('monthly');
      expect(reporting.recipients).toContain('compliance@company.com');
      expect(reporting.format).toBe('PDF');
    });
  });

  describe('checkCompliance', () => {
    it('应该返回合规状态', async () => {
      const status = await complianceManager.checkCompliance();
      expect(status).toBeDefined();
      expect(status.compliant).toBeDefined();
      expect(status.frameworks).toBeDefined();
      expect(status.gaps).toBeDefined();
    });

    it('应该检查所有框架的合规性', async () => {
      const status = await complianceManager.checkCompliance();
      expect(status.frameworks.length).toBeGreaterThan(0);
      status.frameworks.forEach(framework => {
        expect(framework.name).toBeDefined();
        expect(framework.status).toBeDefined();
        expect(framework.score).toBeGreaterThanOrEqual(0);
        expect(framework.score).toBeLessThanOrEqual(100);
      });
    });

    it('应该识别合规差距', async () => {
      const status = await complianceManager.checkCompliance();
      if (!status.compliant) {
        expect(status.gaps.length).toBeGreaterThan(0);
        status.gaps.forEach(gap => {
          expect(gap.framework).toBeDefined();
          expect(gap.requirement).toBeDefined();
          expect(gap.status).toBeDefined();
          expect(gap.remediation).toBeDefined();
        });
      }
    });
  });

  describe('generateComplianceReport', () => {
    it('应该生成合规报告', async () => {
      const report = await complianceManager.generateComplianceReport();
      expect(report).toBeDefined();
      expect(report.overallStatus).toBeDefined();
      expect(report.frameworkDetails).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.nextAuditDate).toBeDefined();
    });

    it('应该包含有效的总体状态', async () => {
      const report = await complianceManager.generateComplianceReport();
      expect(['compliant', 'non-compliant']).toContain(report.overallStatus);
    });

    it('应该包含框架详情', async () => {
      const report = await complianceManager.generateComplianceReport();
      expect(report.frameworkDetails.length).toBeGreaterThan(0);
      report.frameworkDetails.forEach(detail => {
        expect(detail.name).toBeDefined();
        expect(detail.status).toBeDefined();
        expect(detail.score).toBeGreaterThanOrEqual(0);
        expect(detail.score).toBeLessThanOrEqual(100);
      });
    });

    it('应该包含推荐措施', async () => {
      const report = await complianceManager.generateComplianceReport();
      expect(report.recommendations.length).toBeGreaterThan(0);
      report.recommendations.forEach(recommendation => {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      });
    });

    it('应该计算下次审计日期', async () => {
      const report = await complianceManager.generateComplianceReport();
      const today = new Date();
      const nextAudit = new Date(today);
      nextAudit.setMonth(nextAudit.getMonth() + 6);
      
      const diffTime = Math.abs(report.nextAuditDate.getTime() - nextAudit.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expect(diffDays).toBeLessThanOrEqual(1);
    });
  });

  describe('updateComplianceRules', () => {
    it('应该更新合规规则', async () => {
      const initialRuleCount = complianceManager['complianceRules'].length;
      await complianceManager.updateComplianceRules();
      const updatedRuleCount = complianceManager['complianceRules'].length;
      expect(updatedRuleCount).toBeGreaterThanOrEqual(initialRuleCount);
    });

    it('应该记录规则更新事件', async () => {
      const initialEventCount = complianceManager['auditTrail'].events.length;
      await complianceManager.updateComplianceRules();
      const updatedEventCount = complianceManager['auditTrail'].events.length;
      expect(updatedEventCount).toBeGreaterThan(initialEventCount);
      
      const lastEvent = complianceManager['auditTrail'].events[updatedEventCount - 1];
      expect(lastEvent.requirement).toBe('rules_updated');
    });
  });

  describe('checkFrameworkCompliance', () => {
    it('应该检查单个框架的合规性', async () => {
      const framework = complianceManager['frameworks'].get('GDPR');
      expect(framework).toBeDefined();
      
      const status = await complianceManager['checkFrameworkCompliance'](framework!);
      expect(status.name).toBe('GDPR');
      expect(['compliant', 'non-compliant', 'partial']).toContain(status.status);
      expect(status.score).toBeGreaterThanOrEqual(0);
      expect(status.score).toBeLessThanOrEqual(100);
    });

    it('应该根据规则计算合规分数', async () => {
      const framework = complianceManager['frameworks'].get('SOC 2');
      expect(framework).toBeDefined();
      
      const status = await complianceManager['checkFrameworkCompliance'](framework!);
      expect(status.score).toBeGreaterThanOrEqual(0);
      expect(status.score).toBeLessThanOrEqual(100);
    });
  });

  describe('checkRule', () => {
    it('应该检查单个规则', async () => {
      const rule = complianceManager['complianceRules'][0];
      expect(rule).toBeDefined();
      
      const result = await complianceManager['checkRule'](rule);
      expect(['compliant', 'partial', 'non-compliant']).toContain(result);
    });

    it('应该处理不存在的检查方法', async () => {
      const rule = {
        id: 'TEST-001',
        framework: 'TEST',
        requirement: '测试规则',
        description: '测试描述',
        severity: 'high' as const,
        checkFunction: 'nonExistentMethod'
      };
      
      const result = await complianceManager['checkRule'](rule);
      expect(result).toBe('partial');
    });
  });

  describe('identifyGaps', () => {
    it('应该识别合规差距', async () => {
      const framework = complianceManager['frameworks'].get('HIPAA');
      expect(framework).toBeDefined();
      
      const status = await complianceManager['checkFrameworkCompliance'](framework!);
      const gaps = await complianceManager['identifyGaps'](framework!, status);
      
      if (status.status !== 'compliant') {
        expect(gaps.length).toBeGreaterThan(0);
        gaps.forEach(gap => {
          expect(gap.framework).toBe('HIPAA');
          expect(gap.requirement).toBeDefined();
          expect(gap.status).toBeDefined();
          expect(gap.remediation).toBeDefined();
        });
      }
    });
  });

  describe('generateRemediation', () => {
    it('应该为规则生成补救措施', () => {
      const rule = complianceManager['complianceRules'][0];
      const remediation = complianceManager['generateRemediation'](rule);
      expect(typeof remediation).toBe('string');
      expect(remediation.length).toBeGreaterThan(0);
    });

    it('应该为未知规则生成通用补救措施', () => {
      const rule = {
        id: 'TEST-001',
        framework: 'TEST',
        requirement: '未知规则',
        description: '测试描述',
        severity: 'high' as const,
        checkFunction: 'testMethod'
      };
      
      const remediation = complianceManager['generateRemediation'](rule);
      expect(typeof remediation).toBe('string');
      expect(remediation.length).toBeGreaterThan(0);
    });
  });

  describe('generateRecommendations', () => {
    it('应该为合规状态生成推荐措施', () => {
      const status = {
        compliant: true,
        frameworks: [],
        gaps: []
      };
      
      const recommendations = complianceManager['generateRecommendations'](status);
      expect(recommendations.length).toBeGreaterThan(0);
      recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
      });
    });

    it('应该为不合规状态生成推荐措施', () => {
      const status = {
        compliant: false,
        frameworks: [],
        gaps: [
          {
            framework: 'GDPR',
            requirement: '数据主体权利',
            status: 'non-compliant' as const,
            remediation: '实施用户数据管理界面'
          }
        ]
      };
      
      const recommendations = complianceManager['generateRecommendations'](status);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some(rec => rec.includes('GDPR'))).toBe(true);
    });
  });

  describe('logComplianceEvent', () => {
    it('应该记录合规事件', async () => {
      const initialEventCount = complianceManager['auditTrail'].events.length;
      await complianceManager['logComplianceEvent']('test_event', { test: 'data' });
      const updatedEventCount = complianceManager['auditTrail'].events.length;
      expect(updatedEventCount).toBeGreaterThan(initialEventCount);
    });

    it('应该限制事件数量', async () => {
      for (let i = 0; i < 15000; i++) {
        await complianceManager['logComplianceEvent'](`test_event_${i}`, { index: i });
      }
      
      const eventCount = complianceManager['auditTrail'].events.length;
      expect(eventCount).toBeLessThanOrEqual(10000);
    });
  });

  describe('checkDataSubjectRights', () => {
    it('应该检查数据主体权利', async () => {
      const result = await complianceManager['checkDataSubjectRights']();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('checkSecurityPolicy', () => {
    it('应该检查信息安全策略', async () => {
      const result = await complianceManager['checkSecurityPolicy']();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('checkAccessControl', () => {
    it('应该检查访问控制', async () => {
      const result = await complianceManager['checkAccessControl']();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('checkPHIProtection', () => {
    it('应该检查PHI保护', async () => {
      const result = await complianceManager['checkPHIProtection']();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('checkCardholderData', () => {
    it('应该检查持卡人数据', async () => {
      const result = await complianceManager['checkCardholderData']();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('checkDataBreachNotification', () => {
    it('应该检查数据泄露通知', async () => {
      const result = await complianceManager['checkDataBreachNotification']();
      expect(typeof result).toBe('boolean');
    });
  });
});
