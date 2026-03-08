/**
 * @file doc-header-compliance-tool.ts
 * @description 文档标头合规化工具，自动更新文档文件标头使其符合YYC³团队标准
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags doc,compliance,header,tool
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ComplianceConfig {
  targetPath: string;
  dryRun: boolean;
  verbose: boolean;
}

interface FileInfo {
  path: string;
  name: string;
  hasHeader: boolean;
  needsUpdate: boolean;
  currentHeader?: string;
}

class DocHeaderComplianceTool {
  private config: ComplianceConfig;

  constructor(config?: Partial<ComplianceConfig>) {
    this.config = {
      targetPath: config?.targetPath || path.join(__dirname, '..', 'docs'),
      dryRun: config?.dryRun || false,
      verbose: config?.verbose || false
    };
  }

  async run(): Promise<void> {
    console.log('🚀 开始文档标头合规化...\n');

    const files = this.scanFiles();
    const stats = this.analyzeFiles(files);

    this.printStats(stats);

    if (!this.config.dryRun) {
      await this.updateFiles(files);
    }

    console.log('\n✅ 文档标头合规化完成！');
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
          const content = fs.readFileSync(fullPath, 'utf-8');
          const info = this.analyzeFile(fullPath, entry.name, content);
          files.push(info);
        }
      }
    };

    scanDir(this.config.targetPath);
    return files;
  }

  private analyzeFile(filePath: string, fileName: string, content: string): FileInfo {
    const hasHeader = content.startsWith('---');

    let needsUpdate = false;
    let currentHeader: string | undefined;

    if (hasHeader) {
      const headerEnd = content.indexOf('---', 3);
      if (headerEnd !== -1) {
        currentHeader = content.substring(0, headerEnd + 3);

        if (!this.checkHeaderCompliance(currentHeader)) {
          needsUpdate = true;
        }
      } else {
        needsUpdate = true;
      }
    } else {
      needsUpdate = true;
    }

    return {
      path: filePath,
      name: fileName,
      hasHeader,
      needsUpdate,
      currentHeader
    };
  }

  private checkHeaderCompliance(header: string): boolean {
    const requiredFields = [
      '@file:',
      '@description:',
      '@author:',
      '@version:',
      '@created:',
      '@updated:',
      '@status:',
      '@tags:',
      '@category:',
      '@language:'
    ];

    for (const field of requiredFields) {
      if (!header.includes(field)) {
        return false;
      }
    }

    return true;
  }

  private analyzeFiles(files: FileInfo[]): {
    total: number;
    hasHeader: number;
    needsUpdate: number;
  } {
    const stats = {
      total: files.length,
      hasHeader: 0,
      needsUpdate: 0
    };

    for (const file of files) {
      if (file.hasHeader) stats.hasHeader++;
      if (file.needsUpdate) stats.needsUpdate++;
    }

    return stats;
  }

  private printStats(stats: ReturnType<typeof this.analyzeFiles>): void {
    console.log('📊 统计信息:');
    console.log(`  总文件数: ${stats.total}`);
    console.log(`  已有标头: ${stats.hasHeader} (${((stats.hasHeader / stats.total) * 100).toFixed(1)}%)`);
    console.log(`  需要更新: ${stats.needsUpdate} (${((stats.needsUpdate / stats.total) * 100).toFixed(1)}%)`);
    console.log('');
  }

  private async updateFiles(files: FileInfo[]): Promise<void> {
    const filesToUpdate = files.filter(f => f.needsUpdate);

    console.log(`📝 开始更新 ${filesToUpdate.length} 个文件...\n`);

    for (const file of filesToUpdate) {
      await this.updateFileHeader(file);
    }
  }

  private async updateFileHeader(file: FileInfo): Promise<void> {
    const content = fs.readFileSync(file.path, 'utf-8');
    const relativePath = path.relative(this.config.targetPath, file.path);

    const newHeader = this.generateHeader(file.name, relativePath);

    let newContent: string;
    if (file.hasHeader) {
      const headerEnd = content.indexOf('---', 3);
      if (headerEnd !== -1) {
        let remainingContent = content.substring(headerEnd + 3).trimStart();

        // Remove old header content if present
        const oldHeaderPatterns = [
          /> \*\*\*生成时间\*\*:/,
          /> \*\*\*文档版本\*\*:/,
          /> \*\*\*维护团队\*\*:/,
          /> \*\*\*状态\*\*:/,
          /> \*\*\*文档版本\*\*:/,
          /> \*\*\*创建日期\*\*:/,
          /> \*\*\*文档状态\*\*:/,
          /> \*\*\*维护团队\*\*:/,
          /\*\*\*YanYuCloudCube\*\*\*/,
          /言启象限 \| 语枢未来/,
          /\*\*\*Words Initiate Quadrants, Language Serves as Core for the Future\*\*\*/,
          /万象归元于云枢 \| 深栈智启新纪元/,
          /\*\*\*All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence\*\*\*/,
          /\*\*\*All things converge in cloud pivot; Deep stacks ignite a new era of intelligence\*\*\*/,
          /All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence/,
          /All things converge in cloud pivot; Deep stacks ignite a new era of intelligence/
        ];

        for (const pattern of oldHeaderPatterns) {
          remainingContent = remainingContent.replace(pattern, '');
        }

        // Clean up empty lines and extra separators
        remainingContent = remainingContent
          .split('\n')
          .filter(line => line.trim() !== '')
          .join('\n')
          .replace(/^---+$/gm, '')
          .trim();

        newContent = newHeader + '\n\n' + remainingContent;
      } else {
        newContent = newHeader + '\n\n' + content.trimStart();
      }
    } else {
      newContent = newHeader + '\n\n' + content.trimStart();
    }

    fs.writeFileSync(file.path, newContent, 'utf-8');

    if (this.config.verbose) {
      console.log(`✓ 已更新: ${relativePath}`);
    }
  }

  private generateHeader(fileName: string, relativePath: string): string {
    const today = new Date().toISOString().split('T')[0];
    const docName = this.getDocName(fileName);
    const description = this.generateDescription(docName);
    const category = this.getCategory(relativePath);
    const baseUrl = 'https://api.yyc3.com/v1';

    return `---
@file: ${fileName}
@description: ${description}
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: ${today}
@updated: ${today}
@status: stable
@tags: api,${category},restful,critical,zh-CN
@category: api
@language: zh-CN
@base_url: ${baseUrl}
@authentication: oauth2
@audience: developers
@complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---`;
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
      'README': 'YYC³ PortAISys API 文档目录，包含所有 API 文档的索引和导航',
      '目录映射总结': 'YYC³ PortAISys API 文档目录映射总结，提供文档结构和组织方式'
    };

    return nameMap[docName] || `${docName} 文档`;
  }

  private getCategory(relativePath: string): string {
    if (relativePath.includes('API文档')) return 'api';
    if (relativePath.includes('代码文档')) return 'code';
    if (relativePath.includes('架构文档')) return 'architecture';
    if (relativePath.includes('部署文档')) return 'deployment';
    if (relativePath.includes('运维文档')) return 'operations';
    return 'general';
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  const targetPathIndex = args.indexOf('--path');
  const targetPath = targetPathIndex !== -1 ? args[targetPathIndex + 1] : undefined;

  const tool = new DocHeaderComplianceTool({
    targetPath: targetPath ? path.resolve(targetPath) : undefined,
    dryRun,
    verbose
  });

  await tool.run();
}

main().catch(console.error);
