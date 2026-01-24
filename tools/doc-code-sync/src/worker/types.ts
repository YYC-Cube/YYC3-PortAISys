export interface WorkerMessage<T = any> {
  id: string;
  type: 'sync' | 'analyze' | 'process' | 'validate';
  data: T;
  timestamp: number;
}

export interface WorkerResponse<R = any> {
  id: string;
  type: 'success' | 'error' | 'progress';
  data?: R;
  error?: WorkerError;
  timestamp: number;
  progress?: number;
}

export interface WorkerError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export interface SyncTaskData {
  mappingId: string;
  documentPath: string;
  codePaths: string[];
  direction: 'doc-to-code' | 'code-to-doc' | 'bidirectional';
  options?: {
    validateBeforeSync?: boolean;
    createBackup?: boolean;
    skipConflicts?: boolean;
  };
}

export interface SyncTaskResult {
  mappingId: string;
  success: boolean;
  syncedFiles: string[];
  skippedFiles: string[];
  conflicts: FileConflict[];
  duration: number;
  bytesProcessed: number;
}

export interface FileConflict {
  path: string;
  type: 'content' | 'structure' | 'metadata';
  reason: string;
  docContent?: string;
  codeContent?: string;
}

export interface AnalyzeTaskData {
  filePath: string;
  analysisType: 'structure' | 'content' | 'dependencies' | 'complexity';
  options?: {
    includeLineNumbers?: boolean;
    includeComments?: boolean;
    maxDepth?: number;
  };
}

export interface AnalyzeTaskResult {
  filePath: string;
  analysisType: string;
  result: any;
  duration: number;
}

export interface ProcessTaskData {
  filePath: string;
  operation: 'transform' | 'optimize' | 'format' | 'minify';
  options?: {
    preserveComments?: boolean;
    indentSize?: number;
    outputFormat?: string;
  };
}

export interface ProcessTaskResult {
  filePath: string;
  operation: string;
  success: boolean;
  outputPath?: string;
  duration: number;
  originalSize: number;
  processedSize: number;
}

export interface ValidateTaskData {
  filePath: string;
  validationType: 'syntax' | 'lint' | 'type' | 'schema';
  options?: {
    strictMode?: boolean;
    customRules?: any[];
  };
}

export interface ValidateTaskResult {
  filePath: string;
  validationType: string;
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  duration: number;
}

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  rule?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  line: number;
  column: number;
  message: string;
  rule?: string;
  suggestion?: string;
}

export interface WorkerStats {
  tasksProcessed: number;
  tasksSucceeded: number;
  tasksFailed: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  bytesProcessed: number;
  lastActivity: number;
}

export interface WorkerConfig {
  maxMemoryMB?: number;
  maxTaskDuration?: number;
  enableProfiling?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
