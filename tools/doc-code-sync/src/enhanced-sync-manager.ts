/**
 * @file 增强型文档与代码同步管理器
 * @description 实现智能文档与代码同步机制，包含冲突解决、版本控制、质量检查等功能
 * @author YYC³ Team
 * @version 2.0.0
 * @created 2026-01-25
 * @updated 2026-01-25
 * @copyright Copyright (c) 2026 YYC³
 * @license MIT
 */

import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'eventemitter3';
import * as chokidar from 'chokidar';
import {
  Mapping,
  MappingConfig,
  SyncResult,
  SyncDetail,
  FileChangeEvent,
  SyncStatus,
  Notification
} from './types';

export interface ConflictResolutionStrategy {
  type: 'manual' | 'auto' | 'latest' | 'code-priority' | 'doc-priority';
  confidence: number;
  reason: string;
}

export interface DocumentQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  readability: number;
  overallScore: number;
}

export interface CodeDocumentationConsistency {
  isConsistent: boolean;
  missingDocs: string[];
  outdatedDocs: string[];
  inconsistencies: string[];
}

export interface SyncOptimizationMetrics {
  syncTime: number;
  conflictCount: number;
  autoResolvedCount: number;
  manualResolutionCount: number;
  qualityScore: number;
}

export class EnhancedDocCodeSyncManager extends EventEmitter {
  private configPath: string;
  private mappings: Map<string, Mapping> = new Map();
  private docWatcher: chokidar.FSWatcher | null = null;
  private codeWatcher: chokidar.FSWatcher | null = null;
  private syncQueue: FileChangeEvent[] = [];
  private isProcessing: boolean = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private debounceDelay: number = 1000;
  private conflictHistory: Map<string, ConflictResolutionStrategy[]> = new Map();
  private qualityMetrics: Map<string, DocumentQualityMetrics> = new Map();
  private consistencyCache: Map<string, CodeDocumentationConsistency> = new Map();
  private syncOptimizationMetrics: SyncOptimizationMetrics[] = [];

  constructor(configPath: string = '.doc-code-mapping.json') {
    super();
    this.configPath = configPath;
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf-8');
      const config: MappingConfig = JSON.parse(configData);

      this.mappings.clear();
      for (const mapping of config.mappings) {
        this.mappings.set(mapping.id, mapping);
      }

      this.emit('config-loaded', config);
    } catch (error) {
      this.emit('error', `Failed to load config: ${error}`);
    }
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
    const configDir = path.dirname(this.configPath);
    const configFileName = path.basename(this.configPath);

    const configWatcher = chokidar.watch(configFileName, {
      cwd: configDir,
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    });

    configWatcher
      .on('change', () => {
        this.emit('config-change', 'Configuration file updated');
        this.loadConfig();
      })
      .on('error', (error) => this.emit('error', error));
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
    const startTime = Date.now();

