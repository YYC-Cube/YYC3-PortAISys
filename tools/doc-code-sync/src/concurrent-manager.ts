import { EventEmitter } from 'events';

class AggregateError extends Error {
  constructor(public errors: Error[], message: string) {
    super(message);
    this.name = 'AggregateError';
  }
}

export interface Task<T> {
  id: string;
  data: T;
  priority: number;
  createdAt: number;
}

export interface TaskResult<T, R> {
  task: Task<T>;
  result?: R;
  error?: Error;
  completedAt: number;
}

export interface WorkerPoolOptions {
  maxWorkers?: number;
  taskTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class WorkerPool<T, R> extends EventEmitter {
  private maxWorkers: number;
  private taskTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  private workers: Map<number, any>;
  private taskQueue: Task<T>[];
  private activeTasks: Map<string, Task<T>>;
  private results: Map<string, TaskResult<T, R>>;
  private workerIdCounter: number;

  constructor(
    private workerScript: string,
    options: WorkerPoolOptions = {}
  ) {
    super();
    this.maxWorkers = options.maxWorkers || 4;
    this.taskTimeout = options.taskTimeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.workers = new Map();
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.results = new Map();
    this.workerIdCounter = 0;
  }

  async addTask(data: T, priority: number = 0): Promise<string> {
    const task: Task<T> = {
      id: this.generateTaskId(),
      data,
      priority,
      createdAt: Date.now(),
    };

    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => b.priority - a.priority);
    this.processQueue();

    return task.id;
  }

  async addTasks(tasks: T[], priority: number = 0): Promise<string[]> {
    const taskIds = await Promise.all(
      tasks.map(data => this.addTask(data, priority))
    );
    return taskIds;
  }

  async getTaskResult(taskId: string): Promise<TaskResult<T, R>> {
    return new Promise((resolve, reject) => {
      const checkResult = () => {
        const result = this.results.get(taskId);
        if (result) {
          resolve(result);
        } else {
          setTimeout(checkResult, 100);
        }
      };
      checkResult();
    });
  }

  async waitForAllTasks(): Promise<TaskResult<T, R>[]> {
    return new Promise((resolve) => {
      const checkComplete = () => {
        if (this.taskQueue.length === 0 && this.activeTasks.size === 0) {
          const allResults = Array.from(this.results.values());
          resolve(allResults);
        } else {
          setTimeout(checkComplete, 100);
        }
      };
      checkComplete();
    });
  }

  private processQueue(): void {
    while (
      this.taskQueue.length > 0 &&
      this.workers.size < this.maxWorkers
    ) {
      const task = this.taskQueue.shift();
      if (task) {
        this.assignTask(task);
      }
    }
  }

  private async assignTask(task: Task<T>): Promise<void> {
    const workerId = this.workerIdCounter++;
    const Worker = require('worker_threads').Worker;
    const worker = new Worker(this.workerScript);

    this.workers.set(workerId, worker);
    this.activeTasks.set(task.id, task);

    worker.on('message', (result: R) => {
      this.handleTaskSuccess(task, result);
      this.cleanupWorker(workerId);
    });

    worker.on('error', (error: Error) => {
      this.handleTaskError(task, error);
      this.cleanupWorker(workerId);
    });

    worker.on('exit', (code: number) => {
      if (code !== 0) {
        this.handleTaskError(task, new Error(`Worker exited with code ${code}`));
        this.cleanupWorker(workerId);
      }
    });

    const timeout = setTimeout(() => {
      this.handleTaskError(task, new Error('Task timeout'));
      this.cleanupWorker(workerId);
    }, this.taskTimeout);

    worker.postMessage(task.data);
  }

  private handleTaskSuccess(task: Task<T>, result: R): void {
    const taskResult: TaskResult<T, R> = {
      task,
      result,
      completedAt: Date.now(),
    };
    this.results.set(task.id, taskResult);
    this.activeTasks.delete(task.id);
    this.emit('taskComplete', taskResult);
    this.processQueue();
  }

  private async handleTaskError(task: Task<T>, error: Error): Promise<void> {
    const taskResult = this.results.get(task.id);
    const attempt = taskResult ? (taskResult.error ? 1 : 0) + 1 : 1;

    if (attempt < this.retryAttempts) {
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      this.taskQueue.push(task);
      this.processQueue();
    } else {
      const finalResult: TaskResult<T, R> = {
        task,
        error,
        completedAt: Date.now(),
      };
      this.results.set(task.id, finalResult);
      this.activeTasks.delete(task.id);
      this.emit('taskError', finalResult);
      this.processQueue();
    }
  }

  private cleanupWorker(workerId: number): void {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.terminate();
      this.workers.delete(workerId);
    }
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats(): WorkerPoolStats {
    return {
      totalWorkers: this.maxWorkers,
      activeWorkers: this.workers.size,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      completedTasks: this.results.size,
      failedTasks: Array.from(this.results.values()).filter(r => r.error).length,
    };
  }

  async shutdown(): Promise<void> {
    for (const [workerId, worker] of this.workers) {
      worker.terminate();
      this.workers.delete(workerId);
    }
    this.taskQueue = [];
    this.activeTasks.clear();
  }
}

export interface WorkerPoolStats {
  totalWorkers: number;
  activeWorkers: number;
  queuedTasks: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
}

export class ConcurrentTaskManager<T, R> {
  private workerPool: WorkerPool<T, R>;

  constructor(workerScript: string, options: WorkerPoolOptions = {}) {
    this.workerPool = new WorkerPool<T, R>(workerScript, options);
  }

  async executeTask(data: T, priority: number = 0): Promise<R> {
    const taskId = await this.workerPool.addTask(data, priority);
    const result = await this.workerPool.getTaskResult(taskId);

    if (result.error) {
      throw result.error;
    }

    return result.result!;
  }

  async executeTasks(tasks: T[], priority: number = 0): Promise<R[]> {
    const taskIds = await this.workerPool.addTasks(tasks, priority);
    const allResults = await this.workerPool.waitForAllTasks();

    const results: R[] = [];
    const errors: Error[] = [];

    for (const taskId of taskIds) {
      const result = allResults.find(r => r.task.id === taskId);
      if (result) {
        if (result.error) {
          errors.push(result.error);
        } else if (result.result) {
          results.push(result.result);
        }
      }
    }

    if (errors.length > 0) {
      throw new AggregateError(errors, `${errors.length} tasks failed`);
    }

    return results;
  }

  getStats(): WorkerPoolStats {
    return this.workerPool.getStats();
  }

  async shutdown(): Promise<void> {
    return this.workerPool.shutdown();
  }
}
