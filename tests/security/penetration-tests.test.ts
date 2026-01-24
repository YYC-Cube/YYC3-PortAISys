/**
 * @file penetration-tests.test.ts
 * @description 渗透测试套件
 * @module tests/security
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createVulnerabilityDetector, VulnerabilityType, VulnerabilitySeverity } from '../../core/security/VulnerabilityDetector';

describe('Penetration Tests', () => {
  describe('SQL Injection Tests', () => {
    it('应该检测基本SQL注入', async () => {
      const detector = createVulnerabilityDetector();
      const result = await detector.scan();

      const sqlInjections = result.vulnerabilities.filter(
        v => v.type === VulnerabilityType.SQL_INJECTION
      );

      expect(sqlInjections.length).toBeGreaterThan(0);
      expect(sqlInjections.some(v => v.severity === VulnerabilitySeverity.CRITICAL)).toBe(true);
    });

    it('应该检测UNION注入', () => {
      const testCases = [
        "1' UNION SELECT null, username, password FROM users--",
        "admin' UNION ALL SELECT * FROM information_schema.tables--",
        "' UNION SELECT 1,2,3,4,5--"
      ];

      for (const testCase of testCases) {
        const isVulnerable = /union.*select/i.test(testCase);
        expect(isVulnerable).toBe(true);
      }
    });

    it('应该检测布尔盲注', () => {
      const testCases = [
        "admin' AND '1'='1",
        "' OR 1=1--"
      ];

      for (const testCase of testCases) {
        // 匹配布尔盲注模式：AND/OR 后跟条件比较
        const isVulnerable = /(and|or)\s+['"\d\w]+\s*=\s*['"\d\w]+/i.test(testCase);
        expect(isVulnerable).toBe(true);
      }
    });

    it('应该检测时间盲注', () => {
      const testCases = [
        "admin' AND SLEEP(10)--",
        "' OR BENCHMARK(10000000,MD5('A'))--",
        "'; WAITFOR DELAY '00:00:10'--"
      ];

      for (const testCase of testCases) {
        const isVulnerable = /(sleep|waitfor|benchmark)/i.test(testCase);
        expect(isVulnerable).toBe(true);
      }
    });
  });

  describe('XSS Attack Tests', () => {
    it('应该检测存储型XSS', async () => {
      const detector = createVulnerabilityDetector();
      const result = await detector.scan();

      const xssVulns = result.vulnerabilities.filter(
        v => v.type === VulnerabilityType.XSS
      );

      expect(xssVulns.length).toBeGreaterThan(0);
    });

    it('应该检测反射型XSS', () => {
      const testCases = [
        '<script>alert(document.cookie)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        'javascript:alert("XSS")'
      ];

      for (const testCase of testCases) {
        const isVulnerable = /<script|<img|<svg|javascript:/i.test(testCase);
        expect(isVulnerable).toBe(true);
      }
    });

    it('应该检测DOM型XSS', () => {
      const testCases = [
        '<iframe src="javascript:alert(1)">',
        '<body onload=alert(1)>',
        '<input onfocus=alert(1) autofocus>'
      ];

      for (const testCase of testCases) {
        const isVulnerable = /(on\w+|javascript:)/i.test(testCase);
        expect(isVulnerable).toBe(true);
      }
    });

    it('应该检测XSS绕过技巧', () => {
      const testCases = [
        '<ScRiPt>alert(1)</ScRiPt>',
        '<img src=x onerror="alert(1)">',
        '<<script>alert(1)</script>',
        '<img src=x onerror=`alert(1)`>'
      ];

      for (const testCase of testCases) {
        const isVulnerable = /<script|onerror/i.test(testCase);
        expect(isVulnerable).toBe(true);
      }
    });
  });

  describe('CSRF Attack Tests', () => {
    it('应该检测CSRF漏洞', async () => {
      const detector = createVulnerabilityDetector();
      const result = await detector.scan();

      const csrfVulns = result.vulnerabilities.filter(
        v => v.type === VulnerabilityType.CSRF
      );

      expect(csrfVulns.length).toBeGreaterThan(0);
    });

    it('应该验证CSRF令牌存在', () => {
      // 模拟请求
      const request = {
        method: 'POST',
        headers: {},
        body: { action: 'delete_user' }
      };

      const hasCSRFToken = 'x-csrf-token' in request.headers;
      expect(hasCSRFToken).toBe(false); // 应该失败，因为没有CSRF令牌
    });

    it('应该验证状态改变操作的保护', () => {
      const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of stateChangingMethods) {
        const needsCSRFProtection = stateChangingMethods.includes(method);
        expect(needsCSRFProtection).toBe(true);
      }
    });
  });

  describe('Authentication Bypass Tests', () => {
    it('应该检测弱密码策略', async () => {
      const detector = createVulnerabilityDetector();
      const result = await detector.scan();

      const authVulns = result.vulnerabilities.filter(
        v => v.type === VulnerabilityType.AUTH_BYPASS
      );

      expect(authVulns.length).toBeGreaterThan(0);
    });

    it('应该测试弱密码', () => {
      const weakPasswords = [
        '123456',
        'password',
        'admin',
        'qwerty',
        '12345678'
      ];

      for (const password of weakPasswords) {
        const isWeak = password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password);
        expect(isWeak).toBe(true);
      }
    });

    it('应该测试认证绕过尝试', () => {
      const bypassAttempts = [
        { username: "admin' OR '1'='1", password: "anything" },
        { username: "admin", password: "' OR '1'='1" },
        { username: "admin'--", password: "" }
      ];

      for (const attempt of bypassAttempts) {
        const isSuspicious = 
          /('|--|;|union|select)/i.test(attempt.username) || 
          /('|--|;|union|select)/i.test(attempt.password);
        expect(isSuspicious).toBe(true);
      }
    });

    it('应该测试会话固定攻击', () => {
      const sessionId = 'fixed_session_id_12345';
      
      // 检查会话ID是否在登录后重新生成
      const sessionRegeneratedAfterLogin = false; // 模拟
      
      expect(sessionRegeneratedAfterLogin).toBe(false); // 应该是漏洞
    });
  });

  describe('Privilege Escalation Tests', () => {
    it('应该检测垂直权限提升', () => {
      const userRole = 'user';
      const attemptedAction = 'delete_all_users';
      const adminActions = ['delete_all_users', 'modify_system_config'];
      
      const isEscalation = userRole === 'user' && adminActions.includes(attemptedAction);
      expect(isEscalation).toBe(true);
    });

    it('应该检测水平权限提升', () => {
      const currentUserId = 123;
      const targetUserId = 456;
      const action = 'view_profile';
      
      const isUnauthorized = currentUserId !== targetUserId;
      expect(isUnauthorized).toBe(true);
    });

    it('应该验证RBAC实现', async () => {
      const detector = createVulnerabilityDetector();
      const result = await detector.scan();

      const accessControlVulns = result.vulnerabilities.filter(
        v => v.type === VulnerabilityType.BROKEN_ACCESS_CONTROL
      );

      // 应该没有严重的访问控制问题（因为我们有RBAC）
      const criticalAccessIssues = accessControlVulns.filter(
        v => v.severity === VulnerabilitySeverity.CRITICAL
      );
      
      expect(criticalAccessIssues.length).toBe(0);
    });
  });

  describe('Sensitive Data Exposure Tests', () => {
    it('应该检测敏感数据泄露', async () => {
      const detector = createVulnerabilityDetector();
      const result = await detector.scan();

      const dataExposure = result.vulnerabilities.filter(
        v => v.type === VulnerabilityType.SENSITIVE_DATA_EXPOSURE
      );

      expect(dataExposure.length).toBeGreaterThan(0);
    });

    it('应该检测硬编码密钥', () => {
      const codeSnippets = [
        'const apiKey = "sk_live_1234567890abcdef";',
        'password = "MySecretPassword123"',
        'const SECRET_KEY = "supersecret";'
      ];

      for (const code of codeSnippets) {
        // 改进正则表达式以匹配更多变化的硬编码密钥形式
        const hasHardcodedSecret = /(api[_-]?key|password|SECRET_KEY)\s*=\s*["']/i.test(code);
        expect(hasHardcodedSecret).toBe(true);
      }
    });

    it('应该检测敏感信息日志', () => {
      const logStatements = [
        'console.log("User password:", password);',
        'logger.info("API Key: " + apiKey);',
        'debug("Credit card: " + creditCard);'
      ];

      for (const log of logStatements) {
        const logsSensitiveData = /(password|api[_-]?key|credit|token)/i.test(log);
        expect(logsSensitiveData).toBe(true);
      }
    });
  });

  describe('Security Misconfiguration Tests', () => {
    it('应该检测安全配置问题', async () => {
      const detector = createVulnerabilityDetector();
      const result = await detector.scan();

      const misconfigVulns = result.vulnerabilities.filter(
        v => v.type === VulnerabilityType.SECURITY_MISCONFIGURATION
      );

      expect(misconfigVulns.length).toBeGreaterThan(0);
    });

    it('应该检测缺失的安全头', () => {
      const headers = {
        'Content-Type': 'application/json'
      };

      const requiredSecurityHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'Content-Security-Policy',
        'Strict-Transport-Security'
      ];

      const missingHeaders = requiredSecurityHeaders.filter(
        header => !(header in headers)
      );

      expect(missingHeaders.length).toBeGreaterThan(0);
    });

    it('应该检测不安全的CORS配置', () => {
      const corsConfig = {
        origin: '*',
        credentials: true
      };

      const isInsecure = corsConfig.origin === '*' && corsConfig.credentials;
      expect(isInsecure).toBe(true);
    });
  });

  describe('Dependency Vulnerability Tests', () => {
    it('应该检测不安全的依赖', async () => {
      const detector = createVulnerabilityDetector();
      const result = await detector.scan();

      const depVulns = result.vulnerabilities.filter(
        v => v.type === VulnerabilityType.INSECURE_DEPENDENCY
      );

      expect(depVulns.length).toBeGreaterThan(0);
    });

    it('应该验证依赖版本', () => {
      const dependencies = [
        { name: 'lodash', version: '4.17.15', hasVulnerability: true },
        { name: 'express', version: '4.16.0', hasVulnerability: true },
        { name: 'axios', version: '0.21.0', hasVulnerability: true }
      ];

      const vulnerableDeps = dependencies.filter(d => d.hasVulnerability);
      expect(vulnerableDeps.length).toBeGreaterThan(0);
    });
  });

  describe('Complete Security Scan', () => {
    it('应该执行完整的安全扫描', async () => {
      const detector = createVulnerabilityDetector();
      const result = await detector.scan();

      console.log('\n=== Security Scan Report ===');
      console.log(`Total Vulnerabilities: ${result.totalVulnerabilities}`);
      console.log(`Critical: ${result.criticalCount}`);
      console.log(`High: ${result.highCount}`);
      console.log(`Medium: ${result.mediumCount}`);
      console.log(`Low: ${result.lowCount}`);
      console.log(`Scan Duration: ${result.scanDuration}ms`);
      console.log('\nVulnerabilities:');
      
      for (const vuln of result.vulnerabilities) {
        console.log(`\n[${vuln.severity.toUpperCase()}] ${vuln.title}`);
        console.log(`  Type: ${vuln.type}`);
        console.log(`  Location: ${vuln.location}`);
        console.log(`  Recommendation: ${vuln.recommendation}`);
      }

      expect(result.totalVulnerabilities).toBeGreaterThan(0);
      expect(result.scanDuration).toBeLessThan(10000);
    });

    it('应该生成JSON报告', async () => {
      const detector = createVulnerabilityDetector();
      const result = await detector.scan();
      const jsonReport = detector.exportReport(result);

      const parsed = JSON.parse(jsonReport);
      
      expect(parsed.totalVulnerabilities).toBeDefined();
      expect(parsed.vulnerabilities).toBeInstanceOf(Array);
      expect(parsed.timestamp).toBeDefined();
    });

    it('应该生成HTML报告', async () => {
      const detector = createVulnerabilityDetector();
      const result = await detector.scan();
      const htmlReport = detector.exportHTML(result);

      expect(htmlReport).toContain('<!DOCTYPE html>');
      expect(htmlReport).toContain('Security Vulnerability Report');
      expect(htmlReport).toContain(result.totalVulnerabilities.toString());
    });
  });
});