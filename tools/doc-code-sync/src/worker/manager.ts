import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import {
  WorkerMessage,
  WorkerResponse,
  WorkerStats,
  WorkerConfig,
  SyncTaskData,
  SyncTaskResult,
  AnalyzeTaskData,
  AnalyzeTaskResult,
  ProcessTaskData,
  ProcessTaskResult,
  ValidateTaskData,
  ValidateTaskResult,
} from './types';

export interface WorkerManagerOptions {
  maxWorkers?: number;
  workerScript?: string;
  config?: WorkerConfig;
  taskTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface WorkerInstance {
  id: number;
  worker: Worker;
  busy: boolean;
  stats: WorkerStats;
  lastActivity: number;
}

export class WorkerManager extends EventEmitter {
  private workers: Map<number, WorkerInstance>;
  private taskQueue: Map<string, WorkerMessage>;
  private pendingResponses: Map<string, {
    resolve: (value: WorkerResponse) => void;
    reject: (reason: any) => void;
    timeout: NodeJS.Timeout;
  }>;
  private workerIdCounter: number;
  private maxWorkers: number;
  private workerScript: string;
  private config: WorkerConfig;
  private taskTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(options: WorkerManagerOptions = {}) {
    super();
    this.workers = new Map();
    this.taskQueue = new Map();
    this.pendingResponses = new Map();
    this.workerIdCounter = 0;
    this.maxWorkers = options.maxWorkers || 4;
    this.workerScript = options.workerScript || __dirname + '/worker/index.js';
    this.config = options.config || {};
    this.taskTimeout = options.taskTimeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;

    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker(): WorkerInstance {
    const workerId = this.workerIdCounter++;
    const worker = new Worker(this.workerScript, {
      workerData: { config: this.config },
    });

    const workerInstance: WorkerInstance = {
      id: workerId,
      worker,
      busy: false,
      stats: {
        tasksProcessed: 0,
        tasksSucceeded: 0,
        tasksFailed: 0,
        totalProcessingTime: 0,
        averageProcessingTime: 0,
        bytesProcessed: 0,
        lastActivity: Date.now(),
      },
      lastActivity: Date.now(),
    };

    worker.on('message', (response: WorkerResponse) => {
      this.handleWorkerResponse(workerId, response);
    });

    worker.on('error', (error: Error) => {
      this.handleWorkerError(workerId, error);
    });

    worker.on('exit', (code: number) => {
      if (code !== 0) {
        console.error(`Worker ${workerId} exited with code ${code}`);
        this.restartWorker(workerId);
      }
    });

    this.workers.set(workerId, workerInstance);
    this.emit('workerCreated', workerId);

    return workerInstance;
  }

  private restartWorker(workerId: number): void {
    const workerInstance = this.workers.get(workerId);
    if (workerInstance) {
      workerInstance.worker.terminate();
      this.workers.delete(workerId);
      this.createWorker();
    }
  }

  private handleWorkerResponse(workerId: number, response: WorkerResponse): void {
    const pending = this.pendingResponses.get(response.id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingResponses.delete(response.id);

      const workerInstance = this.workers.get(workerId);
      if (workerInstance) {
        workerInstance.busy = false;
        workerInstance.lastActivity = Date.now();

        if (response.type === 'success') {
          workerInstance.stats.tasksProcessed++;
          workerInstance.stats.tasksSucceeded++;
          workerInstance.stats.totalProcessingTime += response.timestamp - (workerInstance.stats.lastActivity || response.timestamp);
          workerInstance.stats.averageProcessingTime = workerInstance.stats.totalProcessingTime / workerInstance.stats.tasksProcessed;
        } else if (response.type === 'error') {
          workerInstance.stats.tasksProcessed++;
          workerInstance.stats.tasksFailed++;
        }
      }

      if (response.type === 'success') {
        pending.resolve(response);
      } else {
        pending.reject(new Error(response.error?.message || 'Task failed'));
      }

      this.processQueue();
    }
  }

  private handleWorkerError(workerId: number, error: Error): void {
    console.error(`Worker ${workerId} error:`, error);
    this.restartWorker(workerId);
  }

  private processQueue(): void {
    for (const [taskId, message] of this.taskQueue) {
      const availableWorker = this.findAvailableWorker();
      if (availableWorker) {
        this.taskQueue.delete(taskId);
        this.assignTask(availableWorker, message);
      }
    }
  }

  private findAvailableWorker(): WorkerInstance | undefined {
    for (const workerInstance of this.workers.values()) {
      if (!workerInstance.busy) {
        return workerInstance;
      }
    }
    return undefined;
  }

  private assignTask(workerInstance: WorkerInstance, message: WorkerMessage): void {
    workerInstance.busy = true;
    workerInstance.worker.postMessage(message);
  }

  private async executeTaskWithRetry(
    message: WorkerMessage,
    attempt: number = 1
  ): Promise<WorkerResponse> {
    try {
      return await this.executeTask(message);
    } catch (error) {
      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.executeTaskWithRetry(message, attempt + 1);
      }
      throw error;
    }
  }

