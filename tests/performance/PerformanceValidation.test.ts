/**
 * @file 性能测试验证套件
 * @description 验证YYC³系统的性能优化效果
 *
 * 运行方式：
 * - 跳过：默认行为（pnpm test）
 * - 执行：RUN_PERF=true pnpm test tests/performance/
 *
 * @module __tests__/performance/PerformanceValidation.test
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-20
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AutonomousAIEngine } from '../../core/AutonomousAIEngine'
import { CacheLayer } from '../../core/cache/CacheLayer'
import { StateManager } from '../../core/state-manager/StateManager'
import { MessageBus } from '../../core/MessageBus'
import * as os from 'os'
import * as v8 from 'v8'

// 性能测试门控：仅在明确指定时运行
const shouldRunPerformanceTests = process.env.RUN_PERF === 'true'
const describePerf = shouldRunPerformanceTests ? describe : describe.skip

describePerf('性能测试验证', () => {
  let engine: AutonomousAIEngine
  let cache: CacheLayer
  let stateManager: StateManager
  let messageBus: MessageBus

  beforeEach(async () => {
    engine = new AutonomousAIEngine({
      enableOptimizations: true,
      enableCaching: true,
    })

    cache = new IntelligentCacheLayer({
      l1Size: 10000,
      l1TTL: 60000,
      enableCompression: false,
    })

    stateManager = new StateManager({
      persistInterval: 5000,
      enableOptimizations: true,
    })

    messageBus = new MessageBus()

    await engine.initialize()
  })

  afterEach(async () => {
    await engine.shutdown()
    if (stateManager && typeof stateManager.shutdown === 'function') {
      await stateManager.shutdown()
    }
    if (cache && typeof cache.clear === 'function') {
      cache.clear()
    }
  })

  describe('响应时间测试', () => {
    it('API响应时间应小于200ms (P95)', async () => {
      const iterations = 100
      const responseTimes: number[] = []

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now()
        await engine.sendMessage({
          to: 'system',
          content: `测试消息 ${i}`,
        })
        responseTimes.push(Date.now() - startTime)
      }

      // 计算P95响应时间
      responseTimes.sort((a, b) => a - b)
      const p95Index = Math.floor(iterations * 0.95)
      const p95Time = responseTimes[p95Index]

      expect(p95Time).toBeLessThan(200)

      console.log(`P95响应时间: ${p95Time}ms`)
      console.log(`平均响应时间: ${responseTimes.reduce((a, b) => a + b) / iterations}ms`)
    })

    it('页面加载时间应小于2秒 (P95)', async () => {
      const iterations = 50
      const loadTimes: number[] = []

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now()

        // 模拟页面加载流程
        await Promise.all([engine.initialize(), stateManager.loadState(), cache.warmup?.()])

        loadTimes.push(Date.now() - startTime)

        await engine.shutdown()
      }

      loadTimes.sort((a, b) => a - b)
      const p95Index = Math.floor(iterations * 0.95)
      const p95Time = loadTimes[p95Index]

      expect(p95Time).toBeLessThan(2000)

      console.log(`P95加载时间: ${p95Time}ms`)
    })

    it('同步操作时间应小于5秒 (P95)', async () => {
      const iterations = 20
      const syncTimes: number[] = []

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now()

        // 模拟同步操作
        await engine.syncData({
          source: 'local',
          target: 'remote',
          dataSize: 1000,
        })

        syncTimes.push(Date.now() - startTime)
      }

      syncTimes.sort((a, b) => a - b)
      const p95Index = Math.floor(iterations * 0.95)
      const p95Time = syncTimes[p95Index]

      expect(p95Time).toBeLessThan(5000)

      console.log(`P95同步时间: ${p95Time}ms`)
    })
  })

  describe('吞吐量测试', () => {
    it('API QPS应大于等于1000', async () => {
      const duration = 10000 // 10秒
      const startTime = Date.now()
      let requestCount = 0

      // 持续发送请求
      while (Date.now() - startTime < duration) {
        await engine.sendMessage({
          to: 'system',
          content: `性能测试 ${requestCount}`,
        })
        requestCount++
      }

      const actualDuration = Date.now() - startTime
      const qps = (requestCount / actualDuration) * 1000

      expect(qps).toBeGreaterThanOrEqual(1000)

      console.log(`实际QPS: ${qps.toFixed(2)}`)
      console.log(`总请求数: ${requestCount}`)
    })

    it('并发用户数应大于等于100', async () => {
      const concurrentUsers = 100
      const requestsPerUser = 10

      const startTime = Date.now()

      const userRequests = Array.from({ length: concurrentUsers }, (_, userId) =>
        Promise.all(
          Array.from({ length: requestsPerUser }, async (_, reqId) => {
            await engine.sendMessage({
              to: 'system',
              content: `用户${userId}-请求${reqId}`,
              metadata: { userId, reqId },
            })
          })
        )
      )

      await Promise.all(userRequests)

      const duration = Date.now() - startTime
      const totalRequests = concurrentUsers * requestsPerUser
      const qps = (totalRequests / duration) * 1000

      expect(qps).toBeGreaterThan(0)

      console.log(`并发用户数: ${concurrentUsers}`)
      console.log(`总请求数: ${totalRequests}`)
      console.log(`完成时间: ${duration}ms`)
      console.log(`平均QPS: ${qps.toFixed(2)}`)
    })

    it('同步任务数应大于等于50/min', async () => {
      const duration = 60000 // 1分钟
      const startTime = Date.now()
      const syncTasks: Promise<any>[] = []

      // 持续创建同步任务
      const interval = setInterval(() => {
        if (Date.now() - startTime < duration) {
          syncTasks.push(
            engine.syncData({
              source: 'local',
              target: 'remote',
              dataSize: 100,
            })
          )
        }
      }, 1000) // 每秒创建一个

      // 等待测试完成
      await new Promise(resolve => setTimeout(resolve, duration))
      clearInterval(interval)

      await Promise.all(syncTasks)

      const tasksPerMinute = syncTasks.length
      expect(tasksPerMinute).toBeGreaterThanOrEqual(50)

      console.log(`每分钟同步任务数: ${tasksPerMinute}`)
    })
  })

  describe('可用性测试', () => {
    it('系统可用性应大于等于99.9%', async () => {
      const totalChecks = 1000
      let successCount = 0

      for (let i = 0; i < totalChecks; i++) {
        try {
          const health = await engine.healthCheck()
          if (health.healthy) {
            successCount++
          }
        } catch (error) {
          // 健康检查失败
        }
      }

      const availability = (successCount / totalChecks) * 100
      expect(availability).toBeGreaterThanOrEqual(99.9)

      console.log(`系统可用性: ${availability.toFixed(3)}%`)
    })

    it('数据一致性应大于等于99.99%', async () => {
      const iterations = 10000
      let consistentCount = 0

      for (let i = 0; i < iterations; i++) {
        const key = `test-key-${i}`
        const value = { data: `test-${i}`, timestamp: Date.now() }

        // 写入数据
        await stateManager.setState(key, value)
        cache.set(key, value)

        // 立即读取验证
        const stateValue = await stateManager.getState(key)
        const cacheValue = cache.get(key)

        if (
          JSON.stringify(stateValue) === JSON.stringify(value) &&
          JSON.stringify(cacheValue) === JSON.stringify(value)
        ) {
          consistentCount++
        }
      }

      const consistency = (consistentCount / iterations) * 100
      expect(consistency).toBeGreaterThanOrEqual(99.99)

      console.log(`数据一致性: ${consistency.toFixed(3)}%`)
    })

    it('错误率应小于等于0.1%', async () => {
      const iterations = 1000
      let errorCount = 0

      for (let i = 0; i < iterations; i++) {
        try {
          await engine.sendMessage({
            to: 'system',
            content: `测试 ${i}`,
          })
        } catch (error) {
          errorCount++
        }
      }

      const errorRate = (errorCount / iterations) * 100
      expect(errorRate).toBeLessThanOrEqual(0.1)

      console.log(`错误率: ${errorRate.toFixed(3)}%`)
    })
  })

  describe('资源使用测试', () => {
    it('CPU使用率应小于等于70%', async () => {
      const cpuUsage: number[] = []
      const duration = 10000
      const startTime = Date.now()

      // 监控CPU使用率
      const monitorInterval = setInterval(() => {
        const usage = process.cpuUsage()
        const totalUsage = (usage.user + usage.system) / 1000000 // 转换为秒
        cpuUsage.push(totalUsage)
      }, 100)

      // 执行负载
      while (Date.now() - startTime < duration) {
        await engine.sendMessage({
          to: 'system',
          content: '负载测试',
        })
      }

      clearInterval(monitorInterval)

      // 计算平均CPU使用率
      const avgCPU = cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length
      const cpuPercent = (avgCPU / os.cpus().length) * 100

      expect(cpuPercent).toBeLessThanOrEqual(70)

      console.log(`平均CPU使用率: ${cpuPercent.toFixed(2)}%`)
    })

    it('内存使用率应小于等于80%', async () => {
      const memorySnapshots: number[] = []
      const iterations = 100

      for (let i = 0; i < iterations; i++) {
        // 创建一些数据
        const data = Array.from({ length: 1000 }, (_, j) => ({
          id: `${i}-${j}`,
          data: new Array(100).fill(i),
        }))

        await stateManager.setState(`batch-${i}`, data)

        const usage = process.memoryUsage()
        memorySnapshots.push(usage.heapUsed)
      }

      // 计算内存使用率
      const totalMemory = os.totalmem()
      const maxUsed = Math.max(...memorySnapshots)
      const memoryPercent = (maxUsed / totalMemory) * 100

      expect(memoryPercent).toBeLessThanOrEqual(80)

      console.log(`最大内存使用: ${(maxUsed / 1024 / 1024).toFixed(2)}MB`)
      console.log(`内存使用率: ${memoryPercent.toFixed(2)}%`)
    })

    it('磁盘I/O应小于等于80%', async () => {
      // 注意：实际磁盘I/O监控需要系统级工具
      // 这里使用模拟测试
      const writeOperations = 100
      const startTime = Date.now()

      for (let i = 0; i < writeOperations; i++) {
        await stateManager.setState(`disk-test-${i}`, {
          data: new Array(1000).fill(i),
        })
      }

      const duration = Date.now() - startTime
      const opsPerSecond = (writeOperations / duration) * 1000

      // 假设基准性能是1000 ops/s
      const ioUsagePercent = Math.min((opsPerSecond / 1000) * 100, 100)

      expect(ioUsagePercent).toBeLessThanOrEqual(80)

      console.log(`磁盘I/O操作: ${opsPerSecond.toFixed(2)} ops/s`)
    })
  })

  describe('缓存性能测试', () => {
    it('缓存命中率应大于80%', async () => {
      const iterations = 1000
      let hits = 0
      let misses = 0

      // 先写入一些数据
      for (let i = 0; i < 100; i++) {
        cache.set(`key-${i}`, { value: i })
      }

      // 读取数据，模拟80%的重复读取
      for (let i = 0; i < iterations; i++) {
        const key =
          i < iterations * 0.8
            ? `key-${i % 100}` // 80%命中
            : `key-${i}` // 20%未命中

        const value = cache.get(key)
        if (value !== undefined) {
          hits++
        } else {
          misses++
        }
      }

      const hitRate = (hits / (hits + misses)) * 100
      expect(hitRate).toBeGreaterThan(80)

      console.log(`缓存命中率: ${hitRate.toFixed(2)}%`)
      console.log(`命中: ${hits}, 未命中: ${misses}`)
    })

    it('缓存操作应在1ms内完成', async () => {
      const operations = 10000
      const times: number[] = []

      for (let i = 0; i < operations; i++) {
        const startTime = process.hrtime.bigint()
        cache.set(`perf-test-${i}`, { value: i })
        cache.get(`perf-test-${i}`)
        const endTime = process.hrtime.bigint()

        times.push(Number(endTime - startTime) / 1000000) // 转换为ms
      }

      const avgTime = times.reduce((a, b) => a + b) / times.length
      const maxTime = Math.max(...times)

      expect(avgTime).toBeLessThan(1)

      console.log(`平均缓存操作时间: ${avgTime.toFixed(3)}ms`)
      console.log(`最大缓存操作时间: ${maxTime.toFixed(3)}ms`)
    })
  })

  describe('并发处理性能测试', () => {
    it('应能处理1000个并发请求', async () => {
      const concurrency = 1000
      const startTime = Date.now()

      const requests = Array.from({ length: concurrency }, (_, i) =>
        engine.sendMessage({
          to: 'system',
          content: `并发测试 ${i}`,
        })
      )

      await Promise.all(requests)

      const duration = Date.now() - startTime
      const avgTime = duration / concurrency

      expect(avgTime).toBeLessThan(100) // 平均每个请求少于100ms

      console.log(`1000并发请求完成时间: ${duration}ms`)
      console.log(`平均每请求时间: ${avgTime.toFixed(2)}ms`)
    })

    it('应能处理高并发写入操作', async () => {
      const concurrency = 500
      const startTime = Date.now()

      const writes = Array.from({ length: concurrency }, (_, i) =>
        stateManager.setState(`concurrent-${i}`, {
          data: `test-${i}`,
          timestamp: Date.now(),
        })
      )

      await Promise.all(writes)

      const duration = Date.now() - startTime
      const throughput = (concurrency / duration) * 1000 // ops/s

      expect(throughput).toBeGreaterThan(100) // 至少100 ops/s

      console.log(`并发写入吞吐量: ${throughput.toFixed(2)} ops/s`)
    })
  })

  describe('内存泄漏测试', () => {
    it('长时间运行不应有内存泄漏', async () => {
      const iterations = 1000
      const memorySnapshots: number[] = []

      // 记录初始内存
      global.gc?.() // 触发垃圾回收（需要--expose-gc标志）
      const initialMemory = process.memoryUsage().heapUsed

      // 执行大量操作
      for (let i = 0; i < iterations; i++) {
        await engine.sendMessage({
          to: 'system',
          content: `内存测试 ${i}`,
        })

        if (i % 100 === 0) {
          global.gc?.()
          memorySnapshots.push(process.memoryUsage().heapUsed)
        }
      }

      global.gc?.()
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory
      const increaseMB = memoryIncrease / 1024 / 1024

      // 内存增长应该小于10MB
      expect(increaseMB).toBeLessThan(10)

      console.log(`初始内存: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`)
      console.log(`最终内存: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`)
      console.log(`内存增长: ${increaseMB.toFixed(2)}MB`)
    })
  })

  describe('数据库查询性能测试', () => {
    it('简单查询应在50ms内完成', async () => {
      const queries = 100
      const times: number[] = []

      for (let i = 0; i < queries; i++) {
        const startTime = Date.now()
        await stateManager.getState(`simple-query-${i % 10}`)
        times.push(Date.now() - startTime)
      }

      const avgTime = times.reduce((a, b) => a + b) / times.length
      expect(avgTime).toBeLessThan(50)

      console.log(`平均查询时间: ${avgTime.toFixed(2)}ms`)
    })

    it('复杂查询应在200ms内完成', async () => {
      const queries = 50
      const times: number[] = []

      for (let i = 0; i < queries; i++) {
        const startTime = Date.now()
        // 模拟复杂查询
        await stateManager.queryStates({
          filters: { type: 'complex' },
          sort: { field: 'timestamp', order: 'desc' },
          limit: 100,
        })
        times.push(Date.now() - startTime)
      }

      const avgTime = times.reduce((a, b) => a + b) / times.length
      expect(avgTime).toBeLessThan(200)

      console.log(`复杂查询平均时间: ${avgTime.toFixed(2)}ms`)
    })
  })
})
