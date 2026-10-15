# 贡献指南 / Contributing to YYC³ PortAISys

> 言启千行代码，语枢万物智能
> 感谢你为 YYC³ PortAISys 贡献力量！请先阅读本指南，让协作高效而规范。

## 目录

- [行为准则](#行为准则)
- [环境准备](#环境准备)
- [开发工作流](#开发工作流)
- [代码规范](#代码规范)
- [测试要求](#测试要求)
- [提交规范](#提交规范)
- [PR 流程](#pr-流程)
- [报告缺陷与提议功能](#报告缺陷与提议功能)
- [开发者文档导航](#开发者文档导航)

---

## 行为准则

参与本项目即表示你同意遵守 [行为准则](CODE_OF_CONDUCT.md)（Code of Conduct）。

## 环境准备

| 依赖        | 版本要求      | 说明                                        |
| ----------- | ------------- | ------------------------------------------- |
| Node.js     | **>= 22.13.0** | `.nvmrc` 已固定，Prisma 7 强制要求          |
| pnpm        | **>= 11.10.0** | `packageManager` 字段固定为 `pnpm@12.11.2`  |
| PostgreSQL  | >= 14.0（可选） | 数据库功能                                  |
| Redis       | >= 6.0（可选）  | 二级缓存                                    |

```bash
git clone https://github.com/YYC-Cube/YYC3-PortAISys.git
cd YYC3-PortAISys

nvm use                        # 使用 .nvmrc 固定的 Node 版本
pnpm install                   # 安装依赖（.npmrc 已配置 npmmirror + 超时重试）
pnpm approve-builds --all      # 允许原生构建脚本（bcrypt/prisma/esbuild）
cp .env.example .env           # 配置环境变量，填入真实值
pnpm prisma generate           # 生成 Prisma 客户端（输出至 generated/prisma）
pnpm dev                       # 启动开发服务器
```

> ⚠️ **必须使用 pnpm**：项目依赖 `pnpm-workspace.yaml` 的 `overrides`（安全补丁）与
> `onlyBuiltDependencies`，npm/yarn 会静默忽略这些配置。CI 仅接受
> `pnpm-lock.yaml`（`--frozen-lockfile`）。

## 开发工作流

采用 **Plan → Do → Check → Act → Archive** 闭环：

```
规划（目标/验收标准） → 实现 → 自检（lint/typecheck/test） → 修正 → 归档文档
```

**推送前最低门槛**（与 CI 一致）：

```bash
pnpm typecheck && pnpm lint && pnpm test:unit
```

## 代码规范

### 文件标头（强制）

每个 `.ts`/`.tsx` 文件必须以 JSDoc 标头开头（由
`scripts/code-header-compliance-tool.ts` 强制校验）：

```typescript
/**
 * @file path/relative/filename.ts
 * @description 模块简要说明
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created YYYY-MM-DD
 * @updated YYYY-MM-DD
 * @status draft|dev|test|stable|deprecated
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript,core
 */
```

### 关键约定

| 约定             | 要求                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| **路径别名**     | 跨模块导入使用 `@/*`（→ `core/*`）、`@tests/*`（→ `tests/*`）            |
| **日志**         | 禁止 `console.*`（ESLint error），使用 `core/utils/logger.ts` 的 `logger` |
| **错误处理**     | 使用 `core/error-handler/ErrorTypes.ts` 的 `YYC3Error` 类型层级           |
| **事件**         | 使用 `eventemitter3`，**不要**用 Node 内置 `events`                       |
| **TypeScript**   | 严格模式，无正当理由禁止 `any`；布尔变量用 `is/has/should` 前缀           |
| **语言**         | 注释、日志、测试描述默认中文                                              |
| **公共 API**     | 新核心模块必须在 `core/index.ts` 桶文件中导出                             |
| **文件上限**     | 2000 行/文件、150 行/函数（ESLint warn）                                  |

### 新增核心模块清单

1. 在对应 `core/<domain>/` 子目录创建文件
2. 添加 JSDoc 标头（从邻近文件复制并修改）
3. 使用 `@/` 别名导入、`logger` 记日志、`YYC3Error` 子类抛错
4. 在 `core/index.ts` 导出公共 API
5. 在 `tests/unit/<domain>/` 镜像路径添加单元测试

## 测试要求

| 类型     | 命令                    | 位置             | 性能目标    |
| -------- | ----------------------- | ---------------- | ----------- |
| 单元     | `pnpm test:unit`        | `tests/unit/**`  | < 100ms/用例 |
| 集成     | `pnpm test:integration` | `tests/integration/**` | < 5s/用例 |
| E2E      | `pnpm test:e2e`         | `tests/e2e/**`   | Playwright  |
| 安全     | `pnpm test:security`    | `tests/security/**` | —        |
| 性能     | `pnpm test:performance` | `tests/performance/**` | —     |
| 覆盖率   | `pnpm test:coverage`    | —                | **>= 80%**（CI 强制） |

> 测试环境提示：`tests/setup.ts` 全局 mock 了 `fetch`、`uuid`、DOM 与 RN 模块；
> 测试失败时先检查是否被全局 mock 拦截，用 `vi.restoreAllMocks()` 恢复。

## 提交规范

遵循 **Conventional Commits**，中文描述常见：

```
<type>(<scope>): <中文描述>

[可选正文：说明 why 与影响面]
```

| type         | 用途         |
| ------------ | ------------ |
| `feat`       | 新功能       |
| `fix`        | 缺陷修复     |
| `docs`       | 文档变更     |
| `refactor`   | 重构（不改行为） |
| `perf`       | 性能优化     |
| `test`       | 测试相关     |
| `chore`      | 构建/工具链  |
| `ci`         | CI/CD 配置   |

示例：`fix(cache): resolve Redis connection timeout issue`、`docs(readme): 更新架构图`

## PR 流程

1. 从 `main` 切出特性分支：`feat/xxx`、`fix/xxx`、`docs/xxx`
2. 完成开发并通过本地最低门槛检查
3. 推送分支并创建 PR，**目标分支 `main`**，描述中说明：动机 / 变更点 / 验证方式
4. 确保 CI 全绿（代码质量 → 构建 → 单元/集成/E2E/性能/安全测试）
5. 至少一位维护者审查通过后合并

> PR 规模建议 < 500 行变更；大重构请先开 Issue 讨论方案。

## 报告缺陷与提议功能

- **缺陷**：[GitHub Issues](https://github.com/YYC-Cube/YYC3-PortAISys/issues)，
  附复现步骤 / 期望行为 / 实际行为 / 环境信息
- **安全漏洞**：**请勿公开 Issue**！遵循 [安全政策](SECURITY.md) 私密上报
- **功能提议**：开 Issue 并使用 `enhancement` 标签，说明场景与价值

## 开发者文档导航

| 文档目录                                       | 内容                     |
| ---------------------------------------------- | ------------------------ |
| [docs/YYC3-PortAISys-架构设计](docs/YYC3-PortAISys-架构设计) | 五维闭环架构设计   |
| [docs/YYC3-PortAISys-开发指南](docs/YYC3-PortAISys-开发指南) | 开发环境与流程     |
| [docs/YYC3-PortAISys-模版规范](docs/YYC3-PortAISys-模版规范) | 代码/文档模板规范  |
| [docs/YYC3-PortAISys-测试覆盖](docs/YYC3-PortAISys-测试覆盖) | 测试策略与覆盖     |
| [docs/YYC3-PortAISys-部署发布](docs/YYC3-PortAISys-部署发布) | 部署与发布流程     |
| [TESTING.md](TESTING.md)                       | 测试框架总览             |
| [AGENTS.md](AGENTS.md)                         | AI 协同开发上下文        |

---

**YYC³ Team** · © 2026 · 言启象限 | 语枢未来
