# AGENTS.md

Guidance for AI agents (and humans) working in the YYC³ PortAISys codebase.
Document only what is observed in the repo — conventions here are derived from
configs, source, CI, and existing rule files.

---

## Project Overview

**YYC³ PortAISys** (YanYuCloudCube Portable Intelligent AI System) is an
enterprise-grade, TypeScript-based AI platform implementing a **Five-Dimensional
Closed-Loop Architecture** (Analysis → Execution → Optimization → Learning →
Management). The primary product is an autonomous, pluggable, drag-and-drop AI
widget system with agent orchestration, multi-model support, and enterprise
security/compliance.

- **Language**: TypeScript (strict). Code comments, logs, and docs are
  predominantly **Chinese (中文)** — match this when editing existing files.
- **License**: MIT. Author: `YanYuCloudCube Team <admin@0379.email>`.
- **Repo**: https://github.com/YYC-Cube/YYC3-PortAISys.git

> ⚠️ **Reality check**: Documentation and instruction files (`.github/instructions/*`,
> `README.md`) describe features that may not yet be fully implemented (e.g. the
> `web-dashboard/` directory is currently **empty**, NextAuth is referenced in
> security docs but the codebase uses custom auth). Always verify against actual
> source code, not just docs.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js **≥ 20.19.0** (enforced in `.nvmrc`, `package.json` engines, CI; required by Prisma 7) |
| Language | TypeScript 5.3+, **strict mode** |
| Module system | ESM (`"type": "module"`) |
| Build | `tsc` + Vite |
| Test | Vitest 1.x (unit/integration) + Playwright (E2E) |
| Lint | ESLint 9 (flat config) + Prettier |
| Database | PostgreSQL + Prisma 7 |
| Cache | Redis (`ioredis`) + in-process LRU (dual-layer) |
| AI Models | OpenAI + Anthropic adapters (`core/adapters/`, `core/model/`) |
| Observability | OpenTelemetry (`@opentelemetry/*`) |
| Validation | Zod 4 |
| Events | `eventemitter3` (NOT Node's built-in `events`) |
| Other deps | `uuid`, `bcrypt`, `next` (API routes in `src/pages/api/`) |

**Package manager**: `pnpm@11.10.0` (pinned in CI). The lockfile is
`pnpm-lock.yaml`. **pnpm v11+ is required** — the project uses
`pnpm-workspace.yaml` for `overrides` (security patches) and
`onlyBuiltDependencies` (native build approval), both v11-only features; older
pnpm silently ignores them. `.npmrc` pins the `npmmirror` registry and raises
`fetch-timeout`/`fetch-retries` (the Prisma 7 dependency tree is large).

---

## Essential Commands

### Setup
```bash
nvm use              # uses .nvmrc → Node 20.19.0
pnpm install         # .npmrc pins npmmirror + fetch-timeout; succeeds offline-ish
pnpm approve-builds --all   # allow native build scripts (bcrypt/prisma/esbuild) — pnpm v11 gates these
cp .env.example .env # then fill in real values
```

### Development
```bash
pnpm dev             # vite dev server
pnpm build           # tsc && vite build
pnpm preview         # vite preview
pnpm typecheck       # tsc --noEmit  (FAST type check, no emit)
```

### Linting & Formatting
```bash
pnpm lint            # eslint core --ext .ts,.tsx
pnpm lint:fix        # eslint . --ext .ts,.tsx --fix
pnpm format          # prettier --write "**/*.{ts,tsx,js,jsx,json,md}"
```
> Note: `pnpm lint` scopes to `core/`; `pnpm lint:fix` runs on the whole repo.

### Testing

Tests are split by type and run via separate configs/scripts:

```bash
pnpm test            # vitest (watch mode, unit tests only by default)
pnpm test:run        # vitest run (single pass, unit tests)
pnpm test:unit       # vitest run tests/unit
pnpm test:integration# vitest run --config vitest.integration.config.ts
pnpm test:security   # vitest run tests/security
pnpm test:performance# vitest run tests/performance
pnpm test:e2e        # playwright test (needs: pnpm exec playwright install)
pnpm test:e2e:ui     # playwright test --ui
pnpm test:coverage   # vitest run --coverage
pnpm test:all        # unit && integration && e2e
```

**Phased test suites** (defined in `package.json`):
```bash
pnpm test:phase1     # unit + integration + e2e
pnpm test:phase2     # performance + security
pnpm test:phase3     # AI agents, plugins, mobile, multimodal, multi-model, workflow
pnpm test:full       # ./scripts/run-phase123-tests.sh  (all three phases)
pnpm quick-test      # ./scripts/quick-start-tests.sh   (verify + subset of tests)
```

**Single file**: `pnpm vitest run path/to/file.test.ts`
**Verbose**: `pnpm test --reporter=verbose`

### Database (Prisma)
```bash
pnpm test:db:migrate     # tsx scripts/create-yyc3-schema.ts
pnpm test:db:schema      # tsx scripts/verify-yyc3-schema.ts
pnpm test:db:connection  # tsx scripts/test-database-connection.ts
```
Prisma client is generated to `../generated/prisma` (gitignored). The
`DATABASE_URL` env var drives the connection (see `prisma.config.ts`).

### Documentation tooling
```bash
pnpm docs:compliance:check  # dry-run check of doc headers
pnpm docs:compliance:fix    # fix doc headers
pnpm sync:docs              # tsx scripts/sync-docs.ts
pnpm verify                 # tsx scripts/verify-implementation.ts
```

### Clean
```bash
pnpm clean   # rm -rf dist node_modules
```

---

## Project Structure

```
core/                    # ALL business logic (100+ modules, the heart of the repo)
├── ai/                  # Agent system: BaseAgent, AgentManager, AgentOrchestrator, agents/
├── adapters/            # Model adapters (OpenAI, Internal) + pluggable engine
├── analytics/           # AI analytics, predictive, anomaly detection
├── architecture/        # Auto-scaling, service registry
├── autonomous-ai-widget/# Autonomous AI engine + types (core product)
├── cache/               # CacheLayer, CacheSharding, loadBalancer, healthCheck
├── closed-loop/         # Five-dimensional system (value-creation, technical-evolution, metrics, improvement)
├── context-manager/     # ContextManager
├── error-handler/       # YYC3Error hierarchy, ErrorHandler, ErrorBoundary, recovery strategies
├── event-dispatcher/    # EventDispatcher
├── knowledge-base/      # KnowledgeBase
├── learning/            # LearningSystem + types
├── memory/              # MemorySystem
├── message-bus/         # MessageBus
├── model/               # ModelRouter, OpenAI/Anthropic/Local adapters
├── monitoring/          # Metrics, alerts, real-time perf monitor
├── performance/         # OptimizationEngine (+ testing/ subpackage)
├── plugin-system/       # PluginManager, PluginMarketplace
├── pluggable/           # Pluggable AutonomousAIEngine, ModelAdapter, factory
├── security/            # ThreatDetector, scanners, ComplianceManager, InputValidator
├── state-manager/       # StateManager
├── task-scheduler/      # TaskScheduler
├── tools/               # ToolRegistry, core-tools
├── tracing/             # OpenTelemetry config + utils
├── ui/                  # ChatInterface, ToolboxPanel, widget/* (30+ widget systems)
├── utils/               # logger.ts (custom Logger), common-utils.ts, metrics.ts
├── workflows/           # IntelligentCallingWorkflow, calling engine
└── [50+ other domains]  # innovation, industries, mobile, marketing, etc.

core/index.ts            # Public API barrel export — extend this when adding modules

src/pages/api/           # Next.js API routes (chat, health, sessions, model-config, etc.)
src/pages/               # (currently only api/ is populated)

tests/
├── setup.ts             # Global mocks: window, document, navigator, fetch, uuid, RN modules
├── unit/                # *.test.ts — mirrors core/ structure
├── integration/         # *.integration.test.ts
├── security/            # SecurityTests, penetration-tests, security-hardening
├── performance/         # Benchmarks, load tests
└── e2e/                 # Playwright *.spec.ts / *.e2e.test.ts

prisma/                  # schema.prisma (PostgreSQL models: User, ModelConfig, Plugin, Workflow, AuditLog…)
scripts/                 # TS/shell dev tooling (test runners, doc tools, schema tools)
tools/doc-code-sync/     # Standalone doc↔code sync tooling (own package.json)
docs/                    # Extensive Chinese documentation (规范, reports, architecture)
config/                  # prometheus.yml, grafana dashboards
public/                  # Static assets, YYC³ brand icons (iOS/Android/macOS/watchOS/Web)
web-dashboard/           # EMPTY (despite being referenced in docs)
```

---

## Path Aliases

Defined in `tsconfig.json` and mirrored in all vitest configs:

| Alias | Resolves to |
|-------|-------------|
| `@/*` | `./core/*` |
| `@tests/*` | `./tests/*` |

**Use `@/` imports for core modules.** Avoid deep relative imports like
`../../../core/...` (though note some existing files, e.g. tests, still use
relative paths — follow whatever the surrounding file uses).

---

## Coding Conventions

### File Headers (MANDATORY)

Every `.ts`/`.tsx` file **must** begin with a JSDoc header. This is enforced by
`scripts/code-header-compliance-tool.ts` and `scripts/doc-compliance-tool.ts`.
Required fields (see `YYC³-团队代码标头格式范本.md`):

```typescript
/**
 * @file path/relative/filename.ts
 * @description Brief description of the module (Chinese OK)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created YYYY-MM-DD
 * @updated YYYY-MM-DD
 * @status draft|dev|test|stable|deprecated
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript,core   (comma-separated)
 */
```

When creating a new file, copy the header from a neighbouring file and update
`@file`, `@description`, and `@tags`. Set `@created`/`@updated` to today's date.

### Naming
- **Components**: `PascalCase.tsx`
- **Classes/Services/utils**: `PascalCase.ts` (e.g. `ErrorHandler.ts`, `Logger`)
- **Config files**: `kebab-case.config.ts` (e.g. `vitest.config.ts`)
- **Docs**: `kebab-case.md`
- **Enums**: `PascalCase` names, `UPPER_SNAKE` members
- **Boolean vars**: prefer `is`/`has`/`should` prefixes

### TypeScript
- **Strict mode** is on (`tsconfig.json`): `strict`, `noUnusedLocals`,
  `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`.
- **No `any`** without justification. Underscore-prefixed identifiers
  (`_param`, `_err`) are allowed to bypass unused checks (ESLint `argsIgnorePattern: '^_'`).
- Prefer **interfaces** for object shapes, **enums** for fixed value sets.
- Target: ES2020, module ESNext, `moduleResolution: bundler`.

### ESLint rules that bite (see `eslint.config.js`)
| Rule | Level | Detail |
|------|-------|--------|
| `no-console` | **error** | Use the `logger` from `core/utils/logger.ts` instead. **Off** for: `tests/**`, `*.test.ts`, `*.spec.ts`, `core/examples/**`, `core/utils/logger.ts`, `core/performance/testing/**`. |
| `no-debugger` | error | — |
| `max-lines` | warn | 2000 (skips blanks/comments) |
| `max-lines-per-function` | warn | 150 (skips blanks/comments) |
| `complexity` | warn | max 30 |
| `@typescript-eslint/no-unused-vars` | warn | `caughtErrors: 'none'` (catch params unchecked), `^_` ignored |

### Logging
Import and use the singleton logger — never raw `console.*` in `core/`:
```typescript
import { logger } from '../utils/logger';   // or '@/utils/logger'
logger.info('message', 'ContextTag', { metadataKey: value });
logger.error('failed', 'ContextTag', { err }, error as Error);
```
The `Logger` supports levels (DEBUG/INFO/WARN/ERROR/FATAL), JSON or text format,
and optional file output (enabled in production). It internally uses `console.*`,
which is why `no-console` is disabled for that one file.

### Error Handling
Use the typed `YYC3Error` hierarchy from `core/error-handler/ErrorTypes.ts`
(`ValidationError`, `AuthenticationError`, `NotFoundError`, `ConflictError`,
`TimeoutError`, `NetworkError`, `InternalError`, …). Each carries `code`,
`category` (enum), `severity` (enum), `retryable`, and `context`. Wrap async
operations and include context in logs.

### Events
Use `eventemitter3` (imported as `import EventEmitter from 'eventemitter3'`),
**not** Node's `events` module. `BaseAgent` and many systems extend it.

### Agents
All AI agents extend `core/ai/BaseAgent.ts` (abstract; implements
`setupCapabilities()` and `setupCommandHandlers()`). Register command handlers
via `this.registerCommandHandler(action, fn)` and communicate through the
`AgentManager` (bound to `window.agentManager` at runtime).

### Internationalisation
Comments, log messages, `describe`/`it` test names, and user-facing strings are
**Chinese by default**. When editing, preserve the language of surrounding code.

---

## Testing Approach

### Framework split
| Type | Runner | Config | Naming | Location |
|------|--------|--------|--------|----------|
| Unit | Vitest | `vitest.config.ts` | `*.test.ts` | `tests/unit/**` |
| Integration | Vitest | `vitest.integration.config.ts` | `*.integration.test.ts` (or `*.test.ts`) | `tests/integration/**` |
| E2E | Playwright | `playwright.config.ts` | `*.spec.ts` / `*.e2e.test.ts` | `tests/e2e/**` |
| Security | Vitest | `vitest.config.ts` (or quick) | `*.test.ts` | `tests/security/**` |
| Performance | Vitest (gated by `RUN_PERF` env in some files) | `vitest.config.ts` | `*.test.ts` | `tests/performance/**` |

### Test environment quirks (`tests/setup.ts`)
- **Environment is `node`**, but `core/` code touches the DOM. `setup.ts`
  installs global **mocks for `window`, `document`, `navigator`**, plus
  `performance.now`, `requestAnimationFrame`, etc. Tests that need real DOM
  should switch their suite to `environment: 'jsdom'` (jsdom is a devDep).
- **`global.fetch` is mocked** to return a canned AI response (`{ content, toolUsed, usage }`).
  Override per-test with `vi.mocked(fetch).mockResolvedValueOnce(...)` or restore.
- **`uuid` is mocked** → `v4()` returns `'test-uuid-12345'`. Use `vi.useFakeTimers()`
  or override if unique IDs are needed.
- **React Native modules** (`async-storage`, `expo-location`, `expo-local-authentication`)
  are mocked because mobile code is imported transitively.
- **`console.*` are silenced** (`vi.fn()`). In tests, ESLint disables `no-console`,
  so you may use `console.log` for debugging without lint errors.
- `beforeEach(() => vi.clearAllMocks())` runs globally.

### Coverage
`vitest.config.ts` enforces **80% thresholds** (lines/functions/branches/statements)
on `core/**/*.ts`. CI uploads coverage to Codecov. Coverage excludes `*.test.ts`,
`*.spec.ts`, `**/types.ts`, `**/*.config.ts`, mocks/fixtures.

### E2E (Playwright)
- `baseURL`: `http://localhost:3000` (override via `BASE_URL`).
- Locales: `zh-CN`, timezone `Asia/Shanghai`.
- Projects: chromium, firefox, webkit, Mobile Chrome, Mobile Safari, iPad.
- In CI (`CI=true`), `webServer` is **disabled** — the app must be served
  another way. Locally, Playwright auto-starts `pnpm dev`.
- First run: `pnpm exec playwright install`.

### Test-writing style (observed)
```typescript
describe('ModuleName', () => {
  let instance: ModuleName;
  beforeEach(() => { instance = new ModuleName({...}); });
  afterEach(() => { instance.destroy?.(); });

  describe('功能分组', () => {       // Chinese describe blocks
    it('应该...（should ...）', async () => {
      expect(...).toBe(...);
    });
  });
});
```
Use descriptive Chinese `it` names, keep unit tests <100ms, integration <5s.

---

## CI/CD (`.github/workflows/ci.yml`)

Triggered on `push`/`pull_request` to `main`/`develop`, weekly cron, and
manual dispatch. Pipeline jobs (Node 20.19.0, pnpm 8):

1. **lint-and-typecheck** → `pnpm lint`, `pnpm typecheck`, `pnpm format --check`
2. **build** → `pnpm build` (uploads `dist/`)
3. **test-unit** → `pnpm test:unit --coverage` (→ Codecov)
4. **test-integration** → `pnpm test:integration --coverage`
5. **test-e2e** → `npx playwright install --with-deps` then `pnpm test:e2e`
6. **test-performance** → `pnpm test:performance`
7. **test-security** → `npm audit`, `pnpm test:security`, Snyk scan
8. **sync-docs** → `pnpm sync:docs`
9. **deploy-staging** → only on `develop` push (placeholder)
10. **generate-status** → runs `generate-ci-status.ts` + `generate-test-report.ts`

**Before pushing**, locally run at minimum: `pnpm typecheck && pnpm lint && pnpm test:unit`.

---

## Key Gotchas & Non-Obvious Patterns

1. **Node version is strict (20.19.0+).** Prisma 7 refuses to run on older
   Node. Enforced by `.nvmrc` (pinned to `20.19.0`), `package.json` engines,
   and CI. (README's old ">=18" was corrected to ">=20.19.0" — trust `.nvmrc`.)

2. **`web-dashboard/` is a placeholder (was a broken submodule).** The git
   history contained a gitlink (mode `160000`) pointing at a commit that was
   never fetchable, with **no `.gitmodules`** — i.e. an orphan submodule that
   could not be initialized. The gitlink has been removed; the directory now
   holds only a `.gitkeep`. Architecture docs describe a full Next.js dashboard
   but the code does **not** exist yet — don't assume dashboard code is present.

3. **Single lockfile: `pnpm-lock.yaml`.** A stray `package-lock.json` was
   tracked previously (risk of divergent resolutions); it has been removed.
   Always use `pnpm` to stay consistent with CI. A `ts-errors.txt` historical
   dump (~600 KB) was also removed; it is gitignored now — regenerate via
   `pnpm typecheck > ts-errors.txt` if ever needed.

4. **`tsc --noEmit` is the typecheck; `vite build` does the actual emit.** The
   `build` script chains both. `tsconfig.json` has `noEmit: true` and
   **excludes** `*.test.ts`/`*.spec.ts` from the program — Vitest compiles
   tests itself. Rely on `pnpm typecheck` for current status (do not trust
   any checked-in error dump).

5. **ESLint `no-console: error` applies to `core/`.** Any `console.log` added to
   a core module will fail `pnpm lint`. Use `logger` from `core/utils/logger.ts`.

6. **`lint` vs `lint:fix` have different scopes.** `pnpm lint` only checks
   `core/`; `pnpm lint:fix` checks the whole repo (`.`). CI runs `pnpm lint`
   (core-only), so expanding `lint`'s scope to `src/`+`scripts/` would also
   expand CI's surface — do that deliberately, not accidentally. Run
   `pnpm lint:fix` if you changed files outside `core/`.

7. **`tests/setup.ts` mocks `fetch`, `uuid`, and all RN/Expo modules globally.**
   If a test fails unexpectedly, check whether a global mock is intercepting
   your code. Clear/restore with `vi.restoreAllMocks()` inside the test.

8. **Prisma client output path is `generated/prisma`** (gitignored, see `.gitignore`).
   Run `pnpm prisma generate` after cloning or changing the schema. The schema
   datasource reads `DATABASE_URL` from the environment (`prisma.config.ts`).

9. **`core/index.ts` is the public barrel.** When adding a new core module,
   export its public API here so consumers can import from `@/`.

10. **Documentation lives under `docs/` and is extensive but Chinese-only** and
    partly aspirational (describes planned/ideal state). `docs/YYC3-团队通用-规范文档/`
    and `docs/YYC3-PortAISys-模版规范/` hold team standards and templates. There
    are doc-compliance scripts that enforce header formats on `.md` files.

11. **Commit messages** follow Conventional Commits (`feat:`, `fix:`, `docs:`,
    `refactor:`, `perf:`, `test:`, `chore:`) with optional scope — see recent
    `git log` for style. Chinese descriptions are common.

12. **`eventemitter3`, not Node `events`.** `BaseAgent` and many systems extend
    the npm `eventemitter3` default export. Don't substitute Node's `EventEmitter`.

13. **`package.json` references both `next` and `vite`.** Vite drives the core
    library dev/build; Next.js is used only for the API routes under
    `src/pages/api/`. Don't assume a Next.js app shell exists.

14. **`.zap/`, `.trae/`, `.crush/`, `.snyk.json`, `.zap/rules.tsv`** are
    third-party tool configs (linters, security, IDE rules). The substantive
    rule files are under `.github/instructions/` (architecture, review,
    security) — read these for deeper conventions.

---

## Known Issues & Remediation (as of 2026-07)

These were identified during the AGENTS.md hardening pass. Items marked ✅ are
fixed in the working tree; ⚠️ need human action (often blocked on the ability
to run a full `pnpm install`, see below).

### ✅ Fixed
- **README Node version** — badge + "环境要求" corrected from `>=18` to
  `>=20.19.0`; the `npm install` fallback was removed (pnpm-only).
- **`.trae/rules/project_rules.md`** — hardcoded private path
  `/Users/my/yyc3-Portable-Intelligent-AI-System/...` replaced with relative
  `docs/` references.
- **Duplicate lockfile** — `package-lock.json` removed (git-tracked → deleted);
  only `pnpm-lock.yaml` remains.
- **`ts-errors.txt`** — ~600 KB historical diagnostic dump removed and added
  to `.gitignore`.
- **Orphan submodule `web-dashboard`** — broken gitlink (unresolvable commit,
  no `.gitmodules`) removed from the index; `.gitkeep` placeholder added.
- **Install timeout** — `.npmrc` now pins `registry=npmmirror` with
  `fetch-timeout=120000` and `fetch-retries=5`; `pnpm install` succeeds.
- **2 critical RCE vulnerabilities** — `pnpm-workspace.yaml` `overrides`
  force `protobufjs>=8.0.1` (was 7.5.4 + 8.0.0, both RCE) and
  `js-yaml>=4.1.2` (was ≤4.1.1, DoS). Audit went 3→1 critical, 52→35 high.
- **Native build scripts** — `pnpm-workspace.yaml` `onlyBuiltDependencies`
  allows `bcrypt`/`prisma`/`@prisma/engines`/`esbuild`/`sharp` to run their
  install scripts (pnpm v11 blocks them by default). Run `pnpm approve-builds --all`
  after a fresh clone if builds are skipped.
- **CI pnpm version** — all jobs bumped from `pnpm@8` to `pnpm@11.10.0`
  (required to read `pnpm-workspace.yaml` overrides/onlyBuiltDependencies).
  `test-security` job now runs `pnpm audit --audit-level=high` (was
  `npm audit ... continue-on-error: true`, which silently passed).

### ⚠️ Open — 1 remaining critical (dev-only)
`vitest@1.6.1` (<3.2.6) — UI server arbitrary file read. This is a **devDep**
and only exploitable when `pnpm test:ui` is running on an untrusted network.
Cannot be fixed via `overrides` (1.x→3.x is a breaking API jump); needs a

deliberate vitest migration with a full test run. Tracked for a separate PR.

### ⚠️ Open — remaining high/moderate advisories (build-time transitive)
Post-override audit (92 advisories: 6 low / 50 moderate / 35 high / 1 critical):

| Package | Severity | Via | Reach | Fix path |
|---------|----------|-----|-------|----------|
| `tar@6.2.1` | high (×5) | `bcrypt>@mapbox/node-pre-gyp>tar` | build-time (native compile) | bump bcrypt to v6 (drops node-pre-gyp) — breaking |
| `hono@4.11.4` | high | `@prisma/client>prisma>@prisma/dev>hono` | dev-only (`@prisma/dev`) | wait for Prisma to trim `@prisma/dev` |
| `effect@3.18.4` | high | `@prisma/client>prisma>@prisma/config>effect` | Prisma internals | upstream Prisma |
| `rollup@4.57.0` | high | `vite>rollup` (devDep) | build-time | bump vite to v6+/v8+ — breaking |
| `minimatch@3.1.2` | high (×3) | `eslint>…>minimatch` (devDep) | lint-time | bump eslint to v10 — breaking |
| `flatted@3.x` | high | `eslint>@eslint/eslintrc>…` (devDep) | lint-time | upstream eslint |

**Assessment**: all remaining high-severity items are in **build/lint/dev**
paths (not shipped to production runtime). They cannot reach end-users of the
`core/` library. Override-forcing major bumps (bcrypt 5→6, vite 5→8, eslint 9→10)
would break the toolchain and is not recommended without a dedicated migration.

### Audit workflow for maintainers
```bash
# 必须使用官方 registry（npmmirror 不支持 audit 端点）
pnpm audit --registry=https://registry.npmjs.org
# 仅查高危以上
pnpm audit --audit-level=high --registry=https://registry.npmjs.org
```

---

## When Adding a New Core Module

1. Create the file under the appropriate `core/<domain>/` subdirectory.
2. Add the mandatory JSDoc header (copy from a neighbour).
3. Use `@/`-aliased imports for cross-module deps; `logger` for logging;
   `YYC3Error` subclasses for errors.
4. Export the public API from `core/index.ts`.
5. Add unit tests mirroring the path under `tests/unit/<domain>/`.
6. Run `pnpm typecheck && pnpm lint && pnpm test:unit` before committing.

## Existing Rule Files (for deeper context)

- `.github/instructions/architecture.instructions.md` — design patterns (Agent,
  Model Router, dual-layer Cache, Repository, Service Layer, Plugin, Event-Driven,
  Worker Thread), anti-patterns, review checklist.
- `.github/instructions/review.instructions.md` — code-review priorities (P0–P3),
  naming, test structure, commit format.
- `.github/instructions/security.instructions.md` — auth/authz, input validation,
  secrets, AI-specific security, compliance (GDPR/SOC2/ISO27001).
- `YYC³-团队代码标头格式范本.md` / `YYC³-团队文档标头格式范本.md` — file/doc header formats.
- `docs/YYC3-PortAISys-文档规范.md` — documentation standards.
- `TESTING.md` — test framework overview and performance targets.
