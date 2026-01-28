# YYC³ PortAISys - Code Review Guidelines

## Project Context

YYC³ Portable Intelligent AI System is an enterprise-grade AI platform implementing a Five-Dimensional Closed-Loop Architecture (Analysis → Execution → Optimization → Learning → Management) for port and logistics operations.

## Tech Stack Overview

- **Frontend**: Next.js 16 + React 19 with App Router
- **Backend**: Node.js ≥20.19.0 + TypeScript 5.3+
- **Database**: PostgreSQL + Prisma 7
- **Caching**: Redis + LRU Cache (dual-layer)
- **AI Models**: Multi-provider (OpenAI, Anthropic, Google)
- **Observability**: OpenTelemetry + Distributed Tracing
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **UI**: Radix UI + Tailwind CSS 4

## Code Style & Conventions

### File Headers (Required)

Every file must include a comprehensive header:

```typescript
/**
 * @file filename
 * @description Brief description
 * @module module/name
 * @author YYC³
 * @version 1.0.0
 * @created YYYY-MM-DD
 * @copyright Copyright (c) 2026 YYC³
 */
```

**Action**: Verify all new/modified files include proper headers with accurate descriptions.

### Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`, `AlertDashboard.tsx`)
- **Utils/Services**: `camelCase.ts` (e.g., `userService.ts`, `analyticsEngine.ts`)
- **Config Files**: `kebab-case.config.js` (e.g., `eslint.config.js`)
- **Documentation**: `kebab-case.md` or `UPPERCASE.md`

**Action**: Flag any deviations from these naming patterns.

### TypeScript Standards

- **Strict Mode**: All code must pass `strict: true` checks
- **Type Safety**: No `any` types without explicit justification
- **Path Aliases**: Use `@/*` for core module imports
- **Interfaces**: Prefer interfaces over types for object shapes
- **Enums**: Use const enums for performance when appropriate

**Action**: Check for:
- Proper type annotations on function parameters and returns
- No implicit `any` types
- Correct use of path aliases instead of relative imports
- TypeScript decorators properly configured

### ESLint Rules

**Critical Limits**:
- Max 300 lines per file (warn)
- Max 50 lines per function (warn)
- Cyclomatic complexity max 10 (warn)
- No `console.log` (use `console.warn` or `console.error` only)
- No `debugger` statements (error)

**Action**: Check if changes exceed these limits and suggest refactoring if needed.

## Architecture Patterns

### Five-Dimensional Closed-Loop

Ensure changes respect the architectural flow:

1. **Analysis**: Data collection and insight extraction
2. **Execution**: Action implementation via AI agents
3. **Optimization**: Performance and efficiency improvements
4. **Learning**: Model training and adaptation
5. **Management**: Orchestration and governance

**Action**: Verify that new features align with the appropriate dimension.

### Module Organization

```
core/                  # Core system modules (100+)
├── ai/               # Agent orchestration and routing
├── analytics/        # Data insights and predictions
├── security/         # Security and compliance
├── workflows/        # Business process automation
├── plugin-system/    # Extensibility framework
└── [other modules]   # Specialized capabilities

web-dashboard/        # Next.js management interface
├── app/             # Route handlers and pages
└── components/      # Reusable UI components

tools/               # Development tools
tests/               # Comprehensive test suites
```

**Action**: Ensure new code is placed in the correct module/directory.

### Common Patterns to Check

#### AI Agent Pattern

```typescript
// Preferred: Extend BaseAgent
class CustomAgent extends BaseAgent {
  async execute(params: AgentParams): Promise<AgentResult> {
    // Implementation with proper error handling
  }
}

// Use AgentOrchestrator for coordination
const orchestrator = new AgentOrchestrator();
orchestrator.addAgent(customAgent);
```

**Action**: Verify agents follow the BaseAgent pattern.

#### Caching Pattern

```typescript
// Preferred: Use dual-layer caching
const data = await cache.get(key) || 
             await redisCache.get(key) ||
             await fetchFromDatabase();
```

**Action**: Check if caching is implemented for expensive operations.

#### Error Handling Pattern

```typescript
// Preferred: Comprehensive error handling with logging
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error('Operation failed', { error, context });
  throw new CustomError('User-friendly message', error);
}
```

**Action**: Ensure all async operations have proper error handling.

## Code Quality Checks

### Must Check

1. **Type Safety**
   - All function parameters and returns have explicit types
   - No use of `any` without justification comment
   - Proper handling of nullable types

2. **Error Handling**
   - All Promise-based code has error handlers
   - Database operations wrapped in try-catch
   - User-facing errors are informative
   - System errors are logged with context

3. **Performance**
   - No N+1 query problems
   - Proper pagination for large datasets
   - Caching implemented for repeated operations
   - Worker threads used for CPU-intensive tasks

4. **Code Duplication**
   - No copy-pasted code blocks >10 lines
   - Common logic extracted to utilities
   - Reusable components identified

5. **Documentation**
   - Complex logic has explanatory comments
   - Public APIs have JSDoc documentation
   - README updates for new features
   - Migration guides for breaking changes

### Should Check

1. **Code Organization**
   - Functions are focused (single responsibility)
   - Files are appropriately sized (<300 lines)
   - Related code is co-located

2. **Naming**
   - Variables and functions have descriptive names
   - Avoid abbreviations unless standard (e.g., `id`, `url`)
   - Boolean variables start with `is`, `has`, `should`

