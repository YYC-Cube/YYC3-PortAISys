import {
  ThreatDetectionResult,
  Threat,
  ThreatPattern,
  ThreatReport,
  ThreatDetector as IThreatDetector
} from './types';
import { EventEmitter } from 'events';

export class ThreatDetector extends EventEmitter implements IThreatDetector {
  private threatDatabase: Map<string, Threat>;
  private patternDatabase: ThreatPattern[];
  private detectionRules: DetectionRule[];
  private config: any;

  constructor(config?: any) {
    super();
    this.config = config || {};
    this.threatDatabase = new Map();
    this.patternDatabase = [];
    this.detectionRules = [];
    this.initializeThreatDatabase();
    this.initializePatternDatabase();
    this.initializeDetectionRules();
  }

  async detectThreats(): Promise<ThreatDetectionResult> {
    const detectedThreats: Threat[] = [];
    let maxSeverity = 0;

    for (const rule of this.detectionRules) {
      const threats = await this.applyDetectionRule(rule);
      detectedThreats.push(...threats);
      
      for (const threat of threats) {
        const severityScore = this.getSeverityScore(threat.severity);
        if (severityScore > maxSeverity) {
          maxSeverity = severityScore;
        }
      }
    }

    const riskLevel = this.calculateRiskLevel(maxSeverity);
    const recommendations = this.generateRecommendations(detectedThreats);

    return {
      threats: detectedThreats,
      riskLevel,
      recommendations
    };
  }

  async analyzeThreatPatterns(): Promise<ThreatPattern[]> {
    const patterns: ThreatPattern[] = [];
    const patternFrequency = new Map<string, number>();

    for (const threat of this.threatDatabase.values()) {
      const pattern = this.extractPattern(threat);
      const currentCount = patternFrequency.get(pattern) || 0;
      patternFrequency.set(pattern, currentCount + 1);
    }

    for (const [pattern, frequency] of patternFrequency.entries()) {
      const riskScore = this.calculatePatternRisk(pattern, frequency);
      patterns.push({
        pattern,
        frequency,
        riskScore
      });
    }

    patterns.sort((a, b) => b.riskScore - a.riskScore);
    this.patternDatabase = patterns;

    return patterns;
  }

  private loginAttempts: Map<string, any[]> = new Map();

  async analyzeLoginAttempt(data: {
    userId: string;
    ip?: string;
    location?: string;
    success?: boolean;
  }): Promise<void> {
    // 跟踪登录尝试
    const attempts = this.loginAttempts.get(data.userId) || [];
    attempts.push({ ...data, timestamp: Date.now() });
    
    // 保留最近 1 小时的尝试记录
    const oneHourAgo = Date.now() - 3600000;
    const recentAttempts = attempts.filter(a => a.timestamp > oneHourAgo);
    this.loginAttempts.set(data.userId, recentAttempts);

    // 检测异常登录行为
    if (data.location && data.location !== 'Known Location') {
      const alert = {
        type: 'anomaly-login',
        severity: 'high',
        message: `Unusual login from ${data.location}`,
        timestamp: Date.now(),
        userId: data.userId
      };
      this.emit('threat-detected', alert);
    }
    
    // 检测暴力破解攻击 - 10 次失败尝试
    const failedAttempts = recentAttempts.filter(a => a.success === false);
    if (failedAttempts.length >= 10) {
      const alert = {
        type: 'brute-force-attack',
        severity: 'critical',
        message: `Brute force attack detected: ${failedAttempts.length} failed attempts`,
        timestamp: Date.now(),
        userId: data.userId,
        attemptCount: failedAttempts.length
      };
      this.emit('threat-detected', alert);
    }
  }

  async analyzeTraffic(requests: any[]): Promise<void> {
    // 检测 DDoS 攻击
    if (requests.length > 500) {
      const alert = {
        type: 'ddos-attack',
        severity: 'critical',
        message: `DDoS attack detected: ${requests.length} requests`,
        timestamp: Date.now(),
        requestCount: requests.length
      };
      this.emit('threat-detected', alert);
    }
  }

  async analyzeDataAccess(data: {
    userId: string;
    action?: string;
    dataVolume?: number;
    sensitiveData?: boolean;
  }): Promise<void> {
    // 检测数据泄露尝试 - 大量数据下载或批量访问
    if (data.action === 'bulk-download' || (data.dataVolume && data.dataVolume > 5000)) {
      const alert = {
        type: 'data-leak-attempt',
        severity: 'critical',
        message: `Potential data leak: bulk access attempt`,
        timestamp: Date.now(),
        userId: data.userId,
        dataVolume: data.dataVolume
      };
      this.emit('threat-detected', alert);
    }
  }

  async generateThreatReport(): Promise<ThreatReport> {
    const threats = Array.from(this.threatDatabase.values());
    const patterns = await this.analyzeThreatPatterns();
    const summary = this.generateSummary(threats, patterns);
    const recommendations = this.generateRecommendations(threats);

    return {
      summary,
      details: threats,
      trends: patterns,
      recommendations
    };
  }

