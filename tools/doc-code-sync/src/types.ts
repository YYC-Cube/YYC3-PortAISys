/**
 * @file tools/doc-code-sync/src/types.ts
 * @description Types 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

export interface MappingConfig {
  version: string;
  lastUpdated?: string;
  mappings: Mapping[];
  globalSettings: GlobalSettings;
}

export interface Mapping {
  id: string;
  document: string;
  codeFiles: string[];
  type: 'one-to-one' | 'one-to-many' | 'many-to-one';
  syncEnabled?: boolean;
  lastSync?: string;
  syncStatus?: 'success' | 'failed' | 'pending';
}

export interface GlobalSettings {
  autoSync?: boolean;
  syncInterval?: number;
  conflictResolution?: 'manual' | 'auto' | 'latest';
  notificationEnabled?: boolean;
}

export interface SyncResult {
  success: boolean;
  message: string;
  timestamp: string;
  details?: SyncDetail[];
}

export interface SyncDetail {
  file: string;
  status: 'success' | 'failed' | 'skipped';
  message?: string;
}

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  timestamp: string;
}

export interface SyncStatus {
  isProcessing: boolean;
  isRunning: boolean;
  lastSyncTime?: string;
  totalMappings: number;
  syncedMappings: number;
  failedMappings: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
