/**
 * @file 文档标头标尾合规化工具
 * @description 自动为docs目录下的文档添加或更新符合YYC³标准的标头标尾
 * @module scripts
 * @author YanYuCloudCube Team
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags docs,compliance,header,footer,tool
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ComplianceConfig {
  docsPath: string;
  dryRun: boolean;
  verbose: boolean;
}

interface DocInfo {
  path: string;
  name: string;
  hasHeader: boolean;
  hasFooter: boolean;
  needsUpdate: boolean;
}

class DocComplianceTool {
  private config: ComplianceConfig;

  constructor(config?: Partial<ComplianceConfig>) {
    this.config = {
      docsPath: path.join(__dirname, '..', 'docs'),
      dryRun: false,
      verbose: false,
      ...config
    };
  }

  async run(): Promise<void> {
    console.log('🚀 开始文档标头标尾合规化...\n');
    
    const docs = this.scanDocuments();
    const stats = this.analyzeDocuments(docs);
    
    this.printStats(stats);
    
    if (!this.config.dryRun) {
      await this.updateDocuments(docs);
    }
    
    console.log('\n✅ 文档标头标尾合规化完成！');
  }

  private scanDocuments(): DocInfo[] {
    const docs: DocInfo[] = [];
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
          const info = this.analyzeDocument(fullPath, entry.name, content);
          docs.push(info);
        }
      }
    };
    
    scanDir(this.config.docsPath);
    return docs;
  }

  private analyzeDocument(filePath: string, fileName: string, content: string): DocInfo {
    const hasHeader = this.hasValidHeader(content);
    const hasFooter = this.hasValidFooter(content);
    const needsUpdate = !hasHeader || !hasFooter;
    
    return {
      path: filePath,
      name: fileName,
      hasHeader,
      hasFooter,
      needsUpdate
    };
  }

  private hasValidHeader(content: string): boolean {
    const headerPattern = /> \*\*生成时间\*\*:/;
    return headerPattern.test(content);
  }

  private hasValidFooter(content: string): boolean {
    const footerPattern = /<div align="center">\s*>\s*「\*\*\*YanYuCloudCube\*\*\*」/;
    return footerPattern.test(content);
  }

  private analyzeDocuments(docs: DocInfo[]) {
    const total = docs.length;
    const withHeader = docs.filter(d => d.hasHeader).length;
    const withFooter = docs.filter(d => d.hasFooter).length;
    const needsUpdate = docs.filter(d => d.needsUpdate).length;
    
    return {
      total,
      withHeader,
      withFooter,
      needsUpdate,
      headerRate: ((withHeader / total) * 100).toFixed(1),
      footerRate: ((withFooter / total) * 100).toFixed(1)
    };
  }

  private printStats(stats: any): void {
    console.log('📊 文档合规性统计:\n');
    console.log(`  总文档数: ${stats.total}`);
    console.log(`  有标头文档: ${stats.withHeader} (${stats.headerRate}%)`);
    console.log(`  有标尾文档: ${stats.withFooter} (${stats.footerRate}%)`);
    console.log(`  需要更新: ${stats.needsUpdate}\n`);
    
    if (this.config.verbose) {
      console.log('📋 详细信息:\n');
      console.log('  需要更新的文档:');
      console.log('  ' + '-'.repeat(60));
    }
  }

  private async updateDocuments(docs: DocInfo[]): Promise<void> {
    let updated = 0;
    let skipped = 0;
    
    for (const doc of docs) {
      if (doc.needsUpdate) {
        try {
          await this.updateDocument(doc);
          updated++;
          
          if (this.config.verbose) {
            console.log(`  ✓ ${doc.name}`);
          }
        } catch (error) {
          console.error(`  ✗ ${doc.name}: ${error}`);
        }
      } else {
        skipped++;
      }
    }
    
    console.log(`\n📈 更新统计:`);
    console.log(`  已更新: ${updated}`);
    console.log(`  已跳过: ${skipped}`);
  }

  private async updateDocument(doc: DocInfo): Promise<void> {
    let content = fs.readFileSync(doc.path, 'utf-8');
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (!doc.hasHeader) {
      content = this.addHeader(content, currentDate);
    }
    
    if (!doc.hasFooter) {
      content = this.addFooter(content);
    }
    
    fs.writeFileSync(doc.path, content, 'utf-8');
  }

  private addHeader(content: string, date: string): string {
    const header = `> **生成时间**: ${date}  
> **文档版本**: v1.0.0  
> **维护团队**: YanYuCloudCube Team  
> **状态**: 稳定

`;
    
    const lines = content.split('\n');
    const titleLine = lines.findIndex(line => line.startsWith('#'));
    
    if (titleLine >= 0) {
      lines.splice(titleLine + 1, 0, header);
      return lines.join('\n');
    }
    
    return header + content;
  }

  private addFooter(content: string): string {
    const footer = `

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
`;
    
    if (!content.includes(footer)) {
      return content.trim() + footer;
    }
    
    return content;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  
  const tool = new DocComplianceTool({
    dryRun,
    verbose
  });
  
  await tool.run();
}

main().catch(console.error);
