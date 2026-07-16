# YYC³ PortAISys - Security Review Guidelines

## Security Context

YYC³ PortAISys is a mission-critical AI system for port and logistics operations. Security vulnerabilities can lead to:

- Unauthorized access to sensitive port operational data
- Data breaches affecting shipping and customer information
- Service disruption impacting port operations
- Regulatory compliance violations (GDPR, SOC 2, ISO 27001)
- AI model poisoning or adversarial attacks
- Supply chain compromise through malicious plugins

**Security Severity**: CRITICAL - Always treat security issues as highest priority.

## Security Architecture Overview

### Implemented Security Layers

1. **Authentication**: NextAuth.js v5 with multi-factor support
2. **Authorization**: RBAC (ADMIN, MODERATOR, USER, GUEST)
3. **Encryption**: End-to-end encryption for sensitive data
4. **Input Validation**: Zod schemas throughout
5. **Audit Logging**: Complete operation trails (7-year retention)
6. **Compliance**: GDPR, SOC 2 Type II, ISO 27001 monitoring
7. **Threat Detection**: Real-time pattern analysis
8. **Vulnerability Scanning**: Automated security scanning
9. **Incident Response**: Automated escalation workflows

### Security Modules

```
core/security/
├── ComprehensiveSecurityCenter.ts    # Central security hub
├── ThreatDetector.ts                 # Real-time threat detection
├── ComplianceManager.ts              # Regulatory compliance
├── VulnerabilityScanner.ts           # Security scanning
├── AuditLogger.ts                    # Audit trail management
├── EncryptionService.ts              # Data encryption
└── IncidentResponseSystem.ts         # Security incident handling
```

## Critical Security Checks

### 1. Authentication & Authorization

#### Must Check

**Authentication**:

```typescript
// ✅ Preferred: Use NextAuth session validation
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  // Proceed with authenticated logic
}

// ❌ Discouraged: Custom auth without proper validation
if (request.headers.get("Authorization")) {
  // Unsafe - no token verification
}
```

**Authorization (RBAC)**:

```typescript
// ✅ Preferred: Check user role/permissions
import { hasPermission } from "@/core/security/permissions";

if (!hasPermission(session.user, "port:write")) {
  return new Response("Forbidden", { status: 403 });
}

// ❌ Discouraged: Hard-coded role checks
if (user.role !== "admin") {
} // Inflexible, error-prone
```

**Action Items**:

- [ ] Verify all API routes validate authentication
- [ ] Check authorization before data access/modification
- [ ] Ensure session tokens are properly validated
- [ ] Confirm JWT expiry is configured (not indefinite)
- [ ] Validate MFA implementation for sensitive operations

#### Common Vulnerabilities

🚨 **Broken Authentication**:

- Missing authentication checks on API endpoints
- Session tokens without expiration
- Weak password requirements (<8 chars, no complexity)
- Insecure session storage (localStorage for sensitive tokens)

🚨 **Broken Access Control**:

- Missing authorization checks (authenticated but not authorized)
- Direct object references without ownership validation
- Privilege escalation paths
- Horizontal access control bypasses

### 2. Input Validation & Sanitization

#### Must Check

**Input Validation**:

```typescript
// ✅ Preferred: Zod schema validation
import { z } from "zod";

const PortDataSchema = z.object({
  portId: z.string().uuid(),
  operation: z.enum(["load", "unload", "inspect"]),
  containerId: z.string().regex(/^[A-Z]{4}\d{7}$/),
  timestamp: z.string().datetime(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validation = PortDataSchema.safeParse(body);

  if (!validation.success) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const data = validation.data; // Type-safe, validated data
  // Proceed with processing
}

// ❌ Discouraged: No validation
export async function POST(request: Request) {
  const body = await request.json();
  // Directly use body without validation
}
```

**SQL Injection Prevention**:

