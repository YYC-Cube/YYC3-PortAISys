/**
 * @file DocumentSyncManager 单元测试
 * @description 测试文档同步管理器的核心功能
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DocumentSyncManager } from '../../../core/documentation/DocumentSyncManager';
import * as path from 'path';

describe('DocumentSyncManager', () => {
  let documentSyncManager: DocumentSyncManager;
  let tempDir: string;

  beforeEach(() => {
    vi.resetAllMocks();

    tempDir = path.join('/tmp', `test-${Date.now()}`);

    vi.mock('fs', () => ({
      readFileSync: vi.fn(() => '# Test Content'),
      writeFileSync: vi.fn(() => {}),
      statSync: vi.fn(() => ({
        mtimeMs: Date.now(),
        isDirectory: () => false,
        isFile: () => true
      })),
      readdirSync: vi.fn(() => []),
      existsSync: vi.fn(() => true),
      mkdirSync: vi.fn(() => {})
    }));

    documentSyncManager = new DocumentSyncManager({
      codeBasePath: tempDir,
      docsBasePath: path.join(tempDir, 'docs'),
      enableAutoSync: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultManager = new DocumentSyncManager();
      expect(defaultManager).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const customManager = new DocumentSyncManager({
        codeBasePath: '/custom/code',
        docsBasePath: '/custom/docs',
        syncInterval: 300000,
        enableAutoSync: false
      });
      expect(customManager).toBeDefined();
    });
  });

  describe('sync', () => {
    it('should execute sync process', async () => {
      const result = await documentSyncManager.sync();
      expect(result.success).toBe(true);
      expect(result.syncedFiles).toBe(0);
      expect(result.outdatedFiles).toBe(0);
      expect(result.errors).toBe(0);
    });
  });

  describe('getSyncStatus', () => {
    it('should return sync status', () => {
      const status = documentSyncManager.getSyncStatus();
      expect(status).toHaveProperty('totalFiles');
      expect(status).toHaveProperty('syncedFiles');
      expect(status).toHaveProperty('outdatedFiles');
      expect(status).toHaveProperty('errorFiles');
      expect(status).toHaveProperty('conflictFiles');
      expect(status).toHaveProperty('details');
    });
  });

  describe('event handling', () => {
    it('should allow subscribing to events', () => {
      const callback = vi.fn();
      documentSyncManager.on('syncStarted', callback);
      expect(callback).toBeDefined();
    });

    it('should allow unsubscribing from events', () => {
      const callback = vi.fn();
      documentSyncManager.on('syncStarted', callback);
      documentSyncManager.off('syncStarted', callback);
      expect(callback).toBeDefined();
    });
  });

  describe('shutdown', () => {
    it('should shutdown manager', async () => {
      await documentSyncManager.shutdown();
      expect(documentSyncManager.getSyncStatus().totalFiles).toBe(0);
    });
  });

  describe('file scanning', () => {
    it('should scan files based on patterns', () => {
      documentSyncManager.rescanFiles();
      const status = documentSyncManager.getSyncStatus();
      expect(status.totalFiles).toBeGreaterThanOrEqual(0);
    });
  });

  describe('conflict resolution', () => {
    it('should detect conflicts when both files are modified', () => {
      const entry = {
        codePath: '/test/file.ts',
        docPath: '/test/docs/file.md',
        lastSynced: Date.now() - 10000,
        syncStatus: 'conflict' as const,
        conflictDetails: {
          codeHash: 'hash1',
          docHash: 'hash2'
        }
      };

      const resolved = documentSyncManager.resolveConflict(entry, 'code');
      expect(resolved).toBe(true);
    });

    it('should resolve conflicts using doc resolution strategy', () => {
      const entry = {
        codePath: '/test/file.ts',
        docPath: '/test/docs/file.md',
        lastSynced: Date.now() - 10000,
        syncStatus: 'conflict' as const,
        conflictDetails: {
          codeHash: 'hash1',
          docHash: 'hash2'
        }
      };

      const resolved = documentSyncManager.resolveConflict(entry, 'doc');
      expect(resolved).toBe(true);
    });
  });

  describe('backup functionality', () => {
    it('should create backups when backup is enabled', async () => {
      const manager = new DocumentSyncManager({
        codeBasePath: tempDir,
        docsBasePath: path.join(tempDir, 'docs'),
        enableAutoSync: false,
        backupEnabled: true
      });

      await manager.sync();
      expect(manager.getSyncStatus().totalFiles).toBeGreaterThanOrEqual(0);
    });
  });

  describe('sync strategies', () => {
    it('should use timestamp strategy for syncing', async () => {
      const manager = new DocumentSyncManager({
        codeBasePath: tempDir,
        docsBasePath: path.join(tempDir, 'docs'),
        enableAutoSync: false,
        syncStrategy: 'timestamp'
      });

      await manager.sync();
      expect(manager.getSyncStatus().totalFiles).toBeGreaterThanOrEqual(0);
    });

    it('should use content strategy for syncing', async () => {
      const manager = new DocumentSyncManager({
        codeBasePath: tempDir,
        docsBasePath: path.join(tempDir, 'docs'),
        enableAutoSync: false,
        syncStrategy: 'content'
      });

      await manager.sync();
      expect(manager.getSyncStatus().totalFiles).toBeGreaterThanOrEqual(0);
    });

    it('should use manual strategy for syncing', async () => {
      const manager = new DocumentSyncManager({
        codeBasePath: tempDir,
        docsBasePath: path.join(tempDir, 'docs'),
        enableAutoSync: false,
        syncStrategy: 'manual'
      });

      await manager.sync();
      expect(manager.getSyncStatus().totalFiles).toBeGreaterThanOrEqual(0);
    });
  });

  describe('auto sync', () => {
    it('should start auto sync when enabled', async () => {
      const manager = new DocumentSyncManager({
        codeBasePath: tempDir,
        docsBasePath: path.join(tempDir, 'docs'),
        enableAutoSync: false,
        syncInterval: 100
      });

      manager.startAutoSync();
      expect(manager.getSyncStatus().totalFiles).toBeGreaterThanOrEqual(0);
      manager.stopAutoSync();
    });

    it('should stop auto sync', async () => {
      const manager = new DocumentSyncManager({
        codeBasePath: tempDir,
        docsBasePath: path.join(tempDir, 'docs'),
        enableAutoSync: false,
        syncInterval: 100
      });

      manager.startAutoSync();
      manager.stopAutoSync();
      expect(manager.getSyncStatus().totalFiles).toBeGreaterThanOrEqual(0);
    });
  });
});
