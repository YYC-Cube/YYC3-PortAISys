/**
 * @file 增强型安全漏洞扫描器
 * @description 实现全面的安全漏洞扫描功能，包括静态代码分析、依赖漏洞检测、配置安全检查等
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 * @updated 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'eventemitter3';

export interface VulnerabilitySeverity {
  level: 'critical' | 'high' | 'medium' | 'low' | 'info';
  score: number;
}

export interface VulnerabilityLocation {
  file: string;
  line: number;
  column?: number;
  codeSnippet?: string;
}

export interface Vulnerability {
  id: string;
  type: string;
  severity: VulnerabilitySeverity;
  title: string;
  description: string;
  location: VulnerabilityLocation;
  recommendation: string;
  references?: string[];
  cve?: string;
  owasp?: string;
}

export interface SecurityScanConfig {
  scanPaths: string[];
  excludePatterns: string[];
  severityThreshold: 'critical' | 'high' | 'medium' | 'low' | 'info';
  enableStaticAnalysis: boolean;
  enableDependencyScan: boolean;
  enableConfigScan: boolean;
  enableSecretScan: boolean;
  maxDepth: number;
}

export interface SecurityScanResult {
  scanId: string;
  timestamp: string;
  duration: number;
  totalFiles: number;
  scannedFiles: number;
  vulnerabilities: Vulnerability[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  status: 'completed' | 'failed' | 'partial';
}

export interface DependencyVulnerability {
  packageName: string;
  version: string;
  vulnerability: Vulnerability;
  fixAvailable: boolean;
  fixedVersion?: string;
}

export interface SecretPattern {
  name: string;
  pattern: RegExp;
  severity: VulnerabilitySeverity;
  description: string;
}

export class EnhancedSecurityScanner extends EventEmitter {
  private config: SecurityScanConfig;
  private secretPatterns: SecretPattern[] = [];
  private vulnerabilityHistory: Map<string, SecurityScanResult[]> = new Map();

  constructor(config: Partial<SecurityScanConfig> = {}) {
    super();
    this.config = {
      scanPaths: ['.'],
      excludePatterns: ['node_modules', 'dist', 'build', '.git'],
      severityThreshold: 'medium',
      enableStaticAnalysis: true,
      enableDependencyScan: true,
      enableConfigScan: true,
      enableSecretScan: true,
      maxDepth: 10,
      ...config
    };

    this.initializeSecretPatterns();
  }

  private initializeSecretPatterns(): void {
    this.secretPatterns = [
      {
        name: 'AWS Access Key',
        pattern: /AKIA[0-9A-Z]{16}/g,
        severity: { level: 'critical', score: 10 },
        description: 'AWS Access Key detected'
      },
      {
        name: 'AWS Secret Key',
        pattern: /\b[0-9a-zA-Z/+]{40}\b/g,
        severity: { level: 'critical', score: 10 },
        description: 'AWS Secret Key detected'
      },
      {
        name: 'GitHub Token',
        pattern: /ghp_[a-zA-Z0-9]{32,40}/g,
        severity: { level: 'critical', score: 10 },
        description: 'GitHub Personal Access Token detected'
      },
      {
        name: 'API Key',
        pattern: /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/gi,
        severity: { level: 'high', score: 8 },
        description: 'Potential API key detected'
      },
      {
        name: 'Database Connection String',
        pattern: /(mongodb|mysql|postgresql|redis):\/\/[^\s'"]+/gi,
        severity: { level: 'critical', score: 10 },
        description: 'Database connection string detected'
      },
      {
        name: 'Private Key',
        pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
        severity: { level: 'critical', score: 10 },
        description: 'Private key detected'
      },
      {
        name: 'JWT Token',
        pattern: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
        severity: { level: 'medium', score: 6 },
        description: 'JWT token detected'
      },
      {
        name: 'Password in Code',
        pattern: /password\s*[:=]\s*['"]?[^'"\s]{4,}['"]?/gi,
        severity: { level: 'high', score: 8 },
        description: 'Potential password in code'
      }
    ];
  }

  async performFullScan(): Promise<SecurityScanResult> {
    const scanId = this.generateScanId();
    const startTime = Date.now();

    this.emit('scan-started', { scanId });

    try {
      const vulnerabilities: Vulnerability[] = [];
      const files = this.collectFiles();

      this.emit('files-collected', { scanId, count: files.length });

      if (this.config.enableStaticAnalysis) {
        const staticVulns = await this.performStaticAnalysis(files);
        vulnerabilities.push(...staticVulns);
      }

      if (this.config.enableDependencyScan) {
        const depVulns = await this.performDependencyScan();
        vulnerabilities.push(...depVulns);
      }

      if (this.config.enableConfigScan) {
        const configVulns = await this.performConfigScan(files);
        vulnerabilities.push(...configVulns);
      }

      if (this.config.enableSecretScan) {
        const secretVulns = await this.performSecretScan(files);
        vulnerabilities.push(...secretVulns);
      }

      const duration = Date.now() - startTime;
      const result = this.createScanResult(scanId, duration, files.length, vulnerabilities);

      this.recordScanResult(result);
      this.emit('scan-completed', result);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: SecurityScanResult = {
        scanId,
        timestamp: new Date().toISOString(),
        duration,
        totalFiles: 0,
        scannedFiles: 0,
        vulnerabilities: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        status: 'failed'
      };

      this.emit('scan-failed', { scanId, error });
      return result;
    }
  }

  private generateScanId(): string {
    return `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private collectFiles(): string[] {
    const files: string[] = [];

    for (const scanPath of this.config.scanPaths) {
      this.collectFilesRecursive(scanPath, files, 0);
    }

    return files;
  }

  private collectFilesRecursive(dir: string, files: string[], depth: number): void {
    if (depth > this.config.maxDepth) {
      return;
    }

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (this.shouldExclude(fullPath)) {
          continue;
        }

        if (entry.isDirectory()) {
          this.collectFilesRecursive(fullPath, files, depth + 1);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.emit('error', `Failed to read directory ${dir}: ${error}`);
    }
  }

  private shouldExclude(filePath: string): boolean {
    const relativePath = path.relative(process.cwd(), filePath);

    for (const pattern of this.config.excludePatterns) {
      if (relativePath.includes(pattern)) {
        return true;
      }
    }

    return false;
  }

  private async performStaticAnalysis(files: string[]): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    const codeFiles = files.filter(f => /\.(ts|tsx|js|jsx)$/.test(f));

    for (const file of codeFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const fileVulns = this.analyzeCodeForVulnerabilities(file, content);
        vulnerabilities.push(...fileVulns);
      } catch (error) {
        this.emit('error', `Failed to analyze file ${file}: ${error}`);
      }
    }

    return vulnerabilities;
  }

  private analyzeCodeForVulnerabilities(filePath: string, content: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (line.includes('eval(')) {
        vulnerabilities.push({
          id: this.generateVulnerabilityId(),
          type: 'code-injection',
          severity: { level: 'high', score: 8 },
          title: 'Use of eval() detected',
          description: 'eval() can execute arbitrary code and is a security risk',
          location: { file: filePath, line: index + 1, codeSnippet: line.trim() },
          recommendation: 'Avoid using eval(). Use safer alternatives like JSON.parse() or function constructors.',
          owasp: 'A03:2021 - Injection'
        });
      }

      if (line.includes('innerHTML')) {
        vulnerabilities.push({
          id: this.generateVulnerabilityId(),
          type: 'xss',
          severity: { level: 'medium', score: 6 },
          title: 'Potential XSS vulnerability',
          description: 'innerHTML can lead to Cross-Site Scripting attacks',
          location: { file: filePath, line: index + 1, codeSnippet: line.trim() },
          recommendation: 'Use textContent or sanitize HTML before inserting.',
          owasp: 'A03:2021 - Injection'
        });
      }

      if (line.match(/http:\/\//)) {
        vulnerabilities.push({
          id: this.generateVulnerabilityId(),
          type: 'insecure-protocol',
          severity: { level: 'low', score: 4 },
          title: 'Insecure HTTP protocol',
          description: 'HTTP is not encrypted and can be intercepted',
          location: { file: filePath, line: index + 1, codeSnippet: line.trim() },
          recommendation: 'Use HTTPS instead of HTTP.',
          owasp: 'A02:2021 - Cryptographic Failures'
        });
      }

      if (line.includes('process.env.') && !line.includes('NODE_ENV')) {
        vulnerabilities.push({
          id: this.generateVulnerabilityId(),
          type: 'environment-variable',
          severity: { level: 'info', score: 2 },
          title: 'Environment variable usage',
          description: 'Environment variable detected - ensure sensitive data is properly managed',
          location: { file: filePath, line: index + 1, codeSnippet: line.trim() },
          recommendation: 'Ensure environment variables are properly documented and secured.'
        });
      }
    });

    return vulnerabilities;
  }

  private async performDependencyScan(): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        return vulnerabilities;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      for (const [name, version] of Object.entries(dependencies)) {
        const depVulns = await this.checkPackageVulnerabilities(name, version as string);
        vulnerabilities.push(...depVulns);
      }
    } catch (error) {
      this.emit('error', `Failed to scan dependencies: ${error}`);
    }

    return vulnerabilities;
  }

  private async checkPackageVulnerabilities(packageName: string, version: string): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    try {
      const response = await fetch(`https://registry.npmjs.org/${packageName}`);
      const packageData = await response.json();

      if (packageData.versions && packageData.versions[version]) {
        const packageInfo = packageData.versions[version];

        if (packageInfo.deprecated) {
          vulnerabilities.push({
            id: this.generateVulnerabilityId(),
            type: 'deprecated-package',
            severity: { level: 'medium', score: 6 },
            title: `Deprecated package: ${packageName}`,
            description: packageInfo.deprecated,
            location: { file: 'package.json', line: 0 },
            recommendation: 'Update to a maintained alternative or latest version.'
          });
        }
      }
    } catch (error) {
      this.emit('error', `Failed to check package ${packageName}: ${error}`);
    }

    return vulnerabilities;
  }

  private async performConfigScan(files: string[]): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];
    const configFiles = files.filter(f => /\.(json|yaml|yml|env|config|conf)$/.test(f));

    for (const file of configFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const fileVulns = this.analyzeConfigForVulnerabilities(file, content);
        vulnerabilities.push(...fileVulns);
      } catch (error) {
        this.emit('error', `Failed to analyze config file ${file}: ${error}`);
      }
    }

    return vulnerabilities;
  }

  private analyzeConfigForVulnerabilities(filePath: string, content: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (line.match(/password\s*[:=]\s*['"]?[^'"\s]{4,}['"]?/i)) {
        vulnerabilities.push({
          id: this.generateVulnerabilityId(),
          type: 'hardcoded-credential',
          severity: { level: 'critical', score: 10 },
          title: 'Hardcoded password detected',
          description: 'Password is hardcoded in configuration file',
          location: { file: filePath, line: index + 1, codeSnippet: line.trim() },
          recommendation: 'Move credentials to environment variables or secure vault.',
          owasp: 'A07:2021 - Identification and Authentication Failures'
        });
      }

      if (line.match(/api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/i)) {
        vulnerabilities.push({
          id: this.generateVulnerabilityId(),
          type: 'hardcoded-api-key',
          severity: { level: 'critical', score: 10 },
          title: 'Hardcoded API key detected',
          description: 'API key is hardcoded in configuration file',
          location: { file: filePath, line: index + 1, codeSnippet: line.trim() },
          recommendation: 'Move API keys to environment variables or secure vault.',
          owasp: 'A07:2021 - Identification and Authentication Failures'
        });
      }

      if ((line.includes('localhost') || line.includes('127.0.0.1')) && !line.includes('password') && !line.includes('api')) {
        vulnerabilities.push({
          id: this.generateVulnerabilityId(),
          type: 'localhost-reference',
          severity: { level: 'info', score: 2 },
          title: 'Localhost reference detected',
          description: 'Configuration references localhost which may not work in production',
          location: { file: filePath, line: index + 1, codeSnippet: line.trim() },
          recommendation: 'Ensure localhost references are replaced with appropriate production values.'
        });
      }
    });

    return vulnerabilities;
  }

  private async performSecretScan(files: string[]): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const fileVulns = this.scanForSecrets(file, content);
        vulnerabilities.push(...fileVulns);
      } catch (error) {
        this.emit('error', `Failed to scan file ${file} for secrets: ${error}`);
      }
    }

    return vulnerabilities;
  }

  private scanForSecrets(filePath: string, content: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = [];
    const lines = content.split('\n');
    const reportedLines = new Set<number>();

    for (const pattern of this.secretPatterns) {
      let match;
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);

      while ((match = regex.exec(content)) !== null) {
        const lineIndex = content.substring(0, match.index).split('\n').length - 1;

        if (reportedLines.has(lineIndex)) {
          continue;
        }

        reportedLines.add(lineIndex);
        const line = lines[lineIndex];

        vulnerabilities.push({
          id: this.generateVulnerabilityId(),
          type: 'secret-leak',
          severity: pattern.severity,
          title: pattern.name,
          description: pattern.description,
          location: {
            file: filePath,
            line: lineIndex + 1,
            codeSnippet: line.trim().substring(0, 50)
          },
          recommendation: 'Remove secrets from code and use environment variables or secret management.',
          owasp: 'A07:2021 - Identification and Authentication Failures'
        });
      }
    }

    return vulnerabilities;
  }

  private createScanResult(
    scanId: string,
    duration: number,
    totalFiles: number,
    vulnerabilities: Vulnerability[]
  ): SecurityScanResult {
    const filteredVulns = this.filterBySeverity(vulnerabilities);
    const summary = this.calculateSummary(filteredVulns);

    return {
      scanId,
      timestamp: new Date().toISOString(),
      duration,
      totalFiles,
      scannedFiles: totalFiles,
      vulnerabilities: filteredVulns,
      summary,
      status: 'completed'
    };
  }

  private filterBySeverity(vulnerabilities: Vulnerability[]): Vulnerability[] {
    const threshold = this.config.severityThreshold;
    const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
    const thresholdIndex = severityOrder.indexOf(threshold);

    return vulnerabilities.filter(v => {
      const vulnIndex = severityOrder.indexOf(v.severity.level);
      return vulnIndex <= thresholdIndex;
    });
  }

  private calculateSummary(vulnerabilities: Vulnerability[]): SecurityScanResult['summary'] {
    return {
      critical: vulnerabilities.filter(v => v.severity.level === 'critical').length,
      high: vulnerabilities.filter(v => v.severity.level === 'high').length,
      medium: vulnerabilities.filter(v => v.severity.level === 'medium').length,
      low: vulnerabilities.filter(v => v.severity.level === 'low').length,
      info: vulnerabilities.filter(v => v.severity.level === 'info').length
    };
  }

  private generateVulnerabilityId(): string {
    return `vuln-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private recordScanResult(result: SecurityScanResult): void {
    const scanPath = this.config.scanPaths[0];
    if (!this.vulnerabilityHistory.has(scanPath)) {
      this.vulnerabilityHistory.set(scanPath, []);
    }

    const history = this.vulnerabilityHistory.get(scanPath)!;
    history.push(result);

    if (history.length > 100) {
      history.shift();
    }
  }

  getScanHistory(scanPath?: string): SecurityScanResult[] {
    if (scanPath) {
      const history = this.vulnerabilityHistory.get(scanPath) || [];
      return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    const allResults: SecurityScanResult[] = [];
    for (const results of this.vulnerabilityHistory.values()) {
      allResults.push(...results);
    }

    return allResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getLatestScanResult(scanPath?: string): SecurityScanResult | undefined {
    const history = this.getScanHistory(scanPath);
    return history.length > 0 ? history[0] : undefined;
  }

  async generateSecurityReport(): Promise<{
    summary: SecurityScanResult['summary'];
    trends: {
      date: string;
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
    }[];
    recommendations: string[];
  }> {
    const history = this.getScanHistory();
    const latestResult = this.getLatestScanResult();

    if (!latestResult) {
      return {
        summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        trends: [],
        recommendations: []
      };
    }

    const trends = history.slice(0, 10).map(result => ({
      date: result.timestamp,
      ...result.summary
    }));

    const recommendations: string[] = [];

    if (latestResult.summary.critical > 0) {
      recommendations.push('Critical vulnerabilities found - immediate action required');
    }

    if (latestResult.summary.high > 5) {
      recommendations.push('High number of high severity vulnerabilities - prioritize fixes');
    }

    if (latestResult.summary.medium > 10) {
      recommendations.push('Consider addressing medium severity vulnerabilities soon');
    }

    return {
      summary: latestResult.summary,
      trends,
      recommendations
    };
  }

  updateConfig(updates: Partial<SecurityScanConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config-updated', this.config);
  }

  getConfig(): SecurityScanConfig {
    return { ...this.config };
  }
}
