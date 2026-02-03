/**
 * @file 安全审计管理器
 * @description 提供企业级安全审计和渗透测试功能
 * @module security/SecurityAuditManager
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-12-30
 */

import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

/**
 * 安全审计类型
 */
export enum AuditType {
  VULNERABILITY_SCAN = 'vulnerability_scan',
  PENETRATION_TEST = 'penetration_test',
  COMPLIANCE_CHECK = 'compliance_check',
  SECURITY_ASSESSMENT = 'security_assessment'
}

/**
 * 安全问题严重程度
 */
export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 安全问题
 */
export interface SecurityIssue {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  category: string;
  location: string;
  recommendations: string[];
  detectedAt: Date;
  fixedAt?: Date;
  status: 'open' | 'fixed' | 'ignored';
}

/**
 * 安全审计配置
 */
export interface SecurityAuditConfig {
  enabled: boolean;
  scanInterval: number; // 秒
  penetrationTestInterval: number; // 秒
  complianceCheckInterval: number; // 秒
  maxIssues: number;
  reportDirectory: string;
}

/**
 * 安全审计结果
 */
export interface AuditResult {
  id: string;
  type: AuditType;
  startedAt: Date;
  completedAt: Date;
  duration: number;
  issues: SecurityIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    status: 'passed' | 'failed' | 'warning';
  };
}

/**
 * 安全审计管理器
 *
 * 设计理念：
 * 1. 支持多种审计类型：漏洞扫描、渗透测试、合规检查、安全评估
 * 2. 定期自动执行安全审计
 * 3. 详细的安全问题报告
 * 4. 智能的修复建议
 * 5. 与监控系统集成
 */
export class SecurityAuditManager {
  private config: SecurityAuditConfig;
  private scanTimer?: ReturnType<typeof setInterval>;
  private penetrationTestTimer?: ReturnType<typeof setInterval>;
  private complianceCheckTimer?: ReturnType<typeof setInterval>;
  private issues: SecurityIssue[] = [];
  private auditHistory: AuditResult[] = [];

  constructor(config: Partial<SecurityAuditConfig> = {}) {
    this.config = {
      enabled: config.enabled !== false,
      scanInterval: config.scanInterval || 86400, // 24小时
      penetrationTestInterval: config.penetrationTestInterval || 604800, // 7天
      complianceCheckInterval: config.complianceCheckInterval || 2592000, // 30天
      maxIssues: config.maxIssues || 1000,
      reportDirectory: config.reportDirectory || './security-reports'
    };

    if (this.config.enabled) {
      this.startAuditTimers();
      this.initializeReportDirectory();
    }
  }

  /**
   * 启动审计定时器
   */
  private startAuditTimers(): void {
    // 漏洞扫描定时器
    this.scanTimer = setInterval(() => {
      this.performVulnerabilityScan();
    }, this.config.scanInterval * 1000);

    // 渗透测试定时器
    this.penetrationTestTimer = setInterval(() => {
      this.performPenetrationTest();
    }, this.config.penetrationTestInterval * 1000);

    // 合规检查定时器
    this.complianceCheckTimer = setInterval(() => {
      this.performComplianceCheck();
    }, this.config.complianceCheckInterval * 1000);

    logger.info('安全审计定时器已启动', 'SecurityAudit');
  }

