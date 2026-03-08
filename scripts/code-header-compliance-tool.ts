/**
 * @file code-header-compliance-tool.ts
 * @description 代码标头合规化工具，自动更新代码文件标头使其符合YYC³团队标准
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags code,compliance,header,tool
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
  type: 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust';
  hasHeader: boolean;
  needsUpdate: boolean;
}

interface HeaderTemplate {
  prefix: string;
  suffix: string;
  requiredFields: string[];
  optionalFields: string[];
}

class CodeHeaderComplianceTool {
  private config: ComplianceConfig;

  constructor(config?: Partial<ComplianceConfig>) {
    this.config = {
      targetPath: config?.targetPath || path.join(__dirname, '..'),
      dryRun: config?.dryRun || false,
      verbose: config?.verbose || false
    };
  }

  async run(): Promise<void> {
    console.log('🚀 开始代码标头合规化...\n');

    const files = this.scanFiles();
    const stats = this.analyzeFiles(files);

    this.printStats(stats);

    if (!this.config.dryRun) {
      await this.updateFiles(files);
    }

    console.log('\n✅ 代码标头合规化完成！');
  }

  private scanFiles(): FileInfo[] {
    const files: FileInfo[] = [];
    const scanDir = (dirPath: string) => {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
            scanDir(fullPath);
          }
        } else if (entry.isFile()) {
          const type = this.getFileType(entry.name);
          if (type) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const info = this.analyzeFile(fullPath, entry.name, type, content);
            files.push(info);
          }
        }
      }
    };

    scanDir(this.config.targetPath);
    return files;
  }

  private getFileType(filename: string): FileInfo['type'] | null {
    const ext = path.extname(filename).toLowerCase();
    const typeMap: Record<string, FileInfo['type']> = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rs': 'rust'
    };
    return typeMap[ext] || null;
  }

  private analyzeFile(filePath: string, fileName: string, type: FileInfo['type'], content: string): FileInfo {
    const template = this.getHeaderTemplate(type);
    const hasHeader = content.trim().startsWith(template.prefix);

    let needsUpdate = false;
    if (hasHeader) {
      const headerEnd = content.indexOf(template.suffix);
      if (headerEnd === -1) {
        needsUpdate = true;
      } else {
        const headerContent = content.substring(0, headerEnd + template.suffix.length);
        needsUpdate = !this.checkHeaderCompliance(headerContent, template);
      }
    } else {
      needsUpdate = true;
    }

    return {
      path: filePath,
      name: fileName,
      type,
      hasHeader,
      needsUpdate
    };
  }

  private getHeaderTemplate(type: FileInfo['type']): HeaderTemplate {
    const templates: Record<FileInfo['type'], HeaderTemplate> = {
      typescript: {
        prefix: '/**',
        suffix: ' */',
        requiredFields: ['@file', '@description', '@author', '@version', '@created', '@updated', '@status'],
        optionalFields: ['@license', '@copyright', '@tags', '@depends', '@see', '@todo']
      },
      javascript: {
        prefix: '/**',
        suffix: ' */',
        requiredFields: ['@file', '@description', '@author', '@version', '@created', '@updated', '@status'],
        optionalFields: ['@license', '@copyright', '@tags', '@depends', '@see', '@todo']
      },
      python: {
        prefix: '"""',
        suffix: '"""',
        requiredFields: ['@file:', '@description:', '@author:', '@version:', '@created:', '@updated:', '@status:'],
        optionalFields: ['@license:', '@copyright:', '@tags:', '@depends:', '@see:', '@todo:']
      },
      java: {
        prefix: '/**',
        suffix: ' */',
        requiredFields: ['@file', '@description', '@author', '@version', '@created', '@updated', '@status'],
        optionalFields: ['@license', '@copyright', '@tags', '@depends', '@see', '@todo']
      },
      go: {
        prefix: '//',
        suffix: '',
        requiredFields: ['@file', '@description', '@author', '@version', '@created', '@updated', '@status'],
        optionalFields: ['@license', '@copyright', '@tags']
      },
      rust: {
        prefix: '//!',
        suffix: '',
        requiredFields: ['@file', '@description', '@author', '@version', '@created', '@updated', '@status'],
        optionalFields: ['@license', '@copyright', '@tags']
      }
    };
    return templates[type];
  }

  private checkHeaderCompliance(headerContent: string, template: HeaderTemplate): boolean {
    const lines = headerContent.split('\n');
    const foundFields = new Set<string>();

    for (const line of lines) {
      for (const field of [...template.requiredFields, ...template.optionalFields]) {
        if (line.includes(field)) {
          foundFields.add(field);
        }
      }
    }

    for (const requiredField of template.requiredFields) {
      if (!foundFields.has(requiredField)) {
        return false;
      }
    }

    return true;
  }

  private analyzeFiles(files: FileInfo[]): {
    total: number;
    hasHeader: number;
    needsUpdate: number;
    byType: Record<string, number>;
  } {
    const stats = {
      total: files.length,
      hasHeader: 0,
      needsUpdate: 0,
      byType: {} as Record<string, number>
    };

    for (const file of files) {
      if (file.hasHeader) stats.hasHeader++;
      if (file.needsUpdate) stats.needsUpdate++;

      stats.byType[file.type] = (stats.byType[file.type] || 0) + 1;
    }

    return stats;
  }

  private printStats(stats: ReturnType<typeof this.analyzeFiles>): void {
    console.log('📊 统计信息:');
    console.log(`  总文件数: ${stats.total}`);
    console.log(`  已有标头: ${stats.hasHeader} (${((stats.hasHeader / stats.total) * 100).toFixed(1)}%)`);
    console.log(`  需要更新: ${stats.needsUpdate} (${((stats.needsUpdate / stats.total) * 100).toFixed(1)}%)`);
    console.log('\n📁 按类型统计:');
    for (const [type, count] of Object.entries(stats.byType)) {
      console.log(`  ${type}: ${count} 个文件`);
    }
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
    const template = this.getHeaderTemplate(file.type);
    const relativePath = path.relative(this.config.targetPath, file.path);

    const newHeader = this.generateHeader(file, relativePath, template);

    let newContent: string;
    if (file.hasHeader) {
      const headerEnd = content.indexOf(template.suffix);
      if (headerEnd !== -1) {
        newContent = newHeader + '\n\n' + content.substring(headerEnd + template.suffix.length).trimStart();
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

  private generateHeader(file: FileInfo, relativePath: string, _template: HeaderTemplate): string {
    const today = new Date().toISOString().split('T')[0];

    if (file.type === 'python') {
      return `"""
@file: ${relativePath}
@description: ${this.generateDescription(file.name)}
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: ${today}
@updated: ${today}
@status: stable
@license: MIT
@copyright: Copyright (c) 2026 YanYuCloudCube Team
@tags: ${this.generateTags(file.type, relativePath)}
"""`;
    } else if (file.type === 'go') {
      return `// @file ${relativePath}
// @description ${this.generateDescription(file.name)}
// @author YanYuCloudCube Team <admin@0379.email>
// @version v1.0.0
// @created ${today}
// @updated ${today}
// @status stable
// @license MIT
// @copyright Copyright (c) 2026 YanYuCloudCube Team
// @tags ${this.generateTags(file.type, relativePath)}`;
    } else if (file.type === 'rust') {
      return `//! @file ${relativePath}
//! @description ${this.generateDescription(file.name)}
//! @author YanYuCloudCube Team <admin@0379.email>
//! @version v1.0.0
//! @created ${today}
//! @updated ${today}
//! @status stable
//! @license MIT
//! @copyright Copyright (c) 2026 YanYuCloudCube Team
//! @tags ${this.generateTags(file.type, relativePath)}`;
    } else {
      return `/**
 * @file ${relativePath}
 * @description ${this.generateDescription(file.name)}
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created ${today}
 * @updated ${today}
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags ${this.generateTags(file.type, relativePath)}
 */`;
    }
  }

  private generateDescription(fileName: string): string {
    const nameWithoutExt = path.basename(fileName, path.extname(fileName));
    const camelCaseToWords = nameWithoutExt
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return `${camelCaseToWords} 模块`;
  }

  private generateTags(type: FileInfo['type'], relativePath: string): string {
    const tags: string[] = [type];

    const pathParts = relativePath.split(path.sep);
    if (pathParts.includes('core')) tags.push('core');
    if (pathParts.includes('utils')) tags.push('utils');
    if (pathParts.includes('api')) tags.push('api');
    if (pathParts.includes('ui')) tags.push('ui');
    if (pathParts.includes('db')) tags.push('db');

    return tags.join(',');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  const targetPathIndex = args.indexOf('--path');
  const targetPath = targetPathIndex !== -1 ? args[targetPathIndex + 1] : undefined;

  const tool = new CodeHeaderComplianceTool({
    targetPath: targetPath ? path.resolve(targetPath) : undefined,
    dryRun,
    verbose
  });

  await tool.run();
}

main().catch(console.error);
