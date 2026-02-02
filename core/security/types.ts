export interface ThreatDetector {
  detectThreats(): Promise<ThreatDetectionResult>;
  analyzeThreatPatterns(): Promise<ThreatPattern[]>;
  generateThreatReport(): Promise<ThreatReport>;
}

export interface ComplianceManager {
  checkCompliance(): Promise<ComplianceStatus>;
  generateComplianceReport(): Promise<ComplianceReport>;
  updateComplianceRules(): Promise<void>;
}

export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  mode: string;
}

export interface AccessControlConfig {
  model: 'RBAC' | 'ABAC' | 'PBAC';
  policies: Policy[];
  roles: Role[];
}

export interface Policy {
  id: string;
  name: string;
  permissions: string[];
  resources: string[];
}

export interface Role {
  id: string;
  name: string;
  policies: string[];
}

export interface DataMaskingConfig {
  fields: string[];
  method: 'hash' | 'mask' | 'tokenize';
  preserveFormat: boolean;
}

export interface AuditTrailConfig {
  enabled: boolean;
  retentionDays: number;
  logLevel: 'info' | 'warn' | 'error' | 'debug';
}

export interface VulnerabilityConfig {
  scanInterval: number;
  severityThreshold: 'low' | 'medium' | 'high' | 'critical';
  autoRemediation: boolean;
}

export interface SecureDevelopmentConfig {
  codeReviewRequired: boolean;
  securityTestingRequired: boolean;
  dependencyScanning: boolean;
}

export interface PenetrationTestingConfig {
  schedule: string;
  scope: string[];
  tools: string[];
}

export interface SecurityMonitoringConfig {
  realTimeAlerts: boolean;
  anomalyDetection: boolean;
  logAggregation: boolean;
}

export interface RegulatoryComplianceConfig {
  frameworks: string[];
  regions: string[];
  auditFrequency: string;
}

export interface DataPrivacyConfig {
  consentManagement: boolean;
  dataMinimization: boolean;
  rightToBeForgotten: boolean;
}

export interface IndustryStandardsConfig {
  standards: string[];
  certifications: string[];
  complianceLevel: string;
}

export interface CertificationManagementConfig {
  activeCertifications: string[];
  renewalReminders: boolean;
  auditPreparation: boolean;
}

export interface DisasterRecoveryConfig {
  rpo: number;
  rto: number;
  backupLocations: string[];
  failoverStrategy: string;
}

export interface BackupStrategyConfig {
  frequency: string;
  retention: number;
  encryption: boolean;
  offsite: boolean;
}

export interface HighAvailabilityConfig {
  loadBalancing: boolean;
  autoScaling: boolean;
  multiRegion: boolean;
  healthChecks: boolean;
}

export interface IncidentResponseConfig {
  responseTeam: string[];
  escalationMatrix: EscalationLevel[];
  notificationChannels: string[];
}

export interface EscalationLevel {
  level: number;
  severity: string;
  contacts: string[];
  responseTime: number;
}

export interface DataSecurity {
  encryption: EncryptionImplementation;
  accessControl: AccessControlImplementation;
  dataMasking: DataMaskingImplementation;
  auditTrail: AuditTrailImplementation;
}

export interface ApplicationSecurity {
  vulnerabilityManagement: VulnerabilityManagement;
  secureDevelopment: SecureDevelopment;
  penetrationTesting: PenetrationTesting;
  securityMonitoring: SecurityMonitoring;
}

export interface Compliance {
  regulatoryCompliance: RegulatoryCompliance;
  dataPrivacy: DataPrivacy;
  industryStandards: IndustryStandards;
  certificationManagement: CertificationManagement;
}

export interface BusinessContinuity {
  disasterRecovery: DisasterRecovery;
  backupStrategy: BackupStrategy;
  highAvailability: HighAvailability;
  incidentResponse: IncidentResponse;
}

export interface EnterpriseSecurity {
  dataSecurity: DataSecurity;
  applicationSecurity: ApplicationSecurity;
  compliance: Compliance;
  businessContinuity: BusinessContinuity;
}

