import EventEmitter from 'eventemitter3';

export interface MonitoringSystem extends EventEmitter {
  startMonitoring(config: MonitoringConfig): Promise<void>;
  stopMonitoring(): Promise<void>;
  getMonitoringStatus(): Promise<MonitoringStatus>;
  getRealTimeMetrics(): Promise<Metric[]>;
  getHistoricalMetrics(query: MetricsQuery): Promise<Metric[]>;
}

export interface MonitoringConfig {
  collectionInterval: number;
  retentionDays: number;
  enabledModules: MonitoringModule[];
  customMetrics?: CustomMetricConfig[];
}

export enum MonitoringModule {
  SYSTEM_METRICS = 'system-metrics',
  APPLICATION_METRICS = 'application-metrics',
  LOGS = 'logs',
  TRACES = 'traces',
  EVENTS = 'events'
}

export interface MonitoringStatus {
  isRunning: boolean;
  startedAt?: Date;
  metricsCollected: number;
  alertsTriggered: number;
  healthStatus: HealthStatus;
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
}

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  unit: string;
  labels: Record<string, string>;
  timestamp: Date;
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

export interface MetricsQuery {
  name?: string;
  startTime: Date;
  endTime: Date;
  labelFilters?: LabelFilter[];
  aggregation?: AggregationType;
  interval?: number;
  metricName?: string;
  labels?: LabelFilter[];
  labelValues?: Record<string, string>;
}

export interface LabelFilter {
  name: string;
  operator: FilterOperator;
  value: string;
}

export enum FilterOperator {
  EQUAL = '=',
  NOT_EQUAL = '!=',
  MATCH_REGEX = '=~',
  NOT_MATCH_REGEX = '!~'
}

export enum AggregationType {
  AVG = 'avg',
  MAX = 'max',
  MIN = 'min',
  SUM = 'sum',
  COUNT = 'count'
}

export interface CustomMetricConfig {
  name: string;
  type: string;
  description: string;
  labels: string[];
  buckets?: number[];
}

