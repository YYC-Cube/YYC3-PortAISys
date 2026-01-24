/**
 * @file 性能测试框架类型定义
 * @description 定义性能测试框架的核心类型和接口
 * @module performance-testing
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-07
 */

export enum TestType {
  BASELINE = 'baseline',
  STRESS = 'stress',
  MONITORING = 'monitoring',
  ANALYSIS = 'analysis'
}

export enum TestStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum MetricType {
  RESPONSE_TIME = 'response_time',
  THROUGHPUT = 'throughput',
  ACCURACY = 'accuracy',
  RESOURCE_UTILIZATION = 'resource_utilization',
  ERROR_RATE = 'error_rate',
  CUSTOM = 'custom'
}

export interface PerformanceMetric {
  name: string;
  type: MetricType;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PerformanceThreshold {
  metricName: string;
  warningThreshold: number;
  criticalThreshold: number;
  comparison: 'less_than' | 'greater_than' | 'equals';
  enabled: boolean;
}

export interface PerformanceTestConfig {
  testId: string;
  testName: string;
  testType: TestType;
  description?: string;
  duration: number;
  concurrency: number;
  rampUpTime?: number;
  thresholds: PerformanceThreshold[];
  customMetrics?: string[];
  tags?: string[];
  environment?: 'development' | 'staging' | 'production';
}

export interface PerformanceTestResult {
  testId: string;
  testName: string;
  testType: TestType;
  status: TestStatus;
  startTime: Date;
  endTime: Date;
  duration: number;
  metrics: PerformanceMetric[];
  thresholds: PerformanceThreshold[];
  violations: ThresholdViolation[];
  summary: TestSummary;
  rawResults?: any[];
  metadata?: Record<string, any>;
}

export interface ThresholdViolation {
  metricName: string;
  threshold: PerformanceThreshold;
  actualValue: number;
  severity: 'warning' | 'critical';
  timestamp: Date;
}

export interface TestSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  errorRate: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    network: number;
  };
}

export interface PerformanceTestEngine {
  runTest(config: PerformanceTestConfig): Promise<PerformanceTestResult>;
  runBaselineTest(config: PerformanceTestConfig): Promise<PerformanceTestResult>;
  runStressTest(config: PerformanceTestConfig): Promise<PerformanceTestResult>;
  runMonitoringTest(config: PerformanceTestConfig): Promise<PerformanceTestResult>;
  runAnalysisTest(config: PerformanceTestConfig): Promise<PerformanceTestResult>;
  cancelTest(testId: string): Promise<void>;
  getTestStatus(testId: string): Promise<TestStatus>;
}

export interface PerformanceMonitor {
  startMonitoring(testId: string): Promise<void>;
  stopMonitoring(testId: string): Promise<void>;
  collectMetrics(testId: string): Promise<PerformanceMetric[]>;
  checkThresholds(metrics: PerformanceMetric[], thresholds: PerformanceThreshold[]): ThresholdViolation[];
}

export interface PerformanceAnalyzer {
  analyzeResults(results: PerformanceTestResult): AnalysisReport;
  compareResults(baseline: PerformanceTestResult, current: PerformanceTestResult): ComparisonReport;
  identifyBottlenecks(results: PerformanceTestResult): BottleneckReport[];
  generateRecommendations(results: PerformanceTestResult): Recommendation[];
}

export interface AnalysisReport {
  testId: string;
  testName: string;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  keyFindings: Finding[];
  trends: Trend[];
  anomalies: Anomaly[];
  recommendations: Recommendation[];
}

export interface ComparisonReport {
  baselineTestId: string;
  currentTestId: string;
  comparisonDate: Date;
  metricsComparison: MetricComparison[];
  performanceChange: PerformanceChange;
  regressionAnalysis: RegressionAnalysis;
}

export interface MetricComparison {
  metricName: string;
  baselineValue: number;
  currentValue: number;
  change: number;
  changePercentage: number;
  significance: 'significant' | 'moderate' | 'negligible';
}

export interface PerformanceChange {
  overall: 'improved' | 'degraded' | 'stable';
  responseTime: number;
  throughput: number;
  errorRate: number;
  resourceUtilization: number;
}

export interface RegressionAnalysis {
  hasRegression: boolean;
  regressedMetrics: string[];
  regressionSeverity: 'minor' | 'moderate' | 'major' | 'critical';
  impact: string;
}

export interface BottleneckReport {
  type: 'cpu' | 'memory' | 'network' | 'database' | 'custom';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  metrics: PerformanceMetric[];
  impact: string;
  suggestions: string[];
}

export interface Finding {
  type: 'positive' | 'negative' | 'neutral';
  category: string;
  description: string;
  evidence: PerformanceMetric[];
}

export interface Trend {
  metricName: string;
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  significance: 'significant' | 'moderate' | 'negligible';
}

export interface Anomaly {
  metricName: string;
  value: number;
  expectedValue: number;
  deviation: number;
  timestamp: Date;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  metrics: string[];
}

export interface Logger {
  info(message: string, metadata?: Record<string, any>): void;
  warn(message: string, metadata?: Record<string, any>): void;
  error(message: string, error?: Error, metadata?: Record<string, any>): void;
  debug(message: string, metadata?: Record<string, any>): void;
}

export interface PerformanceTestRunner {
  run(): Promise<PerformanceTestResult>;
  cancel(): Promise<void>;
  getStatus(): TestStatus;
}

export interface TestScenario {
  name: string;
  description: string;
  config: PerformanceTestConfig;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  executeRequest: () => Promise<any>;
}
