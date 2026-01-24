export interface MappingConfig {
  version: string;
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
  isRunning: boolean;
  lastSyncTime?: string;
  totalMappings: number;
  syncedMappings: number;
  failedMappings: number;
}

export interface Notification {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