  private executeTask(message: WorkerMessage): Promise<WorkerResponse> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingResponses.delete(message.id);
        reject(new Error('Task timeout'));
      }, this.taskTimeout);

      this.pendingResponses.set(message.id, {
        resolve,
        reject,
        timeout,
      });

      const availableWorker = this.findAvailableWorker();
      if (availableWorker) {
        this.assignTask(availableWorker, message);
      } else {
        this.taskQueue.set(message.id, message);
      }
    });
  }

  async executeSyncTask(data: SyncTaskData): Promise<SyncTaskResult> {
    const message: WorkerMessage<SyncTaskData> = {
      id: this.generateTaskId(),
      type: 'sync',
      data,
      timestamp: Date.now(),
    };

    const response = await this.executeTaskWithRetry(message);
    return response.data as SyncTaskResult;
  }

  async executeAnalyzeTask(data: AnalyzeTaskData): Promise<AnalyzeTaskResult> {
    const message: WorkerMessage<AnalyzeTaskData> = {
      id: this.generateTaskId(),
      type: 'analyze',
      data,
      timestamp: Date.now(),
    };

    const response = await this.executeTaskWithRetry(message);
    return response.data as AnalyzeTaskResult;
  }

  async executeProcessTask(data: ProcessTaskData): Promise<ProcessTaskResult> {
    const message: WorkerMessage<ProcessTaskData> = {
      id: this.generateTaskId(),
      type: 'process',
      data,
      timestamp: Date.now(),
    };

    const response = await this.executeTaskWithRetry(message);
    return response.data as ProcessTaskResult;
  }

  async executeValidateTask(data: ValidateTaskData): Promise<ValidateTaskResult> {
    const message: WorkerMessage<ValidateTaskData> = {
      id: this.generateTaskId(),
      type: 'validate',
      data,
      timestamp: Date.now(),
    };

    const response = await this.executeTaskWithRetry(message);
    return response.data as ValidateTaskResult;
  }

  async executeBatchSyncTasks(tasks: SyncTaskData[]): Promise<SyncTaskResult[]> {
    const promises = tasks.map(task => this.executeSyncTask(task));
    return Promise.all(promises);
  }

  async executeBatchAnalyzeTasks(tasks: AnalyzeTaskData[]): Promise<AnalyzeTaskResult[]> {
    const promises = tasks.map(task => this.executeAnalyzeTask(task));
    return Promise.all(promises);
  }

  async executeBatchProcessTasks(tasks: ProcessTaskData[]): Promise<ProcessTaskResult[]> {
    const promises = tasks.map(task => this.executeProcessTask(task));
    return Promise.all(promises);
  }

  async executeBatchValidateTasks(tasks: ValidateTaskData[]): Promise<ValidateTaskResult[]> {
    const promises = tasks.map(task => this.executeValidateTask(task));
    return Promise.all(promises);
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats(): {
    totalWorkers: number;
    activeWorkers: number;
    idleWorkers: number;
    queuedTasks: number;
    pendingResponses: number;
    totalTasksProcessed: number;
    totalTasksSucceeded: number;
    totalTasksFailed: number;
    averageProcessingTime: number;
    totalBytesProcessed: number;
  } {
    let totalTasksProcessed = 0;
    let totalTasksSucceeded = 0;
    let totalTasksFailed = 0;
    let totalProcessingTime = 0;
    let totalBytesProcessed = 0;

    for (const workerInstance of this.workers.values()) {
      totalTasksProcessed += workerInstance.stats.tasksProcessed;
      totalTasksSucceeded += workerInstance.stats.tasksSucceeded;
      totalTasksFailed += workerInstance.stats.tasksFailed;
      totalProcessingTime += workerInstance.stats.totalProcessingTime;
      totalBytesProcessed += workerInstance.stats.bytesProcessed;
    }

    return {
      totalWorkers: this.workers.size,
      activeWorkers: Array.from(this.workers.values()).filter(w => w.busy).length,
      idleWorkers: Array.from(this.workers.values()).filter(w => !w.busy).length,
      queuedTasks: this.taskQueue.size,
      pendingResponses: this.pendingResponses.size,
      totalTasksProcessed,
      totalTasksSucceeded,
      totalTasksFailed,
      averageProcessingTime: totalTasksProcessed > 0 ? totalProcessingTime / totalTasksProcessed : 0,
      totalBytesProcessed,
    };
  }

  getWorkerStats(workerId: number): WorkerStats | undefined {
    const workerInstance = this.workers.get(workerId);
    return workerInstance?.stats;
  }

  async shutdown(): Promise<void> {
    for (const [workerId, workerInstance] of this.workers) {
      workerInstance.worker.terminate();
      this.workers.delete(workerId);
    }

    for (const [taskId, pending] of this.pendingResponses) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Worker manager shutdown'));
    }

    this.pendingResponses.clear();
    this.taskQueue.clear();
  }

  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  once(event: string, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }

  emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}
