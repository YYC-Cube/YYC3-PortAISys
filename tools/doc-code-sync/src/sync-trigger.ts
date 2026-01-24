import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'eventemitter3';
import * as chokidar from 'chokidar';
import { Mapping, FileChangeEvent, SyncResult, SyncDetail } from './types';
import { MappingRuleParser } from './mapping-parser';

export class BidirectionalSyncTrigger extends EventEmitter {
  private parser: MappingRuleParser;
  private docWatcher: chokidar.FSWatcher | null = null;
  private codeWatcher: chokidar.FSWatcher | null = null;
  private configWatcher: chokidar.FSWatcher | null = null;
  private syncQueue: FileChangeEvent[] = [];
  private isProcessing: boolean = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private debounceDelay: number = 1000;

  constructor(configPath: string = '.doc-code-mapping.json') {
    super();
    this.parser = new MappingRuleParser(configPath);
  }

  startWatching(docsDir: string, codeDir: string): void {
    this.setupDocWatcher(docsDir);
    this.setupCodeWatcher(codeDir);
    this.setupConfigWatcher();
    this.processSyncQueue();
  }

  stopWatching(): void {
    if (this.docWatcher) {
      this.docWatcher.close();
      this.docWatcher = null;
    }
    if (this.codeWatcher) {
      this.codeWatcher.close();
      this.codeWatcher = null;
    }
    if (this.configWatcher) {
      this.configWatcher.close();
      this.configWatcher = null;
    }
    this.emit('stopped');
  }