3. **Testing Coverage**
   - New features have unit tests
   - Critical paths have integration tests
   - Edge cases are tested
   - Tests are readable and maintainable

## Testing Requirements

### Test Structure

```
tests/
├── unit/              # Unit tests (fast, isolated)
├── integration/       # Integration tests (system-level)
├── security/          # Security and penetration tests
├── performance/       # Performance benchmarks
└── e2e/              # End-to-end tests (Playwright)
```

**Action**: Verify tests are in the correct directory and follow naming conventions:
- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.spec.ts`

### Coverage Expectations

- **Critical Modules**: ≥90% coverage (auth, security, AI core)
- **Standard Modules**: ≥80% coverage
- **UI Components**: ≥70% coverage
- **Utilities**: ≥95% coverage

**Action**: Check if new code includes appropriate tests.

### Test Quality

```typescript
// Preferred: Descriptive test names
describe('UserAuthenticationService', () => {
  it('should hash password with bcrypt before storing', async () => {
    // Test implementation
  });
  
  it('should reject passwords shorter than 8 characters', async () => {
    // Test implementation
  });
});
```

**Action**: Ensure tests are:
- Self-documenting with clear names
- Independent and can run in any order
- Fast (unit tests <100ms, integration <5s)
- Deterministic (no flaky tests)

## Performance Considerations

### Must Monitor

1. **Database Queries**
   - Use Prisma's `select` to limit fields
   - Implement proper indexing
   - Avoid N+1 queries with `include` or separate queries

2. **API Response Times**
   - Cache frequently accessed data
   - Paginate large result sets
   - Use streaming for large payloads

3. **Memory Usage**
   - Clean up event listeners
   - Close database connections
   - Release Worker Thread resources

4. **Bundle Size**
   - Dynamic imports for large dependencies
   - Tree-shaking friendly imports
   - Code splitting for routes

**Action**: Flag potential performance issues and suggest optimizations.

## Documentation Standards

### Inline Documentation

```typescript
/**
 * Processes port logistics data using AI analysis
 * 
 * @param portData - Raw port operational data
 * @param options - Processing configuration
 * @returns Analyzed insights with recommendations
 * @throws {ValidationError} If port data is invalid
 * @throws {AIServiceError} If AI model fails
 * 
 * @example
 * const insights = await processPortData(data, { model: 'gpt-4' });
 */
async function processPortData(
  portData: PortData,
  options: ProcessingOptions
): Promise<PortInsights> {
  // Implementation
}
```

**Action**: Verify complex functions have JSDoc comments.

### README Updates

When adding new features:
- Update main README.md with feature description
- Add usage examples
- Document configuration options
- Update API documentation if applicable

**Action**: Check if README needs updates for new functionality.

## Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

**Examples**:
- `feat(auth): implement RBAC permission system`
- `fix(cache): resolve Redis connection timeout issue`
- `docs(api): update endpoint documentation`

**Action**: Verify commit messages follow this convention.

## Review Priority Checklist

When reviewing code, prioritize checking in this order:

### P0 (Critical - Must Fix)
- [ ] Security vulnerabilities
- [ ] Data loss potential
- [ ] Breaking API changes without migration path
- [ ] Performance regressions in critical paths
- [ ] Missing error handling in production code

### P1 (High - Should Fix)
- [ ] Missing or inadequate tests
- [ ] Type safety violations
- [ ] Architectural pattern violations
- [ ] Code duplication >20 lines
- [ ] Missing documentation for public APIs

### P2 (Medium - Nice to Have)
- [ ] Minor style inconsistencies
- [ ] Suboptimal variable names
- [ ] Missing JSDoc for internal functions
- [ ] Non-critical performance improvements

### P3 (Low - Optional)
- [ ] Formatting preferences
- [ ] Alternative implementation suggestions
- [ ] Future enhancement ideas

## Preferred vs. Discouraged Practices

### ✅ Preferred

```typescript
// Explicit types
async function getUser(id: string): Promise<User> { }

// Proper error handling
try {
  await operation();
} catch (error) {
  logger.error('Failed', { error });
  throw new AppError('Operation failed', error);
}

// Path aliases
import { UserService } from '@/core/services/userService';

// Const enums
const enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}
```

### ❌ Discouraged

```typescript
// Any types without justification
async function getUser(id: any): Promise<any> { }

// Unhandled promises
await riskyOperation(); // No error handling

// Relative imports for core modules
import { UserService } from '../../../core/services/userService';

// Magic strings
if (role === 'admin') { } // Should use enum
```

## Related Documentation

- [Architecture Documentation](../../docs/)
- [Testing Guidelines](../../TESTING.md)
- [Tracing Implementation](../../TRACING_ADDED.md)
- [Week 2 Progress Reports](../../WEEK2_PROGRESS_REPORT.md)

## Summary

Focus on:
1. **Security first** - Port AI systems handle sensitive logistics data
2. **Type safety** - Leverage TypeScript's full power
3. **Performance** - Cache, paginate, optimize
4. **Testing** - Comprehensive coverage for reliability
5. **Documentation** - Clear, helpful, up-to-date
6. **Architecture** - Respect five-dimensional closed-loop design
7. **Error handling** - Graceful failures with context
8. **Code quality** - Clean, maintainable, well-organized

Remember: This is an enterprise-grade port AI system. Reliability, security, and performance are paramount.