```typescript
// ✅ Preferred: Prisma parameterized queries
const users = await prisma.user.findMany({
  where: { email: userInput }, // Safe - parameterized
});

// ❌ NEVER: Raw SQL with string concatenation
const query = `SELECT * FROM users WHERE email = '${userInput}'`; // VULNERABLE!
await prisma.$executeRawUnsafe(query); // NEVER DO THIS
```

**XSS Prevention**:

```typescript
// ✅ Preferred: React auto-escaping + explicit sanitization
import DOMPurify from 'isomorphic-dompurify';

function UserComment({ comment }: { comment: string }) {
  // React automatically escapes
  return <p>{comment}</p>;

  // For HTML content, sanitize first
  const cleanHTML = DOMPurify.sanitize(comment);
  return <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
}

// ❌ Discouraged: Unescaped user input
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // VULNERABLE!
```

**Action Items**:

- [ ] All user inputs validated with Zod schemas
- [ ] Database queries use Prisma ORM (no raw SQL)
- [ ] File uploads validated (type, size, content)
- [ ] URL parameters sanitized
- [ ] Form inputs have proper constraints
- [ ] API payloads size-limited to prevent DoS

#### Common Vulnerabilities

🚨 **Injection Attacks**:

- SQL injection (raw queries with string interpolation)
- NoSQL injection (unvalidated MongoDB queries)
- Command injection (executing shell commands with user input)
- LDAP injection
- XPath injection

🚨 **Cross-Site Scripting (XSS)**:

- Reflected XSS (unescaped URL parameters in output)
- Stored XSS (unescaped user content in database)
- DOM-based XSS (client-side script injection)

### 3. Sensitive Data Protection

#### Must Check

**Encryption**:

```typescript
// ✅ Preferred: Encrypt sensitive data
import { EncryptionService } from "@/core/security/EncryptionService";

const encrypted = await EncryptionService.encrypt(sensitiveData);
await db.save({ data: encrypted });

// When retrieving
const decrypted = await EncryptionService.decrypt(storedData);

// ❌ Discouraged: Storing sensitive data in plain text
await db.save({ creditCard: userInput }); // VULNERABLE!
```

**Password Security**:

```typescript
// ✅ Preferred: bcryptjs hashing
import bcrypt from "bcryptjs";

const hashedPassword = await bcrypt.hash(password, 12); // 12+ rounds
await db.user.create({ passwordHash: hashedPassword });

// Verification
const isValid = await bcrypt.compare(inputPassword, storedHash);

// ❌ NEVER: Plain text or weak hashing
await db.user.create({ password: plainPassword }); // NEVER!
const hash = crypto.createHash("md5").update(password).digest("hex"); // WEAK!
```

**Secrets Management**:

```typescript
// ✅ Preferred: Environment variables (never commit)
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("API key not configured");

// ❌ NEVER: Hard-coded secrets
const apiKey = "sk-abc123xyz"; // NEVER COMMIT SECRETS!

// ❌ NEVER: Log secrets
logger.info("API Key:", apiKey); // Exposes secret in logs
```

**Action Items**:

- [ ] Sensitive data encrypted at rest
- [ ] TLS/HTTPS enforced for data in transit
- [ ] Passwords hashed with bcrypt (12+ rounds)
- [ ] No secrets in source code or version control
- [ ] API keys stored in environment variables
- [ ] Secrets not logged or exposed in errors
- [ ] PII (personally identifiable info) minimized
- [ ] Data retention policies enforced

#### Common Vulnerabilities

🚨 **Sensitive Data Exposure**:

- Credentials in source code or config files
- API keys committed to git
- Passwords in plain text
- Secrets in client-side code
- Sensitive data in logs or error messages
- Unencrypted database fields
- Insecure data transmission (HTTP instead of HTTPS)

🚨 **Cryptographic Failures**:

- Weak hashing algorithms (MD5, SHA1)
- Insufficient salt rounds for bcrypt (<10)
- Hard-coded encryption keys
- Using deprecated crypto methods
- Improper random number generation

