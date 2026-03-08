/**
 * @file generate-test-report.ts
 * @description Generate Test Report 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestResult {
  name: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage?: CoverageInfo;
}

interface CoverageInfo {
  lines: number;
  statements: number;
  functions: number;
  branches: number;
}

interface TestReport {
  timestamp: string;
  environment: {
    node: string;
    platform: string;
    arch: string;
    cpus: number;
    memory: number;
  };
  summary: {
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    totalSkipped: number;
    totalDuration: number;
    successRate: number;
  };
  testResults: {
    unit: TestResult;
    integration: TestResult;
    security: TestResult;
    performance: TestResult;
  };
  coverage: CoverageInfo;
  recommendations: string[];
  issues: string[];
}

export class TestReportGenerator {
  private projectRoot: string;
  private reportDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.reportDir = path.join(this.projectRoot, 'test-reports');
  }

  async generateComprehensiveReport(): Promise<void> {
    console.log('📊 开始生成综合测试报告...\n');

    // 创建报告目录
    await fs.mkdir(this.reportDir, { recursive: true });

    // 收集测试结果
    const report: TestReport = {
      timestamp: new Date().toISOString(),
      environment: this.getEnvironmentInfo(),
      summary: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalSkipped: 0,
        totalDuration: 0,
        successRate: 0
      },
      testResults: {
        unit: await this.runUnitTests(),
        integration: await this.runIntegrationTests(),
        security: await this.runSecurityTests(),
        performance: await this.runPerformanceTests()
      },
      coverage: await this.getCoverageInfo(),
      recommendations: [],
      issues: []
    };

    // 计算总体摘要
    this.calculateSummary(report);

    // 生成建议和问题
    this.generateRecommendations(report);
    this.identifyIssues(report);

    // 生成报告文件
    await this.saveReport(report);
    await this.generateMarkdownReport(report);
    await this.generateHTMLReport(report);

    console.log('✅ 综合测试报告生成完成！');
    console.log(`📁 报告保存在: ${this.reportDir}`);
  }

  private getEnvironmentInfo() {
    return {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: require('os').cpus().length,
      memory: Math.round(require('os').totalmem() / 1024 / 1024 / 1024) // GB
    };
  }

  private async runUnitTests(): Promise<TestResult> {
    console.log('🧪 运行单元测试...');
    try {
      const { stdout } = await execAsync('pnpm test -- --reporter=json tests/unit');
      const result = JSON.parse(stdout);
      
      return {
        name: '单元测试',
        passed: result.numPassedTests || 0,
        failed: result.numFailedTests || 0,
        skipped: result.numPendingTests || 0,
        duration: result.testResults?.reduce((sum: number, r: any) => 
          sum + (r.perfStats?.runtime || 0), 0) || 0
      };
    } catch (error) {
      console.error('单元测试执行失败:', error);
      return {
        name: '单元测试',
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      };
    }
  }

  private async runIntegrationTests(): Promise<TestResult> {
    console.log('🔗 运行集成测试...');
    try {
      const { stdout } = await execAsync('pnpm test -- --reporter=json tests/integration');
      const result = JSON.parse(stdout);
      
      return {
        name: '集成测试',
        passed: result.numPassedTests || 0,
        failed: result.numFailedTests || 0,
        skipped: result.numPendingTests || 0,
        duration: result.testResults?.reduce((sum: number, r: any) => 
          sum + (r.perfStats?.runtime || 0), 0) || 0
      };
    } catch (error) {
      console.error('集成测试执行失败:', error);
      return {
        name: '集成测试',
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      };
    }
  }

  private async runSecurityTests(): Promise<TestResult> {
    console.log('🔒 运行安全测试...');
    try {
      const { stdout } = await execAsync('pnpm test -- --reporter=json tests/security');
      const result = JSON.parse(stdout);
      
      return {
        name: '安全测试',
        passed: result.numPassedTests || 0,
        failed: result.numFailedTests || 0,
        skipped: result.numPendingTests || 0,
        duration: result.testResults?.reduce((sum: number, r: any) => 
          sum + (r.perfStats?.runtime || 0), 0) || 0
      };
    } catch (error) {
      console.error('安全测试执行失败:', error);
      return {
        name: '安全测试',
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      };
    }
  }

  private async runPerformanceTests(): Promise<TestResult> {
    console.log('⚡ 运行性能测试...');
    try {
      const { stdout } = await execAsync('pnpm test -- --reporter=json tests/performance');
      const result = JSON.parse(stdout);
      
      return {
        name: '性能测试',
        passed: result.numPassedTests || 0,
        failed: result.numFailedTests || 0,
        skipped: result.numPendingTests || 0,
        duration: result.testResults?.reduce((sum: number, r: any) => 
          sum + (r.perfStats?.runtime || 0), 0) || 0
      };
    } catch (error) {
      console.error('性能测试执行失败:', error);
      return {
        name: '性能测试',
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      };
    }
  }

  private async getCoverageInfo(): Promise<CoverageInfo> {
    console.log('📈 收集测试覆盖率...');
    try {
      const coverageFile = path.join(this.projectRoot, 'coverage/coverage-summary.json');
      const content = await fs.readFile(coverageFile, 'utf-8');
      const coverage = JSON.parse(content);
      const total = coverage.total;

      return {
        lines: total.lines.pct || 0,
        statements: total.statements.pct || 0,
        functions: total.functions.pct || 0,
        branches: total.branches.pct || 0
      };
    } catch (error) {
      return {
        lines: 0,
        statements: 0,
        functions: 0,
        branches: 0
      };
    }
  }

  private calculateSummary(report: TestReport): void {
    const { unit, integration, security, performance } = report.testResults;

    report.summary.totalTests = 
      unit.passed + unit.failed + unit.skipped +
      integration.passed + integration.failed + integration.skipped +
      security.passed + security.failed + security.skipped +
      performance.passed + performance.failed + performance.skipped;

    report.summary.totalPassed = 
      unit.passed + integration.passed + security.passed + performance.passed;

    report.summary.totalFailed = 
      unit.failed + integration.failed + security.failed + performance.failed;

    report.summary.totalSkipped = 
      unit.skipped + integration.skipped + security.skipped + performance.skipped;

    report.summary.totalDuration = 
      unit.duration + integration.duration + security.duration + performance.duration;

    report.summary.successRate = report.summary.totalTests > 0
      ? (report.summary.totalPassed / report.summary.totalTests) * 100
      : 0;
  }

  private generateRecommendations(report: TestReport): void {
    // 基于测试结果生成建议
    if (report.coverage.lines < 80) {
      report.recommendations.push(
        `测试覆盖率 (${report.coverage.lines.toFixed(1)}%) 低于目标 (80%)，建议增加测试用例`
      );
    }

    if (report.summary.successRate < 95) {
      report.recommendations.push(
        `测试成功率 (${report.summary.successRate.toFixed(1)}%) 低于目标 (95%)，需要修复失败的测试`
      );
    }

    if (report.testResults.security.failed > 0) {
      report.recommendations.push(
        `发现 ${report.testResults.security.failed} 个安全测试失败，这是高优先级问题，需要立即处理`
      );
    }

    if (report.testResults.performance.failed > 0) {
      report.recommendations.push(
        `发现 ${report.testResults.performance.failed} 个性能测试失败，需要优化系统性能`
      );
    }

    if (report.recommendations.length === 0) {
      report.recommendations.push('所有测试都已通过，系统状态良好！');
    }
  }

  private identifyIssues(report: TestReport): void {
    // 识别需要关注的问题
    if (report.testResults.unit.failed > 0) {
      report.issues.push(`单元测试失败: ${report.testResults.unit.failed} 个`);
    }

    if (report.testResults.integration.failed > 0) {
      report.issues.push(`集成测试失败: ${report.testResults.integration.failed} 个`);
    }

    if (report.testResults.security.failed > 0) {
      report.issues.push(`安全测试失败: ${report.testResults.security.failed} 个 ⚠️`);
    }

    if (report.testResults.performance.failed > 0) {
      report.issues.push(`性能测试失败: ${report.testResults.performance.failed} 个`);
    }

    if (report.coverage.lines < 70) {
      report.issues.push(`测试覆盖率过低: ${report.coverage.lines.toFixed(1)}% ⚠️`);
    }
  }

  private async saveReport(report: TestReport): Promise<void> {
    const jsonPath = path.join(this.reportDir, 'test-report.json');
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
    console.log(`📄 JSON报告已保存: ${jsonPath}`);
  }

  private async generateMarkdownReport(report: TestReport): Promise<void> {
    const markdown = `# YYC³ 系统综合测试报告

## 📊 测试摘要

**生成时间**: ${new Date(report.timestamp).toLocaleString('zh-CN')}

| 指标 | 数值 |
|------|------|
| 总测试数 | ${report.summary.totalTests} |
| 通过测试 | ${report.summary.totalPassed} ✅ |
| 失败测试 | ${report.summary.totalFailed} ❌ |
| 跳过测试 | ${report.summary.totalSkipped} ⏭️ |
| 测试时长 | ${(report.summary.totalDuration / 1000).toFixed(2)}s |
| 成功率 | ${report.summary.successRate.toFixed(2)}% |

## 🖥️ 测试环境

- **Node.js版本**: ${report.environment.node}
- **平台**: ${report.environment.platform}
- **架构**: ${report.environment.arch}
- **CPU核心数**: ${report.environment.cpus}
- **内存**: ${report.environment.memory}GB

## 📈 详细测试结果

### 单元测试
- 通过: ${report.testResults.unit.passed} ✅
- 失败: ${report.testResults.unit.failed} ❌
- 跳过: ${report.testResults.unit.skipped} ⏭️
- 时长: ${(report.testResults.unit.duration / 1000).toFixed(2)}s

### 集成测试
- 通过: ${report.testResults.integration.passed} ✅
- 失败: ${report.testResults.integration.failed} ❌
- 跳过: ${report.testResults.integration.skipped} ⏭️
- 时长: ${(report.testResults.integration.duration / 1000).toFixed(2)}s

### 安全测试
- 通过: ${report.testResults.security.passed} ✅
- 失败: ${report.testResults.security.failed} ❌
- 跳过: ${report.testResults.security.skipped} ⏭️
- 时长: ${(report.testResults.security.duration / 1000).toFixed(2)}s

### 性能测试
- 通过: ${report.testResults.performance.passed} ✅
- 失败: ${report.testResults.performance.failed} ❌
- 跳过: ${report.testResults.performance.skipped} ⏭️
- 时长: ${(report.testResults.performance.duration / 1000).toFixed(2)}s

## 📊 测试覆盖率

| 类型 | 覆盖率 | 目标 | 状态 |
|------|--------|------|------|
| 行覆盖率 | ${report.coverage.lines.toFixed(1)}% | 80% | ${report.coverage.lines >= 80 ? '✅' : '❌'} |
| 语句覆盖率 | ${report.coverage.statements.toFixed(1)}% | 80% | ${report.coverage.statements >= 80 ? '✅' : '❌'} |
| 函数覆盖率 | ${report.coverage.functions.toFixed(1)}% | 80% | ${report.coverage.functions >= 80 ? '✅' : '❌'} |
| 分支覆盖率 | ${report.coverage.branches.toFixed(1)}% | 80% | ${report.coverage.branches >= 80 ? '✅' : '❌'} |

## 💡 建议

${report.recommendations.map(r => `- ${r}`).join('\n')}

## ⚠️ 需要关注的问题

${report.issues.length > 0 
  ? report.issues.map(i => `- ${i}`).join('\n')
  : '✅ 没有发现需要关注的问题'
}

## 🎯 结论

${this.generateConclusion(report)}

---

**报告生成工具**: YYC³ Test Report Generator v1.0.0  
**文档版本**: ${report.timestamp}
`;

    const mdPath = path.join(this.reportDir, 'test-report.md');
    await fs.writeFile(mdPath, markdown);
    console.log(`📝 Markdown报告已保存: ${mdPath}`);
  }

  private async generateHTMLReport(report: TestReport): Promise<void> {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YYC³ 系统综合测试报告</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card h3 {
            margin-top: 0;
            color: #667eea;
        }
        .metric {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        .success { color: #10b981; }
        .failure { color: #ef4444; }
        .warning { color: #f59e0b; }
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background-color: #667eea;
            color: white;
            font-weight: 600;
        }
        .recommendations, .issues {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .recommendations h2, .issues h2 {
            color: #667eea;
            margin-top: 0;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 YYC³ 系统综合测试报告</h1>
        <p>生成时间: ${new Date(report.timestamp).toLocaleString('zh-CN')}</p>
    </div>

    <div class="summary">
        <div class="card">
            <h3>总测试数</h3>
            <div class="metric">${report.summary.totalTests}</div>
        </div>
        <div class="card">
            <h3>通过测试</h3>
            <div class="metric success">${report.summary.totalPassed} ✅</div>
        </div>
        <div class="card">
            <h3>失败测试</h3>
            <div class="metric failure">${report.summary.totalFailed} ❌</div>
        </div>
        <div class="card">
            <h3>成功率</h3>
            <div class="metric ${report.summary.successRate >= 95 ? 'success' : 'warning'}">
                ${report.summary.successRate.toFixed(1)}%
            </div>
        </div>
    </div>

    <div class="card" style="margin-bottom: 30px;">
        <h2>📈 详细测试结果</h2>
        <table>
            <thead>
                <tr>
                    <th>测试类型</th>
                    <th>通过</th>
                    <th>失败</th>
                    <th>跳过</th>
                    <th>时长</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>单元测试</td>
                    <td class="success">${report.testResults.unit.passed}</td>
                    <td class="failure">${report.testResults.unit.failed}</td>
                    <td>${report.testResults.unit.skipped}</td>
                    <td>${(report.testResults.unit.duration / 1000).toFixed(2)}s</td>
                </tr>
                <tr>
                    <td>集成测试</td>
                    <td class="success">${report.testResults.integration.passed}</td>
                    <td class="failure">${report.testResults.integration.failed}</td>
                    <td>${report.testResults.integration.skipped}</td>
                    <td>${(report.testResults.integration.duration / 1000).toFixed(2)}s</td>
                </tr>
                <tr>
                    <td>安全测试</td>
                    <td class="success">${report.testResults.security.passed}</td>
                    <td class="failure">${report.testResults.security.failed}</td>
                    <td>${report.testResults.security.skipped}</td>
                    <td>${(report.testResults.security.duration / 1000).toFixed(2)}s</td>
                </tr>
                <tr>
                    <td>性能测试</td>
                    <td class="success">${report.testResults.performance.passed}</td>
                    <td class="failure">${report.testResults.performance.failed}</td>
                    <td>${report.testResults.performance.skipped}</td>
                    <td>${(report.testResults.performance.duration / 1000).toFixed(2)}s</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="card" style="margin-bottom: 30px;">
        <h2>📊 测试覆盖率</h2>
        <table>
            <thead>
                <tr>
                    <th>类型</th>
                    <th>覆盖率</th>
                    <th>目标</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>行覆盖率</td>
                    <td>${report.coverage.lines.toFixed(1)}%</td>
                    <td>80%</td>
                    <td>${report.coverage.lines >= 80 ? '✅' : '❌'}</td>
                </tr>
                <tr>
                    <td>语句覆盖率</td>
                    <td>${report.coverage.statements.toFixed(1)}%</td>
                    <td>80%</td>
                    <td>${report.coverage.statements >= 80 ? '✅' : '❌'}</td>
                </tr>
                <tr>
                    <td>函数覆盖率</td>
                    <td>${report.coverage.functions.toFixed(1)}%</td>
                    <td>80%</td>
                    <td>${report.coverage.functions >= 80 ? '✅' : '❌'}</td>
                </tr>
                <tr>
                    <td>分支覆盖率</td>
                    <td>${report.coverage.branches.toFixed(1)}%</td>
                    <td>80%</td>
                    <td>${report.coverage.branches >= 80 ? '✅' : '❌'}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="recommendations">
        <h2>💡 建议</h2>
        <ul>
            ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
    </div>

    ${report.issues.length > 0 ? `
    <div class="issues">
        <h2>⚠️ 需要关注的问题</h2>
        <ul>
            ${report.issues.map(i => `<li>${i}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <div class="card">
        <h2>🎯 结论</h2>
        <p>${this.generateConclusion(report)}</p>
    </div>
</body>
</html>`;

    const htmlPath = path.join(this.reportDir, 'test-report.html');
    await fs.writeFile(htmlPath, html);
    console.log(`🌐 HTML报告已保存: ${htmlPath}`);
  }

  private generateConclusion(report: TestReport): string {
    const { successRate } = report.summary;
    const { lines } = report.coverage;

    if (successRate >= 95 && lines >= 80) {
      return '✅ 系统测试全面通过，代码质量优秀，可以进入生产环境部署！';
    } else if (successRate >= 90 && lines >= 70) {
      return '⚠️ 系统基本达标，但仍有改进空间。建议在部署前解决失败的测试并提高测试覆盖率。';
    } else if (successRate >= 80) {
      return '⚠️ 系统存在一些问题需要解决。建议修复失败的测试，特别是安全测试和性能测试。';
    } else {
      return '❌ 系统存在严重问题，不建议部署到生产环境。需要立即修复失败的测试。';
    }
  }
}

// 如果直接运行此文件，生成报告
if (require.main === module) {
  const generator = new TestReportGenerator();
  generator.generateComprehensiveReport().catch(console.error);
}
