import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'eventemitter3';
import * as chokidar from 'chokidar';
import { Mapping, FileChangeEvent, SyncResult, SyncDetail } from './types';
import { MappingRuleParser } from './mapping-parser';
import { ChunkProcessor } from './chunk-processor';
import { CacheManager, MultiLevelCache } from './cache-manager';
import { ConcurrentTaskManager } from './concurrent-manager';

export class OptimizedBidirectionalSyncTrigger extends EventEmitter {
  private parser: MappingRuleParser;
  private docWatcher: chokidar.FSWatcher | null = null;
  private codeWatcher: chokidar.FSWatcher | null = null;
  private configWatcher: chokidar.FSWatcher | null = null;
  private syncQueue: FileChangeEvent[] = [];
  private isProcessing: boolean = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private debounceDelay: number = 1000;
  
  private chunkProcessor: ChunkProcessor;
  private contentCache: MultiLevelCache<string>;
  private syncTaskManager: ConcurrentTaskManager<FileChangeEvent, SyncResult>;

  constructor(configPath: string = '.doc-code-mapping.json') {
    super();
    this.parser = new MappingRuleParser(configPath);
    
    this.chunkProcessor = new ChunkProcessor({
      chunkSize: 1024 * 1024,
      onProgress: (progress) => {
        this.emit('progress', { progress, message: '处理文件中...' });
      }
    });

    this.contentCache = new MultiLevelCache<string>(
      { maxSize: 100, ttl: 1800000 },
      { maxSize: 1000, ttl: 3600000 }
    );

    this.syncTaskManager = new ConcurrentTaskManager<FileChangeEvent, SyncResult>(
      './src/workers/sync-worker.js',
      {
        maxWorkers: 4,
        taskTimeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    );
  }

  startWatching(docsDir: string, codeDir: string): void {
    this.setupDocWatcher(docsDir);
    this.setupCodeWatcher(codeDir);
    this.setupConfigWatcher();
    this.processSyncQueue();
    this.emit('started');
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
    this.syncTaskManager.shutdown();
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
        this.contentCache.clear();
      })
      .on('error', (error) => this.emit('error', error));

    this.emit('watcher-started', 'config');
  }

  private handleDocChange(type: 'add' | 'change' | 'unlink', filePath: string): void {
    const event: FileChangeEvent = {
      path: filePath,
      type,
      timestamp: Date.now().toString()
    };

    this.syncQueue.push(event);
    this.debouncedProcess();
  }

  private handleCodeChange(type: 'add' | 'change' | 'unlink', filePath: string): void {
    const event: FileChangeEvent = {
      path: filePath,
      type,
      timestamp: Date.now().toString()
    };

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
    this.emit('processing-start', { queueSize: this.syncQueue.length });

    const events = [...this.syncQueue];
    this.syncQueue = [];

    try {
      const results = await this.syncTaskManager.executeTasks(events);
      
      for (const result of results) {
        if (result.success) {
          this.emit('sync-success', result);
        } else {
          this.emit('sync-error', result);
        }
      }

      this.emit('processing-complete', { 
        total: events.length, 
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });
    } catch (error) {
      this.emit('error', error);
    } finally {
      this.isProcessing = false;
      
      if (this.syncQueue.length > 0) {
        setTimeout(() => this.processSyncQueue(), 100);
      }
    }
  }

  private async syncDocToCode(event: FileChangeEvent, mapping: Mapping): Promise<SyncResult> {
    if (event.type === 'unlink') {
      throw new Error('文档删除操作不支持自动同步到代码');
    }

    const cacheKey = `doc:${event.path}:${fs.statSync(event.path).mtimeMs}`;
    const cached = await this.contentCache.get(cacheKey);
    
    if (cached) {
      return {
        success: true,
        message: '使用缓存',
        timestamp: Date.now().toString(),
        details: []
      };
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

    await this.contentCache.set(cacheKey, docContent);

    return {
      success: true,
      message: '同步成功',
      timestamp: Date.now().toString(),
      details: []
    };
  }

  private extractCodeInfoFromDoc(docContent: string): any {
    const info: any = {
      description: '',
      api: [],
      functions: []
    };

    const descMatch = docContent.match(/## 功能描述\s*\n([\s\S]*?)(?=\n##|$)/);
    if (descMatch) {
      info.description = descMatch[1].trim();
    }

    const apiMatches = docContent.matchAll(/```typescript\s*\n(.*?)\n```/gs);
    for (const match of apiMatches) {
      info.api.push(match[1].trim());
    }

    return info;
  }

  private generateCodeTemplate(fileName: string, info: any): string {
    return `/**
 * @description ${info.description || '自动生成的代码文件'}
 * @generated-by YYC³ 文档同步工具
 * @generated-at ${new Date().toISOString()}
 */

export class ${fileName.charAt(0).toUpperCase() + fileName.slice(1)} {
  // TODO: 实现具体功能
  constructor() {
    console.log('${fileName} initialized');
  }
}
`;
  }

  private updateCodeWithDocInfo(codeContent: string, info: any): string {
    const updated = codeContent.replace(
      /@description [^\n]*/,
      `@description ${info.description || ''}`
    );
    return updated;
  }

  reloadConfig(): void {
    this.parser.reloadConfig();
    this.emit('config-reloaded');
  }

  getStats(): any {
    return {
      queueSize: this.syncQueue.length,
      isProcessing: this.isProcessing,
      cacheStats: this.contentCache.getStats(),
      workerStats: this.syncTaskManager.getStats()
    };
  }
}