export interface ThreatDetectionResult {
  threats: Threat[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface Threat {
  id: string;
  type: string;
  severity: string;
  description: string;
  affectedResources: string[];
}

export interface ThreatPattern {
  pattern: string;
  frequency: number;
  riskScore: number;
}

export interface ThreatReport {
  summary: string;
  details: Threat[];
  trends: ThreatPattern[];
  recommendations: string[];
}

export interface ComplianceStatus {
  compliant: boolean;
  frameworks: FrameworkStatus[];
  gaps: ComplianceGap[];
  score: number;
}

export interface FrameworkStatus {
  name: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  gaps: ComplianceGap[];
}

export interface ComplianceGap {
  framework: string;
  requirement: string;
  status: string;
  remediation: string;
}

export interface ComplianceReport {
  overallStatus: string;
  frameworkDetails: FrameworkStatus[];
  recommendations: string[];
  nextAuditDate: Date;
}

export interface EncryptionImplementation {
  algorithm: string;
  keyManagement: KeyManagement;
  dataEncryption: DataEncryption;
  keyRotation: KeyRotation;
}

export interface KeyManagement {
  provider: string;
  storage: string;
  rotationPolicy: string;
}

export interface DataEncryption {
  atRest: boolean;
  inTransit: boolean;
  inUse: boolean;
}

export interface KeyRotation {
  enabled: boolean;
  interval: number;
  lastRotation: Date;
}

export interface AccessControlImplementation {
  model: string;
  authentication: Authentication;
  authorization: Authorization;
  sessionManagement: SessionManagement;
}

export interface Authentication {
  methods: string[];
  mfaEnabled: boolean;
  passwordPolicy: PasswordPolicy;
}

export interface PasswordPolicy {
  minLength: number;
  complexity: boolean;
  rotationDays: number;
  historyCount: number;
}

export interface Authorization {
  rbacEnabled: boolean;
  abacEnabled: boolean;
  policyEnforcement: string;
}

export interface SessionManagement {
  timeout: number;
  concurrentLimit: number;
  secureCookies: boolean;
}

export interface DataMaskingImplementation {
  enabled: boolean;
  fields: MaskedField[];
  methods: MaskingMethod[];
}

export interface MaskedField {
  name: string;
  method: string;
  pattern: string;
}

export interface MaskingMethod {
  name: string;
  algorithm: string;
  reversible: boolean;
}

export interface AuditTrailImplementation {
  enabled: boolean;
  events: AuditEvent[];
  retention: number;
  alerting: AuditAlerting;
}

export interface AuditEvent {
  type: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  outcome: string;
}

export interface AuditAlerting {
  enabled: boolean;
  rules: AuditRule[];
  notifications: string[];
}

export interface AuditRule {
  condition: string;
  severity: string;
  action: string;
}

export interface VulnerabilityManagement {
  scanning: VulnerabilityScanning;
  assessment: VulnerabilityAssessment;
  remediation: VulnerabilityRemediation;
}

export interface VulnerabilityScanning {
  enabled: boolean;
  schedule: string;
  tools: string[];
  lastScan: Date;
}

export interface VulnerabilityAssessment {
  totalVulnerabilities: number;
  bySeverity: SeverityBreakdown;
  byCategory: CategoryBreakdown;
}

export interface SeverityBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface CategoryBreakdown {
  [key: string]: number;
}

export interface VulnerabilityRemediation {
  autoRemediation: boolean;
  prioritization: string;
  tracking: boolean;
}

export interface SecureDevelopment {
  sdlc: SDLC;
  codeReview: CodeReview;
  securityTesting: SecurityTesting;
}

export interface SDLC {
  phases: string[];
  securityGates: SecurityGate[];
}

export interface SecurityGate {
  phase: string;
  requirements: string[];
  approvalRequired: boolean;
}

export interface CodeReview {
  enabled: boolean;
  reviewers: number;
  automatedChecks: boolean;
}

export interface SecurityTesting {
  sast: boolean;
  dast: boolean;
  sca: boolean;
  iast: boolean;
}

export interface PenetrationTesting {
  schedule: string;
  scope: string[];
  methodology: string;
  lastTest: Date;
  nextTest: Date;
}

export interface SecurityMonitoring {
  siem: SIEM;
  threatDetection: ThreatDetection;
  incidentResponse: SecurityIncidentResponse;
}

export interface SIEM {
  enabled: boolean;
  integration: string[];
  retention: number;
}

export interface ThreatDetection {
  rules: number;
  mlEnabled: boolean;
  falsePositiveRate: number;
}

export interface SecurityIncidentResponse {
  playbook: string[];
  team: string[];
  automation: boolean;
}

export interface RegulatoryCompliance {
  frameworks: ComplianceFramework[];
  auditTrail: ComplianceAuditTrail;
  reporting: ComplianceReporting;
}

export interface ComplianceFramework {
  name: string;
  status: string;
  lastAudit: Date;
  nextAudit: Date;
  score: number;
}

export interface ComplianceAuditTrail {
  enabled: boolean;
  events: ComplianceEvent[];
  retention: number;
}

export interface ComplianceEvent {
  framework: string;
  requirement: string;
  status: string;
  timestamp: Date;
  evidence: string[];
}

export interface ComplianceReporting {
  frequency: string;
  recipients: string[];
  format: string;
}

export interface DataPrivacy {
  consent: ConsentManagement;
  dataRights: DataRights;
  dataProtection: DataProtection;
}

export interface ConsentManagement {
  enabled: boolean;
  tracking: boolean;
  withdrawal: boolean;
}

export interface DataRights {
  access: boolean;
  rectification: boolean;
  erasure: boolean;
  portability: boolean;
}

export interface DataProtection {
  encryption: boolean;
  anonymization: boolean;
  pseudonymization: boolean;
}

export interface IndustryStandards {
  standards: Standard[];
  certifications: Certification[];
  bestPractices: BestPractice[];
}

export interface Standard {
  name: string;
  version: string;
  status: string;
  lastUpdated: Date;
}

export interface Certification {
  name: string;
  issuer: string;
  validUntil: Date;
  status: string;
}

export interface BestPractice {
  name: string;
  category: string;
  implementation: string;
}

export interface CertificationManagement {
  activeCertifications: Certification[];
  renewalTracking: RenewalTracking;
  auditPreparation: AuditPreparation;
}

export interface RenewalTracking {
  enabled: boolean;
  reminders: number[];
  autoRenewal: boolean;
}

export interface AuditPreparation {
  checklists: Checklist[];
  mockAudits: MockAudit[];
  gapAnalysis: GapAnalysis;
}

export interface Checklist {
  framework: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  requirement: string;
  status: string;
  owner: string;
  dueDate: Date;
}

export interface MockAudit {
  date: Date;
  scope: string[];
  findings: number;
  remediated: number;
}

export interface GapAnalysis {
  lastRun: Date;
  gaps: Gap[];
  remediationPlan: string;
}

export interface Gap {
  area: string;
  severity: string;
  description: string;
  remediation: string;
}

export interface DisasterRecovery {
  plan: DisasterRecoveryPlan;
  testing: DisasterRecoveryTesting;
  recovery: DisasterRecoveryRecovery;
}

export interface DisasterRecoveryPlan {
  version: string;
  lastUpdated: Date;
  approvers: string[];
  rpo: number;
  rto: number;
}

export interface DisasterRecoveryTesting {
  frequency: string;
  lastTest: Date;
  nextTest: Date;
  successRate: number;
}

export interface DisasterRecoveryRecovery {
  procedures: RecoveryProcedure[];
  team: RecoveryTeam;
  communication: CommunicationPlan;
}

export interface RecoveryProcedure {
  scenario: string;
  steps: string[];
  estimatedTime: number;
  responsible: string[];
}

export interface RecoveryTeam {
  primary: string[];
  secondary: string[];
  escalation: string[];
}

export interface CommunicationPlan {
  stakeholders: string[];
  channels: string[];
  templates: string[];
}

export interface BackupStrategy {
  schedule: BackupSchedule;
  retention: BackupRetention;
  storage: BackupStorage;
  verification: BackupVerification;
}

export interface BackupSchedule {
  full: string;
  incremental: string;
  differential: string;
}

export interface BackupRetention {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export interface BackupStorage {
  primary: string;
  secondary: string;
  offsite: boolean;
  encryption: boolean;
}

export interface BackupVerification {
  enabled: boolean;
  frequency: string;
  testRestores: boolean;
}

export interface HighAvailability {
  architecture: HAArchitecture;
  failover: Failover;
  monitoring: HAMonitoring;
}

export interface HAArchitecture {
  type: string;
  redundancy: number;
  loadBalancing: boolean;
  multiRegion: boolean;
}

export interface Failover {
  automatic: boolean;
  manualOverride: boolean;
  testFrequency: string;
  lastTest: Date;
}

export interface HAMonitoring {
  healthChecks: boolean;
  performanceMetrics: boolean;
  alerting: boolean;
}

export interface IncidentResponse {
  plan: IncidentResponsePlan;
  team: IncidentResponseTeam;
  workflow: IncidentResponseWorkflow;
}

export interface IncidentResponsePlan {
  version: string;
  lastUpdated: Date;
  severityLevels: SeverityLevel[];
  responseTimes: ResponseTime[];
}

export interface SeverityLevel {
  level: number;
  name: string;
  criteria: string[];
}

export interface ResponseTime {
  severity: string;
  acknowledge: number;
  investigate: number;
  resolve: number;
}

export interface IncidentResponseTeam {
  members: TeamMember[];
  roles: TeamRole[];
  escalation: EscalationMatrix;
}

export interface TeamMember {
  name: string;
  role: string;
  contact: string;
  availability: string;
}

export interface TeamRole {
  name: string;
  responsibilities: string[];
  authority: string;
}

export interface EscalationMatrix {
  levels: EscalationLevel[];
  notifications: Notification[];
}

export interface Notification {
  channel: string;
  recipients: string[];
  template: string;
}

export interface IncidentResponseWorkflow {
  detection: DetectionWorkflow;
  analysis: AnalysisWorkflow;
  containment: ContainmentWorkflow;
  eradication: EradicationWorkflow;
  recovery: RecoveryWorkflow;
  lessonsLearned: LessonsLearnedWorkflow;
}

export interface DetectionWorkflow {
  methods: string[];
  automation: boolean;
  falsePositiveHandling: string;
}

export interface AnalysisWorkflow {
  tools: string[];
  procedures: string[];
  collaboration: string;
}

export interface ContainmentWorkflow {
  strategies: string[];
  approvalRequired: boolean;
  timeToContain: number;
}

export interface EradicationWorkflow {
  methods: string[];
  verification: string;
  documentation: string;
}

export interface RecoveryWorkflow {
  procedures: string[];
  validation: string[];
  monitoring: string;
}

export interface LessonsLearnedWorkflow {
  review: string;
  documentation: string;
  improvement: string;
}

export interface ComprehensiveSecurityCenterConfig {
  enableThreatDetection: boolean;
  enableComplianceManagement: boolean;
  enableSecurityMonitoring: boolean;
  auditRetentionDays: number;
  alertThresholds: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    responseTime: number;
  };
  encryptionKey?: string;
  enableSecurityAudit?: boolean;
  enablePenetrationTesting?: boolean;
  securityAuditSchedule?: string;
  penetrationTestingSchedule?: string;
}

export interface SecurityAuditResult {
  auditId: string;
  timestamp: Date;
  status: 'pass' | 'fail';
  summary: {
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    complianceScore: number;
  };
  details: {
    vulnerabilityScan: any;
    complianceCheck: any;
    accessReview: any;
    configurationAudit: any;
  };
  recommendations: string[];
}

export interface PenetrationTestResult {
  testId: string;
  timestamp: Date;
  status: 'pass' | 'fail';
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    criticalIssues: number;
  };
  details: {
    networkTests: any;
    applicationTests: any;
    apiTests: any;
    socialEngineeringTests: any;
  };
  recommendations: string[];
}

export interface VulnerabilityScanResult {
  scanId: string;
  timestamp: Date;
  vulnerabilities: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedComponents: string[];
    remediation: string;
  }>;
}

