/**
 * @file doc-header-cleaner.ts
 * @description 文档标头清理工具，彻底清除旧标头并添加符合YYC³标准的新标头
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.3.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags doc,compliance,header,tool
 */

import fs from 'fs';
import path from 'path';

interface FileInfo {
  path: string;
  name: string;
}

enum DocType {
  API = 'api',
  TECHNICAL = 'technical',
  PROJECT = 'project',
  GENERAL = 'general'
}

class DocHeaderCleaner {
  private targetPath: string;

  constructor(targetPath: string) {
    this.targetPath = targetPath;
  }

  async cleanAll(): Promise<void> {
    console.log('🚀 开始清理文档标头...\n');

    const files = this.scanFiles();
    console.log(`📝 找到 ${files.length} 个文档文件\n`);

    for (const file of files) {
      await this.cleanFile(file);
    }

    console.log('\n✅ 文档标头清理完成！');
  }

  private scanFiles(): FileInfo[] {
    const files: FileInfo[] = [];
    const scanDir = (dirPath: string) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.')) {
            scanDir(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push({
            path: fullPath,
            name: entry.name
          });
        }
      }
    };

    scanDir(this.targetPath);
    return files;
  }

  private async cleanFile(file: FileInfo): Promise<void> {
    const content = fs.readFileSync(file.path, 'utf-8');
    const relativePath = path.relative(this.targetPath, file.path);

    // Find first main heading (starts with #)
    const lines = content.split('\n');
    let mainHeadingIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#') && !line.startsWith('---') && !line.startsWith('>')) {
        mainHeadingIndex = i;
        break;
      }
    }

    if (mainHeadingIndex === -1) {
      console.log(`⚠️  跳过: ${relativePath} (未找到主标题)`);
      return;
    }

    // Get content from main heading onwards
    let mainContent = lines.slice(mainHeadingIndex).join('\n');

    // Remove old header content after main heading
    mainContent = this.removeOldHeaderContent(mainContent);

    // Remove old footer brand blocks
    mainContent = this.removeOldFooterContent(mainContent);

    // Determine document type
    const docType = this.determineDocType(relativePath, file.name);

    // Generate new header based on document type
    const newHeader = this.generateHeader(file.name, relativePath, docType);

    // Combine new header with main content
    const newContent = newHeader + '\n\n' + mainContent;

    // Write back to file
    fs.writeFileSync(file.path, newContent, 'utf-8');

    console.log(`✓ 已清理: ${relativePath} (${docType})`);
  }

  private removeOldHeaderContent(content: string): string {
    const lines = content.split('\n');
    const cleanedLines: string[] = [];
    let skipUntilNextSection = false;
    let skipCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip old header metadata blocks
      if (line.match(/^>\s*\*\*生成时间\*\*:/) ||
          line.match(/^>\s*\*\*文档版本\*\*:/) ||
          line.match(/^>\s*\*\*维护团队\*\*:/) ||
          line.match(/^>\s*\*\*状态\*\*:/) ||
          line.match(/^>\s*\*\*创建日期\*\*:/) ||
          line.match(/^>\s*\*\*文档状态\*\*:/)) {
        skipUntilNextSection = true;
        skipCount = 0;
        continue;
      }

      // Skip old YYC³ brand blocks after main heading
      if (line.includes('***YanYuCloudCube***') && skipUntilNextSection) {
        skipCount++;
        continue;
      }

      if (line.includes('言启象限') && skipUntilNextSection) {
        skipCount++;
        continue;
      }

      if (line.includes('Words Initiate Quadrants') && skipUntilNextSection) {
        skipCount++;
        continue;
      }

      if (line.includes('万象归元于云枢') && skipUntilNextSection) {
        skipCount++;
        continue;
      }

      if (line.includes('All things converge in') && skipUntilNextSection) {
        skipCount++;
        continue;
      }

      // Stop skipping when we hit a separator or next section
      if (skipUntilNextSection && (line === '---' || line.startsWith('##'))) {
        skipUntilNextSection = false;
        skipCount = 0;
        continue;
      }

      // Skip empty lines while skipping
      if (skipUntilNextSection && line === '') {
        continue;
      }

      // Keep line if we're not skipping
      if (!skipUntilNextSection) {
        cleanedLines.push(lines[i]);
      }
    }

    return cleanedLines.join('\n');
  }

  private removeOldFooterContent(content: string): string {
    const lines = content.split('\n');
    const cleanedLines: string[] = [];
    let inOldFooter = false;

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();

      // Check if we hit old footer brand block
      if (line.includes('「***YanYuCloudCube***」') ||
          line.includes('「***<admin@0379.email>***」') ||
          line.includes('「言启象限 | 语枢未来」') ||
          line.includes('「Words Initiate Quadrants') ||
          line.includes('「万象归元于云枢') ||
          line.includes('「All things converge in')) {
        inOldFooter = true;
        continue;
      }

      // Check for div align center blocks
      if (line.includes('<div align="center">') && inOldFooter) {
        continue;
      }

      // Check for closing div tags
      if (line.includes('</div>') && inOldFooter) {
        continue;
      }

      // Check for empty lines in footer
      if (line === '' && inOldFooter) {
        continue;
      }

      // Stop when we hit a separator or content
      if (inOldFooter && (line === '---' || line.startsWith('#') || line.startsWith('|') || line.startsWith('*'))) {
        inOldFooter = false;
      }

      // Keep line if we're not in footer
      if (!inOldFooter) {
        cleanedLines.unshift(lines[i]);
      }
    }

    return cleanedLines.join('\n');
  }

  private determineDocType(relativePath: string, fileName: string): DocType {
    // API 文档
    if (relativePath.includes('API文档') || fileName.includes('API')) {
      return DocType.API;
    }

    // 项目文档
    if (relativePath.includes('项目规划') || relativePath.includes('项目报告') ||
        relativePath.includes('项目维护') || fileName.includes('项目')) {
      return DocType.PROJECT;
    }

    // 技术文档
    if (relativePath.includes('代码文档') || relativePath.includes('部署发布') ||
        relativePath.includes('技术文档') || fileName.includes('技术') ||
        fileName.includes('架构') || fileName.includes('实施')) {
      return DocType.TECHNICAL;
    }

    // 默认为通用文档
    return DocType.GENERAL;
  }

  private generateHeader(fileName: string, relativePath: string, docType: DocType): string {
    const today = new Date().toISOString().split('T')[0];
    const docName = this.getDocName(fileName);
    const description = this.generateDescription(docName);
    const category = this.getCategory(relativePath, docType);

    const baseFields = `---
@file: ${fileName}
@description: ${description}
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: ${today}
@updated: ${today}
@status: stable
@tags: ${this.generateTags(relativePath, docType)}
@category: ${category}
@language: zh-CN`;

    const brandBlock = `

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---`;

    switch (docType) {
      case DocType.API:
        return `${baseFields}
@base_url: https://api.yyc3.com/v1
@authentication: oauth2
@audience: developers
@complexity: advanced
---${brandBlock}`;

      case DocType.TECHNICAL:
        return `${baseFields}
@audience: developers
@complexity: advanced
---${brandBlock}`;

      case DocType.PROJECT:
        return `${baseFields}
@project: YYC3-PortAISys
@phase: development
---${brandBlock}`;

      case DocType.GENERAL:
      default:
        return `${baseFields}
---${brandBlock}`;
    }
  }

  private getDocName(fileName: string): string {
    return fileName.replace('.md', '').replace(/^\d+-/, '');
  }

  private generateDescription(docName: string): string {
    const nameMap: Record<string, string> = {
      'YYC3-PortAISys-API总览': 'YYC³ PortAISys API 总览文档，包含 API 概述、认证方式、请求格式、响应格式和错误处理',
      'YYC3-PortAISys-认证API': 'YYC³ PortAISys 认证 API 文档，提供用户注册、登录、Token 刷新和登出功能',
      'YYC3-PortAISys-AI智能体API': 'YYC³ PortAISys AI 智能体 API 文档，提供智能体创建、管理、交互和监控功能',
      'YYC3-PortAISys-工作流API': 'YYC³ PortAISys 工作流 API 文档，提供工作流创建、执行、管理和监控功能',
      'YYC3-PortAISys-数据分析API': 'YYC³ PortAISys 数据分析 API 文档，提供数据分析、统计和可视化功能',
      'YYC3-PortAISys-用户管理API': 'YYC³ PortAISys 用户管理 API 文档，提供用户创建、查询、更新和删除功能',
      'YYC3-PortAISys-权限管理API': 'YYC³ PortAISys 权限管理 API 文档，提供权限分配、角色管理和访问控制功能',
      'YYC3-PortAISys-安全审计API': 'YYC³ PortAISys 安全审计 API 文档，提供安全事件记录、审计日志和合规检查功能',
      'YYC3-PortAISys-系统监控API': 'YYC³ PortAISys 系统监控 API 文档，提供系统状态监控、性能指标和告警功能',
      'YYC3-PortAISys-数据存储API': 'YYC³ PortAISys 数据存储 API 文档，提供数据存储、查询、备份和恢复功能',
      'YYC3-PortAISys-文件管理API': 'YYC³ PortAISys 文件管理 API 文档，提供文件上传、下载、管理和分享功能',
      'YYC3-PortAISys-缓存管理API': 'YYC³ PortAISys 缓存管理 API 文档，提供缓存设置、管理和清理功能',
      'YYC3-PortAISys-数据库API': 'YYC³ PortAISys 数据库 API 文档，提供数据库连接、查询和管理功能',
      'YYC3-PortAISys-模型管理API': 'YYC³ PortAISys 模型管理 API 文档，提供模型上传、部署、版本管理和监控功能',
      'YYC3-PortAISys-推理服务API': 'YYC³ PortAISys 推理服务 API 文档，提供模型推理、批处理和性能优化功能',
      'YYC3-PortAISys-训练服务API': 'YYC³ PortAISys 训练服务 API 文档，提供模型训练、调优和评估功能',
      'YYC3-PortAISys-Webhook API': 'YYC³ PortAISys Webhook API 文档，提供 Webhook 配置、管理和事件推送功能',
      'YYC3-PortAISys-知识库API': 'YYC³ PortAISys 知识库 API 文档，提供知识库管理、检索和更新功能',
      'YYC3-PortAISys-插件API': 'YYC³ PortAISys 插件 API 文档，提供插件开发、注册和管理功能',
      'YYC3-PortAISys-第三方集成API': 'YYC³ PortAISys 第三方集成 API 文档，提供与主流第三方服务和平台的集成能力',
      'YYC3-PortAISys-错误代码参考': 'YYC³ PortAISys 错误代码参考文档，包含所有 API 错误代码的详细说明',
      'YYC3-PortAISys-SDK文档': 'YYC³ PortAISys SDK 文档，提供各语言 SDK 的使用指南和 API 参考',
      'YYC3-PortAISys-API使用指南': 'YYC³ PortAISys API 使用指南，包含最佳实践、示例代码和常见问题',
      'YYC3-PortAISys-API变更日志': 'YYC³ PortAISys API 变更日志，记录所有 API 的版本更新和变更历史',
      'README': 'YYC³ PortAISys 文档目录，包含所有文档的索引和导航',
      '目录映射总结': 'YYC³ PortAISys 文档目录映射总结，提供文档结构和组织方式'
    };

    return nameMap[docName] || `${docName} 文档`;
  }

  private getCategory(relativePath: string, docType: DocType): string {
    if (relativePath.includes('API文档')) return 'api';
    if (relativePath.includes('代码文档')) return 'code';
    if (relativePath.includes('架构文档')) return 'architecture';
    if (relativePath.includes('部署文档')) return 'deployment';
    if (relativePath.includes('运维文档')) return 'operations';
    if (relativePath.includes('项目规划')) return 'project';
    if (relativePath.includes('项目报告')) return 'project';
    if (relativePath.includes('项目维护')) return 'project';
    if (relativePath.includes('需求规划')) return 'requirements';
    if (relativePath.includes('技术文档')) return 'technical';
    if (relativePath.includes('部署发布')) return 'deployment';
    if (relativePath.includes('审核分析')) return 'audit';

    switch (docType) {
      case DocType.API: return 'api';
      case DocType.TECHNICAL: return 'technical';
      case DocType.PROJECT: return 'project';
      default: return 'general';
    }
  }

  private generateTags(_relativePath: string, docType: DocType): string {
    const tags: string[] = [];

    switch (docType) {
      case DocType.API:
        tags.push('api', 'restful', 'critical', 'zh-CN');
        break;
      case DocType.TECHNICAL:
        tags.push('technical', 'code', 'documentation', 'zh-CN');
        break;
      case DocType.PROJECT:
        tags.push('project', 'planning', 'management', 'zh-CN');
        break;
      default:
        tags.push('general', 'documentation', 'zh-CN');
    }

    return tags.join(',');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const targetPathIndex = args.indexOf('--path');
  const targetPath = targetPathIndex !== -1 ? args[targetPathIndex + 1] : 'docs';

  const cleaner = new DocHeaderCleaner(path.resolve(targetPath));
  await cleaner.cleanAll();
}

main().catch(console.error);