export interface AlertSystem extends EventEmitter {
  createAlertRule(rule: AlertRule): Promise<AlertRule>;
  updateAlertRule(ruleId: string, rule: Partial<AlertRule>): Promise<AlertRule>;
  deleteAlertRule(ruleId: string): Promise<void>;
  getAlertRules(query?: AlertRuleQuery): Promise<AlertRule[]>;
  getAlerts(query?: AlertQuery): Promise<Alert[]>;
  acknowledgeAlert(alertId: string, comment?: string): Promise<void>;
  closeAlert(alertId: string, comment?: string): Promise<void>;
  getAlertStatistics(query?: AlertStatisticsQuery): Promise<AlertStatistics>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metricName: string;
  query: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  notificationChannels: NotificationChannel[];
  suppressionRules?: SuppressionRule[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  triggeredCount?: number;
  message?: string;
  lastTriggeredAt?: Date;
}

export interface AlertCondition {
  operator: AlertOperator;
  threshold: number;
  duration?: number;
}

export enum AlertOperator {
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  EQUAL = '==',
  NOT_EQUAL = '!='
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  SLACK = 'slack',
  DINGTALK = 'dingtalk',
  WEWORK = 'wework'
}

export interface NotificationChannelConfig {
  id: string;
  type: NotificationChannel;
  config: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  enabled: boolean;
  recipients?: string[];
}

export interface SuppressionRule {
  id: string;
  name: string;
  condition: string;
  duration: number;
  enabled: boolean;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  metricName: string;
  severity: AlertSeverity;
  message: string;
  currentValue: number;
  threshold: number;
  labels: Record<string, string>;
  status: AlertStatus;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  acknowledgementComment?: string;
  closedAt?: Date;
  closedBy?: string;
  closeComment?: string;
  timestamp: Date;
  count?: number;
  lastOccurrence?: Date;
  updatedAt?: Date;
  metricValue?: number;
}

export enum AlertStatus {
  OPEN = 'open',
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  CLOSED = 'closed'
}

export interface AlertQuery {
  ruleId?: string;
  severity?: AlertSeverity;
  status?: AlertStatus;
  startTime?: Date;
  endTime?: Date;
  labelFilters?: LabelFilter[];
  pagination?: PaginationParams;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface AlertStatistics {
  total: number;
  active: number;
  acknowledged: number;
  closed: number;
  bySeverity: Record<AlertSeverity, number>;
  avgResponseTime: number;
  avgResolutionTime: number;
  byStatus: Record<AlertStatus, number>;
  closedCount?: number;
  triggeredCount?: number;
}

export interface AlertRuleQuery {
  enabled?: boolean;
  severity?: AlertSeverity;
  metricName?: string;
}

export interface AlertStatisticsQuery {
  startTime: Date;
  endTime: Date;
}

export interface NotificationSystem extends EventEmitter {
  sendNotification(notification: Notification): Promise<void>;
  sendNotifications(notifications: Notification[]): Promise<void>;
  getNotificationHistory(query: NotificationQuery): Promise<Notification[]>;
  getNotificationStatistics(query: NotificationStatisticsQuery): Promise<NotificationStatistics>;
}

export interface Notification {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  content: string;
  recipients: string[];
  attachments?: Attachment[];
  priority: NotificationPriority;
  status: NotificationStatus;
  sentAt?: Date;
  receivedAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  updatedAt?: Date;
  deliveredAt?: Date;
  error?: string;
  timestamp?: Date;
  metadata?: any;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  body: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  content?: string;
}

export enum NotificationType {
  ALERT = 'alert',
  REPORT = 'report',
  SYSTEM = 'system',
  CUSTOM = 'custom'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENDING = 'sending',
  SENT = 'sent',
  RECEIVED = 'received',
  FAILED = 'failed'
}

export interface Attachment {
  filename: string;
  contentType: string;
  content: string;
  size: number;
}

export interface NotificationQuery {
  type?: NotificationType;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  startTime?: Date;
  endTime?: Date;
  pagination?: PaginationParams;
}

export interface NotificationStatistics {
  total: number;
  success: number;
  failed: number;
  successRate: number;
  byChannel: Record<NotificationChannel, number>;
  byType: Record<NotificationType, number>;
}

export interface NotificationStatisticsQuery {
  startTime: Date;
  endTime: Date;
}

export interface AnalysisSystem extends EventEmitter {
  analyzeMetrics(query: MetricsQuery): Promise<AnalysisResult>;
  detectAnomalies(query: MetricsQuery): Promise<Anomaly[]>;
  analyzeTrends(query: MetricsQuery): Promise<Trend[]>;
  correlateMetrics(metrics: string[]): Promise<CorrelationResult[]>;
  analyzeRootCause(alert: Alert): Promise<RootCauseResult>;
  getAnomalyHistory(query: MetricsQuery): Promise<Anomaly[]>;
}

export interface AnalysisResult {
  metricName: string;
  statistics: MetricStatistics;
  trend: Trend;
  anomalies: Anomaly[];
  analyzedAt: Date;
}

export interface MetricStatistics {
  avg: number;
  max: number;
  min: number;
  median: number;
  stdDev: number;
  percentiles: Record<string, number>;
}

export interface Trend {
  direction: TrendDirection;
  strength: number;
  forecast?: number;
  confidenceInterval?: [number, number];
  confidence?: number;
}

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable'
}

export interface Anomaly {
  id: string;
  metricName: string;
  type: AnomalyType;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: AnomalySeverity;
  startTime: Date;
  endTime?: Date;
  description: string;
  confidence?: number;
}

export enum AnomalyType {
  SPIKE = 'spike',
  DROP = 'drop',
  TREND_CHANGE = 'trend-change',
  SEASONAL = 'seasonal',
  UNKNOWN = 'unknown'
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface CorrelationResult {
  metric1: string;
  metric2: string;
  correlation: number;
  strength: CorrelationStrength;
  lag?: number;
  significance?: number;
}

export enum CorrelationStrength {
  STRONG_POSITIVE = 'strong-positive',
  MODERATE_POSITIVE = 'moderate-positive',
  WEAK_POSITIVE = 'weak-positive',
  NONE = 'none',
  WEAK_NEGATIVE = 'weak-negative',
  MODERATE_NEGATIVE = 'moderate-negative',
  STRONG_NEGATIVE = 'strong-negative'
}

export interface RootCauseResult {
  alertId: string;
  rootCause: string;
  confidence: number;
  relatedMetrics: string[];
  possibleCauses: PossibleCause[];
  recommendations: Recommendation[];
  analyzedAt: Date;
}

export interface PossibleCause {
  description: string;
  probability: number;
  evidence: string[];
}

export interface Recommendation {
  description: string;
  priority: RecommendationPriority;
  expectedImpact: string;
}

export enum RecommendationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface Logger {
  debug(message: string, context?: string, metadata?: Record<string, unknown>): void;
  info(message: string, context?: string, metadata?: Record<string, unknown>): void;
  warn(message: string, context?: string, metadata?: Record<string, unknown>, error?: Error): void;
  error(message: string, context?: string, metadata?: Record<string, unknown>, error?: Error): void;
}

export interface MetricCollector {
  collect(): Promise<Metric[]>;
}

export interface AnomalyDetector {
  detect(metrics: Metric[]): Promise<Anomaly[]>;
}

export interface NotificationChannelProvider {
  send(notification: Notification): Promise<void>;
}
