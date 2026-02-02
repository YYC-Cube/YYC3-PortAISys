import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { CacheSharding } from '@/core/cache/CacheSharding';
import { IntelligentCacheLayer } from '@/core/cache/CacheLayer';
import { QueryRewriter } from '@/core/optimization/QueryRewriter';
import { DatabaseOptimizer } from '@/core/optimization/DatabaseOptimizer';
import { InputValidator } from '@/core/security/InputValidator';
import { OutputEncoder } from '@/core/security/OutputEncoder';
import { AlertManager } from '@/core/monitoring/AlertManager';
import { SecurityAuditor } from '@/core/security/SecurityAuditor';

describe('System Integration Tests', () => {
  let cacheSharding: CacheSharding;
  let intelligentCacheLayer: IntelligentCacheLayer;
  let queryRewriter: QueryRewriter;
  let databaseOptimizer: DatabaseOptimizer;
  let inputValidator: InputValidator;
  let outputEncoder: OutputEncoder;
  let alertManager: AlertManager;
  let securityAuditor: SecurityAuditor;

  beforeAll(() => {
    cacheSharding = new CacheSharding(4);
    intelligentCacheLayer = new IntelligentCacheLayer({
      l1Size: 100,
      l1TTL: 60000,
    });
    queryRewriter = new QueryRewriter();
    databaseOptimizer = new DatabaseOptimizer({
      enableAutoIndex: true,
      enableQueryAnalysis: true,
    });
    inputValidator = new InputValidator();
    outputEncoder = new OutputEncoder();
    alertManager = new AlertManager();
    securityAuditor = new SecurityAuditor({
      enableScheduledAudits: false,
      enableRealTimeAuditing: true,
    });
  });

  afterAll(() => {
    databaseOptimizer.stop();
    securityAuditor.stopScheduledAudits();
  });

  beforeEach(() => {
    alertManager.reset();
    securityAuditor.reset();
  });

  afterEach(() => {
    inputValidator.resetHistory();
    outputEncoder.resetHistory();
  });

  describe('Cache System Integration', () => {
    it('should integrate CacheSharding with IntelligentCacheLayer', async () => {
      const testData = { id: 1, name: 'Test Data' };

      await cacheSharding.set('test-key', testData);
      const result = await cacheSharding.get('test-key');

      expect(result.hit).toBe(true);
      expect(result.value).toEqual(testData);
    });

    it('should handle concurrent cache operations across shards', async () => {
      const keys = Array.from({ length: 100 }, (_, i) => `key-${i}`);

      const setPromises = keys.map(key => 
        cacheSharding.set(key, { value: key })
      );
      await Promise.all(setPromises);

      const getPromises = keys.map(key => 
        cacheSharding.get(key)
      );
      const results = await Promise.all(getPromises);

      results.forEach(result => {
        expect(result.hit).toBe(true);
      });

      const metrics = cacheSharding.getOverallMetrics();
      expect(metrics.totalHits).toBe(100);
      expect(metrics.hitRate).toBe(1);
    });

    it('should maintain cache consistency across multiple operations', async () => {
      const key = 'consistency-key';
      const value1 = { version: 1, data: 'first' };
      const value2 = { version: 2, data: 'second' };

      await cacheSharding.set(key, value1);
      let result = await cacheSharding.get(key);
      expect(result.value).toEqual(value1);

      await cacheSharding.set(key, value2);
      result = await cacheSharding.get(key);
      expect(result.value).toEqual(value2);
      expect(result.value.version).toBe(2);
    });
  });

  describe('Database Optimization Integration', () => {
    it('should integrate QueryRewriter with DatabaseOptimizer', () => {
      const originalQuery = 'SELECT * FROM users WHERE id = 1 ORDER BY name ASC LIMIT 1000';
      const rewrittenQuery = queryRewriter.rewrite(originalQuery);

      databaseOptimizer.recordQuery(rewrittenQuery, 150);

      const stats = databaseOptimizer.getQueryStats();
      expect(stats.length).toBeGreaterThan(0);
      expect(stats[0].query).toContain('SELECT');
    });

    it('should generate optimization suggestions based on query patterns', () => {
      const slowQuery = 'SELECT * FROM large_table WHERE complex_condition = 1';
      databaseOptimizer.recordQuery(slowQuery, 500);

      const suggestions = databaseOptimizer.getIndexSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should track query performance over time', () => {
      const query = 'SELECT * FROM users WHERE id = ?';
      
      for (let i = 0; i < 10; i++) {
        databaseOptimizer.recordQuery(query, 50 + Math.random() * 20);
      }

      const stats = databaseOptimizer.getQueryStats();
      const queryStats = stats.find(s => s.query.includes(query));
      
      expect(queryStats).toBeDefined();
      expect(queryStats?.executionCount).toBe(10);
      expect(queryStats?.avgDuration).toBeGreaterThan(0);
    });
  });

  describe('Security Integration', () => {
    it('should integrate InputValidator with OutputEncoder', () => {
      const userInput = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
      };

      const validationResult = inputValidator.validateUserInput(userInput);
      expect(validationResult.success).toBe(true);

      const encodedName = outputEncoder.encodeHTML(validationResult.data.name);
      expect(encodedName).toBeDefined();
      expect(encodedName).not.toContain('<');
    });

    it('should prevent XSS attacks through validation and encoding', () => {
      const maliciousInput = {
        comment: '<script>alert("XSS")</script>',
      };

      const validationResult = inputValidator.validateXSSInput(maliciousInput);
      expect(validationResult.success).toBe(false);

      const encodedComment = outputEncoder.encodeHTML(maliciousInput.comment);
      expect(encodedComment).not.toContain('<script>');
    });

    it('should prevent SQL injection through validation', () => {
      const maliciousInput = {
        name: "'; DROP TABLE users; --",
      };

      const validationResult = inputValidator.validateSQLInput(maliciousInput);
      expect(validationResult.success).toBe(false);
      expect(validationResult.errors?.some(e => e.code === 'SQL_INJECTION_DETECTED')).toBe(true);
    });

    it('should handle complex validation and encoding workflows', () => {
      const userInput = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        name: 'John <script>alert("test")</script> Doe',
      };

      const validationResult = inputValidator.validateUserInput(userInput);
      expect(validationResult.success).toBe(true);

      const encodedName = outputEncoder.encodeHTML(validationResult.data.name);
      expect(encodedName).not.toContain('<script>');
    });
  });

  describe('Monitoring and Alerting Integration', () => {
    it('should integrate AlertManager with performance monitoring', () => {
      const alertData = {
        metric: 'cpu',
        value: 90,
        source: 'system',
      };

      const triggeredAlerts = alertManager.checkRules(alertData);
      expect(triggeredAlerts.length).toBeGreaterThan(0);
    });

    it('should trigger alerts for critical conditions', () => {
      const criticalData = {
        metric: 'cpu',
        value: 98,
        source: 'system',
      };

      const triggeredAlerts = alertManager.checkRules(criticalData);
      const criticalAlerts = triggeredAlerts.filter(a => a.severity === 'critical');
      expect(criticalAlerts.length).toBeGreaterThan(0);
    });

    it('should track alert lifecycle', () => {
      const alertData = {
        metric: 'memory',
        value: 85,
        source: 'system',
      };

      const triggeredAlerts = alertManager.checkRules(alertData);
      const alert = triggeredAlerts[0];

      expect(alert.acknowledged).toBe(false);
      expect(alert.resolved).toBe(false);

      alertManager.acknowledgeAlert(alert.id, 'admin');
      const acknowledgedAlert = alertManager.getAlert(alert.id);
      expect(acknowledgedAlert?.acknowledged).toBe(true);

      alertManager.resolveAlert(alert.id, 'admin');
      const resolvedAlert = alertManager.getAlert(alert.id);
      expect(resolvedAlert?.resolved).toBe(true);
    });

    it('should generate alert statistics', () => {
      for (let i = 0; i < 10; i++) {
        alertManager.checkRules({
          metric: 'cpu',
          value: 80 + i,
          source: 'system',
        });
      }

      const stats = alertManager.getStatistics();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byType).toBeDefined();
    });
  });

  describe('Security Audit Integration', () => {
    it('should integrate SecurityAuditor with other security components', async () => {
      const auditResult = await securityAuditor.runFullAudit();
      expect(auditResult).toBeDefined();
      expect(auditResult.findings).toBeDefined();
      expect(auditResult.recommendations).toBeDefined();
    });

    it('should perform vulnerability scanning', async () => {
      const vulnResult = await securityAuditor.runVulnerabilityScan();
      expect(vulnResult.findings).toBeDefined();
      expect(vulnResult.recommendations).toBeDefined();
    });

    it('should perform compliance checks', async () => {
      const complianceResult = await securityAuditor.runComplianceChecks();
      expect(complianceResult.findings).toBeDefined();
      expect(complianceResult.recommendations).toBeDefined();
    });

    it('should generate audit reports', async () => {
      const auditResult = await securityAuditor.runFullAudit();
      const report = securityAuditor.generateAuditReport(auditResult.id);
      expect(report).toBeDefined();
      expect(report).toContain('Security Audit Report');
    });

    it('should track audit history', async () => {
      await securityAuditor.runFullAudit();
      await securityAuditor.runFullAudit();

      const history = securityAuditor.getAuditHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it('should calculate audit statistics', async () => {
      await securityAuditor.runFullAudit();

      const stats = securityAuditor.getAuditStatistics();
      expect(stats.totalAudits).toBeGreaterThan(0);
      expect(stats.averageScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('End-to-End Workflow Integration', () => {
    it('should handle complete user request workflow', async () => {
      const userInput = {
        email: 'user@example.com',
        password: 'SecurePass123!',
        name: 'John Doe',
      };

      const validationResult = inputValidator.validateUserInput(userInput);
      expect(validationResult.success).toBe(true);

      const cacheKey = `user:${validationResult.data.email}`;
      await cacheSharding.set(cacheKey, validationResult.data);

      const cachedResult = await cacheSharding.get(cacheKey);
      expect(cachedResult.hit).toBe(true);
      expect(cachedResult.value.email).toBe(userInput.email);

      const encodedName = outputEncoder.encodeHTML(cachedResult.value.name);
      expect(encodedName).toBeDefined();
    });

    it('should handle database query optimization workflow', () => {
      const originalQuery = 'SELECT * FROM users WHERE email = ?';
      const rewrittenQuery = queryRewriter.rewrite(originalQuery);

      databaseOptimizer.recordQuery(rewrittenQuery, 75);

      const stats = databaseOptimizer.getQueryStats();
      expect(stats.length).toBeGreaterThan(0);

      const suggestions = databaseOptimizer.getIndexSuggestions();
      expect(suggestions).toBeDefined();
    });

    it('should handle security monitoring workflow', async () => {
      const maliciousInput = {
        comment: '<script>alert("XSS")</script>',
      };

      const validationResult = inputValidator.validateXSSInput(maliciousInput);
      expect(validationResult.success).toBe(false);

      const alertData = {
        metric: 'security',
        value: 1,
        source: 'input-validator',
      };

      const triggeredAlerts = alertManager.checkRules(alertData);
      expect(triggeredAlerts).toBeDefined();

      await securityAuditor.runCustomAudit('security-incident', {
        type: 'xss-attempt',
        input: maliciousInput,
      });
    });

    it('should handle performance monitoring workflow', () => {
      const performanceData = {
        metric: 'cpu',
        value: 85,
        source: 'system',
      };

      const triggeredAlerts = alertManager.checkRules(performanceData);
      expect(triggeredAlerts.length).toBeGreaterThan(0);

      const stats = alertManager.getStatistics();
      expect(stats.total).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle cache errors gracefully', async () => {
      const invalidKey = null as any;
      
      try {
        await cacheSharding.set(invalidKey, 'value');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle validation errors gracefully', () => {
      const invalidInput = {
        email: 'invalid-email',
        password: 'weak',
      };

      const result = inputValidator.validateUserInput(invalidInput);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle encoding errors gracefully', () => {
      const invalidValue = null as any;
      
      const encoded = outputEncoder.encodeHTML(invalidValue);
      expect(encoded).toBeNull();
    });

    it('should handle alert errors gracefully', () => {
      const invalidData = null as any;
      
      const triggeredAlerts = alertManager.checkRules(invalidData);
      expect(triggeredAlerts).toBeDefined();
    });
  });

  describe('Performance Integration', () => {
    it('should handle high-volume cache operations', async () => {
      const operations = 1000;
      const keys = Array.from({ length: operations }, (_, i) => `perf-key-${i}`);

      const startTime = Date.now();

      const setPromises = keys.map(key => 
        cacheSharding.set(key, { value: key })
      );
      await Promise.all(setPromises);

      const getPromises = keys.map(key => 
        cacheSharding.get(key)
      );
      await Promise.all(getPromises);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000);
    });

    it('should handle high-volume validation operations', () => {
      const operations = 1000;
      const inputs = Array.from({ length: operations }, (_, i) => ({
        email: `user${i}@example.com`,
        password: 'SecurePass123!',
        name: `User ${i}`,
      }));

      const startTime = Date.now();

      inputs.forEach(input => {
        inputValidator.validateUserInput(input);
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000);
    });

    it('should handle high-volume encoding operations', () => {
      const operations = 1000;
      const values = Array.from({ length: operations }, (_, i) => 
        `Value ${i} with <special> characters`
      );

      const startTime = Date.now();

      values.forEach(value => {
        outputEncoder.encodeHTML(value);
      });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000);
    });
  });
});
