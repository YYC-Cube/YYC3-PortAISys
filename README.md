# YYC³ Portable Intelligent AI System

<div align="center">
  <img src="/yyc3-Family.png" alt="YYC³ PortAISys" style="max-width: 100%; height: auto; border-radius: 12px; margin-bottom: 20px;">

  <br>

  <!-- Version & License -->
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D22.13-5FA04E?style=flat-square&logo=node.js" alt="Node">
  <img src="https://img.shields.io/badge/pnpm-%3E%3D11.10-F69220?style=flat-square&logo=pnpm" alt="pnpm">
  <img src="https://img.shields.io/badge/typescript-%3E%3D5.3-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/next.js-16.0-000000?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react" alt="React">
  <br>
  <!-- CI & Quality -->
  <img src="https://img.shields.io/github/actions/workflow/status/YYC-Cube/YYC3-PortAISys/ci.yml?branch=main&label=CI&style=flat-square" alt="CI">
  <img src="https://img.shields.io/github/actions/workflow/status/YYC-Cube/YYC3-PortAISys/deploy-pages.yml?branch=main&label=deploy&style=flat-square" alt="Deploy">
  <img src="https://img.shields.io/github/actions/workflow/status/YYC-Cube/YYC3-PortAISys/security-scan.yml?branch=main&label=security&style=flat-square" alt="Security">
  <img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="Build">
  <img src="https://img.shields.io/badge/coverage-%3E80%25-brightgreen?style=flat-square" alt="Coverage">
  <br>
  <!-- Domain & Platform -->
  <img src="https://img.shields.io/badge/domain-portable.yyc3.top-4285F4?style=flat-square" alt="Domain">
  <img src="https://img.shields.io/badge/pwa-ready-5A0FC8?style=flat-square" alt="PWA">
  <img src="https://img.shields.io/badge/OS-macOS%20%7C%20Linux%20%7C%20Windows-0078D6?style=flat-square" alt="OS">

  <br><br>

  **「言启千行代码，语枢万物智能」**
  *Portable Intelligent AI System — 便携式智能AI系统*

</div>

---

## Overview

YYC³ (YanYuCloudCube) PortAISys 是一个基于云原生架构的便携式智能AI系统，采用**五维闭环架构**（分析→执行→优化→学习→管理），为企业提供高性能、高可靠性、高安全性、高扩展性、高智能化的AI解决方案。

| 特性 | 说明 |
|------|------|
| 🧠 **五维闭环** | 分析、执行、优化、学习、管理五大维度协同 |
| 🌐 **全端覆盖** | Web / iOS / Android / macOS / watchOS 多平台 |
| 🔒 **企业安全** | 端到端加密、RBAC权限、安全审计、威胁检测 |
| 📊 **AI驱动洞察** | 实时数据分析、异常检测、预测分析 |
| 🔄 **智能工作流** | 自动化的业务流程编排与执行 |
| 🚀 **高性能** | 分块处理、二级缓存、并发执行、自动扩缩容 |

---

## Quick Start

```bash
# 环境要求
# - Node.js >= 22.13.0
# - pnpm >= 11.10.0
# - PostgreSQL >= 14.0 (可选)
# - Redis >= 6.0.0 (可选)

git clone https://github.com/YYC-Cube/YYC3-PortAISys.git
cd YYC3-PortAISys

pnpm install                           # 安装依赖
cp .env.example .env                   # 配置环境变量
pnpm dev                               # 启动开发服务器（http://localhost:3200）
pnpm run build                         # 生产构建
pnpm run preview                       # 本地预览构建产物
```

---

## Architecture

### 五维闭环核心架构