### 4. API Security

#### Must Check

**Rate Limiting**:

```typescript
// ✅ Preferred: Implement rate limiting
import { rateLimit } from "@/core/security/rateLimit";

export async function POST(request: Request) {
  const clientId = request.headers.get("X-Client-ID");

  if (!(await rateLimit.check(clientId, { max: 100, window: 60000 }))) {
    return new Response("Too many requests", { status: 429 });
  }

  // Process request
}

// ❌ Discouraged: No rate limiting
// Vulnerable to DoS attacks
```

**CORS Configuration**:

```typescript
// ✅ Preferred: Restrictive CORS
const allowedOrigins = [
  'https://yyc-port.com',
  'https://dashboard.yyc-port.com'
];

if (!allowedOrigins.includes(request.headers.get('Origin'))) {
  return new Response('Forbidden', { status: 403 });
}

// ❌ Discouraged: Permissive CORS
headers: {
  'Access-Control-Allow-Origin': '*', // TOO PERMISSIVE!
}
```

**API Key Validation**:

```typescript
// ✅ Preferred: Validate API keys
const apiKey = request.headers.get("X-API-Key");
if (!(await validateApiKey(apiKey))) {
  return new Response("Invalid API key", { status: 401 });
}

// ❌ Discouraged: No API key validation
// Anyone can call your endpoints
```

**Action Items**:

- [ ] Rate limiting on all public endpoints
- [ ] CORS configured with specific origins
- [ ] API keys validated for external integrations
- [ ] Request size limits enforced
- [ ] Timeouts configured for long-running operations
- [ ] GraphQL query depth limits (if applicable)

#### Common Vulnerabilities

🚨 **API Abuse**:

- Missing rate limiting (DoS vulnerability)
- Overly permissive CORS
- No request size limits
- Unrestricted resource consumption
- Missing authentication on public APIs

🚨 **Mass Assignment**:

- Accepting all fields from user input
- No explicit field whitelisting
- Allowing role/permission modification via API

### 5. AI-Specific Security

#### Must Check (Port AI Systems)

**Model Input Validation**:

```typescript
// ✅ Preferred: Validate AI inputs
const AIInputSchema = z.object({
  prompt: z.string().max(4000), // Limit length
  model: z.enum(["gpt-4", "claude-3", "gemini"]), // Whitelist models
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().max(2000),
});

const input = AIInputSchema.parse(userInput);
const response = await aiService.generate(input);

// ❌ Discouraged: Unvalidated AI inputs
const response = await aiService.generate({
  prompt: userInput, // No length/content validation
  model: userModel, // User-controlled model selection
});
```

**Prompt Injection Prevention**:

```typescript
// ✅ Preferred: Sanitize and separate system/user content
const systemPrompt = "You are a port logistics assistant.";
const userContent = sanitizePrompt(userInput); // Remove injection attempts

const response = await openai.chat.completions.create({
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ],
});

// ❌ Discouraged: Concatenating prompts
const prompt = `${systemInstructions}\nUser: ${userInput}`; // VULNERABLE to injection
```

**Model Output Validation**:

```typescript
// ✅ Preferred: Validate AI outputs before use
const OutputSchema = z.object({
  recommendation: z.string(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

const aiOutput = await aiService.analyze(data);
const validated = OutputSchema.parse(JSON.parse(aiOutput));

// ❌ Discouraged: Blindly trust AI output
const result = JSON.parse(aiOutput); // No validation
executeCommand(result.action); // DANGEROUS!
```

**Data Privacy in AI Training**:

```typescript
// ✅ Preferred: Anonymize data before AI processing
const anonymized = anonymizePortData(sensitiveData);
const insights = await aiService.analyze(anonymized);

// ❌ Discouraged: Sending PII to third-party AI
await openai.analyze(customerData); // May violate privacy policies
```

**Action Items**:

