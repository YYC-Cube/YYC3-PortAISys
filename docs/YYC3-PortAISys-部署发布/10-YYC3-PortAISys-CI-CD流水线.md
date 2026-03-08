---
@file: 10-YYC3-PortAISys-CI-CD流水线.md
@description: YYC3-PortAISys-CI-CD流水线 文档
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: technical,code,documentation,zh-CN
@category: deployment
@language: zh-CN
@audience: developers
@complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ PortAISys CI/CD流水线

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| **文档名称** | YYC³ PortAISys CI/CD流水线 |
| **文档版本** | v1.0.0 |
| **创建日期** | 2026-02-03 |
| **最后更新** | 2026-02-03 |
| **文档状态** | 📋 正式发布 |
| **作者** | YYC³ Team |

---

## 🎯 概述

本文档详细说明 YYC³ PortAISys 的 CI/CD 流水线配置，包括代码检查、测试、构建和部署自动化。

---

## 🔄 CI/CD 架构

### 流水线架构图

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Push/PR    │───▶│   代码检查    │───▶│   单元测试    │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   构建镜像    │◀───│  集成测试     │◀───│   安全扫描    │
└──────────────┘    └──────────────┘    └──────────────┘
     │
     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   推送镜像    │───▶│  部署预发     │───▶│   验证测试    │
└──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   部署生产    │◀───│  人工审批     │◀───│   性能测试    │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## 📝 GitHub Actions 配置

### 主 CI 流水线

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  # ===========================================
  # 代码质量检查
  # ===========================================
  code-quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm typecheck

      - name: ESLint
        run: pnpm lint

  # ===========================================
  # 单元测试
  # ===========================================
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: code-quality
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:run

      - name: Generate coverage
        run: pnpm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  # ===========================================
  # 集成测试
  # ===========================================
  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: yyc3_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Setup database
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/yyc3_test

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/yyc3_test
          REDIS_URL: redis://localhost:6379

  # ===========================================
  # E2E 测试
  # ===========================================
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build application
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: test-reports/playwright/
```

---

## 🔒 安全扫描流水线

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0'  # 每周日凌晨

jobs:
  # ===========================================
  # 依赖安全扫描
  # ===========================================
  dependency-scan:
    name: Dependency Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Upload Snyk results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: snyk.sarif

  # ===========================================
  # 代码安全扫描
  # ===========================================
  code-scan:
    name: Code Security Scan
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  # ===========================================
  # 容器镜像扫描
  # ===========================================
  image-scan:
    name: Container Image Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Build image
        run: docker build -t yyc3-portaisys:test .

      - name: Run Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'yyc3-portaisys:test'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

---

## 🚀 构建与部署流水线

```yaml
# .github/workflows/build-deploy.yml
name: Build and Deploy

on:
  push:
    branches:
      - main
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        type: choice
        options:
          - staging
          - production

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ===========================================
  # 构建镜像
  # ===========================================
  build:
    name: Build Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            BUILD_DATE=${{ github.event.head_commit.timestamp }}
            VCS_REF=${{ github.sha }}

  # ===========================================
  # 部署到预发环境
  # ===========================================
  deploy-staging:
    name: Deploy to Staging
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.yyc3.com
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to staging
        run: |
          # 这里替换为实际的部署命令
          echo "Deploying to staging..."
          # kubectl set image deployment/yyc3-app \
          #   yyc3-app=${{ needs.build.outputs.image-tag }} \
          #   -n staging

      - name: Verify deployment
        run: |
          # 等待部署完成
          kubectl rollout status deployment/yyc3-app -n staging

      - name: Run smoke tests
        run: |
          # 运行冒烟测试
          curl -f https://staging.yyc3.com/api/health || exit 1

  # ===========================================
  # 部署到生产环境
  # ===========================================
  deploy-production:
    name: Deploy to Production
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.yyc3.com
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # kubectl set image deployment/yyc3-app \
          #   yyc3-app=${{ needs.build.outputs.image-tag }} \
          #   -n production

      - name: Verify deployment
        run: |
          kubectl rollout status deployment/yyc3-app -n production

      - name: Run smoke tests
        run: |
          curl -f https://app.yyc3.com/api/health || exit 1

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Deployment to production completed!
            Image: ${{ needs.build.outputs.image-tag }}
            Digest: ${{ needs.build.outputs.image-digest }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

---

## 🎯 性能测试流水线

```yaml
# .github/workflows/performance.yml
name: Performance Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # 每周一早上

jobs:
  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build application
        run: pnpm build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          uploadArtifacts: true
          temporaryPublicStorage: true
          urls: |
            http://localhost:3200
          budgetPath: ./lighthouse-budget.json
          configPath: ./lighthouse.config.js

  load-test:
    name: Load Testing
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run k6 load test
        uses: k6io/action@v0.3
        with:
          filename: tests/performance/load-test.js
        env:
          TEST_HOST: http://localhost:3200

      - name: Upload performance results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: performance-results.json
```

---

## 📊 测试报告流水线

```yaml
# .github/workflows/test-report.yml
name: Test Report

on:
  workflow_run:
    workflows: [CI Pipeline]
    types: [completed]

jobs:
  generate-report:
    name: Generate Test Report
    runs-on: ubuntu-latest
    if: github.event.workflow_run.conclusion == 'success'
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Download test results
        uses: dawidd6/action-download-artifact@v2
        with:
          workflow: ci.yml
          run_id: ${{ github.event.workflow_run.id }}
          path: test-results

      - name: Generate report
        run: |
          tsx scripts/generate-test-report.ts

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: test-report.html

      - name: Comment PR with report
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('test-report.html', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Test Report\n\n${report}`
            });
```

---

## 🔧 流水线优化

### 并行执行

```yaml
jobs:
  job1:
    runs-on: ubuntu-latest
    steps: [...]

  job2:
    runs-on: ubuntu-latest
    steps: [...]

  job3:
    needs: [job1, job2]  # 等待 job1 和 job2 完成
    runs-on: ubuntu-latest
    steps: [...]
```

### 矩阵构建

```yaml
jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [18, 20]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
```

### 缓存优化

```yaml
steps:
  - name: Cache pnpm
    uses: actions/cache@v3
    with:
      path: |
        ~/.pnpm-store
        node_modules
      key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
      restore-keys: |
        ${{ runner.os }}-pnpm-
```

---

## ✅ 流水线最佳实践

### 1. 使用环境变量

```yaml
env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'
```

### 2. 使用复合动作

```yaml
steps:
  - name: Setup environment
    uses: ./.github/actions/setup-env
```

### 3. 条件执行

```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main' && success()
  run: deploy.sh
```

### 4. 失败重试

```yaml
- name: Test
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 10
    max_attempts: 3
    command: pnpm test
```

---

## 📚 相关文档

- [04-构建流程指南](./04-构建流程指南.md)
- [08-云平台部署指南](./08-云平台部署指南.md)

---

## 📞 联系方式

- **项目主页**: https://github.com/YYC-Cube/YYC3-PortAISys
- **问题反馈**: https://github.com/YYC-Cube/YYC3-PortAISys/issues
- **邮箱**: admin@0379.email

---
> **All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence**

Made with ❤️ by YYC³ Team

---
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