```
┌──────────────────────────────────────────────────────────┐
│                  YYC³ PortAISys 核心架构                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │  Analysis    │──▶│  Execution   │──▶│ Optimization │  │
│  │   分析维度    │   │   执行维度    │   │   优化维度    │  │
│  └──────────────┘   └──────────────┘   └──────────────┘  │
│         │                                  ▲             │
│         ▼                                  │             │
│  ┌──────────────┐   ┌──────────────┐        │             │
│  │   Learning   │◀──│  Management  │────────┘             │
│  │   学习维度    │   │   管理维度    │                      │
│  └──────────────┘   └──────────────┘                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐   │
│  │  AI智能体 · 安全模块 · 监控系统 · UI组件 · 缓存层   │   │
│  └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Technology Stack

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端** | Next.js 16 + React 19 + Vite 8 | 现代化Web框架 |
| **UI** | Radix UI + shadcn/ui + Tailwind CSS 4 | 无障碍组件系统 |
| **状态** | Zustand + Context API | 轻量级状态管理 |
| **构建** | Vite 8 + TypeScript 5.3 | 高速构建工具链 |
| **认证** | NextAuth.js v5 / JWT | 企业认证方案 |
| **数据库** | PostgreSQL + Prisma 7 | 类型安全ORM |
| **AI** | OpenAI + Anthropic 适配器 | 多模型支持 |
| **缓存** | Redis + LRU Cache | 二级缓存策略 |
| **部署** | GitHub Actions + GitHub Pages | 自动化CI/CD |
| **监控** | Prometheus + Grafana | 可观测性体系 |

### Project Structure

```
YYC3-PortAISys/
├── core/                       # 核心模块（180+ 模块）
│   ├── adapters/               # AI模型适配器
│   ├── ai/agents/              # AI智能体（7个）
│   ├── analytics/              # 分析引擎
│   ├── autonomous-ai-widget/   # 自主AI浮窗
│   ├── closed-loop/            # 五维闭环系统
│   ├── error-handler/          # 错误处理体系（8模块）
│   ├── monitoring/             # 监控告警系统
│   ├── security/               # 安全模块（8模块）
│   ├── ui/                     # UI系统（30+组件）
│   └── ...                     # 更多核心模块
├── src/                        # Web应用
│   ├── App.tsx                 # React应用入口
│   ├── main.tsx                # Vite入口
│   └── pages/api/              # API路由（chat/health/sessions等）
├── public/                     # 静态资源
│   ├── manifest.json           # PWA清单
│   ├── CNAME                   # 自定义域名
│   └── yyc3/                   # 全端Logo（6平台、30+尺寸）
├── tests/                      # 测试（150+ 测试文件）
├── scripts/                    # 数据库脚本
├── docs/                       # 项目文档
└── config/                     # 监控配置（Prometheus/Grafana）
```

---

## CI/CD Pipeline

| Workflow | 触发 | 说明 |
|----------|------|------|
| **CI/CD** (`ci.yml`) | push/PR → main/develop | 代码质量检查 → 构建验证 → 单元/集成/E2E/性能/安全测试 |
| **Deploy Pages** (`deploy-pages.yml`) | push → main | 构建并部署至 GitHub Pages（[portable.yyc3.top](https://portable.yyc3.top)） |
| **Security Scan** (`security-scan.yml`) | 定时/手动 | Snyk + pnpm audit + OWASP ZAP 全链路安全扫描 |
| **Phase 1-3 Tests** (`phase123-tests.yml`) | 定时/PR | 分阶段全面回归测试 |

---

## Core Modules

### AI Agents (7个)

LayoutAgent · BehaviorAgent · ContentAgent · AssistantAgent · MonitoringAgent · LearningAgent · CollaborativeAgent

### Analytics (5个)

AIAnalyticsEngine · PredictiveAnalytics · AnomalyDetection · AIDecisionSupport · OmniChannelAnalytics

### Security (8个)

ComplianceManager · ComprehensiveSecurityCenter · SecurityAuditManager · SecurityAuditor · ThreatDetector · VulnerabilityDetector · EnhancedSecurityScanner · InputValidator

### Monitoring (6个)

EnhancedMonitoringAlertSystem · MetricsCollector · PrometheusIntegration · RealTimePerformanceMonitor · AlertManager · notification/analysis

### UI System (30+ components)

ChatInterface · ToolboxPanel · InsightsDashboard · WorkflowDesigner · IntelligentAIWidget · Window Management (~30个核心组件)

---

## Development

```bash
# 代码质量
pnpm run lint         # ESLint
pnpm run typecheck    # TypeScript类型检查

# 测试
pnpm test             # 单元+集成测试
pnpm test:unit        # 仅单元测试
pnpm test:e2e         # 端到端测试（Playwright）
pnpm test:coverage    # 覆盖率报告

# 数据库
pnpm test:db:migration   # 数据库迁移
pnpm test:db:schema      # Schema验证
pnpm test:db:connection  # 数据库连接测试
```

---

## License

MIT &copy; 2026 YYC³ Team

---

<div align="center">
  <sub>Built with ❤️ by the YYC³ Team</sub>
  <br>
  <sub>言启千行代码，语枢万物智能</sub>
</div>