- [ ] AI inputs validated (length, content, model selection)
- [ ] Prompt injection defenses in place
- [ ] AI outputs validated before execution
- [ ] PII anonymized before AI processing
- [ ] Model versioning tracked for audits
- [ ] AI decisions logged for accountability
- [ ] Fallback mechanisms for AI failures

#### Common AI Vulnerabilities

🚨 **Prompt Injection**:

- User input directly concatenated to system prompts
- No separation between instructions and user content
- Allowing users to override system behavior

🚨 **Model Poisoning**:

- Training data not validated
- Accepting user-contributed training data
- No data provenance tracking

🚨 **Data Leakage**:

- Sending PII to third-party AI services
- Training data exposed through model queries
- Context window leaking previous user data

🚨 **Model Abuse**:

- No rate limiting on AI endpoints
- Expensive model calls without cost controls
- Resource exhaustion through AI requests

### 6. Third-Party Dependencies

#### Must Check

**Dependency Security**:

```typescript
// ✅ Preferred: Regular dependency audits
// Run: pnpm audit
// Run: pnpm outdated
// Keep dependencies updated

// Check for known vulnerabilities
// GitHub Dependabot alerts enabled

// ❌ Discouraged: Outdated dependencies
// Critical packages with known CVEs
// Dependencies not updated in 12+ months
```

**Plugin Security** (Port AI Plugin System):

```typescript
// ✅ Preferred: Validate plugins before loading
import { PluginValidator } from "@/core/plugin-system/validator";

const plugin = await loadPlugin(pluginPath);
const validation = await PluginValidator.verify(plugin);

if (!validation.isSafe) {
  throw new Error(`Unsafe plugin: ${validation.threats.join(", ")}`);
}

// ❌ Discouraged: Loading untrusted plugins
const plugin = require(userProvidedPath); // DANGEROUS!
```

**Action Items**:

- [ ] Dependencies regularly updated (monthly)
- [ ] Security advisories monitored
- [ ] Unused dependencies removed
- [ ] Plugin signatures verified before loading
- [ ] Third-party code sandboxed when possible
- [ ] npm audit shows no critical/high vulnerabilities

#### Common Vulnerabilities

🚨 **Supply Chain Attacks**:

- Compromised dependencies (typosquatting)
- Malicious packages in npm
- Outdated packages with known CVEs
- Unverified plugin installations

### 7. Logging & Monitoring

#### Must Check

**Audit Logging**:

```typescript
// ✅ Preferred: Comprehensive audit logs
import { AuditLogger } from "@/core/security/AuditLogger";

await AuditLogger.log({
  action: "PORT_DATA_ACCESS",
  userId: session.user.id,
  resource: portId,
  ip: request.ip,
  timestamp: new Date(),
  result: "SUCCESS",
});

// ❌ Discouraged: No audit trail for sensitive operations
```

**Security Event Monitoring**:

```typescript
// ✅ Preferred: Alert on security events
import { SecurityMonitor } from "@/core/security/monitoring";

if (failedLoginAttempts > 5) {
  await SecurityMonitor.alert({
    level: "HIGH",
    type: "BRUTE_FORCE_ATTEMPT",
    userId: attemptedUserId,
    ip: request.ip,
  });
}

// ❌ Discouraged: Security events not monitored
```

**Action Items**:

- [ ] Security events logged (auth failures, permission denials)
- [ ] Audit logs immutable (append-only)
- [ ] Logs retained per compliance requirements (7 years)
- [ ] No sensitive data in logs (passwords, tokens, PII)
- [ ] Alerts configured for suspicious patterns
- [ ] Log aggregation and analysis in place

#### Common Vulnerabilities

🚨 **Insufficient Logging**:

- No audit trail for sensitive operations
- Security events not logged
- Logs can be modified/deleted
- No alerting on anomalies

🚨 **Information Leakage**:

- Sensitive data in logs (passwords, tokens)
- Verbose error messages exposing system details
- Stack traces shown to users

### 8. Infrastructure Security