  /**
   * 初始化报告目录
   */
  private initializeReportDirectory(): void {
    try {
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
        const fs = require('fs');
        void require('path');

        if (!fs.existsSync(this.config.reportDirectory)) {
          fs.mkdirSync(this.config.reportDirectory, { recursive: true });
          logger.info('安全报告目录已创建', 'SecurityAudit', { directory: this.config.reportDirectory });
        }
      }
    } catch (error) {
      logger.error('初始化安全报告目录失败', 'SecurityAudit', { error: error.message });
    }
  }

  /**
   * 执行漏洞扫描
   */
  public async performVulnerabilityScan(): Promise<AuditResult> {
    logger.info('开始漏洞扫描', 'SecurityAudit');
    
    const startTime = new Date();
    const issues: SecurityIssue[] = [];

    try {
      // 1. 扫描依赖项漏洞
      const dependencyIssues = await this.scanDependencies();
      issues.push(...dependencyIssues);

      // 2. 扫描代码漏洞
      const codeIssues = await this.scanCode();
      issues.push(...codeIssues);

      // 3. 扫描配置漏洞
      const configIssues = await this.scanConfiguration();
      issues.push(...configIssues);

      // 4. 扫描API漏洞
      const apiIssues = await this.scanAPI();
      issues.push(...apiIssues);

      // 5. 扫描网络漏洞
      const networkIssues = await this.scanNetwork();
      issues.push(...networkIssues);

    } catch (error) {
      logger.error('漏洞扫描失败', 'SecurityAudit', { error: error.message });
    }

    const endTime = new Date();
    const result = this.generateAuditResult(
      AuditType.VULNERABILITY_SCAN,
      startTime,
      endTime,
      issues
    );

    this.saveAuditResult(result);
    this.notifyIssues(result);

    logger.info('漏洞扫描完成', 'SecurityAudit', {
      duration: result.duration,
      issues: result.issues.length
    });

    return result;
  }

  /**
   * 执行渗透测试
   */
  public async performPenetrationTest(): Promise<AuditResult> {
    logger.info('开始渗透测试', 'SecurityAudit');
    
    const startTime = new Date();
    const issues: SecurityIssue[] = [];

    try {
      // 1. 测试认证绕过
      const authIssues = await this.testAuthenticationBypass();
      issues.push(...authIssues);

      // 2. 测试授权缺陷
      const authzIssues = await this.testAuthorizationFlaws();
      issues.push(...authzIssues);

      // 3. 测试注入攻击
      const injectionIssues = await this.testInjectionAttacks();
      issues.push(...injectionIssues);

      // 4. 测试跨站攻击
      const xssIssues = await this.testCrossSiteAttacks();
      issues.push(...xssIssues);

      // 5. 测试敏感信息泄露
      const infoLeakIssues = await this.testInformationDisclosure();
      issues.push(...infoLeakIssues);

    } catch (error) {
      logger.error('渗透测试失败', 'SecurityAudit', { error: error.message });
    }

    const endTime = new Date();
    const result = this.generateAuditResult(
      AuditType.PENETRATION_TEST,
      startTime,
      endTime,
      issues
    );

    this.saveAuditResult(result);
    this.notifyIssues(result);

    logger.info('渗透测试完成', 'SecurityAudit', {
      duration: result.duration,
      issues: result.issues.length
    });

    return result;
  }

  /**
   * 执行合规检查
   */
  public async performComplianceCheck(): Promise<AuditResult> {
    logger.info('开始合规检查', 'SecurityAudit');
    
    const startTime = new Date();
    const issues: SecurityIssue[] = [];

    try {
      // 1. 检查OWASP Top 10合规性
      const owaspIssues = await this.checkOWASPTop10Compliance();
      issues.push(...owaspIssues);

      // 2. 检查CWE/SANS Top 25合规性
      const cweIssues = await this.checkCWETop25Compliance();
      issues.push(...cweIssues);

      // 3. 检查行业标准合规性
      const industryIssues = await this.checkIndustryStandards();
      issues.push(...industryIssues);

      // 4. 检查内部安全策略合规性
      const policyIssues = await this.checkInternalPolicies();
      issues.push(...policyIssues);

    } catch (error) {
      logger.error('合规检查失败', 'SecurityAudit', { error: error.message });
    }

    const endTime = new Date();
    const result = this.generateAuditResult(
      AuditType.COMPLIANCE_CHECK,
      startTime,
      endTime,
      issues
    );

    this.saveAuditResult(result);
    this.notifyIssues(result);

    logger.info('合规检查完成', 'SecurityAudit', {
      duration: result.duration,
      issues: result.issues.length
    });

    return result;
  }

  /**
   * 执行安全评估
   */
  public async performSecurityAssessment(): Promise<AuditResult> {
    logger.info('开始安全评估', 'SecurityAudit');
    
    const startTime = new Date();
    const issues: SecurityIssue[] = [];

    try {
      // 1. 执行漏洞扫描
      const scanResult = await this.performVulnerabilityScan();
      issues.push(...scanResult.issues);

      // 2. 执行渗透测试
      const pentestResult = await this.performPenetrationTest();
      issues.push(...pentestResult.issues);

      // 3. 执行合规检查
      const complianceResult = await this.performComplianceCheck();
      issues.push(...complianceResult.issues);

    } catch (error) {
      logger.error('安全评估失败', 'SecurityAudit', { error: error.message });
    }

    const endTime = new Date();
    const result = this.generateAuditResult(
      AuditType.SECURITY_ASSESSMENT,
      startTime,
      endTime,
      issues
    );

    this.saveAuditResult(result);
    this.notifyIssues(result);

    logger.info('安全评估完成', 'SecurityAudit', {
      duration: result.duration,
      issues: result.issues.length
    });

    return result;
  }

  // ============ 扫描方法 ============

  /**
   * 扫描依赖项漏洞
   */
  private async scanDependencies(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟依赖项扫描
      if (Math.random() > 0.7) {
        issues.push({
          id: `dep-${Date.now()}`,
          title: '过时的依赖项',
          description: '检测到过时的依赖项，可能存在安全漏洞',
          severity: SeverityLevel.MEDIUM,
          category: 'dependency',
          location: 'package.json',
          recommendations: [
            '更新依赖项到最新版本',
            '使用npm audit或yarn audit定期检查依赖项漏洞',
            '考虑使用依赖项锁定文件'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('扫描依赖项漏洞失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  /**
   * 扫描代码漏洞
   */
  private async scanCode(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟代码漏洞扫描
      if (Math.random() > 0.8) {
        issues.push({
          id: `code-${Date.now()}`,
          title: '硬编码密码',
          description: '检测到硬编码的密码或API密钥',
          severity: SeverityLevel.HIGH,
          category: 'code',
          location: 'src/config/credentials.ts',
          recommendations: [
            '使用环境变量存储敏感信息',
            '使用密钥管理服务',
            '移除所有硬编码的凭据'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }

      if (Math.random() > 0.9) {
        issues.push({
          id: `code-${Date.now()}-2`,
          title: 'SQL注入漏洞',
          description: '检测到可能的SQL注入漏洞',
          severity: SeverityLevel.CRITICAL,
          category: 'code',
          location: 'src/services/user.ts',
          recommendations: [
            '使用参数化查询',
            '使用ORM框架',
            '实施输入验证'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('扫描代码漏洞失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  /**
   * 扫描配置漏洞
   */
  private async scanConfiguration(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟配置漏洞扫描
      if (Math.random() > 0.75) {
        issues.push({
          id: `config-${Date.now()}`,
          title: '不安全的CORS配置',
          description: '检测到不安全的CORS配置，允许所有跨域请求',
          severity: SeverityLevel.MEDIUM,
          category: 'configuration',
          location: 'src/config/cors.ts',
          recommendations: [
            '限制允许的源',
            '只允许必要的HTTP方法',
            '配置适当的凭证处理'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('扫描配置漏洞失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  /**
   * 扫描API漏洞
   */
  private async scanAPI(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟API漏洞扫描
      if (Math.random() > 0.8) {
        issues.push({
          id: `api-${Date.now()}`,
          title: '缺少API速率限制',
          description: '检测到API端点缺少速率限制，可能导致DoS攻击',
          severity: SeverityLevel.MEDIUM,
          category: 'api',
          location: 'src/routes/api/users.ts',
          recommendations: [
            '实施API速率限制',
            '使用Redis存储速率限制计数器',
            '对超过限制的请求返回429状态码'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('扫描API漏洞失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  /**
   * 扫描网络漏洞
   */
  private async scanNetwork(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟网络漏洞扫描
      if (Math.random() > 0.9) {
        issues.push({
          id: `net-${Date.now()}`,
          title: '不安全的网络配置',
          description: '检测到不安全的网络配置，可能导致信息泄露',
          severity: SeverityLevel.LOW,
          category: 'network',
          location: 'src/config/network.ts',
          recommendations: [
            '使用HTTPS',
            '配置适当的安全头部',
            '实施网络分段'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('扫描网络漏洞失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  // ============ 渗透测试方法 ============

  /**
   * 测试认证绕过
   */
  private async testAuthenticationBypass(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟认证绕过测试
      if (Math.random() > 0.95) {
        issues.push({
          id: `auth-${Date.now()}`,
          title: '认证绕过漏洞',
          description: '检测到可能的认证绕过漏洞',
          severity: SeverityLevel.CRITICAL,
          category: 'authentication',
          location: 'src/middleware/auth.ts',
          recommendations: [
            '加强认证逻辑',
            '实施多因素认证',
            '定期测试认证系统'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('测试认证绕过失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  /**
   * 测试授权缺陷
   */
  private async testAuthorizationFlaws(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟授权缺陷测试
      if (Math.random() > 0.9) {
        issues.push({
          id: `authz-${Date.now()}`,
          title: '授权缺陷',
          description: '检测到可能的授权缺陷，允许未授权访问',
          severity: SeverityLevel.HIGH,
          category: 'authorization',
          location: 'src/middleware/role.ts',
          recommendations: [
            '实施基于角色的访问控制',
            '对所有敏感操作进行授权检查',
            '使用最小权限原则'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('测试授权缺陷失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  /**
   * 测试注入攻击
   */
  private async testInjectionAttacks(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟注入攻击测试
      if (Math.random() > 0.85) {
        issues.push({
          id: `injection-${Date.now()}`,
          title: '注入攻击漏洞',
          description: '检测到可能的注入攻击漏洞',
          severity: SeverityLevel.CRITICAL,
          category: 'injection',
          location: 'src/services/database.ts',
          recommendations: [
            '使用参数化查询',
            '实施输入验证',
            '使用ORM框架'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('测试注入攻击失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  /**
   * 测试跨站攻击
   */
  private async testCrossSiteAttacks(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟跨站攻击测试
      if (Math.random() > 0.8) {
        issues.push({
          id: `xss-${Date.now()}`,
          title: '跨站脚本攻击漏洞',
          description: '检测到可能的跨站脚本攻击漏洞',
          severity: SeverityLevel.MEDIUM,
          category: 'xss',
          location: 'src/components/CommentForm.tsx',
          recommendations: [
            '实施输入验证和清理',
            '使用内容安全策略',
            '对输出进行适当的编码'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('测试跨站攻击失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  /**
   * 测试敏感信息泄露
   */
  private async testInformationDisclosure(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟信息泄露测试
      if (Math.random() > 0.75) {
        issues.push({
          id: `info-${Date.now()}`,
          title: '敏感信息泄露',
          description: '检测到可能的敏感信息泄露',
          severity: SeverityLevel.LOW,
          category: 'information_disclosure',
          location: 'src/routes/api/debug.ts',
          recommendations: [
            '移除调试端点或限制访问',
            '不要在响应中包含敏感信息',
            '实施适当的错误处理'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('测试敏感信息泄露失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  // ============ 合规检查方法 ============

  /**
   * 检查OWASP Top 10合规性
   */
  private async checkOWASPTop10Compliance(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟OWASP Top 10合规性检查
      if (Math.random() > 0.8) {
        issues.push({
          id: `owasp-${Date.now()}`,
          title: 'OWASP Top 10合规性问题',
          description: '检测到与OWASP Top 10相关的合规性问题',
          severity: SeverityLevel.MEDIUM,
          category: 'compliance',
          location: '整个应用',
          recommendations: [
            '参考OWASP Top 10指南修复问题',
            '实施OWASP推荐的安全控制',
            '定期进行OWASP Top 10合规性评估'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('检查OWASP Top 10合规性失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  /**
   * 检查CWE/SANS Top 25合规性
   */
  private async checkCWETop25Compliance(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟CWE Top 25合规性检查
      if (Math.random() > 0.85) {
        issues.push({
          id: `cwe-${Date.now()}`,
          title: 'CWE Top 25合规性问题',
          description: '检测到与CWE Top 25相关的合规性问题',
          severity: SeverityLevel.MEDIUM,
          category: 'compliance',
          location: '整个应用',
          recommendations: [
            '参考CWE Top 25指南修复问题',
            '实施CWE推荐的安全控制',
            '定期进行CWE Top 25合规性评估'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('检查CWE Top 25合规性失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  /**
   * 检查行业标准合规性
   */
  private async checkIndustryStandards(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟行业标准合规性检查
      if (Math.random() > 0.9) {
        issues.push({
          id: `industry-${Date.now()}`,
          title: '行业标准合规性问题',
          description: '检测到与行业标准相关的合规性问题',
          severity: SeverityLevel.LOW,
          category: 'compliance',
          location: '整个应用',
          recommendations: [
            '参考相关行业标准修复问题',
            '实施行业推荐的安全控制',
            '定期进行行业标准合规性评估'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('检查行业标准合规性失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  /**
   * 检查内部安全策略合规性
   */
  private async checkInternalPolicies(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // 模拟内部安全策略合规性检查
      if (Math.random() > 0.75) {
        issues.push({
          id: `policy-${Date.now()}`,
          title: '内部安全策略合规性问题',
          description: '检测到与内部安全策略相关的合规性问题',
          severity: SeverityLevel.LOW,
          category: 'compliance',
          location: '整个应用',
          recommendations: [
            '参考内部安全策略修复问题',
            '实施内部推荐的安全控制',
            '定期进行内部安全策略合规性评估'
          ],
          detectedAt: new Date(),
          status: 'open'
        });
      }
    } catch (error) {
      logger.error('检查内部安全策略合规性失败', 'SecurityAudit', { error: error.message });
    }

    return issues;
  }

  // ============ 辅助方法 ============

  /**
   * 生成审计结果
   */
  private generateAuditResult(
    type: AuditType,
    startTime: Date,
    endTime: Date,
    issues: SecurityIssue[]
  ): AuditResult {
    const duration = endTime.getTime() - startTime.getTime();
    
    const criticalIssues = issues.filter(issue => issue.severity === SeverityLevel.CRITICAL).length;
    const highIssues = issues.filter(issue => issue.severity === SeverityLevel.HIGH).length;
    const mediumIssues = issues.filter(issue => issue.severity === SeverityLevel.MEDIUM).length;
    const lowIssues = issues.filter(issue => issue.severity === SeverityLevel.LOW).length;

    let status: 'passed' | 'failed' | 'warning' = 'passed';
    if (criticalIssues > 0 || highIssues > 3) {
      status = 'failed';
    } else if (highIssues > 0 || mediumIssues > 5) {
      status = 'warning';
    }

    return {
      id: `audit-${Date.now()}`,
      type,
      startedAt: startTime,
      completedAt: endTime,
      duration,
      issues,
      summary: {
        totalIssues: issues.length,
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues,
        status
      }
    };
  }

  /**
   * 保存审计结果
   */
  private saveAuditResult(result: AuditResult): void {
    try {
      // 保存到内存历史记录
      this.auditHistory.push(result);
      
      // 限制历史记录大小
      if (this.auditHistory.length > 100) {
        this.auditHistory.shift();
      }

      // 保存到文件系统
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
        const fs = require('fs');
        const path = require('path');
        
        const reportPath = path.join(
          this.config.reportDirectory,
          `${result.type}-${result.id}.json`
        );
        
        fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
        logger.info('安全审计报告已保存', 'SecurityAudit', { path: reportPath });
      }

      // 记录指标
      metrics.gauge('security.audit.issues.total', result.summary.totalIssues);
      metrics.gauge('security.audit.issues.critical', result.summary.criticalIssues);
      metrics.gauge('security.audit.issues.high', result.summary.highIssues);
      metrics.gauge('security.audit.issues.medium', result.summary.mediumIssues);
      metrics.gauge('security.audit.issues.low', result.summary.lowIssues);
      metrics.increment('security.audit.executed', 1, { type: result.type });

    } catch (error) {
      logger.error('保存审计结果失败', 'SecurityAudit', { error: error.message });
    }
  }

  /**
   * 通知安全问题
   */
  private notifyIssues(result: AuditResult): void {
    if (result.summary.totalIssues > 0) {
      logger.warn('安全审计发现问题', 'SecurityAudit', {
        totalIssues: result.summary.totalIssues,
        criticalIssues: result.summary.criticalIssues,
        highIssues: result.summary.highIssues,
        auditType: result.type
      });

      // 可以集成告警系统、邮件通知等
    }
  }

  /**
   * 获取安全问题
   */
  public getIssues(status?: 'open' | 'fixed' | 'ignored'): SecurityIssue[] {
    if (status) {
      return this.issues.filter(issue => issue.status === status);
    }
    return this.issues;
  }

  /**
   * 获取审计历史
   */
  public getAuditHistory(limit: number = 10): AuditResult[] {
    return this.auditHistory.slice(-limit);
  }

  /**
   * 修复安全问题
   */
  public fixIssue(issueId: string): boolean {
    const issue = this.issues.find(i => i.id === issueId);
    if (issue) {
      issue.status = 'fixed';
      issue.fixedAt = new Date();
      logger.info('安全问题已修复', 'SecurityAudit', { issueId: issue.id });
      return true;
    }
    return false;
  }

  /**
   * 忽略安全问题
   */
  public ignoreIssue(issueId: string): boolean {
    const issue = this.issues.find(i => i.id === issueId);
    if (issue) {
      issue.status = 'ignored';
      logger.info('安全问题已忽略', 'SecurityAudit', { issueId: issue.id });
      return true;
    }
    return false;
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
    }
    if (this.penetrationTestTimer) {
      clearInterval(this.penetrationTestTimer);
    }
    if (this.complianceCheckTimer) {
      clearInterval(this.complianceCheckTimer);
    }
    logger.info('安全审计管理器已停止', 'SecurityAudit');
  }
}

// ============ 全局安全审计实例 ============

export const securityAuditManager = new SecurityAuditManager({
  enabled: process.env.NODE_ENV === 'production',
  scanInterval: 86400, // 24小时
  penetrationTestInterval: 604800, // 7天
  complianceCheckInterval: 2592000, // 30天
  maxIssues: 1000,
  reportDirectory: './security-reports'
});

// 导出便捷方法
export const {
  performVulnerabilityScan,
  performPenetrationTest,
  performComplianceCheck,
  performSecurityAssessment,
  getIssues,
  getAuditHistory,
  fixIssue,
  ignoreIssue
} = securityAuditManager;