export interface ComplianceCheckResult {
  checkId: string;
  timestamp: Date;
  overallStatus: 'compliant' | 'non-compliant' | 'partial';
  frameworks: Array<{
    name: string;
    status: 'compliant' | 'non-compliant' | 'partial';
    score: number;
    gaps: string[];
  }>;
}

export interface AccessReviewResult {
  reviewId: string;
  timestamp: Date;
  status: 'pass' | 'fail';
  summary: {
    totalUsers: number;
    totalRoles: number;
    excessivePrivileges: number;
    orphanedAccounts: number;
  };
  details: Array<{
    userId: string;
    issues: string[];
  }>;
}

export interface ConfigurationAuditResult {
  auditId: string;
  timestamp: Date;
  status: 'pass' | 'fail';
  summary: {
    totalConfigurations: number;
    compliantConfigurations: number;
    nonCompliantConfigurations: number;
  };
  details: Array<{
    configuration: string;
    status: 'compliant' | 'non-compliant';
    issues: string[];
  }>;
}

export interface NetworkTestResult {
  testId: string;
  timestamp: Date;
  status: 'pass' | 'fail';
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
  };
  details: Array<{
    testName: string;
    status: 'pass' | 'fail';
    details: string;
  }>;
}

export interface ApplicationTestResult {
  testId: string;
  timestamp: Date;
  status: 'pass' | 'fail';
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
  };
  details: Array<{
    testName: string;
    status: 'pass' | 'fail';
    details: string;
  }>;
}

export interface APITestResult {
  testId: string;
  timestamp: Date;
  status: 'pass' | 'fail';
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
  };
  details: Array<{
    endpoint: string;
    status: 'pass' | 'fail';
    issues: string[];
  }>;
}

export interface SocialEngineeringTestResult {
  testId: string;
  timestamp: Date;
  status: 'pass' | 'fail';
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
  };
  details: Array<{
    testName: string;
    status: 'pass' | 'fail';
    details: string;
  }>;
}

export interface SecurityAuditData {
  vulnerabilityScan: VulnerabilityScanResult;
  complianceCheck: ComplianceCheckResult;
  accessReview: AccessReviewResult;
  configurationAudit: ConfigurationAuditResult;
  duration: number;
}
