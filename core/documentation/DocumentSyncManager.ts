/**
 * @file 文档同步管理器
 * @description 实现代码与文档的双向同步机制，确保文档与代码保持一致
 * @author YYC³ Team
 * @version 1.1.0
 * @created 2026-01-25
 * @updated 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DocumentSyncConfig {
  codeBasePath: string;
  docsBasePath: string;
  syncPatterns: {
    code: string[];
    docs: string[];
  };
  ignorePatterns: string[];
  syncInterval: number; // 自动同步间隔（毫秒）
  enableAutoSync: boolean;
  enableConflictResolution: boolean;
  backupEnabled: boolean;
  backupDirectory: string;
  syncStrategy: 'timestamp' | 'content' | 'manual';
}

interface SyncEntry {
  codePath: string;
  docPath: string;
  lastSynced: number;
  syncStatus: 'synced' | 'outdated' | 'error' | 'conflict';
  error?: string;
  conflictDetails?: {
    codeHash: string;
    docHash: string;
    resolution?: 'code' | 'doc' | 'merge';
  };
}

interface SyncResult {
  success: boolean;
  syncedFiles: number;
  outdatedFiles: number;
  errors: number;
  conflicts: number;
  details: SyncEntry[];
}

interface SyncOptions {
  force?: boolean;
  dryRun?: boolean;
  paths?: string[];
}

export class DocumentSyncManager {
  private config: DocumentSyncConfig;
  private syncEntries: Map<string, SyncEntry> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private isSyncing: boolean = false;

  constructor(config: Partial<DocumentSyncConfig> = {}) {
    this.config = {
      codeBasePath: config.codeBasePath || path.resolve(__dirname, '../../'),
      docsBasePath: config.docsBasePath || path.resolve(__dirname, '../../docs'),
      syncPatterns: {
        code: config.syncPatterns?.code || ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        docs: config.syncPatterns?.docs || ['**/*.md', '**/*.mdx']
      },
      ignorePatterns: config.ignorePatterns || ['node_modules', 'dist', 'build', '.git'],
      syncInterval: config.syncInterval || 300000, // 默认5分钟
      enableAutoSync: config.enableAutoSync ?? true,
      enableConflictResolution: config.enableConflictResolution ?? true,
      backupEnabled: config.backupEnabled ?? true,
      backupDirectory: config.backupDirectory || path.resolve(__dirname, '../../docs/.backups'),
      syncStrategy: config.syncStrategy || 'timestamp'
    };

    this.initializeBackupDirectory();
    this.initializeSyncEntries();
    if (this.config.enableAutoSync) {
      this.startAutoSync();
    }
  }

  /**
   * 初始化备份目录
   */
  private initializeBackupDirectory(): void {
    try {
      if (this.config.backupEnabled && !fs.existsSync(this.config.backupDirectory)) {
        fs.mkdirSync(this.config.backupDirectory, { recursive: true });
        logger.info('备份目录已创建', 'DocumentSync', { directory: this.config.backupDirectory });
      }
    } catch (error) {
      logger.error('初始化备份目录失败', 'DocumentSync', { error: error.message });
    }
  }

  /**
   * 初始化同步条目
   */
  private initializeSyncEntries(): void {
    this.syncEntries.clear();
    const codeFiles = this.scanFiles(this.config.codeBasePath, this.config.syncPatterns.code);
    const docFiles = this.scanFiles(this.config.docsBasePath, this.config.syncPatterns.docs);

    // 建立代码与文档的映射关系
    for (const codeFile of codeFiles) {
      const relativeCodePath = path.relative(this.config.codeBasePath, codeFile);
      const docFile = this.findCorrespondingDoc(relativeCodePath, docFiles);
      
      if (docFile) {
        this.syncEntries.set(codeFile, {
          codePath: codeFile,
          docPath: docFile,
          lastSynced: 0,
          syncStatus: 'outdated'
        });
      }
    }

    // 处理只有文档没有代码的情况
    for (const docFile of docFiles) {
      const relativeDocPath = path.relative(this.config.docsBasePath, docFile);
      const codeFile = this.findCorrespondingCode(relativeDocPath, codeFiles);
      
      if (codeFile && !this.syncEntries.has(codeFile)) {
        this.syncEntries.set(codeFile, {
          codePath: codeFile,
          docPath: docFile,
          lastSynced: 0,
          syncStatus: 'outdated'
        });
      }
    }

    this.emit('syncEntriesInitialized', {
      totalEntries: this.syncEntries.size,
      timestamp: Date.now()
    });
  }

  /**
   * 扫描文件
   */
  private scanFiles(basePath: string, patterns: string[]): string[] {
    const files: string[] = [];
    
    const scanDir = (dir: string): void => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // 检查是否应该忽略
          if (this.config.ignorePatterns.some(pattern => 
            fullPath.includes(pattern)
          )) {
            continue;
          }
          
          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else {
            // 检查是否匹配模式
            const relativePath = path.relative(basePath, fullPath);
            if (patterns.some(pattern => this.matchesPattern(relativePath, pattern))) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        logger.error('扫描目录失败', 'DocumentSync', { dir, error: error.message });
      }
    };
    
    scanDir(basePath);
    return files;
  }

  /**
   * 检查路径是否匹配模式
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    const regex = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\{([^}]+)\}/g, '(.*)');
    return new RegExp(`^${regex}$`).test(filePath);
  }

  /**
   * 查找对应的文档文件
   */
  private findCorrespondingDoc(relativeCodePath: string, docFiles: string[]): string | undefined {
    // 转换代码路径为文档路径格式
    const docPathVariants = [
      // 直接对应
      relativeCodePath.replace(/\.(ts|tsx|js|jsx)$/, '.md'),
      // 在代码文档目录中
      path.join('YYC3-PortAISys-代码文档', relativeCodePath.replace(/\.(ts|tsx|js|jsx)$/, '.md')),
      // 去掉目录层级
      path.basename(relativeCodePath).replace(/\.(ts|tsx|js|jsx)$/, '.md'),
      // 在智能拓展目录中
      path.join('YYC3-PortAISys-智能拓展', path.basename(relativeCodePath).replace(/\.(ts|tsx|js|jsx)$/, '.md'))
    ];

    for (const variant of docPathVariants) {
      const matchingDoc = docFiles.find(docFile => 
        docFile.includes(variant)
      );
      if (matchingDoc) {
        return matchingDoc;
      }
    }

    return undefined;
  }

  /**
   * 查找对应的代码文件
   */
  private findCorrespondingCode(relativeDocPath: string, codeFiles: string[]): string | undefined {
    // 转换文档路径为代码路径格式
    const codePathVariants = [
      // 直接对应
      relativeDocPath.replace(/\.(md|mdx)$/, '.ts'),
      relativeDocPath.replace(/\.(md|mdx)$/, '.tsx'),
      relativeDocPath.replace(/\.(md|mdx)$/, '.js'),
      relativeDocPath.replace(/\.(md|mdx)$/, '.jsx'),
      // 去掉文档目录前缀
      relativeDocPath.replace(/^YYC3-PortAISys-代码文档\//, '').replace(/\.(md|mdx)$/, '.ts'),
      relativeDocPath.replace(/^YYC3-PortAISys-智能拓展\//, '').replace(/\.(md|mdx)$/, '.ts')
    ];

    for (const variant of codePathVariants) {
      const matchingCode = codeFiles.find(codeFile => 
        codeFile.includes(variant)
      );
      if (matchingCode) {
        return matchingCode;
      }
    }

    return undefined;
  }

  /**
   * 执行同步
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.isSyncing) {
      logger.warning('同步任务正在进行中', 'DocumentSync');
      throw new Error('同步任务正在进行中');
    }

    this.isSyncing = true;
    const result: SyncResult = {
      success: true,
      syncedFiles: 0,
      outdatedFiles: 0,
      errors: 0,
      conflicts: 0,
      details: []
    };

    try {
      // 过滤要同步的文件
      let entriesToSync = Array.from(this.syncEntries.entries());
      if (options.paths && options.paths.length > 0) {
        entriesToSync = entriesToSync.filter(([codePath]) => 
          options.paths?.some(path => codePath.includes(path))
        );
      }

      this.emit('syncStarted', {
        timestamp: Date.now(),
        totalFiles: entriesToSync.length,
        options
      });

      for (const [codePath, entry] of entriesToSync) {
        try {
          const syncStatus = await this.syncFile(entry, options);
          entry.syncStatus = syncStatus;
          entry.lastSynced = Date.now();
          
          if (syncStatus === 'synced') {
            result.syncedFiles++;
          } else if (syncStatus === 'outdated') {
            result.outdatedFiles++;
          } else if (syncStatus === 'error') {
            result.errors++;
            result.success = false;
          } else if (syncStatus === 'conflict') {
            result.conflicts++;
            result.success = false;
          }
        } catch (error) {
          entry.syncStatus = 'error';
          entry.error = error instanceof Error ? error.message : String(error);
          result.errors++;
          result.success = false;
          logger.error('同步文件失败', 'DocumentSync', {
            codePath: entry.codePath,
            docPath: entry.docPath,
            error: entry.error
          });
        }
        
        result.details.push({ ...entry });
      }

      this.emit('syncCompleted', {
        ...result,
        timestamp: Date.now()
      });

      logger.info('文档同步任务完成', 'DocumentSync', {
        synced: result.syncedFiles,
        outdated: result.outdatedFiles,
        errors: result.errors,
        conflicts: result.conflicts
      });

    } catch (error) {
      logger.error('同步过程中发生错误', 'DocumentSync', { error: error.message });
      result.success = false;
      result.errors++;
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * 同步单个文件
   */
  private async syncFile(entry: SyncEntry, options: SyncOptions = {}): Promise<'synced' | 'outdated' | 'error' | 'conflict'> {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(entry.codePath)) {
        throw new Error(`代码文件不存在: ${entry.codePath}`);
      }
      if (!fs.existsSync(entry.docPath)) {
        throw new Error(`文档文件不存在: ${entry.docPath}`);
      }

      const codeStats = fs.statSync(entry.codePath);
      const docStats = fs.statSync(entry.docPath);

      // 生成文件哈希
      const codeContent = fs.readFileSync(entry.codePath, 'utf8');
      const docContent = fs.readFileSync(entry.docPath, 'utf8');
      const codeHash = this.generateHash(codeContent);
      const docHash = this.generateHash(docContent);

      // 检查是否有冲突
      if (this.config.enableConflictResolution) {
        const conflict = this.detectConflict(entry, codeHash, docHash);
        if (conflict) {
          entry.syncStatus = 'conflict';
          entry.conflictDetails = {
            codeHash,
            docHash
          };
          this.emit('conflictDetected', {
            entry,
            timestamp: Date.now()
          });
          return 'conflict';
        }
      }

      // 根据同步策略决定同步方向
      let syncDirection: 'code-to-doc' | 'doc-to-code' | 'none';
      
      switch (this.config.syncStrategy) {
        case 'timestamp':
          if (codeStats.mtimeMs > docStats.mtimeMs) {
            syncDirection = 'code-to-doc';
          } else if (docStats.mtimeMs > codeStats.mtimeMs) {
            syncDirection = 'doc-to-code';
          } else {
            syncDirection = 'none';
          }
          break;
        case 'content':
          if (codeHash !== docHash) {
            // 基于内容复杂度决定
            const codeComplexity = this.calculateComplexity(codeContent);
            const docComplexity = this.calculateComplexity(docContent);
            syncDirection = codeComplexity > docComplexity ? 'code-to-doc' : 'doc-to-code';
          } else {
            syncDirection = 'none';
          }
          break;
        case 'manual':
          // 手动模式，需要外部干预
          return 'outdated';
        default:
          syncDirection = 'none';
      }

      // 执行同步
      if (syncDirection === 'code-to-doc') {
        if (!options.dryRun) {
          await this.updateDocFromCode(entry.codePath, entry.docPath, options);
        }
        return 'synced';
      } else if (syncDirection === 'doc-to-code') {
        if (!options.dryRun) {
          await this.updateCodeFromDoc(entry.codePath, entry.docPath, options);
        }
        return 'synced';
      }

      return 'outdated';
    } catch (error) {
      entry.error = error instanceof Error ? error.message : String(error);
      return 'error';
    }
  }

  /**
   * 从代码更新文档
   */
  private async updateDocFromCode(codePath: string, docPath: string, options: SyncOptions = {}): Promise<void> {
    try {
      // 创建备份
      if (this.config.backupEnabled) {
        await this.createBackup(docPath);
      }

      const codeContent = fs.readFileSync(codePath, 'utf8');
      const docContent = fs.readFileSync(docPath, 'utf8');

      // 提取代码中的文档注释
      const codeComments = this.extractCodeComments(codeContent);
      
      // 提取代码结构信息
      const codeStructure = this.extractCodeStructure(codeContent);
      
      // 更新文档内容
      const updatedDocContent = this.mergeCommentsIntoDoc(codeComments, codeStructure, docContent);

      if (updatedDocContent !== docContent || options.force) {
        fs.writeFileSync(docPath, updatedDocContent);
        this.emit('docUpdated', {
          docPath,
          codePath,
          timestamp: Date.now()
        });
        logger.debug('文档已更新', 'DocumentSync', { docPath, codePath });
      }
    } catch (error) {
      logger.error('从代码更新文档失败', 'DocumentSync', {
        codePath,
        docPath,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * 从文档更新代码
   */
  private async updateCodeFromDoc(codePath: string, docPath: string, options: SyncOptions = {}): Promise<void> {
    try {
      // 创建备份
      if (this.config.backupEnabled) {
        await this.createBackup(codePath);
      }

      const codeContent = fs.readFileSync(codePath, 'utf8');
      const docContent = fs.readFileSync(docPath, 'utf8');

      // 提取文档中的代码注释
      const docComments = this.extractDocComments(docContent);
      
      // 提取文档中的代码示例
      const docCodeExamples = this.extractDocCodeExamples(docContent);
      
      // 更新代码内容
      const updatedCodeContent = this.mergeDocIntoCode(docComments, docCodeExamples, codeContent);

      if (updatedCodeContent !== codeContent || options.force) {
        fs.writeFileSync(codePath, updatedCodeContent);
        this.emit('codeUpdated', {
          codePath,
          docPath,
          timestamp: Date.now()
        });
        logger.debug('代码已更新', 'DocumentSync', { codePath, docPath });
      }
    } catch (error) {
      logger.error('从文档更新代码失败', 'DocumentSync', {
        codePath,
        docPath,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * 提取代码中的注释
   */
  private extractCodeComments(codeContent: string): Record<string, string> {
    const comments: Record<string, string> = {};
    
    // 提取JSDoc注释
    const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
    let match;
    
    while ((match = jsdocRegex.exec(codeContent)) !== null) {
      const comment = match[0];
      // 提取@description或其他标签内容
      const descriptionMatch = comment.match(/@description\s+(.*?)(?=@|\*\/)/s);
      if (descriptionMatch) {
        comments.description = descriptionMatch[1].trim();
      }
      
      const authorMatch = comment.match(/@author\s+(.*?)(?=@|\*\/)/s);
      if (authorMatch) {
        comments.author = authorMatch[1].trim();
      }
      
      const versionMatch = comment.match(/@version\s+(.*?)(?=@|\*\/)/s);
      if (versionMatch) {
        comments.version = versionMatch[1].trim();
      }

      const fileMatch = comment.match(/@file\s+(.*?)(?=@|\*\/)/s);
      if (fileMatch) {
        comments.file = fileMatch[1].trim();
      }

      const moduleMatch = comment.match(/@module\s+(.*?)(?=@|\*\/)/s);
      if (moduleMatch) {
        comments.module = moduleMatch[1].trim();
      }
    }
    
    return comments;
  }

  /**
   * 提取代码结构
   */
  private extractCodeStructure(codeContent: string): Record<string, any> {
    const structure: Record<string, any> = {
      functions: [],
      classes: [],
      interfaces: [],
      enums: []
    };

    // 提取函数
    const functionRegex = /function\s+([a-zA-Z_$][\w$]*)\s*\(|const\s+([a-zA-Z_$][\w$]*)\s*=\s*\(.*?\)\s*=>|const\s+([a-zA-Z_$][\w$]*)\s*=\s*function/g;
    let match;
    while ((match = functionRegex.exec(codeContent)) !== null) {
      const functionName = match[1] || match[2] || match[3];
      if (functionName) {
        structure.functions.push(functionName);
      }
    }

    // 提取类
    const classRegex = /class\s+([a-zA-Z_$][\w$]*)/g;
    while ((match = classRegex.exec(codeContent)) !== null) {
      structure.classes.push(match[1]);
    }

    // 提取接口
    const interfaceRegex = /interface\s+([a-zA-Z_$][\w$]*)/g;
    while ((match = interfaceRegex.exec(codeContent)) !== null) {
      structure.interfaces.push(match[1]);
    }

    // 提取枚举
    const enumRegex = /enum\s+([a-zA-Z_$][\w$]*)/g;
    while ((match = enumRegex.exec(codeContent)) !== null) {
      structure.enums.push(match[1]);
    }

    return structure;
  }

  /**
   * 提取文档中的注释
   */
  private extractDocComments(docContent: string): Record<string, string> {
    const comments: Record<string, string> = {};
    
    // Handle undefined or null docContent
    if (!docContent) {
      return comments;
    }
    
    // 提取Markdown中的元数据
    const metaRegex = /---[\s\S]*?---/;
    const metaMatch = docContent.match(metaRegex);
    
    if (metaMatch) {
      const metaContent = metaMatch[0];
      const lines = metaContent.split('\n');
      
      for (const line of lines) {
        const keyValueMatch = line.match(/^(\w+):\s*(.+)$/);
        if (keyValueMatch) {
          comments[keyValueMatch[1]] = keyValueMatch[2].trim();
        }
      }
    }

    // 提取文档标题
    const titleRegex = /^#\s+(.*)$/m;
    const titleMatch = docContent.match(titleRegex);
    if (titleMatch) {
      comments.title = titleMatch[1].trim();
    }
    
    return comments;
  }

  /**
   * 提取文档中的代码示例
   */
  private extractDocCodeExamples(docContent: string): Record<string, string> {
    const codeExamples: Record<string, string> = {};
    
    // 提取代码块
    const codeBlockRegex = /```(\w+)?[\s\S]*?```/g;
    let match;
    let index = 0;
    
    while ((match = codeBlockRegex.exec(docContent)) !== null) {
      const language = match[1] || 'code';
      const code = match[0].replace(/```(\w+)?/, '').replace(/```$/, '').trim();
      codeExamples[`example_${index++}`] = code;
    }
    
    return codeExamples;
  }

  /**
   * 将代码注释合并到文档中
   */
  private mergeCommentsIntoDoc(codeComments: Record<string, string>, codeStructure: Record<string, any>, docContent: string): string {
    // Handle undefined or null docContent
    if (!docContent) {
      docContent = '';
    }
    
    // 如果文档没有元数据部分，添加一个
    if (!docContent.startsWith('---')) {
      docContent = `---\n---\n${docContent}`;
    }
    
    // 替换或添加元数据
    let updatedContent = docContent;
    
    for (const [key, value] of Object.entries(codeComments)) {
      const regex = new RegExp(`^${key}:\s*(.*)$`, 'gm');
      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(regex, `${key}: ${value}`);
      } else {
        // 在元数据部分添加新字段
        updatedContent = updatedContent.replace(/---\n/, `---\n${key}: ${value}\n`);
      }
    }

    // 添加代码结构信息
    if (Object.keys(codeStructure).some(key => codeStructure[key].length > 0)) {
      // 检查是否已有代码结构部分
      if (!updatedContent.includes('## 代码结构')) {
        updatedContent += `\n\n## 代码结构\n`;
      }

      // 更新代码结构部分
      let structureContent = '\n## 代码结构\n';
      
      if (codeStructure.functions.length > 0) {
        structureContent += `\n### 函数\n- ${codeStructure.functions.join('\n- ')}\n`;
      }
      
      if (codeStructure.classes.length > 0) {
        structureContent += `\n### 类\n- ${codeStructure.classes.join('\n- ')}\n`;
      }
      
      if (codeStructure.interfaces.length > 0) {
        structureContent += `\n### 接口\n- ${codeStructure.interfaces.join('\n- ')}\n`;
      }
      
      if (codeStructure.enums.length > 0) {
        structureContent += `\n### 枚举\n- ${codeStructure.enums.join('\n- ')}\n`;
      }

      // 替换现有代码结构部分
      const structureRegex = /## 代码结构[\s\S]*?(?=## |$)/;
      if (structureRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(structureRegex, structureContent.trim());
      } else {
        updatedContent += structureContent;
      }
    }
    
    return updatedContent;
  }

  /**
   * 将文档内容合并到代码中
   */
  private mergeDocIntoCode(docComments: Record<string, string>, docCodeExamples: Record<string, string>, codeContent: string): string {
    // 查找或创建文件头部注释
    const headerRegex = /\/\*\*[\s\S]*?\*\//;
    let updatedContent = codeContent;
    
    if (headerRegex.test(updatedContent)) {
      // 更新现有注释
      const existingComment = updatedContent.match(headerRegex)![0];
      let newComment = existingComment;
      
      for (const [key, value] of Object.entries(docComments)) {
        const regex = new RegExp(`@${key}\s+(.*?)(?=@|\*\/)`, 's');
        if (regex.test(newComment)) {
          newComment = newComment.replace(regex, `@${key} ${value}`);
        } else {
          // 在注释末尾添加新标签
          newComment = newComment.replace(/\*\//, ` * @${key} ${value}\n */`);
        }
      }
      
      updatedContent = updatedContent.replace(headerRegex, newComment);
    } else {
      // 创建新的文件头部注释
      const newComment = `/**
 * @file ${path.basename(updatedContent)}
${Object.entries(docComments)
  .map(([key, value]) => ` * @${key} ${value}`)
  .join('\n')}
 */\n\n`;
      
      updatedContent = newComment + updatedContent;
    }
    
    return updatedContent;
  }

  /**
   * 检测冲突
   */
  private detectConflict(entry: SyncEntry, codeHash: string, docHash: string): boolean {
    // 简单的冲突检测：如果上次同步后两个文件都被修改
    if (entry.lastSynced > 0) {
      const codeStats = fs.statSync(entry.codePath);
      const docStats = fs.statSync(entry.docPath);
      
      if (codeStats.mtimeMs > entry.lastSynced && docStats.mtimeMs > entry.lastSynced) {
        entry.conflictDetails = {
          codeHash,
          docHash
        };
        return true;
      }
    }
    return false;
  }

  /**
   * 解决冲突
   */
  public resolveConflict(entry: SyncEntry, resolution: 'code' | 'doc' | 'merge'): boolean {
    try {
      if (!entry.conflictDetails) {
        return false;
      }

      entry.conflictDetails.resolution = resolution;

      switch (resolution) {
        case 'code':
          // 以代码为准
          this.updateDocFromCode(entry.codePath, entry.docPath);
          break;
        case 'doc':
          // 以文档为准
          this.updateCodeFromDoc(entry.codePath, entry.docPath);
          break;
        case 'merge':
          // 手动合并
          // 这里可以实现更复杂的合并逻辑
          break;
      }

      entry.syncStatus = 'synced';
      entry.lastSynced = Date.now();
      return true;
    } catch (error) {
      logger.error('解决冲突失败', 'DocumentSync', {
        entry,
        resolution,
        error: error.message
      });
      return false;
    }
  }

  /**
   * 创建备份
   */
  private async createBackup(filePath: string): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      const backupPath = path.join(
        this.config.backupDirectory,
        path.relative(this.config.codeBasePath, filePath)
          .replace(/\//g, '_') + 
        `.bak_${Date.now()}`
      );

      // 确保备份目录存在
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // 复制文件
      fs.copyFileSync(filePath, backupPath);
      logger.debug('创建备份', 'DocumentSync', { filePath, backupPath });
    } catch (error) {
      logger.error('创建备份失败', 'DocumentSync', {
        filePath,
        error: error.message
      });
    }
  }

  /**
   * 生成哈希值
   */
  private generateHash(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * 计算内容复杂度
   */
  private calculateComplexity(content: string): number {
    // 简单的复杂度计算：字符数 + 行数 + 单词数
    const charCount = content.length;
    const lineCount = content.split('\n').length;
    const wordCount = content.split(/\s+/).length;
    return charCount + lineCount * 10 + wordCount * 5;
  }

  /**
   * 启动自动同步
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      try {
        await this.sync();
      } catch (error) {
        logger.error('自动同步失败', 'DocumentSync', { error: error.message });
      }
    }, this.config.syncInterval);
    
    this.emit('autoSyncStarted', {
      interval: this.config.syncInterval,
      timestamp: Date.now()
    });
    logger.info('自动同步已启动', 'DocumentSync', { interval: this.config.syncInterval });
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      
      this.emit('autoSyncStopped', {
        timestamp: Date.now()
      });
      logger.info('自动同步已停止', 'DocumentSync');
    }
  }

  /**
   * 获取同步状态
   */
  getSyncStatus(): {
    totalFiles: number;
    syncedFiles: number;
    outdatedFiles: number;
    errorFiles: number;
    conflictFiles: number;
    details: SyncEntry[];
  } {
    const details = Array.from(this.syncEntries.values());
    const totalFiles = details.length;
    const syncedFiles = details.filter(entry => entry.syncStatus === 'synced').length;
    const outdatedFiles = details.filter(entry => entry.syncStatus === 'outdated').length;
    const errorFiles = details.filter(entry => entry.syncStatus === 'error').length;
    const conflictFiles = details.filter(entry => entry.syncStatus === 'conflict').length;

    return {
      totalFiles,
      syncedFiles,
      outdatedFiles,
      errorFiles,
      conflictFiles,
      details
    };
  }

  /**
   * 重新扫描文件
   */
  rescanFiles(): void {
    this.initializeSyncEntries();
    logger.info('文件扫描完成', 'DocumentSync', { totalFiles: this.syncEntries.size });
  }

  /**
   * 订阅事件
   */
  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(listener);
  }

  /**
   * 取消订阅
   */
  off(event: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          logger.error(`事件监听器错误: ${event}`, 'DocumentSync', { error: error.message });
        }
      });
    }
  }

  /**
   * 关闭管理器
   */
  shutdown(): void {
    this.stopAutoSync();
    this.eventListeners.clear();
    this.syncEntries.clear();
    logger.info('文档同步管理器已关闭', 'DocumentSync');
  }
}

// 导出默认实例
export const documentSyncManager = new DocumentSyncManager({
  enableAutoSync: true,
  enableConflictResolution: true,
  backupEnabled: true,
  syncStrategy: 'timestamp'
});
