/**
 * @file 增强型安全漏洞扫描器测试
 * @description 测试增强型安全漏洞扫描器的各项功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  EnhancedSecurityScanner,
  SecurityScanConfig,
  Vulnerability,
  SecurityScanResult
} from '../../../core/security/EnhancedSecurityScanner';

describe('EnhancedSecurityScanner', () => {
  let scanner: EnhancedSecurityScanner;
  let testDir: string;

  beforeEach(() => {
    testDir = '/tmp/test-security-scan';
    scanner = new EnhancedSecurityScanner({
      scanPaths: [testDir],
      excludePatterns: ['node_modules'],
      severityThreshold: 'medium',
      enableStaticAnalysis: true,
      enableDependencyScan: false,
      enableConfigScan: true,
      enableSecretScan: true,
      maxDepth: 5
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该成功初始化安全扫描器', () => {
      expect(scanner).toBeDefined();
      expect(scanner.getConfig().scanPaths).toContain(testDir);
    });

    it('应该使用默认配置', () => {
      const defaultScanner = new EnhancedSecurityScanner();
      const config = defaultScanner.getConfig();

      expect(config.enableStaticAnalysis).toBe(true);
      expect(config.enableDependencyScan).toBe(true);
      expect(config.enableConfigScan).toBe(true);
      expect(config.enableSecretScan).toBe(true);
    });
  });

  describe('配置管理', () => {
    it('应该成功更新配置', () => {
      scanner.updateConfig({ severityThreshold: 'high' });

      expect(scanner.getConfig().severityThreshold).toBe('high');
    });

    it('应该保持其他配置不变', () => {
      const originalPaths = scanner.getConfig().scanPaths;
      scanner.updateConfig({ severityThreshold: 'critical' });

      expect(scanner.getConfig().scanPaths).toEqual(originalPaths);
    });
  });

  describe('漏洞检测', () => {
    it('应该检测eval()使用', () => {
      const code = `
        function evaluate(code) {
          return eval(code);
        }
      `;

      const vulnerabilities = scanner['analyzeCodeForVulnerabilities']('test.ts', code);

      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities[0].type).toBe('code-injection');
      expect(vulnerabilities[0].severity.level).toBe('high');
    });

    it('应该检测innerHTML使用', () => {
      const code = `
        function setContent(html) {
          document.getElementById('app').innerHTML = html;
        }
      `;

      const vulnerabilities = scanner['analyzeCodeForVulnerabilities']('test.ts', code);

      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities[0].type).toBe('xss');
      expect(vulnerabilities[0].severity.level).toBe('medium');
    });

    it('应该检测不安全的HTTP协议', () => {
      const code = `
        const apiUrl = 'http://api.example.com/data';
      `;

      const vulnerabilities = scanner['analyzeCodeForVulnerabilities']('test.ts', code);

      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities[0].type).toBe('insecure-protocol');
      expect(vulnerabilities[0].severity.level).toBe('low');
    });

    it('应该检测环境变量使用', () => {
      const code = `
        const apiKey = process.env.API_KEY;
      `;

      const vulnerabilities = scanner['analyzeCodeForVulnerabilities']('test.ts', code);

      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities[0].type).toBe('environment-variable');
      expect(vulnerabilities[0].severity.level).toBe('info');
    });
  });

  describe('配置文件扫描', () => {
    it('应该检测硬编码密码', () => {
      const config = `
        database:
          host: localhost
          password: "hardcoded_password_123"
      `;

      const vulnerabilities = scanner['analyzeConfigForVulnerabilities']('config.yaml', config);

      const passwordVuln = vulnerabilities.find(v => v.type === 'hardcoded-credential');
      expect(passwordVuln).toBeDefined();
      expect(passwordVuln?.severity.level).toBe('critical');
    });

    it('应该检测硬编码API密钥', () => {
      const config = `
        api_key = "sk-1234567890abcdef1234567890abcdef"
      `;

      const vulnerabilities = scanner['analyzeConfigForVulnerabilities']('config.json', config);

      const apiKeyVuln = vulnerabilities.find(v => v.type === 'hardcoded-api-key');
      expect(apiKeyVuln).toBeDefined();
      expect(apiKeyVuln?.severity.level).toBe('critical');
    });

    it('应该检测localhost引用', () => {
      const config = `
        server:
          url: http://localhost:3000
      `;

      const vulnerabilities = scanner['analyzeConfigForVulnerabilities']('config.yaml', config);

      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities[0].type).toBe('localhost-reference');
      expect(vulnerabilities[0].severity.level).toBe('info');
    });
  });

  describe('密钥扫描', () => {
    it('应该检测AWS访问密钥', () => {
      const code = `
        const awsKey = 'AKIAIOSFODNN7EXAMPLE';
      `;

      const vulnerabilities = scanner['scanForSecrets']('test.ts', code);

      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities[0].title).toBe('AWS Access Key');
      expect(vulnerabilities[0].severity.level).toBe('critical');
    });

    it('应该检测GitHub令牌', () => {
      const code = `
        const githubToken = 'ghp_1234567890abcdefghijklmnopqrstuvwx';
      `;

      const vulnerabilities = scanner['scanForSecrets']('test.ts', code);

      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities[0].title).toBe('GitHub Token');
      expect(vulnerabilities[0].severity.level).toBe('critical');
    });

    it('应该检测数据库连接字符串', () => {
      const code = `
        const dbUrl = 'mongodb://user:password@localhost:27017/mydb';
      `;

      const vulnerabilities = scanner['scanForSecrets']('test.ts', code);

      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities[0].title).toBe('Database Connection String');
      expect(vulnerabilities[0].severity.level).toBe('critical');
    });

    it('应该检测私钥', () => {
      const code = `
        -----BEGIN RSA PRIVATE KEY-----
        MIIEpAIBAAKCAQEAz8...
      `;

      const vulnerabilities = scanner['scanForSecrets']('test.ts', code);

      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities[0].title).toBe('Private Key');
      expect(vulnerabilities[0].severity.level).toBe('critical');
    });

    it('应该检测JWT令牌', () => {
      const code = `
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      `;

      const vulnerabilities = scanner['scanForSecrets']('test.ts', code);

      expect(vulnerabilities.length).toBeGreaterThan(0);
      expect(vulnerabilities[0].title).toBe('JWT Token');
      expect(vulnerabilities[0].severity.level).toBe('medium');
    });
  });

  describe('严重性过滤', () => {
    it('应该根据阈值过滤漏洞', () => {
      const vulnerabilities: Vulnerability[] = [
        {
          id: 'vuln-1',
          type: 'test',
          severity: { level: 'critical', score: 10 },
          title: 'Critical',
          description: 'Critical vulnerability',
          location: { file: 'test.ts', line: 1 },
          recommendation: 'Fix it'
        },
        {
          id: 'vuln-2',
          type: 'test',
          severity: { level: 'medium', score: 6 },
          title: 'Medium',
          description: 'Medium vulnerability',
          location: { file: 'test.ts', line: 2 },
          recommendation: 'Fix it'
        },
        {
          id: 'vuln-3',
          type: 'test',
          severity: { level: 'low', score: 4 },
          title: 'Low',
          description: 'Low vulnerability',
          location: { file: 'test.ts', line: 3 },
          recommendation: 'Fix it'
        }
      ];

      const filtered = scanner['filterBySeverity'](vulnerabilities);

      expect(filtered.length).toBe(2);
      expect(filtered.map(v => v.severity.level)).toContain('critical');
      expect(filtered.map(v => v.severity.level)).toContain('medium');
      expect(filtered.map(v => v.severity.level)).not.toContain('low');
    });
  });

  describe('摘要计算', () => {
    it('应该正确计算漏洞摘要', () => {
      const vulnerabilities: Vulnerability[] = [
        {
          id: 'vuln-1',
          type: 'test',
          severity: { level: 'critical', score: 10 },
          title: 'Critical',
          description: 'Critical vulnerability',
          location: { file: 'test.ts', line: 1 },
          recommendation: 'Fix it'
        },
        {
          id: 'vuln-2',
          type: 'test',
          severity: { level: 'high', score: 8 },
          title: 'High',
          description: 'High vulnerability',
          location: { file: 'test.ts', line: 2 },
          recommendation: 'Fix it'
        },
        {
          id: 'vuln-3',
          type: 'test',
          severity: { level: 'medium', score: 6 },
          title: 'Medium',
          description: 'Medium vulnerability',
          location: { file: 'test.ts', line: 3 },
          recommendation: 'Fix it'
        },
        {
          id: 'vuln-4',
          type: 'test',
          severity: { level: 'medium', score: 6 },
          title: 'Medium 2',
          description: 'Medium vulnerability',
          location: { file: 'test.ts', line: 4 },
          recommendation: 'Fix it'
        }
      ];

      const summary = scanner['calculateSummary'](vulnerabilities);

      expect(summary.critical).toBe(1);
      expect(summary.high).toBe(1);
      expect(summary.medium).toBe(2);
      expect(summary.low).toBe(0);
      expect(summary.info).toBe(0);
    });
  });

  describe('扫描历史', () => {
    it('应该记录扫描结果', () => {
      const result: SecurityScanResult = {
        scanId: 'test-scan',
        timestamp: new Date().toISOString(),
        duration: 1000,
        totalFiles: 10,
        scannedFiles: 10,
        vulnerabilities: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        status: 'completed'
      };

      scanner['recordScanResult'](result);

      const history = scanner.getScanHistory(testDir);
      expect(history).toHaveLength(1);
      expect(history[0].scanId).toBe('test-scan');
    });

    it('应该限制历史记录数量', () => {
      for (let i = 0; i < 150; i++) {
        const result: SecurityScanResult = {
          scanId: `scan-${i}`,
          timestamp: new Date().toISOString(),
          duration: 1000,
          totalFiles: 10,
          scannedFiles: 10,
          vulnerabilities: [],
          summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
          status: 'completed'
        };

        scanner['recordScanResult'](result);
      }

      const history = scanner.getScanHistory(testDir);
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('应该返回最新的扫描结果', () => {
      const oldResult: SecurityScanResult = {
        scanId: 'old-scan',
        timestamp: new Date(Date.now() - 10000).toISOString(),
        duration: 1000,
        totalFiles: 10,
        scannedFiles: 10,
        vulnerabilities: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        status: 'completed'
      };

      const newResult: SecurityScanResult = {
        scanId: 'new-scan',
        timestamp: new Date().toISOString(),
        duration: 1000,
        totalFiles: 10,
        scannedFiles: 10,
        vulnerabilities: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        status: 'completed'
      };

      scanner['recordScanResult'](oldResult);
      scanner['recordScanResult'](newResult);

      const latest = scanner.getLatestScanResult(testDir);
      expect(latest?.scanId).toBe('new-scan');
    });
  });

  describe('安全报告生成', () => {
    it('应该生成安全报告', async () => {
      const result: SecurityScanResult = {
        scanId: 'test-scan',
        timestamp: new Date().toISOString(),
        duration: 1000,
        totalFiles: 10,
        scannedFiles: 10,
        vulnerabilities: [
          {
            id: 'vuln-1',
            type: 'test',
            severity: { level: 'critical', score: 10 },
            title: 'Critical',
            description: 'Critical vulnerability',
            location: { file: 'test.ts', line: 1 },
            recommendation: 'Fix it'
          }
        ],
        summary: { critical: 1, high: 0, medium: 0, low: 0, info: 0 },
        status: 'completed'
      };

      scanner['recordScanResult'](result);

      const report = await scanner.generateSecurityReport();

      expect(report.summary.critical).toBe(1);
      expect(report.trends).toHaveLength(1);
      expect(report.recommendations).toContain('Critical vulnerabilities found - immediate action required');
    });

    it('应该在没有扫描结果时返回空报告', async () => {
      const report = await scanner.generateSecurityReport();

      expect(report.summary.critical).toBe(0);
      expect(report.summary.high).toBe(0);
      expect(report.summary.medium).toBe(0);
      expect(report.summary.low).toBe(0);
      expect(report.summary.info).toBe(0);
      expect(report.trends).toHaveLength(0);
      expect(report.recommendations).toHaveLength(0);
    });
  });

  describe('事件发射', () => {
    it('应该在扫描开始时发射事件', async () => {
      const startHandler = vi.fn();
      scanner.on('scan-started', startHandler);

      await scanner.performFullScan();

      expect(startHandler).toHaveBeenCalled();
    });

    it('应该在扫描完成时发射事件', async () => {
      const completeHandler = vi.fn();
      scanner.on('scan-completed', completeHandler);

      await scanner.performFullScan();

      expect(completeHandler).toHaveBeenCalled();
    });

    it('应该在配置更新时发射事件', () => {
      const configHandler = vi.fn();
      scanner.on('config-updated', configHandler);

      scanner.updateConfig({ severityThreshold: 'high' });

      expect(configHandler).toHaveBeenCalled();
    });
  });

  describe('漏洞ID生成', () => {
    it('应该生成唯一的漏洞ID', () => {
      const id1 = scanner['generateVulnerabilityId']();
      const id2 = scanner['generateVulnerabilityId']();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^vuln-\d+-[a-z0-9]+$/);
    });
  });

  describe('扫描ID生成', () => {
    it('应该生成唯一的扫描ID', () => {
      const id1 = scanner['generateScanId']();
      const id2 = scanner['generateScanId']();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^scan-\d+-[a-z0-9]+$/);
    });
  });
});