  private setupDocWatcher(docsDir: string): void {
    this.docWatcher = chokidar.watch('**/*.md', {
      cwd: docsDir,
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    this.docWatcher
      .on('add', (filePath) => this.handleDocChange('add', path.join(docsDir, filePath)))
      .on('change', (filePath) => this.handleDocChange('change', path.join(docsDir, filePath)))
      .on('unlink', (filePath) => this.handleDocChange('unlink', path.join(docsDir, filePath)))
      .on('error', (error) => this.emit('error', error));

    this.emit('watcher-started', 'document');
  }

  private setupCodeWatcher(codeDir: string): void {
    this.codeWatcher = chokidar.watch('**/*.{ts,tsx}', {
      cwd: codeDir,
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    this.codeWatcher
      .on('add', (filePath) => this.handleCodeChange('add', path.join(codeDir, filePath)))
      .on('change', (filePath) => this.handleCodeChange('change', path.join(codeDir, filePath)))
      .on('unlink', (filePath) => this.handleCodeChange('unlink', path.join(codeDir, filePath)))
      .on('error', (error) => this.emit('error', error));

    this.emit('watcher-started', 'code');
  }

  private setupConfigWatcher(): void {
    const configPath = this.parser.getConfigPath();
    const configDir = path.dirname(configPath);
    const configFileName = path.basename(configPath);

    this.configWatcher = chokidar.watch(configFileName, {
      cwd: configDir,
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    this.configWatcher
      .on('change', () => {
        console.log('配置文件已更新，重新加载配置...');
        this.reloadConfig();
      })
      .on('error', (error) => this.emit('error', error));

    this.emit('watcher-started', 'config');
  }

  private handleDocChange(type: 'add' | 'change' | 'unlink', filePath: string): void {
    const event: FileChangeEvent = {
      type,
      path: filePath,
      timestamp: new Date().toISOString()
    };

    this.emit('doc-change', event);
    this.addToSyncQueue(event);
  }

  private handleCodeChange(type: 'add' | 'change' | 'unlink', filePath: string): void {
    const event: FileChangeEvent = {
      type,
      path: filePath,
      timestamp: new Date().toISOString()
    };

    this.emit('code-change', event);
    this.addToSyncQueue(event);
  }

  private addToSyncQueue(event: FileChangeEvent): void {
    this.syncQueue.push(event);
    this.debouncedProcess();
  }

  private debouncedProcess(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processSyncQueue();
    }, this.debounceDelay);
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.emit('sync-started');

    const events = [...this.syncQueue];
    this.syncQueue = [];

    const results: SyncResult[] = [];

    for (const event of events) {
      try {
        const result = await this.syncFile(event);
        results.push(result);
        this.emit('sync-completed', result);
      } catch (error) {
        const errorResult: SyncResult = {
          success: false,
          message: `同步失败: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date().toISOString()
        };
        results.push(errorResult);
        this.emit('sync-failed', errorResult);
      }
    }

    this.isProcessing = false;
    this.emit('sync-finished', results);

    if (this.syncQueue.length > 0) {
      this.processSyncQueue();
    }
  }

  private async syncFile(event: FileChangeEvent): Promise<SyncResult> {
    const mappings = this.findRelatedMappings(event.path);

    if (mappings.length === 0) {
      return {
        success: true,
        message: '未找到相关映射，跳过同步',
        timestamp: new Date().toISOString()
      };
    }

    const details: SyncDetail[] = [];

    for (const mapping of mappings) {
      if (!mapping.syncEnabled) {
        details.push({
          file: mapping.document,
          status: 'skipped',
          message: '同步已禁用'
        });
        continue;
      }

      try {
        if (event.path.endsWith('.md')) {
          await this.syncDocToCode(event, mapping);
        } else {
          await this.syncCodeToDoc(event, mapping);
        }

        this.parser.updateMapping(mapping.id, {
          lastSync: new Date().toISOString(),
          syncStatus: 'success'
        });

        details.push({
          file: mapping.document,
          status: 'success',
          message: '同步成功'
        });
      } catch (error) {
        this.parser.updateMapping(mapping.id, {
          syncStatus: 'failed'
        });

        details.push({
          file: mapping.document,
          status: 'failed',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return {
      success: details.every(d => d.status === 'success' || d.status === 'skipped'),
      message: `同步完成: ${details.length} 个映射`,
      timestamp: new Date().toISOString(),
      details
    };
  }

  private findRelatedMappings(filePath: string): Mapping[] {
    const isDoc = filePath.endsWith('.md');
    const allMappings = this.parser.getAllMappings();

    if (isDoc) {
      return allMappings.filter(m => m.document === filePath);
    } else {
      return allMappings.filter(m => m.codeFiles.includes(filePath));
    }
  }

  private async syncDocToCode(event: FileChangeEvent, mapping: Mapping): Promise<void> {
    if (event.type === 'unlink') {
      throw new Error('文档删除操作不支持自动同步到代码');
    }

    const docContent = fs.readFileSync(event.path, 'utf-8');
    const extractedInfo = this.extractCodeInfoFromDoc(docContent);

    for (const codeFile of mapping.codeFiles) {
      let codeContent = '';
      
      if (!fs.existsSync(codeFile)) {
        const codeDir = path.dirname(codeFile);
        if (!fs.existsSync(codeDir)) {
          fs.mkdirSync(codeDir, { recursive: true });
        }
        
        const codeFileName = path.basename(codeFile, '.ts');
        codeContent = this.generateCodeTemplate(codeFileName, extractedInfo);
      } else {
        codeContent = fs.readFileSync(codeFile, 'utf-8');
        codeContent = this.updateCodeWithDocInfo(codeContent, extractedInfo);
      }

      fs.writeFileSync(codeFile, codeContent, 'utf-8');
    }
  }

  private async syncCodeToDoc(event: FileChangeEvent, mapping: Mapping): Promise<void> {
    if (event.type === 'unlink') {
      throw new Error('代码删除操作不支持自动同步到文档');
    }

    if (!fs.existsSync(mapping.document)) {
      throw new Error(`文档文件不存在: ${mapping.document}`);
    }

    const codeContent = fs.readFileSync(event.path, 'utf-8');
    const extractedInfo = this.extractDocInfoFromCode(codeContent);

    const docContent = fs.readFileSync(mapping.document, 'utf-8');
    const updatedContent = this.updateDocWithCodeInfo(docContent, extractedInfo);

    fs.writeFileSync(mapping.document, updatedContent, 'utf-8');
  }

  private extractCodeInfoFromDoc(docContent: string): any {
    const info: any = {};

    const descriptionMatch = docContent.match(/## 功能描述\s*\n([\s\S]*?)(?=\n##|$)/);
    if (descriptionMatch) {
      info.description = descriptionMatch[1].trim();
    }

    const apiMatch = docContent.match(/## API 接口\s*\n([\s\S]*?)(?=\n##|$)/);
    if (apiMatch) {
      info.api = apiMatch[1].trim();
    }

    const exampleMatch = docContent.match(/## 使用示例\s*\n([\s\S]*?)(?=\n##|$)/);
    if (exampleMatch) {
      info.example = exampleMatch[1].trim();
    }

    return info;
  }

  private updateCodeWithDocInfo(codeContent: string, docInfo: any): string {
    let updatedContent = codeContent;

    if (docInfo.description) {
      const classMatch = updatedContent.match(/(export\s+(?:class|interface|function)\s+\w+)/);
      if (classMatch) {
        const comment = `/**\n * ${docInfo.description.replace(/\n/g, '\n * ')}\n */\n`;
        updatedContent = updatedContent.replace(classMatch[1], comment + classMatch[1]);
      }
    }

    return updatedContent;
  }

  private extractDocInfoFromCode(codeContent: string): any {
    const info: any = {};

    const classMatch = codeContent.match(/export\s+(?:class|interface|function)\s+(\w+)/);
    if (classMatch) {
      info.className = classMatch[1];
    }

    const commentMatch = codeContent.match(/\/\*\*[\s\S]*?\*\//);
    if (commentMatch) {
      const commentText = commentMatch[0]
        .replace(/\/\*\*/, '')
        .replace(/\*\//g, '')
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, '').trim())
        .filter(line => line.length > 0)
        .join('\n');

      info.description = commentText;
    }

    const methodMatches = codeContent.matchAll(/(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*:\s*\w+/g);
    info.methods = Array.from(methodMatches).map(match => match[1]);

    return info;
  }

  private updateDocWithCodeInfo(docContent: string, codeInfo: any): string {
    let updatedContent = docContent;

    if (codeInfo.description) {
      const descSection = `## 功能描述\n\n${codeInfo.description}\n`;
      updatedContent = this.replaceSection(updatedContent, '功能描述', descSection);
    }

    if (codeInfo.methods && codeInfo.methods.length > 0) {
      const methodsSection = `## 方法列表\n\n${codeInfo.methods.map((m: string) => `- \`${m}\``).join('\n')}\n`;
      updatedContent = this.replaceSection(updatedContent, '方法列表', methodsSection);
    }

    return updatedContent;
  }

  private replaceSection(content: string, sectionName: string, newSection: string): string {
    const sectionRegex = new RegExp(`## ${sectionName}\\s*\\n[\\s\\S]*?(?=\\n##|$)`);
    if (sectionRegex.test(content)) {
      return content.replace(sectionRegex, newSection);
    } else {
      return content + '\n\n' + newSection;
    }
  }

  manualSync(filePath: string): Promise<SyncResult> {
    const event: FileChangeEvent = {
      type: 'change',
      path: filePath,
      timestamp: new Date().toISOString()
    };

    return this.syncFile(event);
  }

  getSyncQueueLength(): number {
    return this.syncQueue.length;
  }

  isSyncing(): boolean {
    return this.isProcessing;
  }

  private generateCodeTemplate(className: string, docInfo: any): string {
    const description = docInfo.description || '自动生成的代码文件';
    const descriptionComment = description.split('\n').map((line: string) => ` * ${line}`).join('\n');
    
    return `/**
 * ${descriptionComment}
 */

export class ${className} {
  constructor() {
    // TODO: 实现构造函数
  }

  // TODO: 根据文档添加方法
}
`;
  }

  reloadConfig(): void {
    this.parser = new MappingRuleParser(this.parser.getConfigPath());
    this.emit('config-reloaded');
  }

  getConfigPath(): string {
    return this.parser.getConfigPath();
  }
}