#### Must Check

**Environment Configuration**:

```typescript
// ✅ Preferred: Secure defaults
const config = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL, // Never hardcode
  SESSION_SECRET: process.env.SESSION_SECRET, // Strong random string
  SECURE_COOKIES: true, // Always in production
  HTTPS_ONLY: true,
  HSTS_ENABLED: true,
};

// ❌ Discouraged: Insecure configuration
const config = {
  SECURE_COOKIES: false, // Vulnerable to session hijacking
  DEBUG_MODE: true, // Exposes sensitive info in production
};
```

**Security Headers**:

```typescript
// ✅ Preferred: Security headers configured
headers: {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

**Action Items**:

- [ ] TLS 1.2+ enforced (no SSL, no TLS 1.0/1.1)
- [ ] Security headers configured
- [ ] Cookie flags set (Secure, HttpOnly, SameSite)
- [ ] HSTS enabled
- [ ] CSP configured and tested
- [ ] Database connections encrypted

## Security Testing Requirements

### Required Security Tests

```typescript
// tests/security/auth.security.test.ts
describe("Authentication Security", () => {
  it("should reject requests without valid tokens", async () => {
    const response = await fetch("/api/sensitive", {
      headers: { Authorization: "Bearer invalid" },
    });
    expect(response.status).toBe(401);
  });

  it("should prevent session fixation", async () => {
    // Test implementation
  });

  it("should enforce MFA for admin operations", async () => {
    // Test implementation
  });
});