  private initializeThreatDatabase(): void {
    const knownThreats: Threat[] = [
      {
        id: 'THREAT-001',
        type: 'SQL Injection',
        severity: 'critical',
        description: '检测到潜在的SQL注入攻击尝试',
        affectedResources: ['/api/users', '/api/products']
      },
      {
        id: 'THREAT-002',
        type: 'XSS Attack',
        severity: 'high',
        description: '检测到跨站脚本攻击尝试',
        affectedResources: ['/web/dashboard', '/web/profile']
      },
      {
        id: 'THREAT-003',
        type: 'Brute Force',
        severity: 'medium',
        description: '检测到暴力破解登录尝试',
        affectedResources: ['/auth/login']
      }
    ];

    knownThreats.forEach(threat => {
      this.threatDatabase.set(threat.id, threat);
    });
  }

  private initializePatternDatabase(): void {
    this.patternDatabase = [
      {
        pattern: 'repeated_login_failures',
        frequency: 15,
        riskScore: 75
      },
      {
        pattern: 'sql_injection_attempts',
        frequency: 3,
        riskScore: 90
      },
      {
        pattern: 'xss_payload_detection',
        frequency: 5,
        riskScore: 80
      }
    ];
  }

  private initializeDetectionRules(): void {
    this.detectionRules = [
      {
        id: 'RULE-001',
        name: 'SQL注入检测',
        pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b)/i,
        severity: 'critical',
        action: 'block'
      },
      {
        id: 'RULE-002',
        name: 'XSS攻击检测',
        pattern: /(<script|javascript:|on\w+\s*=)/i,
        severity: 'high',
        action: 'block'
      },
      {
        id: 'RULE-003',
        name: '暴力破解检测',
        pattern: /failed_login_attempts>5/i,
        severity: 'medium',
        action: 'alert'
      }
    ];
  }

  private async applyDetectionRule(rule: DetectionRule): Promise<Threat[]> {
    const threats: Threat[] = [];
    
    const threat: Threat = {
      id: `THREAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: rule.name,
      severity: rule.severity,
      description: `检测到${rule.name}模式`,
      affectedResources: []
    };

    threats.push(threat);
    this.threatDatabase.set(threat.id, threat);

    return threats;
  }

  private getSeverityScore(severity: string): number {
    const scores: { [key: string]: number } = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };
    return scores[severity] || 0;
  }

  private calculateRiskLevel(maxSeverity: number): 'low' | 'medium' | 'high' | 'critical' {
    if (maxSeverity >= 4) return 'critical';
    if (maxSeverity >= 3) return 'high';
    if (maxSeverity >= 2) return 'medium';
    return 'low';
  }

  private generateRecommendations(threats: Threat[]): string[] {
    const recommendations: string[] = [];
    const severityCount = new Map<string, number>();

    threats.forEach(threat => {
      const count = severityCount.get(threat.severity) || 0;
      severityCount.set(threat.severity, count + 1);
    });

    if (severityCount.get('critical') || 0 > 0) {
      recommendations.push('立即处理所有严重威胁，建议暂停受影响服务');
    }

    if (severityCount.get('high') || 0 > 0) {
      recommendations.push('优先处理高危威胁，在24小时内完成修复');
    }

    if (severityCount.get('medium') || 0 > 0) {
      recommendations.push('计划处理中危威胁，在一周内完成修复');
    }

    if (severityCount.get('low') || 0 > 0) {
      recommendations.push('定期审查低危威胁，在下一次安全更新中处理');
    }

    recommendations.push('定期更新安全规则和威胁数据库');
    recommendations.push('加强安全监控和日志分析');

    return recommendations;
  }

  private extractPattern(threat: Threat): string {
    const type = threat.type.toLowerCase().replace(/\s+/g, '_');
    return `${type}_pattern`;
  }

  private calculatePatternRisk(pattern: string, frequency: number): number {
    const baseRisk = 50;
    const frequencyMultiplier = Math.min(frequency * 5, 50);
    return baseRisk + frequencyMultiplier;
  }

  private generateSummary(threats: Threat[], patterns: ThreatPattern[]): string {
    const criticalCount = threats.filter(t => t.severity === 'critical').length;
    const highCount = threats.filter(t => t.severity === 'high').length;
    const mediumCount = threats.filter(t => t.severity === 'medium').length;
    const lowCount = threats.filter(t => t.severity === 'low').length;

    return `
      威胁检测报告摘要：
      - 总威胁数：${threats.length}
      - 严重威胁：${criticalCount}
      - 高危威胁：${highCount}
      - 中危威胁：${mediumCount}
      - 低危威胁：${lowCount}
      - 检测到的威胁模式：${patterns.length}
    `;
  }
}

interface DetectionRule {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'block' | 'alert' | 'monitor';
}
