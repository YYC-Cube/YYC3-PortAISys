import { describe, it, expect, beforeEach } from 'vitest';
import { ThreatDetector } from '../../../core/security/ThreatDetector';

describe('ThreatDetector', () => {
  let threatDetector: ThreatDetector;

  beforeEach(() => {
    threatDetector = new ThreatDetector();
  });

  describe('初始化', () => {
    it('应该正确初始化威胁数据库', () => {
      const database = threatDetector['threatDatabase'];
      expect(database.size).toBeGreaterThan(0);
      expect(database.has('THREAT-001')).toBe(true);
      expect(database.has('THREAT-002')).toBe(true);
      expect(database.has('THREAT-003')).toBe(true);
    });

    it('应该正确初始化模式数据库', () => {
      const patterns = threatDetector['patternDatabase'];
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach(pattern => {
        expect(pattern.pattern).toBeDefined();
        expect(pattern.frequency).toBeGreaterThan(0);
        expect(pattern.riskScore).toBeGreaterThan(0);
      });
    });

    it('应该正确初始化检测规则', () => {
      const rules = threatDetector['detectionRules'];
      expect(rules.length).toBeGreaterThan(0);
      rules.forEach(rule => {
        expect(rule.id).toBeDefined();
        expect(rule.name).toBeDefined();
        expect(rule.pattern).toBeInstanceOf(RegExp);
        expect(['low', 'medium', 'high', 'critical']).toContain(rule.severity);
        expect(['block', 'alert', 'monitor']).toContain(rule.action);
      });
    });
  });

  describe('detectThreats', () => {
    it('应该检测威胁', async () => {
      const result = await threatDetector.detectThreats();
      expect(result).toBeDefined();
      expect(result.threats).toBeDefined();
      expect(result.riskLevel).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('应该返回有效的威胁列表', async () => {
      const result = await threatDetector.detectThreats();
      expect(Array.isArray(result.threats)).toBe(true);
      result.threats.forEach(threat => {
        expect(threat.id).toBeDefined();
        expect(threat.type).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(threat.severity);
        expect(threat.description).toBeDefined();
        expect(Array.isArray(threat.affectedResources)).toBe(true);
      });
    });

    it('应该返回有效的风险级别', async () => {
      const result = await threatDetector.detectThreats();
      expect(['low', 'medium', 'high', 'critical']).toContain(result.riskLevel);
    });

    it('应该返回推荐措施', async () => {
      const result = await threatDetector.detectThreats();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
      result.recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });

    it('应该根据威胁严重性计算风险级别', async () => {
      const result = await threatDetector.detectThreats();
      const maxSeverity = result.threats.reduce((max, threat) => {
        const severityScore = threatDetector['getSeverityScore'](threat.severity);
        return severityScore > max ? severityScore : max;
      }, 0);
      
      const expectedRiskLevel = threatDetector['calculateRiskLevel'](maxSeverity);
      expect(result.riskLevel).toBe(expectedRiskLevel);
    });
  });

  describe('analyzeThreatPatterns', () => {
    it('应该分析威胁模式', async () => {
      const patterns = await threatDetector.analyzeThreatPatterns();
      expect(Array.isArray(patterns)).toBe(true);
      patterns.forEach(pattern => {
        expect(pattern.pattern).toBeDefined();
        expect(pattern.frequency).toBeGreaterThan(0);
        expect(pattern.riskScore).toBeGreaterThan(0);
      });
    });

    it('应该按风险分数排序模式', async () => {
      const patterns = await threatDetector.analyzeThreatPatterns();
      for (let i = 0; i < patterns.length - 1; i++) {
        expect(patterns[i].riskScore).toBeGreaterThanOrEqual(patterns[i + 1].riskScore);
      }
    });

    it('应该更新模式数据库', async () => {
      const initialPatterns = threatDetector['patternDatabase'];
      await threatDetector.analyzeThreatPatterns();
      const updatedPatterns = threatDetector['patternDatabase'];
      expect(updatedPatterns.length).toBeGreaterThan(0);
    });
  });

  describe('generateThreatReport', () => {
    it('应该生成威胁报告', async () => {
      const report = await threatDetector.generateThreatReport();
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.details).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('应该包含摘要', async () => {
      const report = await threatDetector.generateThreatReport();
      expect(typeof report.summary).toBe('string');
      expect(report.summary.length).toBeGreaterThan(0);
    });

    it('应该包含威胁详情', async () => {
      const report = await threatDetector.generateThreatReport();
      expect(Array.isArray(report.details)).toBe(true);
      report.details.forEach(threat => {
        expect(threat.id).toBeDefined();
        expect(threat.type).toBeDefined();
        expect(threat.severity).toBeDefined();
        expect(threat.description).toBeDefined();
      });
    });

    it('应该包含趋势分析', async () => {
      const report = await threatDetector.generateThreatReport();
      expect(Array.isArray(report.trends)).toBe(true);
      report.trends.forEach(trend => {
        expect(trend.pattern).toBeDefined();
        expect(trend.frequency).toBeGreaterThan(0);
        expect(trend.riskScore).toBeGreaterThan(0);
      });
    });

    it('应该包含推荐措施', async () => {
      const report = await threatDetector.generateThreatReport();
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('applyDetectionRule', () => {
    it('应该应用检测规则', async () => {
      const rule = threatDetector['detectionRules'][0];
      const threats = await threatDetector['applyDetectionRule'](rule);
      expect(Array.isArray(threats)).toBe(true);
      expect(threats.length).toBeGreaterThan(0);
    });

    it('应该将检测到的威胁添加到数据库', async () => {
      const initialSize = threatDetector['threatDatabase'].size;
      const rule = threatDetector['detectionRules'][0];
      await threatDetector['applyDetectionRule'](rule);
      const updatedSize = threatDetector['threatDatabase'].size;
      expect(updatedSize).toBeGreaterThan(initialSize);
    });
  });

  describe('getSeverityScore', () => {
    it('应该返回正确的严重性分数', () => {
      expect(threatDetector['getSeverityScore']('critical')).toBe(4);
      expect(threatDetector['getSeverityScore']('high')).toBe(3);
      expect(threatDetector['getSeverityScore']('medium')).toBe(2);
      expect(threatDetector['getSeverityScore']('low')).toBe(1);
    });

    it('应该为未知严重性返回0', () => {
      expect(threatDetector['getSeverityScore']('unknown')).toBe(0);
    });
  });

  describe('calculateRiskLevel', () => {
    it('应该根据最大严重性计算风险级别', () => {
      expect(threatDetector['calculateRiskLevel'](4)).toBe('critical');
      expect(threatDetector['calculateRiskLevel'](3)).toBe('high');
      expect(threatDetector['calculateRiskLevel'](2)).toBe('medium');
      expect(threatDetector['calculateRiskLevel'](1)).toBe('low');
      expect(threatDetector['calculateRiskLevel'](0)).toBe('low');
    });
  });

  describe('generateRecommendations', () => {
    it('应该为空威胁列表生成推荐', () => {
      const recommendations = threatDetector['generateRecommendations']([]);
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('应该为严重威胁生成推荐', () => {
      const threats = [
        {
          id: 'THREAT-001',
          type: 'SQL Injection',
          severity: 'critical' as const,
          description: '严重威胁',
          affectedResources: []
        }
      ];
      const recommendations = threatDetector['generateRecommendations'](threats);
      expect(recommendations.some(rec => rec.includes('立即处理'))).toBe(true);
    });

    it('应该为高危威胁生成推荐', () => {
      const threats = [
        {
          id: 'THREAT-001',
          type: 'XSS Attack',
          severity: 'high' as const,
          description: '高危威胁',
          affectedResources: []
        }
      ];
      const recommendations = threatDetector['generateRecommendations'](threats);
      expect(recommendations.some(rec => rec.includes('优先处理'))).toBe(true);
    });

    it('应该为中危威胁生成推荐', () => {
      const threats = [
        {
          id: 'THREAT-001',
          type: 'Brute Force',
          severity: 'medium' as const,
          description: '中危威胁',
          affectedResources: []
        }
      ];
      const recommendations = threatDetector['generateRecommendations'](threats);
      expect(recommendations.some(rec => rec.includes('计划处理'))).toBe(true);
    });

    it('应该为低危威胁生成推荐', () => {
      const threats = [
        {
          id: 'THREAT-001',
          type: 'Info Disclosure',
          severity: 'low' as const,
          description: '低危威胁',
          affectedResources: []
        }
      ];
      const recommendations = threatDetector['generateRecommendations'](threats);
      expect(recommendations.some(rec => rec.includes('定期审查'))).toBe(true);
    });

    it('应该为混合严重性威胁生成推荐', () => {
      const threats = [
        {
          id: 'THREAT-001',
          type: 'SQL Injection',
          severity: 'critical' as const,
          description: '严重威胁',
          affectedResources: []
        },
        {
          id: 'THREAT-002',
          type: 'XSS Attack',
          severity: 'high' as const,
          description: '高危威胁',
          affectedResources: []
        },
        {
          id: 'THREAT-003',
          type: 'Brute Force',
          severity: 'medium' as const,
          description: '中危威胁',
          affectedResources: []
        }
      ];
      const recommendations = threatDetector['generateRecommendations'](threats);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('extractPattern', () => {
    it('应该从威胁中提取模式', () => {
      const threat = {
        id: 'THREAT-001',
        type: 'SQL Injection',
        severity: 'critical' as const,
        description: 'SQL注入攻击',
        affectedResources: []
      };
      const pattern = threatDetector['extractPattern'](threat);
      expect(pattern).toBe('sql_injection_pattern');
    });

    it('应该处理带空格的威胁类型', () => {
      const threat = {
        id: 'THREAT-001',
        type: 'Cross Site Scripting',
        severity: 'high' as const,
        description: 'XSS攻击',
        affectedResources: []
      };
      const pattern = threatDetector['extractPattern'](threat);
      expect(pattern).toBe('cross_site_scripting_pattern');
    });
  });

  describe('calculatePatternRisk', () => {
    it('应该根据频率计算模式风险', () => {
      const risk = threatDetector['calculatePatternRisk']('test_pattern', 10);
      expect(risk).toBeGreaterThan(50);
    });

    it('应该限制最大风险分数', () => {
      const risk = threatDetector['calculatePatternRisk']('test_pattern', 100);
      expect(risk).toBeLessThanOrEqual(100);
    });

    it('应该为低频率返回基础风险', () => {
      const risk = threatDetector['calculatePatternRisk']('test_pattern', 1);
      expect(risk).toBe(55);
    });
  });

  describe('generateSummary', () => {
    it('应该生成威胁摘要', () => {
      const threats = [
        {
          id: 'THREAT-001',
          type: 'SQL Injection',
          severity: 'critical' as const,
          description: '严重威胁',
          affectedResources: []
        },
        {
          id: 'THREAT-002',
          type: 'XSS Attack',
          severity: 'high' as const,
          description: '高危威胁',
          affectedResources: []
        },
        {
          id: 'THREAT-003',
          type: 'Brute Force',
          severity: 'medium' as const,
          description: '中危威胁',
          affectedResources: []
        }
      ];
      const patterns = [
        {
          pattern: 'sql_injection_pattern',
          frequency: 5,
          riskScore: 75
        }
      ];
      const summary = threatDetector['generateSummary'](threats, patterns);
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(0);
      expect(summary.includes('总威胁数')).toBe(true);
      expect(summary.includes('严重威胁')).toBe(true);
      expect(summary.includes('高危威胁')).toBe(true);
      expect(summary.includes('中危威胁')).toBe(true);
    });

    it('应该正确统计威胁数量', () => {
      const threats = [
        {
          id: 'THREAT-001',
          type: 'SQL Injection',
          severity: 'critical' as const,
          description: '严重威胁',
          affectedResources: []
        },
        {
          id: 'THREAT-002',
          type: 'XSS Attack',
          severity: 'critical' as const,
          description: '严重威胁',
          affectedResources: []
        },
        {
          id: 'THREAT-003',
          type: 'Brute Force',
          severity: 'high' as const,
          description: '高危威胁',
          affectedResources: []
        }
      ];
      const patterns = [];
      const summary = threatDetector['generateSummary'](threats, patterns);
      expect(summary.includes('总威胁数：3')).toBe(true);
      expect(summary.includes('严重威胁：2')).toBe(true);
      expect(summary.includes('高危威胁：1')).toBe(true);
    });
  });
});