// tests/security/injection.security.test.ts
describe("Injection Protection", () => {
  it("should prevent SQL injection via user input", async () => {
    const malicious = "1' OR '1'='1";
    const result = await getUserById(malicious);
    expect(result).toBeNull();
  });

  it("should sanitize XSS attempts", async () => {
    const xss = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(xss);
    expect(sanitized).not.toContain("<script>");
  });
});
```

**Action Items**:

- [ ] Security tests exist for authentication/authorization
- [ ] Input validation tested with malicious payloads
- [ ] XSS prevention tested
- [ ] SQL injection tests included
- [ ] Rate limiting tested
- [ ] Encryption/decryption tested

## Compliance Considerations

### Regulatory Requirements

**GDPR Compliance**:

- [ ] User consent tracked and stored
- [ ] Data retention policies enforced
- [ ] Right to deletion implemented
- [ ] Data portability supported
- [ ] Privacy policy up to date

**SOC 2 Type II**:

- [ ] Access controls documented
- [ ] Change management process followed
- [ ] Incident response procedures tested
- [ ] Audit logs complete and immutable

**ISO 27001**:

- [ ] Risk assessments conducted
- [ ] Security policies documented
- [ ] Employee training tracked
- [ ] Regular security reviews scheduled

## Security Review Checklist

Use this checklist for all code reviews involving security-sensitive code:

### Critical (P0) - Must Fix Before Merge

- [ ] No hard-coded secrets or credentials
- [ ] Authentication required for protected endpoints
- [ ] Authorization checks before data access
- [ ] User inputs validated with schemas
- [ ] SQL queries use parameterized/ORM approach
- [ ] Passwords hashed with bcrypt (12+ rounds)
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS/TLS enforced for data in transit
- [ ] Error messages don't expose sensitive info
- [ ] Security events logged for audit

### High Priority (P1) - Should Fix

- [ ] Rate limiting on public/expensive endpoints
- [ ] CORS configured restrictively
- [ ] Session timeouts configured
- [ ] Security headers present
- [ ] Dependencies up-to-date (no critical CVEs)
- [ ] File uploads validated
- [ ] API responses don't leak sensitive data
- [ ] Logs don't contain PII or secrets
- [ ] AI inputs/outputs validated
- [ ] Security tests included

### Medium Priority (P2) - Nice to Have

- [ ] MFA enforced for sensitive operations
- [ ] Security monitoring/alerting configured
- [ ] Penetration testing completed
- [ ] Security documentation updated
- [ ] Incident response plan tested

## Common Port AI Security Scenarios

### Scenario 1: Port Data Access

```typescript
// ✅ Secure Implementation
export async function GET(request: Request) {
  // 1. Authenticate
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  // 2. Authorize
  if (!hasPermission(session.user, "port:read")) {
    return new Response("Forbidden", { status: 403 });
  }

  // 3. Validate input
  const url = new URL(request.url);
  const portId = PortIdSchema.parse(url.searchParams.get("portId"));

  // 4. Check ownership/access
  const hasAccess = await checkPortAccess(session.user.id, portId);
  if (!hasAccess) return new Response("Forbidden", { status: 403 });

  // 5. Fetch and sanitize data
  const portData = await getPortData(portId);
  const sanitized = sanitizeOutput(portData);

  // 6. Log access
  await AuditLogger.log({
    action: "PORT_DATA_ACCESS",
    userId: session.user.id,
    resource: portId,
  });

  return Response.json(sanitized);
}
```

### Scenario 2: AI Model Integration

```typescript
// ✅ Secure AI Integration
async function analyzeShipmentRisk(shipmentData: ShipmentData) {
  // 1. Anonymize sensitive data
  const anonymized = anonymizeShipmentData(shipmentData);

  // 2. Validate AI input
  const aiInput = AIInputSchema.parse({
    prompt: buildRiskAnalysisPrompt(anonymized),
    model: "gpt-4",
    maxTokens: 1000,
  });

  // 3. Rate limit AI calls
  if (!(await rateLimiter.check("ai-risk-analysis", { max: 100 }))) {
    throw new Error("AI rate limit exceeded");
  }

  // 4. Call AI with timeout
  const response = await withTimeout(
    aiService.analyze(aiInput),
    30000, // 30s timeout
  );

  // 5. Validate AI output
  const result = RiskAnalysisSchema.parse(response);

  // 6. Log AI decision
  await AuditLogger.log({
    action: "AI_RISK_ANALYSIS",
    shipmentId: shipmentData.id,
    result: result.riskLevel,
    modelVersion: aiInput.model,
  });

  return result;
}
```

### Scenario 3: Plugin Installation

```typescript
// ✅ Secure Plugin Loading
async function installPlugin(pluginPackage: string) {
  // 1. Authenticate admin
  if (!isAdmin(session.user)) {
    throw new Error("Only admins can install plugins");
  }

  // 2. Validate plugin source
  if (!isFromTrustedRegistry(pluginPackage)) {
    throw new Error("Plugin must be from approved registry");
  }

  // 3. Scan for vulnerabilities
  const scanResult = await scanPlugin(pluginPackage);
  if (scanResult.hasVulnerabilities) {
    throw new Error(`Plugin has vulnerabilities: ${scanResult.cves}`);
  }

  // 4. Verify signature
  if (!(await verifyPluginSignature(pluginPackage))) {
    throw new Error("Plugin signature verification failed");
  }

  // 5. Sandbox plugin
  const plugin = await loadPluginInSandbox(pluginPackage);

  // 6. Log installation
  await AuditLogger.log({
    action: "PLUGIN_INSTALLED",
    plugin: pluginPackage,
    userId: session.user.id,
  });

  return plugin;
}
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Summary

**Priority Order for Security Reviews**:

1. **Authentication & Authorization** - Who can access what?
2. **Input Validation** - Is user input properly validated?
3. **Sensitive Data Protection** - Are secrets and PII protected?
4. **Injection Prevention** - SQL, XSS, command injection checks
5. **API Security** - Rate limiting, CORS, authentication
6. **AI Security** - Prompt injection, output validation, data privacy
7. **Audit Logging** - Are security events tracked?
8. **Dependencies** - Are third-party libraries secure?

**Remember**: For port AI systems, security is not optional. A single vulnerability can compromise critical logistics operations and sensitive customer data. Always err on the side of caution.
