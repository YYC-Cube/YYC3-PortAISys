/**
 * @file ConcurrencyOptimizer.ts
 * @description 并发优化器 - 优化并发处理和资源利用
 * @module core/optimization
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import EventEmitter from 'eventemitter3'

/**
 * 任务优先级
 */
export enum TaskPriority {
  CRITICAL = 5,
  HIGH = 4,
  NORMAL = 3,
  LOW = 2,
  BACKGROUND = 1,
}

/**
 * 任务状态
 */
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * 任务定义
 */
export interface Task<T = any> {
  id: string
  priority: TaskPriority
  execute: () => Promise<T>
  timeout?: number
  retries?: number
  onComplete?: (result: T) => void
  onError?: (error: Error) => void
}

/**
 * 任务结果
 */
export interface TaskResult<T = any> {
  id: string
  status: TaskStatus
  result?: T
  error?: Error
  startTime: number
  endTime: number
  duration: number
  retryCount: number
}

/**
 * Worker线程池配置
 */
export interface WorkerPoolConfig {
  minWorkers?: number
  maxWorkers?: number
  idleTimeout?: number
  taskTimeout?: number
}

/**
 * 并发优化器配置
 */
export interface ConcurrencyConfig {
  maxConcurrency?: number
  queueSize?: number
  enableBackpressure?: boolean
  enableAdaptive?: boolean
  workerPool?: WorkerPoolConfig
}

/**
 * 背压状态
 */
interface BackpressureState {
  enabled: boolean
  threshold: number
  currentLoad: number
  delayMs: number
}

/**
 * 并发优化器
 */
export class ConcurrencyOptimizer extends EventEmitter {
  private config: Required<ConcurrencyConfig>
  private taskQueue: Array<{ task: Task; resolve: Function; reject: Function }> = []
  private runningTasks: Set<string> = new Set()
  private completedTasks: Map<string, TaskResult> = new Map()
  private backpressure: BackpressureState
  private metrics = {
    tasksProcessed: 0,
    tasksSucceeded: 0,
    tasksFailed: 0,
    totalDuration: 0,
    avgDuration: 0,
    maxConcurrency: 0,
  }

  constructor(config: ConcurrencyConfig = {}) {
    super()

    this.config = {
      maxConcurrency: config.maxConcurrency || 10,
      queueSize: config.queueSize || 1000,
      enableBackpressure: config.enableBackpressure !== false,
      enableAdaptive: config.enableAdaptive !== false,
      workerPool: {
        minWorkers: config.workerPool?.minWorkers || 2,
        maxWorkers: config.workerPool?.maxWorkers || 10,
        idleTimeout: config.workerPool?.idleTimeout || 60000,
        taskTimeout: config.workerPool?.taskTimeout || 30000,
      },
    }

    this.backpressure = {
      enabled: this.config.enableBackpressure,
      threshold: this.config.queueSize * 0.8,
      currentLoad: 0,
      delayMs: 0,
    }

    if (this.config.enableAdaptive) {
      this.startAdaptiveOptimization()
    }
  }

