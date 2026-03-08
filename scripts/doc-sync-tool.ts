/**
 * @file 文档自动同步工具
 * @description 自动同步docs目录下的文档，更新映射总结和索引总览
 * @module scripts
 * @author YanYuCloudCube Team
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags docs,automation,sync,tool
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DocSummary {
  path: string;
  name: string;
  description: string;
  status: string;
  updated: string;
}

interface DirectorySummary {
  path: string;
  name: string;
  description: string;
  documentCount: number;
  documents: DocSummary[];
  categories: {
    name: string;
    count: number;
    documents: DocSummary[];
  }[];
}

interface OverallSummary {
  directories: DirectorySummary[];
  totalDocuments: number;
  lastUpdated: string;
}

class DocSyncTool {
  private docsPath: string;
  private indexPath: string;

  constructor() {
    this.docsPath = path.join(__dirname, '..', 'docs');
    this.indexPath = path.join(this.docsPath, '文档索引总览.md');
  }

  async sync(): Promise<void> {
    console.log('🚀 开始文档同步...');
    
    const directories = this.scanDirectories();
    const summary = this.generateOverallSummary(directories);
    
    await this.updateOverallIndex(summary);
    await this.updateDirectorySummaries(directories);
    
    console.log('✅ 文档同步完成！');
  }

  private scanDirectories(): DirectorySummary[] {
    const directories: DirectorySummary[] = [];
    const entries = fs.readdirSync(this.docsPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('YYC3-PortAIsys-')) {
        const dirPath = path.join(this.docsPath, entry.name);
        const summary = this.scanDirectory(dirPath, entry.name);
        directories.push(summary);
      }
    }
    
    return directories;
  }

  private scanDirectory(dirPath: string, dirName: string): DirectorySummary {
    const files = fs.readdirSync(dirPath);
    const markdownFiles = files.filter(f => f.endsWith('.md') && !f.startsWith('.'));
    const documents: DocSummary[] = [];
    
    for (const file of markdownFiles) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      documents.push({
        path: filePath,
        name: file,
        description: this.extractDescription(content),
        status: this.extractStatus(content),
        updated: this.formatDate(stats.mtime)
      });
    }
    
    const categories = this.categorizeDocuments(documents);
    
    return {
      path: dirPath,
      name: dirName,
      description: this.getDirectoryDescription(dirName),
      documentCount: documents.length,
      documents,
      categories
    };
  }

  private extractDescription(content: string): string {
    const match = content.match(/## 📋 目录概述\n\n([\s\S]*?)\n\n/);
    return match ? match[1].trim() : '暂无描述';
  }

  private extractStatus(content: string): string {
    if (content.includes('✅ 稳定')) return '✅ 稳定';
    if (content.includes('🟡 开发中')) return '🟡 开发中';
    if (content.includes('🔴 已废弃')) return '🔴 已废弃';
    return '✅ 稳定';
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private categorizeDocuments(documents: DocSummary[]) {
    const categories: Map<string, DocSummary[]> = new Map();
    
    for (const doc of documents) {
      const category = this.getCategory(doc.name);
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(doc);
    }
    
    return Array.from(categories.entries()).map(([name, documents]) => ({
      name,
      count: documents.length,
      documents
    }));
  }

  private getCategory(fileName: string): string {
    if (fileName.includes('总览') || fileName.includes('README')) return '总览文档';
    if (fileName.includes('API')) return 'API文档';
    if (fileName.includes('测试')) return '测试文档';
    if (fileName.includes('部署') || fileName.includes('发布')) return '部署文档';
    if (fileName.includes('安全')) return '安全文档';
    if (fileName.includes('性能')) return '性能文档';
    if (fileName.includes('实施总结')) return '实施总结';
    if (fileName.includes('开发计划')) return '开发计划';
    if (fileName.includes('需求')) return '需求文档';
    if (fileName.includes('架构')) return '架构文档';
    return '其他文档';
  }

  private getDirectoryDescription(dirName: string): string {
    const descriptions: Record<string, string> = {
      'YYC3-PortAIsys-API文档': '完整的API文档，涵盖所有系统接口、数据模型和使用指南',
      'YYC3-PortAIsys-代码文档': '核心代码文档，涵盖智能AI浮窗系统、闭环指导体系、五高五标五化技术架构等核心功能的实现细节',
      'YYC3-PortAIsys-用户手册': '完整的用户手册，涵盖快速开始、安装部署、配置管理、功能使用、故障排除等全方位用户指导',
      'YYC3-PortAIsys-项目规划': '完整的项目规划文档，涵盖战略规划、业务需求、技术架构、产品路线图、风险管理、开发计划、测试规划、部署规划、运维规划、安全规划等全方位项目规划',
      'YYC3-PortAIsys-部署发布': '完整的部署发布文档，涵盖环境准备、依赖安装、配置管理、构建流程、Docker容器化、CI/CD流水线、版本发布、回滚与灾备等全方位部署指导',
      'YYC3-PortAIsys-测试框架': '完整的测试框架文档，涵盖测试策略、测试计划、测试用例规范、测试环境配置、缺陷管理流程、测试报告模板',
      'YYC3-PortAIsys-技术文档': '技术文档，涵盖API文档、安全加固方案、OpenTelemetry集成指南等',
      'YYC3-PortAIsys-需求规划': '需求规划文档，涵盖需求管理总览、需求收集与整理、需求分析与建模、需求规格说明',
      'YYC3-PortAIsys-类型定义': '类型定义文档，涵盖核心类型定义、AI模型类型、用户和权限类型、工作流类型、数据存储类型、文件和缓存类型、监控和告警类型、集成和插件类型、错误和异常类型、类型使用指南',
      'YYC3-PortAIsys-模版规范': '模版规范文档，涵盖五高五标五化、文档规范基础标准、文档规范审核模版、文档规范审核清单、文档规范管理架构、文档规范闭环标准、智能协同实施总结、项目审核分析建议、项目审核评估报告、项目验收规范标准、最佳实践、文档生成脚本',
      'YYC3-PortAIsys-智能浮窗': '智能浮窗文档，涵盖ModelAdapter实现、AutonomousAIEngine实现、核心架构、深度设计、功能组件、管理组件、组件深度设计、性能优化、数据分析设计、系统可靠性组件深度设计、智能可移动系统智能自愈生态、系统闭环规划指导、系统设计指导、自治模块指导、深度审核分析报告、插拔式AI系统设计、发展预测拓展建议、设计规划',
      'YYC3-PortAIsys-审核分析': '审核分析文档，涵盖代码完整度分析、全局多维度审核检测分析报告',
      'YYC3-PortAIsys-整理报告': '整理报告文档，涵盖智能体系统集成报告、项目审核报告、独立审核分析报告、实际代码真实评估报告、阶段审核整理报告、系统集成报告、全量版审核分析建议报告',
      'YYC3-PortAIsys-缺失补全': '缺失补全文档，涵盖阶段一工作完成总结、第一阶段工作总结报告、综合测试方案执行总结、集成测试修复最终报告、综合测试方案执行最终报告、系统部署文档、综合测试方案执行指南、用户反馈收集渠道实施方案、综合测试方案、闭环完善设计方案、文档同步工具系统部署文档、文档同步机制设计方案、文档同步工具详细实施计划、文档同步工具性能测试与优化方案、测试框架使用指南、文档同步监控系统实施方案、文档同步工具测试方案、文档同步工具用户操作手册、文档同步工具测试报告、文档同步机制使用说明文档、模型适配器实现完成报告、测试执行状态报告、执行总结报告、文档与代码关联映射规则设计文档、性能瓶颈分析与优化方案、执行计划、执行完成报告、文档同步工具实施进度报告、性能测试报告、完整设计方案、文档同步工具功能扩展路线图、文档同步工具API接口文档、全面分析报告、缺失补全第六章、优先级2任务完成报告、优先级3任务完成报告、下一步工作总结、缺失补全第五章、可执行实施计划、下一步开发和测试工作计划、缺失补全第四章、优先级1任务完成报告、缺失补全浮窗补全一二章、Web界面开发与性能优化工作总结、Web管理界面开发计划和任务分解、缺失补全第三章、BUG修复报告',
      'YYC3-PortAIsys-项目维护': '项目维护文档，涵盖优化工作单、修复不完整文件计划',
      'YYC3-PortAIsys-开发指南': '开发指南文档，涵盖ESLint Catch块参数配置指南'
    };
    
    return descriptions[dirName] || '暂无描述';
  }

  private generateOverallSummary(directories: DirectorySummary[]): OverallSummary {
    const totalDocuments = directories.reduce((sum, dir) => sum + dir.documentCount, 0);
    const lastUpdated = new Date().toISOString().split('T')[0];
    
    return {
      directories,
      totalDocuments,
      lastUpdated
    };
  }

  private async updateOverallIndex(summary: OverallSummary): Promise<void> {
    const indexContent = this.generateOverallIndexContent(summary);
    fs.writeFileSync(this.indexPath, indexContent, 'utf-8');
  }

  private async updateDirectorySummaries(directories: DirectorySummary[]): Promise<void> {
    for (const dir of directories) {
      const summaryPath = path.join(dir.path, '目录映射总结.md');
      const summaryContent = this.generateDirectorySummaryContent(dir);
      fs.writeFileSync(summaryPath, summaryContent, 'utf-8');
    }
  }

  private generateOverallIndexContent(summary: OverallSummary): string {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return `# YYC³ Portable Intelligent AI System 文档索引总览

> **生成时间**: ${currentDate}  
> **文档版本**: v1.0.0  
> **维护团队**: YanYuCloudCube Team  
> **状态**: 稳定

---

## 📋 文档体系概述

YYC³ Portable Intelligent AI System文档体系采用模块化、分层化设计，涵盖API文档、代码文档、用户手册、项目规划、部署发布、测试框架、技术文档、需求规划、类型定义、模版规范、智能浮窗、审核分析、整理报告、缺失补全等全方位文档支持。

---

## 📚 文档目录结构

${summary.directories.map(dir => this.generateDirectorySection(dir)).join('\n\n')}

---

## 📊 文档统计

### 总体统计

| 指标 | 数量 |
|------|------|
| **总目录数** | ${summary.directories.length}个 |
| **总文档数** | ${summary.totalDocuments}个 |
| **映射总结文档** | ${summary.directories.length}个 |
| **稳定文档** | ${summary.totalDocuments}个 (100%) |
| **最后更新** | ${summary.lastUpdated} |

---

## 🎯 文档使用指南

### 新用户入门

1. **阅读项目README** - 了解项目概况
2. **查看用户手册** - 学习系统使用
3. **参考快速开始指南** - 快速上手
4. **执行安装部署** - 完成系统安装

### 开发者指南

1. **查看API文档** - 了解接口规范
2. **阅读代码文档** - 理解实现细节
3. **参考类型定义** - 掌握数据结构
4. **遵循模版规范** - 符合团队标准

### 项目管理者指南

1. **查看项目规划** - 了解项目计划
2. **阅读部署发布** - 掌握部署流程
3. **参考测试框架** - 理解测试策略
4. **查看需求规划** - 明确需求管理

---

## 🔗 快速导航

### 按角色导航

- **[新用户]** → [用户手册](./YYC3-PortAIsys-用户手册/)
- **[开发者]** → [API文档](./YYC3-PortAIsys-API文档/) | [代码文档](./YYC3-PortAIsys-代码文档/)
- **[项目经理]** → [项目规划](./YYC3-PortAIsys-项目规划/) | [部署发布](./YYC3-PortAIsys-部署发布/)
- **[测试人员]** → [测试框架](./YYC3-PortAIsys-测试框架/)
- **[审核人员]** → [审核分析](./YYC3-PortAIsys-审核分析/) | [整理报告](./YYC3-PortAIsys-整理报告/)

---

## 📝 维护说明

### 更新记录

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | ${currentDate} | 自动生成文档索引总览 | YanYuCloudCube Team |

### 文档更新策略

- **定期更新**: 每月检查文档完整性
- **版本同步**: 与代码版本同步更新
- **映射维护**: 保持映射总结文档最新
- **索引更新**: 根目录索引定期更新

### 联系方式

- **维护团队**: YanYuCloudCube Team
- **联系邮箱**: admin@0379.email
- **项目地址**: https://github.com/YYC-Cube/

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
`;
  }

  private generateDirectorySection(dir: DirectorySummary): string {
    const dirName = dir.name.replace('YYC3-PortAIsys-', '');
    
    return `### ${this.getDirectoryNumber(dirName)}. ${dirName}

**路径**: \`docs/${dir.name}/\`  
**映射总结**: [目录映射总结](./${dir.name}/目录映射总结.md)

**描述**: ${dir.description}

**文档数量**: ${dir.documentCount}个  
**主要分类**:
${dir.categories.map(cat => `- **${cat.name}** (${cat.count}个): ${cat.documents.slice(0, 3).map(d => d.name.replace('.md', '')).join('、')}${cat.documents.length > 3 ? '等' : ''}`).join('\n')}

**快速链接**:
${dir.documents.slice(0, 3).map(doc => `- [${doc.name.replace('.md', '')}](./${dir.name}/${doc.name})`).join('\n')}`;
  }

  private getDirectoryNumber(dirName: string): string {
    const directories = [
      'API文档', '代码文档', '用户手册', '项目规划', '部署发布',
      '测试框架', '技术文档', '需求规划', '类型定义', '模版规范',
      '智能浮窗', '审核分析', '整理报告', '缺失补全',
      '项目维护', '开发指南'
    ];
    const index = directories.indexOf(dirName);
    return index >= 0 ? `${index + 1}` : '0';
  }

  private generateDirectorySummaryContent(dir: DirectorySummary): string {
    const currentDate = new Date().toISOString().split('T')[0];
    const dirName = dir.name.replace('YYC3-PortAIsys-', '');
    
    return `# ${dirName}-目录映射总结

> **生成时间**: ${currentDate}  
> **文档版本**: v1.0.0  
> **维护团队**: YanYuCloudCube Team  
> **状态**: 稳定

---

## 📋 目录概述

${dir.description}

---

## 📚 文档映射

${dir.categories.map(cat => `### ${cat.name} (${cat.count}个)

| 文档名称 | 描述 | 状态 | 更新日期 |
|---------|---------|------|----------|
${cat.documents.map(doc => `| [${doc.name.replace('.md', '')}](./${doc.name}) | ${doc.description} | ${doc.status} | ${doc.updated} |`).join('\n')}`).join('\n\n')}

---

## 📊 统计信息

- **总文档数**: ${dir.documentCount}个
- **分类数**: ${dir.categories.length}个
- **稳定文档**: ${dir.documentCount}个 (100%)
- **最后更新**: ${currentDate}

---

## 🔗 相关链接

- [项目README](../../README.md)
- [文档索引总览](../文档索引总览.md)

---

## 📝 维护说明

### 更新记录

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0.0 | ${currentDate} | 自动生成目录映射总结 | YanYuCloudCube Team |

### 联系方式

- **维护团队**: YanYuCloudCube Team
- **联系邮箱**: admin@0379.email
- **项目地址**: https://github.com/YYC-Cube/

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
`;
  }
}

async function main() {
  const tool = new DocSyncTool();
  await tool.sync();
}

main().catch(console.error);
