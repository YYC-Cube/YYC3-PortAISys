# 安全政策 / Security Policy

> YYC³ PortAISys · 便携式智能AI系统
> 安全是我们「五高架构」的核心支柱。我们感谢负责任的漏洞披露。

## 支持的版本 / Supported Versions

| 版本  | 分支     | 安全更新 | 说明                     |
| ----- | -------- | -------- | ------------------------ |
| 1.x   | `main`   | ✅       | 当前发布版本             |
| develop | `develop` | ⚠️     | 开集分支，安全修复异步合入 |

## 报告漏洞 / Reporting a Vulnerability

**🚨 请勿通过公开 GitHub Issue、PR 或 Discussion 报告安全漏洞！**

### 上报渠道（二选一）

1. **GitHub 私密漏洞报告**（推荐）：
   [Security Advisories → Report a vulnerability](https://github.com/YYC-Cube/YYC3-PortAISys/security/advisories/new)
2. **邮件**：<admin@0379.email>（主题注明 `[SECURITY] YYC3-PortAISys`）

### 报告内容请包含

- 漏洞类型（如 XSS / SSRF / 依赖供应链 / RCE）与严重程度评估
- 受影响的版本 / 提交哈希 / 代码路径
- 复现步骤或 PoC（最小化即可）
- 修复建议（如有）

### 响应时限 / Response Timeline

| 阶段                       | 目标时限     |
| -------------------------- | ------------ |
| 确认收到报告               | **48 小时**  |
| 初步评估与严重程度定级     | 5 个工作日   |
| 修复发布（Critical/High）  | 30 天内      |
| 修复发布（Moderate/Low）   | 下个常规版本 |
| 公开披露与致谢             | 修复发布后   |

## 安全测试体系 / Security Pipeline

本项目通过多层自动化安全流水线持续防护（详见
[security-scan.yml](.github/workflows/security-scan.yml) 与 [ci.yml](.github/workflows/ci.yml)）：

| 层级       | 工具                                   | 触发              |
| ---------- | -------------------------------------- | ----------------- |
| 依赖审计   | `pnpm audit` + Dependabot + Snyk       | 每次 push/PR + 每日定时 |
| 供应链加固 | `pnpm-workspace.yaml` overrides（protobufjs/js-yaml RCE 等 8 项强制补丁） | 锁文件级 |
| Web 渗透   | OWASP ZAP Baseline Scan（CSP/头部/注入） | push/PR + 每日定时 |
| 结果归档   | SARIF → GitHub Security Tab（CodeQL 上传） | 每次扫描      |
| 静态检测   | `tests/security/**` 安全测试套件        | 每次 CI           |
| 运行时防护 | CSP Meta 策略（无 unsafe-eval/通配符）、Referrer 策略 | 每次构建 |

### 当前已知接受风险

| 包       | 严重度 | 说明                                                                 |
| -------- | ------ | -------------------------------------------------------------------- |
| `braces` | high   | 上游**无补丁版本**；仅位于 `react-native→metro` 开发工具链，生产运行时不可达 |

## 安全编码要求（贡献者） / Security Coding Requirements

提交代码前请自检（详见 [CONTRIBUTING.md](CONTRIBUTING.md)）：

- [ ] 无硬编码密钥/Token/密码（一律使用环境变量）
- [ ] 用户输入经校验与转义（使用 `core/security/InputValidator`）
- [ ] 数据库操作参数化（Prisma 参数查询，防注入）
- [ ] 错误信息不泄露内部细节
- [ ] 敏感操作有审计日志
- [ ] 新增依赖无已知高危漏洞（`pnpm audit --audit-level=high` 通过）

## 安全披露历史 / Security Advisories

已修复的安全公告将发布于
[GitHub Security Advisories](https://github.com/YYC-Cube/YYC3-PortAISys/security/advisories)。

---

**YYC³ Team** · © 2026 · <admin@0379.email> · 言启象限 | 语枢未来