  /**
   * 提交任务
   */
  async submitTask<T>(task: Task<T>): Promise<T> {
    // 检查队列容量
    if (this.taskQueue.length >= this.config.queueSize) {
      throw new Error('Task queue is full')
    }

    // 背压控制
    if (this.backpressure.enabled && this.backpressure.delayMs > 0) {
      await this.applyBackpressure()
    }

    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task, resolve, reject })
      this.emit('task:queued', { taskId: task.id, queueSize: this.taskQueue.length })
      this.processQueue()
    })
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    while (this.taskQueue.length > 0 && this.runningTasks.size < this.config.maxConcurrency) {
      // 按优先级排序
      this.taskQueue.sort((a, b) => b.task.priority - a.task.priority)

      const item = this.taskQueue.shift()
      if (!item) break

      const { task, resolve, reject } = item
      this.executeTask(task, resolve, reject)
    }

    // 更新背压状态
    this.updateBackpressure()
  }

  /**
   * 执行任务
   */
  private async executeTask<T>(task: Task<T>, resolve: Function, reject: Function): Promise<void> {
    this.runningTasks.add(task.id)
    this.metrics.maxConcurrency = Math.max(this.metrics.maxConcurrency, this.runningTasks.size)

    const startTime = Date.now()
    let retryCount = 0
    const maxRetries = task.retries || 0

    this.emit('task:started', { taskId: task.id })

    const executeWithRetry = async (): Promise<T> => {
      try {
        const timeoutPromise = task.timeout
          ? new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Task timeout')), task.timeout)
            )
          : null

        const result = timeoutPromise
          ? await Promise.race([task.execute(), timeoutPromise])
          : await task.execute()

        return result
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++
          this.emit('task:retry', { taskId: task.id, retryCount })
          await this.delay(Math.pow(2, retryCount) * 1000) // 指数退避
          return executeWithRetry()
        }
        throw error
      }
    }

    try {
      const result = await executeWithRetry()
      const endTime = Date.now()
      const duration = endTime - startTime

      // 记录成功
      this.recordTaskCompletion(task.id, {
        id: task.id,
        status: TaskStatus.COMPLETED,
        result,
        startTime,
        endTime,
        duration,
        retryCount,
      })

      this.metrics.tasksSucceeded++

      if (task.onComplete) {
        task.onComplete(result)
      }

      this.emit('task:completed', { taskId: task.id, duration })
      resolve(result)
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime

      // 记录失败
      this.recordTaskCompletion(task.id, {
        id: task.id,
        status: TaskStatus.FAILED,
        error: error as Error,
        startTime,
        endTime,
        duration,
        retryCount,
      })

      this.metrics.tasksFailed++

      if (task.onError) {
        task.onError(error as Error)
      }

      this.emit('task:failed', { taskId: task.id, error })
      reject(error)
    } finally {
      this.runningTasks.delete(task.id)
      this.processQueue()
    }
  }

  /**
   * 记录任务完成
   */
  private recordTaskCompletion(taskId: string, result: TaskResult): void {
    this.completedTasks.set(taskId, result)
    this.metrics.tasksProcessed++
    this.metrics.totalDuration += result.duration
    this.metrics.avgDuration = this.metrics.totalDuration / this.metrics.tasksProcessed
  }

  /**
   * 应用背压
   */
  private async applyBackpressure(): Promise<void> {
    await this.delay(this.backpressure.delayMs)
  }

  /**
   * 更新背压状态
   */
  private updateBackpressure(): void {
    if (!this.backpressure.enabled) return

    const queueLoad = this.taskQueue.length / this.config.queueSize
    this.backpressure.currentLoad = queueLoad

    if (queueLoad > 0.8) {
      this.backpressure.delayMs = 1000 // 高负载，延迟1秒
    } else if (queueLoad > 0.6) {
      this.backpressure.delayMs = 500 // 中等负载，延迟500ms
    } else if (queueLoad > 0.4) {
      this.backpressure.delayMs = 200 // 低负载，延迟200ms
    } else {
      this.backpressure.delayMs = 0 // 正常，无延迟
    }
  }

  /**
   * 启动自适应优化
   */
  private startAdaptiveOptimization(): void {
    setInterval(() => {
      this.adaptConcurrency()
    }, 10000) // 每10秒调整一次
  }

  /**
   * 自适应调整并发度
   */
  private adaptConcurrency(): void {
    const queueSize = this.taskQueue.length
    const runningSize = this.runningTasks.size
    const avgDuration = this.metrics.avgDuration

    // 如果队列积压且平均处理时间短，增加并发度
    if (queueSize > this.config.maxConcurrency * 2 && avgDuration < 1000) {
      this.config.maxConcurrency = Math.min(this.config.maxConcurrency + 2, 50)
      this.emit('concurrency:increased', { newLimit: this.config.maxConcurrency })
    }

    // 如果队列为空且并发度较高，减少并发度
    if (queueSize === 0 && runningSize < this.config.maxConcurrency * 0.3) {
      this.config.maxConcurrency = Math.max(this.config.maxConcurrency - 1, 5)
      this.emit('concurrency:decreased', { newLimit: this.config.maxConcurrency })
    }
  }

  /**
   * 批量提交任务
   */
  async submitBatch<T>(tasks: Task<T>[]): Promise<T[]> {
    const promises = tasks.map(task => this.submitTask(task))
    return Promise.all(promises)
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): boolean {
    // 从队列中移除
    const index = this.taskQueue.findIndex(item => item.task.id === taskId)
    if (index !== -1) {
      const item = this.taskQueue.splice(index, 1)[0]
      item.reject(new Error('Task cancelled'))

      this.recordTaskCompletion(taskId, {
        id: taskId,
        status: TaskStatus.CANCELLED,
        startTime: Date.now(),
        endTime: Date.now(),
        duration: 0,
        retryCount: 0,
      })

      this.emit('task:cancelled', { taskId })
      return true
    }

    return false
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(taskId: string): TaskStatus {
    if (this.runningTasks.has(taskId)) {
      return TaskStatus.RUNNING
    }

    const completed = this.completedTasks.get(taskId)
    if (completed) {
      return completed.status
    }

    return TaskStatus.PENDING
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