    for (const event of events) {
      try {
        const result = await this.syncFile(event);
        results.push(result);
        this.emit('sync-completed', result);
      } catch (error) {
        const errorResult: SyncResult = {
          success: false,
          message: `Sync failed: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date().toISOString()
        };
        results.push(errorResult);
        this.emit('sync-failed', errorResult);
      }
    }

    const syncTime = Date.now() - startTime;
    this.recordOptimizationMetrics(results, syncTime);

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
        message: 'No related mapping found, skipping sync',
        timestamp: new Date().toISOString()
      };
    }

    const details: SyncDetail[] = [];
    let hasConflict = false;

    for (const mapping of mappings) {
      if (!mapping.syncEnabled) {
        details.push({
          file: mapping.document,
          status: 'skipped',
          message: 'Sync disabled for this mapping'
        });
        continue;
      }

      const conflict = await this.detectConflict(event, mapping);
      if (conflict) {
        hasConflict = true;
        const resolution = await this.resolveConflict(conflict, mapping);
        this.recordConflictResolution(mapping.id, resolution);

        if (resolution.type === 'manual') {
          details.push({
            file: mapping.document,
            status: 'failed',
            message: `Conflict detected: ${conflict.reason}. Manual resolution required.`
          });
        } else {
          const syncResult = await this.performSync(event, mapping, resolution);
          details.push(syncResult);
        }
      } else {
        const syncResult = await this.performSync(event, mapping, {
          type: 'auto',
          confidence: 1.0,
          reason: 'No conflict detected'
        });
        details.push(syncResult);
      }
    }

    return {
      success: !hasConflict,
      message: hasConflict ? 'Conflict detected, requires manual resolution' : 'Sync completed successfully',
      timestamp: new Date().toISOString(),
      details
    };
  }

  private async detectConflict(event: FileChangeEvent, mapping: Mapping): Promise<{
    hasConflict: boolean;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  } | null> {
    try {
      const docContent = fs.readFileSync(mapping.document, 'utf-8');
      const codeContents = mapping.codeFiles.map(file => ({
        file,
        content: fs.readFileSync(file, 'utf-8')
      }));

      const conflicts: string[] = [];

      for (const codeFile of codeContents) {
        if (this.hasAPIChanges(docContent, codeFile.content)) {
          conflicts.push(`API changes detected in ${codeFile.file}`);
        }

        if (this.hasParameterChanges(docContent, codeFile.content)) {
          conflicts.push(`Parameter changes detected in ${codeFile.file}`);
        }

        if (this.hasTypeChanges(docContent, codeFile.content)) {
          conflicts.push(`Type changes detected in ${codeFile.file}`);
        }
      }

      if (conflicts.length > 0) {
        const severity = conflicts.length > 2 ? 'high' : conflicts.length > 1 ? 'medium' : 'low';
        return {
          hasConflict: true,
          reason: conflicts.join('; '),
          severity
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private hasAPIChanges(docContent: string, codeContent: string): boolean {
    const apiPatterns = [
      /export\s+(async\s+)?function\s+\w+/g,
      /export\s+(const|let|var)\s+\w+\s*=/g,
      /interface\s+\w+/g,
      /type\s+\w+\s*=/g
    ];

    const docAPIs = this.extractAPIsFromDoc(docContent);
    const codeAPIs = this.extractAPIsFromCode(codeContent);

    return !this.areAPIsConsistent(docAPIs, codeAPIs);
  }

  private hasParameterChanges(docContent: string, codeContent: string): boolean {
    const paramPattern = /(\w+):\s*(\w+|\{[^}]+\})/g;
    const docParams = (docContent.match(paramPattern) || []).map(p => p.trim());
    const codeParams = (codeContent.match(paramPattern) || []).map(p => p.trim());

    const docParamSet = new Set(docParams);
    const codeParamSet = new Set(codeParams);

    const missingInDoc = [...codeParamSet].filter(p => !docParamSet.has(p));
    const missingInCode = [...docParamSet].filter(p => !codeParamSet.has(p));

    return missingInDoc.length > 0 || missingInCode.length > 0;
  }

  private hasTypeChanges(docContent: string, codeContent: string): boolean {
    const typePattern = /type\s+(\w+)\s*=/g;
    const interfacePattern = /interface\s+(\w+)/g;

    const docTypes = [
      ...(docContent.match(typePattern) || []).map(t => t.replace(/type\s+/, '')),
      ...(docContent.match(interfacePattern) || []).map(i => i.replace(/interface\s+/, ''))
    ];

    const codeTypes = [
      ...(codeContent.match(typePattern) || []).map(t => t.replace(/type\s+/, '')),
      ...(codeContent.match(interfacePattern) || []).map(i => i.replace(/interface\s+/, ''))
    ];

    const docTypeSet = new Set(docTypes);
    const codeTypeSet = new Set(codeTypes);

    const missingInDoc = [...codeTypeSet].filter(t => !docTypeSet.has(t));
    const missingInCode = [...docTypeSet].filter(t => !codeTypeSet.has(t));

    return missingInDoc.length > 0 || missingInCode.length > 0;
  }

  private extractAPIsFromDoc(docContent: string): string[] {
    const apiPattern = /```typescript[\s\S]*?```/g;
    const matches = docContent.match(apiPattern) || [];
    const apis: string[] = [];

    for (const match of matches) {
      const functionPattern = /export\s+(async\s+)?function\s+(\w+)/g;
      const constPattern = /export\s+(const|let|var)\s+(\w+)/g;
      const interfacePattern = /interface\s+(\w+)/g;

      const functions = (match.match(functionPattern) || []).map(f => f.replace(/export\s+(async\s+)?function\s+/, ''));
      const consts = (match.match(constPattern) || []).map(c => c.replace(/export\s+(const|let|var)\s+/, ''));
      const interfaces = (match.match(interfacePattern) || []).map(i => i.replace(/interface\s+/, ''));

      apis.push(...functions, ...consts, ...interfaces);
    }

    return [...new Set(apis)];
  }

  private extractAPIsFromCode(codeContent: string): string[] {
    const functionPattern = /export\s+(async\s+)?function\s+(\w+)/g;
    const constPattern = /export\s+(const|let|var)\s+(\w+)/g;
    const interfacePattern = /interface\s+(\w+)/g;

    const functions = (codeContent.match(functionPattern) || []).map(f => f.replace(/export\s+(async\s+)?function\s+/, ''));
    const consts = (codeContent.match(constPattern) || []).map(c => c.replace(/export\s+(const|let|var)\s+/, ''));
    const interfaces = (codeContent.match(interfacePattern) || []).map(i => i.replace(/interface\s+/, ''));

    return [...new Set([...functions, ...consts, ...interfaces])];
  }

  private areAPIsConsistent(docAPIs: string[], codeAPIs: string[]): boolean {
    const docSet = new Set(docAPIs);
    const codeSet = new Set(codeAPIs);

    const missingInDoc = [...codeSet].filter(api => !docSet.has(api));
    const missingInCode = [...docSet].filter(api => !codeSet.has(api));

    return missingInDoc.length === 0 && missingInCode.length === 0;
  }

  private async resolveConflict(
    conflict: { hasConflict: boolean; reason: string; severity: string },
    mapping: Mapping
  ): Promise<ConflictResolutionStrategy> {
    const history = this.conflictHistory.get(mapping.id) || [];
    const recentResolutions = history.slice(-5);

    const autoResolution = this.findAutoResolution(conflict, recentResolutions);
    if (autoResolution) {
      return autoResolution;
    }

    return {
      type: 'manual',
      confidence: 0.5,
      reason: 'Requires manual intervention'
    };
  }

  private findAutoResolution(
    conflict: { hasConflict: boolean; reason: string; severity: string },
    history: ConflictResolutionStrategy[]
  ): ConflictResolutionStrategy | null {
    if (conflict.severity === 'low') {
      return {
        type: 'auto',
        confidence: 0.8,
        reason: 'Low severity conflict, auto-resolving'
      };
    }

    const codePriorityCount = history.filter(r => r.type === 'code-priority').length;
    const docPriorityCount = history.filter(r => r.type === 'doc-priority').length;

    if (codePriorityCount > docPriorityCount * 2) {
      return {
        type: 'code-priority',
        confidence: 0.7,
        reason: 'Historical preference for code changes'
      };
    }

    if (docPriorityCount > codePriorityCount * 2) {
      return {
        type: 'doc-priority',
        confidence: 0.7,
        reason: 'Historical preference for documentation changes'
      };
    }

    return null;
  }

  private recordConflictResolution(mappingId: string, resolution: ConflictResolutionStrategy): void {
    if (!this.conflictHistory.has(mappingId)) {
      this.conflictHistory.set(mappingId, []);
    }
    const history = this.conflictHistory.get(mappingId)!;
    history.push(resolution);

    if (history.length > 20) {
      history.shift();
    }
  }

  private async performSync(
    event: FileChangeEvent,
    mapping: Mapping,
    resolution: ConflictResolutionStrategy
  ): Promise<SyncDetail> {
    try {
      if (resolution.type === 'code-priority') {
        await this.syncCodeToDoc(mapping);
        return {
          file: mapping.document,
          status: 'success',
          message: 'Code changes synchronized to documentation'
        };
      } else if (resolution.type === 'doc-priority') {
        await this.syncDocToCode(mapping);
        return {
          file: mapping.document,
          status: 'success',
          message: 'Documentation changes synchronized to code'
        };
      } else {
        return {
          file: mapping.document,
          status: 'success',
          message: 'Synchronized successfully'
        };
      }
    } catch (error) {
      return {
        file: mapping.document,
        status: 'failed',
        message: `Sync failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async syncCodeToDoc(mapping: Mapping): Promise<void> {
    const codeContents = mapping.codeFiles.map(file => ({
      file,
      content: fs.readFileSync(file, 'utf-8')
    }));

    const docContent = this.generateDocFromCode(codeContents);
    fs.writeFileSync(mapping.document, docContent, 'utf-8');

    mapping.lastSync = new Date().toISOString();
    mapping.syncStatus = 'success';
  }

  private async syncDocToCode(mapping: Mapping): Promise<void> {
    const docContent = fs.readFileSync(mapping.document, 'utf-8');
    const codeUpdates = this.extractCodeUpdatesFromDoc(docContent);

    for (const update of codeUpdates) {
      const codeFile = mapping.codeFiles.find(f => f.includes(update.fileName));
      if (codeFile) {
        fs.writeFileSync(codeFile, update.content, 'utf-8');
      }
    }

    mapping.lastSync = new Date().toISOString();
    mapping.syncStatus = 'success';
  }

  private generateDocFromCode(codeContents: { file: string; content: string }[]): string {
    let docContent = '';

    for (const code of codeContents) {
      docContent += `## ${path.basename(code.file)}\n\n`;
      docContent += '```typescript\n';
      docContent += code.content;
      docContent += '\n```\n\n';
    }

    return docContent;
  }

  private extractCodeUpdatesFromDoc(docContent: string): { fileName: string; content: string }[] {
    const updates: { fileName: string; content: string }[] = [];
    const codeBlockPattern = /##\s+(\w+)[\s\S]*?```typescript([\s\S]*?)```/g;

    let match;
    while ((match = codeBlockPattern.exec(docContent)) !== null) {
      updates.push({
        fileName: match[1],
        content: match[2].trim()
      });
    }

    return updates;
  }

  private findRelatedMappings(filePath: string): Mapping[] {
    const related: Mapping[] = [];

    for (const mapping of this.mappings.values()) {
      if (filePath === mapping.document || mapping.codeFiles.includes(filePath)) {
        related.push(mapping);
      }
    }

    return related;
  }

  private recordOptimizationMetrics(results: SyncResult[], syncTime: number): number {
    const conflictCount = results.filter(r => !r.success).length;
    const autoResolvedCount = results.filter(r => r.success).length;

    const metrics: SyncOptimizationMetrics = {
      syncTime,
      conflictCount,
      autoResolvedCount,
      manualResolutionCount: conflictCount,
      qualityScore: this.calculateQualityScore(results)
    };

    this.syncOptimizationMetrics.push(metrics);

    if (this.syncOptimizationMetrics.length > 100) {
      this.syncOptimizationMetrics.shift();
    }

    return metrics.qualityScore;
  }

  private calculateQualityScore(results: SyncResult[]): number {
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    if (totalCount === 0) return 1.0;

    return successCount / totalCount;
  }

  async checkDocumentQuality(docPath: string): Promise<DocumentQualityMetrics> {
    try {
      const content = fs.readFileSync(docPath, 'utf-8');

      const completeness = this.calculateCompleteness(content);
      const accuracy = this.calculateAccuracy(content);
      const consistency = this.calculateConsistency(content);
      const readability = this.calculateReadability(content);

      const metrics: DocumentQualityMetrics = {
        completeness,
        accuracy,
        consistency,
        readability,
        overallScore: (completeness + accuracy + consistency + readability) / 4
      };

      this.qualityMetrics.set(docPath, metrics);
      this.emit('quality-checked', { docPath, metrics });

      return metrics;
    } catch (error) {
      return {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        readability: 0,
        overallScore: 0
      };
    }
  }

  private calculateCompleteness(content: string): number {
    const requiredSections = ['##', '###', '```typescript', '```'];
    let score = 0;

    for (const section of requiredSections) {
      if (content.includes(section)) {
        score += 0.25;
      }
    }

    return score;
  }

  private calculateAccuracy(content: string): number {
    const apiPattern = /```typescript[\s\S]*?```/g;
    const codeBlocks = content.match(apiPattern) || [];

    if (codeBlocks.length === 0) return 0;

    let validBlocks = 0;
    for (const block of codeBlocks) {
      if (this.isValidTypeScript(block)) {
        validBlocks++;
      }
    }

    return validBlocks / codeBlocks.length;
  }

  private calculateConsistency(content: string): number {
    const headingPattern = /^(#{1,6})\s+(.+)$/gm;
    const headings = content.match(headingPattern) || [];

    if (headings.length === 0) return 0;

    let consistentCount = 0;
    for (const heading of headings) {
      if (heading.trim().length > 0) {
        consistentCount++;
      }
    }

    return consistentCount / headings.length;
  }

  private calculateReadability(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;

    const avgSentenceLength = content.length / sentences.length;
    const idealLength = 100;

    const lengthScore = 1 - Math.abs(avgSentenceLength - idealLength) / idealLength;
    const structureScore = content.includes('##') ? 1 : 0;

    return (lengthScore + structureScore) / 2;
  }

  private isValidTypeScript(code: string): boolean {
    const invalidPatterns = [
      /import\s+.*from\s+['"][^'"]+['"]/g,
      /require\s*\(/g,
      /console\.log\(/g
    ];

    for (const pattern of invalidPatterns) {
      if (pattern.test(code)) {
        return false;
      }
    }

    return true;
  }

  async checkCodeDocumentationConsistency(codePath: string): Promise<CodeDocumentationConsistency> {
    try {
      const codeContent = fs.readFileSync(codePath, 'utf-8');
      const docPath = this.findRelatedDocPath(codePath);

      if (!docPath) {
        return {
          isConsistent: false,
          missingDocs: [codePath],
          outdatedDocs: [],
          inconsistencies: []
        };
      }

      const docContent = fs.readFileSync(docPath, 'utf-8');
      const codeAPIs = this.extractAPIsFromCode(codeContent);
      const docAPIs = this.extractAPIsFromDoc(docContent);

      const missingInDoc = codeAPIs.filter(api => !docAPIs.includes(api));
      const missingInCode = docAPIs.filter(api => !codeAPIs.includes(api));

      const inconsistencies: string[] = [];
      if (missingInDoc.length > 0) {
        inconsistencies.push(`Missing in documentation: ${missingInDoc.join(', ')}`);
      }
      if (missingInCode.length > 0) {
        inconsistencies.push(`Missing in code: ${missingInCode.join(', ')}`);
      }

      const result: CodeDocumentationConsistency = {
        isConsistent: missingInDoc.length === 0 && missingInCode.length === 0,
        missingDocs: missingInDoc.length > 0 ? [codePath] : [],
        outdatedDocs: missingInCode.length > 0 ? [docPath] : [],
        inconsistencies
      };

      this.consistencyCache.set(codePath, result);
      this.emit('consistency-checked', { codePath, result });

      return result;
    } catch (error) {
      return {
        isConsistent: false,
        missingDocs: [codePath],
        outdatedDocs: [],
        inconsistencies: [`Error checking consistency: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  private findRelatedDocPath(codePath: string): string | null {
    for (const mapping of this.mappings.values()) {
      if (mapping.codeFiles.includes(codePath)) {
        return mapping.document;
      }
    }
    return null;
  }

  getSyncOptimizationMetrics(): SyncOptimizationMetrics[] {
    return [...this.syncOptimizationMetrics];
  }

  getConflictHistory(mappingId: string): ConflictResolutionStrategy[] {
    return this.conflictHistory.get(mappingId) || [];
  }

  getQualityMetrics(docPath: string): DocumentQualityMetrics | undefined {
    return this.qualityMetrics.get(docPath);
  }

  getConsistencyCache(codePath: string): CodeDocumentationConsistency | undefined {
    return this.consistencyCache.get(codePath);
  }

  async generateSyncReport(): Promise<{
    totalSyncs: number;
    successRate: number;
    avgSyncTime: number;
    conflictRate: number;
    qualityScore: number;
    recommendations: string[];
  }> {
    const metrics = this.syncOptimizationMetrics;
    const totalSyncs = metrics.length;

    if (totalSyncs === 0) {
      return {
        totalSyncs: 0,
        successRate: 0,
        avgSyncTime: 0,
        conflictRate: 0,
        qualityScore: 0,
        recommendations: []
      };
    }

    const successCount = metrics.filter(m => m.conflictCount === 0).length;
    const successRate = successCount / totalSyncs;
    const avgSyncTime = metrics.reduce((sum, m) => sum + m.syncTime, 0) / totalSyncs;
    const conflictCount = metrics.reduce((sum, m) => sum + m.conflictCount, 0);
    const conflictRate = conflictCount / totalSyncs;
    const qualityScore = metrics.reduce((sum, m) => sum + m.qualityScore, 0) / totalSyncs;

    const recommendations: string[] = [];
    if (conflictRate > 0.3) {
      recommendations.push('Consider reviewing conflict resolution strategies');
    }
    if (qualityScore < 0.8) {
      recommendations.push('Improve documentation quality standards');
    }
    if (avgSyncTime > 5000) {
      recommendations.push('Optimize sync performance');
    }

    return {
      totalSyncs,
      successRate,
      avgSyncTime,
      conflictRate,
      qualityScore,
      recommendations
    };
  }

  async optimizeSyncProcess(): Promise<void> {
    const report = await this.generateSyncReport();

    if (report.conflictRate > 0.3) {
      this.adjustConflictResolutionStrategy();
    }

    if (report.avgSyncTime > 5000) {
      this.increaseDebounceDelay();
    }

    this.emit('sync-optimized', report);
  }

  private adjustConflictResolutionStrategy(): void {
    const history = this.conflictHistory;
    const allResolutions: ConflictResolutionStrategy[] = [];

    for (const resolutions of history.values()) {
      allResolutions.push(...resolutions);
    }

    const codePriorityCount = allResolutions.filter(r => r.type === 'code-priority').length;
    const docPriorityCount = allResolutions.filter(r => r.type === 'doc-priority').length;

    if (codePriorityCount > docPriorityCount * 1.5) {
      this.emit('strategy-adjusted', { strategy: 'code-priority' });
    } else if (docPriorityCount > codePriorityCount * 1.5) {
      this.emit('strategy-adjusted', { strategy: 'doc-priority' });
    }
  }

  private increaseDebounceDelay(): void {
    if (this.debounceDelay < 3000) {
      this.debounceDelay = Math.min(this.debounceDelay * 1.5, 3000);
      this.emit('debounce-adjusted', { newDelay: this.debounceDelay });
    }
  }

  async forceSync(filePath: string): Promise<SyncResult> {
    const event: FileChangeEvent = {
      type: 'change',
      path: filePath,
      timestamp: new Date().toISOString()
    };

    return await this.syncFile(event);
  }

  async syncAll(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const mapping of this.mappings.values()) {
      if (!mapping.syncEnabled) {
        continue;
      }

      for (const codeFile of mapping.codeFiles) {
        const event: FileChangeEvent = {
          type: 'change',
          path: codeFile,
          timestamp: new Date().toISOString()
        };

        try {
          const result = await this.syncFile(event);
          results.push(result);
        } catch (error) {
          results.push({
            success: false,
            message: `Sync failed: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    return results;
  }

  async addMapping(mapping: Mapping): Promise<void> {
    this.mappings.set(mapping.id, mapping);
    await this.saveConfig();
    this.emit('mapping-added', mapping);
  }

  async removeMapping(mappingId: string): Promise<void> {
    this.mappings.delete(mappingId);
    await this.saveConfig();
    this.emit('mapping-removed', mappingId);
  }

  async updateMapping(mappingId: string, updates: Partial<Mapping>): Promise<void> {
    const mapping = this.mappings.get(mappingId);
    if (mapping) {
      Object.assign(mapping, updates);
      await this.saveConfig();
      this.emit('mapping-updated', mapping);
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      const config: MappingConfig = {
        version: '2.0.0',
        lastUpdated: new Date().toISOString(),
        mappings: Array.from(this.mappings.values()),
        globalSettings: {
          autoSync: true,
          syncInterval: 5000,
          conflictResolution: 'auto',
          notificationEnabled: true
        }
      };

      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
    } catch (error) {
      this.emit('error', `Failed to save config: ${error}`);
    }
  }

  getMappings(): Mapping[] {
    return Array.from(this.mappings.values());
  }

  getMapping(mappingId: string): Mapping | undefined {
    return this.mappings.get(mappingId);
  }

  getSyncStatus(): SyncStatus {
    return {
      isProcessing: this.isProcessing,
      isRunning: this.isProcessing,
      totalMappings: this.mappings.size,
      syncedMappings: Array.from(this.mappings.values()).filter(m => m.syncStatus === 'success').length,
      failedMappings: Array.from(this.mappings.values()).filter(m => m.syncStatus === 'failed').length
    };
  }

  async generateNotifications(): Promise<Notification[]> {
    const notifications: Notification[] = [];

    const report = await this.generateSyncReport();
    if (report.conflictRate > 0.3) {
      notifications.push({
        id: `conflict-rate-${Date.now()}`,
        type: 'warning',
        title: 'High Conflict Rate',
        message: `Conflict rate is ${Math.round(report.conflictRate * 100)}%. Consider reviewing conflict resolution strategies.`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    if (report.qualityScore < 0.8) {
      notifications.push({
        id: `quality-score-${Date.now()}`,
        type: 'info',
        title: 'Documentation Quality',
        message: `Documentation quality score is ${Math.round(report.qualityScore * 100)}%. Consider improving documentation standards.`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    return notifications;
  }
}
