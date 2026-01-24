export interface PerformanceTestConfig {
  testName: string;
  iterations: number;
  concurrency: number;
  warmupIterations?: number;
  timeout?: number;
}

export interface PerformanceTestResult {
  testName: string;
  iterations: number;
  concurrency: number;
  totalDuration: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  percentile95: number;
  percentile99: number;
  throughput: number;
  successCount: number;
  failureCount: number;
  errorRate: number;
  memoryUsage: MemoryUsage;
  cpuUsage: CpuUsage;
  timestamp: number;
}

export interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  arrayBuffers: number;
}

export interface CpuUsage {
  user: number;
  system: number;
  percent: number;
}

export interface PerformanceBenchmark {
  testName: string;
  baseline: PerformanceTestResult;
  current: PerformanceTestResult;
  comparison: {
    durationChange: number;
    durationChangePercent: number;
    throughputChange: number;
    throughputChangePercent: number;
    memoryChange: number;
    memoryChangePercent: number;
  };
  passed: boolean;
  criteria: {
    maxDuration?: number;
    minThroughput?: number;
    maxMemory?: number;
    maxErrorRate?: number;
  };
}

export interface StressTestConfig {
  testName: string;
  startConcurrency: number;
  endConcurrency: number;
  step: number;
  iterationsPerStep: number;
  rampUpTime?: number;
}

export interface StressTestResult {
  testName: string;
  results: PerformanceTestResult[];
  breakingPoint: {
    concurrency: number;
    errorRate: number;
    averageDuration: number;
  };
  recommendations: string[];
}

export interface LoadTestConfig {
  testName: string;
  duration: number;
  targetRPS: number;
  rampUpTime?: number;
}

export interface LoadTestResult {
  testName: string;
  duration: number;
  targetRPS: number;
  actualRPS: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  averageLatency: number;
  percentile95: number;
  percentile99: number;
  minLatency: number;
  maxLatency: number;
  memoryUsage: MemoryUsage;
  cpuUsage: CpuUsage;
}

export interface PerformanceReport {
  reportId: string;
  generatedAt: number;
  environment: {
    nodeVersion: string;
    platform: string;
    arch: string;
    cpus: number;
    totalMemory: number;
    freeMemory: number;
  };
  tests: {
    benchmarks: PerformanceBenchmark[];
    stressTests: StressTestResult[];
    loadTests: LoadTestResult[];
  };
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    overallScore: number;
    recommendations: string[];
  };
}
