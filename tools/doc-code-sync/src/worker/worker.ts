import { 
  WorkerMessage, 
  WorkerResponse, 
  WorkerError, 
  SyncTaskData, 
  SyncTaskResult,
  AnalyzeTaskData,
  AnalyzeTaskResult,
  ProcessTaskData,
  ProcessTaskResult,
  ValidateTaskData,
  ValidateTaskResult,
  WorkerStats,
  WorkerConfig 
} from './types';
import * as fs from 'fs';
import * as path from 'path';

export class DocCodeWorker {
  private stats: WorkerStats;
  private config: WorkerConfig;
  private activeTasks: Map<string, any>;

  constructor(config: WorkerConfig = {}) {
    this.stats = {
      tasksProcessed: 0,
      tasksSucceeded: 0,
      tasksFailed: 0,
      totalProcessingTime: 0,
      averageProcessingTime: 0,
      bytesProcessed: 0,
      lastActivity: Date.now(),
    };
    this.config = {
      maxMemoryMB: config.maxMemoryMB || 512,
      maxTaskDuration: config.maxTaskDuration || 30000,
      enableProfiling: config.enableProfiling || false,
      logLevel: config.logLevel || 'info',
    };
    this.activeTasks = new Map();
  }

  async handleMessage(message: WorkerMessage): Promise<WorkerResponse> {
    const startTime = Date.now();
    this.activeTasks.set(message.id, { startTime, type: message.type });

    try {
      let result: any;

      switch (message.type) {
        case 'sync':
          result = await this.handleSyncTask(message.data as SyncTaskData);
          break;
        case 'analyze':
          result = await this.handleAnalyzeTask(message.data as AnalyzeTaskData);
          break;
        case 'process':
          result = await this.handleProcessTask(message.data as ProcessTaskData);
          break;
        case 'validate':
          result = await this.handleValidateTask(message.data as ValidateTaskData);
          break;
        default:
          throw new Error(`Unknown task type: ${message.type}`);
      }

      const duration = Date.now() - startTime;
      this.updateStats(true, duration, this.calculateBytesProcessed(result));

      this.activeTasks.delete(message.id);

      return {
        id: message.id,
        type: 'success',
        data: result,
        timestamp: Date.now(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateStats(false, duration, 0);

      this.activeTasks.delete(message.id);

      const workerError: WorkerError = {
        code: 'TASK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
        stack: error instanceof Error ? error.stack : undefined,
      };

      return {
        id: message.id,
        type: 'error',
        error: workerError,
        timestamp: Date.now(),
      };
    }
  }

  private async handleSyncTask(data: SyncTaskData): Promise<SyncTaskResult> {
    const startTime = Date.now();
    const syncedFiles: string[] = [];
    const skippedFiles: string[] = [];
    const conflicts: any[] = [];

    this.log('info', `Starting sync for mapping: ${data.mappingId}`);

    if (data.direction === 'doc-to-code' || data.direction === 'bidirectional') {
      for (const codePath of data.codePaths) {
        try {
          if (await this.syncFile(data.documentPath, codePath, 'doc-to-code')) {
            syncedFiles.push(codePath);
          } else {
            skippedFiles.push(codePath);
          }
        } catch (error) {
          conflicts.push({
            path: codePath,
            type: 'content',
            reason: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    if (data.direction === 'code-to-doc' || data.direction === 'bidirectional') {
      try {
        if (await this.syncFile(data.codePaths[0], data.documentPath, 'code-to-doc')) {
          syncedFiles.push(data.documentPath);
        } else {
          skippedFiles.push(data.documentPath);
        }
      } catch (error) {
        conflicts.push({
          path: data.documentPath,
          type: 'content',
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const duration = Date.now() - startTime;
    const bytesProcessed = await this.calculateTotalBytes([...syncedFiles, ...skippedFiles]);

    this.log('info', `Sync completed for mapping: ${data.mappingId}`);

    return {
      mappingId: data.mappingId,
      success: conflicts.length === 0,
      syncedFiles,
      skippedFiles,
      conflicts,
      duration,
      bytesProcessed,
    };
  }

  private async handleAnalyzeTask(data: AnalyzeTaskData): Promise<AnalyzeTaskResult> {
    const startTime = Date.now();

    this.log('info', `Analyzing file: ${data.filePath}`);

    const result = await this.analyzeFile(data.filePath, data.analysisType, data.options);

    const duration = Date.now() - startTime;

    this.log('info', `Analysis completed for file: ${data.filePath}`);

    return {
      filePath: data.filePath,
      analysisType: data.analysisType,
      result,
      duration,
    };
  }

  private async handleProcessTask(data: ProcessTaskData): Promise<ProcessTaskResult> {
    const startTime = Date.now();

    this.log('info', `Processing file: ${data.filePath} with operation: ${data.operation}`);

    const result = await this.processFile(data.filePath, data.operation, data.options);

    const duration = Date.now() - startTime;

    this.log('info', `Processing completed for file: ${data.filePath}`);

    return {
      filePath: data.filePath,
      operation: data.operation,
      success: result.success,
      outputPath: result.outputPath,
      duration,
      originalSize: result.originalSize,
      processedSize: result.processedSize,
    };
  }

  private async handleValidateTask(data: ValidateTaskData): Promise<ValidateTaskResult> {
    const startTime = Date.now();

    this.log('info', `Validating file: ${data.filePath} with type: ${data.validationType}`);

    const result = await this.validateFile(data.filePath, data.validationType, data.options);

    const duration = Date.now() - startTime;

    this.log('info', `Validation completed for file: ${data.filePath}`);

    return {
      filePath: data.filePath,
      validationType: data.validationType,
      valid: result.valid,
      errors: result.errors,
      warnings: result.warnings,
      duration,
    };
  }

  private async syncFile(
    sourcePath: string,
    targetPath: string,
    direction: string
  ): Promise<boolean> {
    try {
      const sourceExists = await this.fileExists(sourcePath);
      const targetExists = await this.fileExists(targetPath);

      if (!sourceExists) {
        this.log('warn', `Source file does not exist: ${sourcePath}`);
        return false;
      }

      const sourceContent = await fs.promises.readFile(sourcePath, 'utf-8');
      const sourceChecksum = this.calculateChecksum(sourceContent);

      if (targetExists) {
        const targetContent = await fs.promises.readFile(targetPath, 'utf-8');
        const targetChecksum = this.calculateChecksum(targetContent);

        if (sourceChecksum === targetChecksum) {
          this.log('info', `Files are identical, skipping: ${targetPath}`);
          return false;
        }
      }

      await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.promises.writeFile(targetPath, sourceContent, 'utf-8');

      this.log('info', `Synced ${direction}: ${sourcePath} -> ${targetPath}`);
      return true;
    } catch (error) {
      this.log('error', `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async analyzeFile(
    filePath: string,
    analysisType: string,
    options?: any
  ): Promise<any> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    switch (analysisType) {
      case 'structure':
        return this.analyzeStructure(content, lines, options);
      case 'content':
        return this.analyzeContent(content, lines, options);
      case 'dependencies':
        return this.analyzeDependencies(content, lines, options);
      case 'complexity':
        return this.analyzeComplexity(content, lines, options);
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }
  }

  private analyzeStructure(content: string, lines: string[], options?: any): any {
    return {
      lineCount: lines.length,
      charCount: content.length,
      emptyLines: lines.filter(line => line.trim() === '').length,
      avgLineLength: content.length / lines.length,
      indentStyle: this.detectIndentStyle(content),
      encoding: 'utf-8',
    };
  }

  private analyzeContent(content: string, lines: string[], options?: any): any {
    const commentRegex = /\/\/.*$|\/\*[\s\S]*?\*\//gm;
    const comments = content.match(commentRegex) || [];
    const codeWithoutComments = content.replace(commentRegex, '');

    return {
      totalLines: lines.length,
      codeLines: codeWithoutComments.split('\n').filter(line => line.trim()).length,
      commentLines: comments.length,
      commentRatio: comments.length / lines.length,
      avgLineLength: content.length / lines.length,
      maxLineLength: Math.max(...lines.map(line => line.length)),
    };
  }

  private analyzeDependencies(content: string, lines: string[], options?: any): any {
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

    const imports: string[] = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return {
      dependencies: [...new Set(imports)],
      externalDeps: imports.filter(dep => dep.startsWith('.') === false),
      internalDeps: imports.filter(dep => dep.startsWith('.') === true),
      totalDependencies: imports.length,
    };
  }

  private analyzeComplexity(content: string, lines: string[], options?: any): any {
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
    const nestingDepth = this.calculateMaxNestingDepth(content);

    return {
      cyclomaticComplexity,
      nestingDepth,
      complexityLevel: this.getComplexityLevel(cyclomaticComplexity),
      maintainabilityIndex: this.calculateMaintainabilityIndex(content, lines.length),
    };
  }

  private calculateCyclomaticComplexity(content: string): number {
    const keywords = ['if', 'else if', 'for', 'while', 'case', 'catch', '&&', '||'];
    let complexity = 1;

    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'g');
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  private calculateMaxNestingDepth(content: string): number {
    let maxDepth = 0;
    let currentDepth = 0;

    for (const char of content) {
      if (char === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}') {
        currentDepth--;
      }
    }

    return maxDepth;
  }

  private calculateMaintainabilityIndex(content: string, lineCount: number): number {
    const complexity = this.calculateCyclomaticComplexity(content);
    const volume = content.length;
    
    const mi = 171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(lineCount);
    return Math.max(0, Math.min(100, mi));
  }

  private getComplexityLevel(complexity: number): string {
    if (complexity <= 10) return 'Low';
    if (complexity <= 20) return 'Moderate';
    if (complexity <= 50) return 'High';
    return 'Very High';
  }

  private async processFile(
    filePath: string,
    operation: string,
    options?: any
  ): Promise<any> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const originalSize = Buffer.byteLength(content, 'utf-8');
    let processedContent = content;

    switch (operation) {
      case 'transform':
        processedContent = this.transformContent(content, options);
        break;
      case 'optimize':
        processedContent = this.optimizeContent(content, options);
        break;
      case 'format':
        processedContent = this.formatContent(content, options);
        break;
      case 'minify':
        processedContent = this.minifyContent(content, options);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const processedSize = Buffer.byteLength(processedContent, 'utf-8');
    const outputPath = filePath.replace(/(\.[^.]+)$/, '.processed$1');

    await fs.promises.writeFile(outputPath, processedContent, 'utf-8');

    return {
      success: true,
      outputPath,
      originalSize,
      processedSize,
      compressionRatio: processedSize / originalSize,
    };
  }

  private transformContent(content: string, options?: any): string {
    return content.replace(/\t/g, '  ');
  }

  private optimizeContent(content: string, options?: any): string {
    return content.replace(/\n\s*\n\s*\n/g, '\n\n');
  }

  private formatContent(content: string, options?: any): string {
    return content;
  }

  private minifyContent(content: string, options?: any): string {
    return content
      .replace(/\s*\/\/.*$/gm, '')
      .replace(/\s*\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async validateFile(
    filePath: string,
    validationType: string,
    options?: any
  ): Promise<any> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    switch (validationType) {
      case 'syntax':
        return this.validateSyntax(content, lines, options);
      case 'lint':
        return this.validateLint(content, lines, options);
      case 'type':
        return this.validateType(content, lines, options);
      case 'schema':
        return this.validateSchema(content, lines, options);
      default:
        throw new Error(`Unknown validation type: ${validationType}`);
    }
  }

  private validateSyntax(content: string, lines: string[], options?: any): any {
    const errors: any[] = [];
    const warnings: any[] = [];

    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push({
        line: 1,
        column: 1,
        message: `Unbalanced braces: ${openBraces} open, ${closeBraces} close`,
        severity: 'error',
      });
    }

    if (openParens !== closeParens) {
      errors.push({
        line: 1,
        column: 1,
        message: `Unbalanced parentheses: ${openParens} open, ${closeParens} close`,
        severity: 'error',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateLint(content: string, lines: string[], options?: any): any {
    const errors: any[] = [];
    const warnings: any[] = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      if (line.length > 120) {
        warnings.push({
          line: lineNum,
          column: 120,
          message: 'Line too long (> 120 characters)',
          rule: 'max-line-length',
          suggestion: 'Consider breaking this line into multiple lines',
        });
      }

      if (line.trim().endsWith(' ')) {
        warnings.push({
          line: lineNum,
          column: line.length,
          message: 'Trailing whitespace',
          rule: 'no-trailing-spaces',
          suggestion: 'Remove trailing whitespace',
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateType(content: string, lines: string[], options?: any): any {
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }

  private validateSchema(content: string, lines: string[], options?: any): any {
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }

  private detectIndentStyle(content: string): 'spaces' | 'tabs' | 'mixed' {
    const spaces = (content.match(/^ {2,}/gm) || []).length;
    const tabs = (content.match(/^\t+/gm) || []).length;

    if (spaces > 0 && tabs > 0) return 'mixed';
    if (spaces > 0) return 'spaces';
    if (tabs > 0) return 'tabs';
    return 'spaces';
  }

  private calculateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  private async calculateTotalBytes(filePaths: string[]): Promise<number> {
    let total = 0;
    for (const filePath of filePaths) {
      try {
        const stats = await fs.promises.stat(filePath);
        total += stats.size;
      } catch {
        continue;
      }
    }
    return total;
  }

  private calculateBytesProcessed(result: any): number {
    if (result && typeof result.bytesProcessed === 'number') {
      return result.bytesProcessed;
    }
    return 0;
  }

  private updateStats(success: boolean, duration: number, bytes: number): void {
    this.stats.tasksProcessed++;
    if (success) {
      this.stats.tasksSucceeded++;
    } else {
      this.stats.tasksFailed++;
    }
    this.stats.totalProcessingTime += duration;
    this.stats.averageProcessingTime = this.stats.totalProcessingTime / this.stats.tasksProcessed;
    this.stats.bytesProcessed += bytes;
    this.stats.lastActivity = Date.now();
  }

  private log(level: string, message: string): void {
    const logLevels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = logLevels.indexOf(this.config.logLevel || 'info');
    const messageLevelIndex = logLevels.indexOf(level);

    if (messageLevelIndex >= currentLevelIndex) {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }

  getStats(): WorkerStats {
    return { ...this.stats };
  }

  getActiveTasks(): string[] {
    return Array.from(this.activeTasks.keys());
  }
}
