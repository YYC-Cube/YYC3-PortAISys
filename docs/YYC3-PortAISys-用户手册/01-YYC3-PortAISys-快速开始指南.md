---
@file: 01-YYC3-PortAISys-快速开始指南.md
@description: YYC3-PortAISys-快速开始指南 文档
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: general,documentation,zh-CN
@category: general
@language: zh-CN
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ PortAISys - 快速开始指南


## 📋 目录

- [系统简介](#系统简介)
- [环境要求](#环境要求)
- [快速安装](#快速安装)
- [基础配置](#基础配置)
- [启动系统](#启动系统)
- [首次使用](#首次使用)
- [常见问题](#常见问题)

---

## 系统简介

YYC³ (YanYuCloudCube) Portable Intelligent AI System 是一个基于云原生架构的便携式智能AI系统，旨在为企业提供高性能、高可靠性、高安全性、高扩展性和高可维护性的AI解决方案。

### 核心特性

- 📈 **分布式追踪**：OpenTelemetry集成，完整的可观测性
- 🔄 **五维闭环架构**：分析、执行、优化、学习、管理五大维度协同工作
- 📊 **实时数据分析**：AI驱动的实时洞察和预测分析
- 🎯 **智能工作流**：自动化的业务流程编排和执行
- 📱 **多端支持**：桌面、移动端无缝切换
- 🔒 **企业级安全**：端到端加密、RBAC权限管理
- 🚀 **高性能优化**：分块处理、二级缓存、并发执行

### 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                YYC³ Portable Intelligent AI System 核心架构               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐│
│  │  Analysis    │───▶│  Execution   │───▶│ Optimization ││
│  │   分析维度   │    │   执行维度    │    │   优化维度    ││
│  └──────────────┘    └──────────────┘    └──────────────┘│
│         │                                    ▲           │
│         │                                    │           │
│         ▼                                    │           │
│  ┌──────────────┐    ┌──────────────┐         │           │
│  │   Learning   │◀───│  Management  │─────────┘           │
│  │   学习维度   │    │   管理维度    │                     │
│  └──────────────┘    └──────────────┘                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 环境要求

### 硬件要求

| 组件 | 最低配置 | 推荐配置 |
| ------ | -------- | -------- |
| **CPU** | 4核心 | 8核心+ |
| **内存** | 8GB | 16GB+ |
| **磁盘** | 50GB SSD | 100GB+ SSD |
| **网络** | 10Mbps | 100Mbps+ |

### 软件要求

| 软件 | 最低版本 | 推荐版本 |
| ---- | -------- | -------- |
| **Node.js** | 18.0.0 | 20.19.0+ |
| **npm** | 9.0.0 | 10.0.0+ |
| **pnpm** | 8.0.0 | 10.0.0+ |
| **TypeScript** | 5.0.0 | 5.9.0+ |
| **PostgreSQL** | 14.0 | 15.0+ |
| **Redis** | 6.0 | 7.0+ |

### 检查环境

```bash
# 检查Node.js版本
node --version

# 检查npm版本
npm --version

# 检查pnpm版本
pnpm --version

# 检查TypeScript版本
tsc --version

# 检查PostgreSQL版本
psql --version

# 检查Redis版本
redis-server --version
```

---

## 快速安装

### 步骤1: 克隆仓库

```bash
# 使用git克隆
git clone https://github.com/YYC-Cube/YYC3-PortAISys.git
cd YYC3-PortAISys

# 或使用SSH
git clone git@github.com:YYC-Cube/YYC3-PortAISys.git
cd YYC3-PortAISys
```

### 步骤2: 安装依赖

```bash
# 使用pnpm安装（推荐）
pnpm install

# 或使用npm安装
npm install

# 或使用yarn安装
yarn install
```

**预期输出**:
```
Packages: +709
Progress: resolved 709, reused 709, downloaded 0, added 709, done

Done in 5.3s using pnpm v10.26.1
```

### 步骤3: 初始化数据库

```bash
# 创建数据库
createdb yyc3_db

# 运行数据库迁移
pnpm prisma migrate dev

# 生成Prisma客户端
pnpm prisma generate
```

**预期输出**:
```
Applying migration `20240101000000_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20240101000000_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

### 步骤4: 初始化Redis

```bash
# 启动Redis服务
redis-server

# 或使用Docker
docker run -d -p 6379:6379 redis:7-alpine
```

**验证Redis**:
```bash
# 测试Redis连接
redis-cli ping
# 预期输出: PONG
```

---

## 基础配置

### 创建环境变量文件

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

### 配置项说明

```env
# 应用配置
APP_NAME=YYC3-PortAISys
APP_ENV=development
APP_PORT=3200

# AI模型配置
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/yyc3_db?schema=public

# 认证配置
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3200

# 缓存配置
REDIS_URL=redis://localhost:6379

# 日志配置
LOG_LEVEL=debug
LOG_FORMAT=json

# 监控配置
ENABLE_METRICS=true
METRICS_PORT=9090

# 追踪配置
ENABLE_TRACING=true
TRACING_ENDPOINT=http://localhost:4318
```

### 获取API密钥

#### OpenAI API密钥

1. 访问 [OpenAI API](https://platform.openai.com/api-keys)
2. 登录或注册账户
3. 创建新的API密钥
4. 复制密钥到`.env`文件

#### Anthropic API密钥

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 登录或注册账户
3. 创建新的API密钥
4. 复制密钥到`.env`文件

#### Google API密钥

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用AI相关API
4. 创建API密钥
5. 复制密钥到`.env`文件

---

## 启动系统

### 开发模式

```bash
# 启动开发服务器
pnpm dev

# 或使用npm
npm run dev
```

**预期输出**:
```
  ▲ Next.js 16.1.6
  - Local:        http://localhost:3200
  - Environments: .env.local

  Ready in 2.3s
```

### 生产模式

```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start
```

**预期输出**:
```
✓ Built in 45s
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (5/5)
✓ Finalizing page optimization

Starting production server...
Ready on http://localhost:3200
```

### 验证启动

```bash
# 检查服务状态
curl http://localhost:3200/health

# 预期输出
{
  "status": "ok",
  "timestamp": 1706980800000,
  "version": "1.0.0"
}
```

---

## 首次使用

### 访问系统

1. 打开浏览器
2. 访问 `http://localhost:3200`
3. 看到欢迎页面

### 注册账户

1. 点击"注册"按钮
2. 填写注册信息：
   - 邮箱地址
   - 密码（至少8位，包含字母和数字）
   - 确认密码
   - 用户名
3. 点击"注册"按钮
4. 等待注册成功

### 登录系统

1. 点击"登录"按钮
2. 输入邮箱和密码
3. 点击"登录"按钮
4. 进入系统主页

### 使用AI浮窗

1. 点击页面右下角的AI浮窗图标
2. 输入您的问题或需求
3. 点击发送按钮
4. 等待AI响应

### 创建工作流

1. 进入"工作流"页面
2. 点击"创建工作流"按钮
3. 选择工作流模板
4. 配置工作流参数
5. 保存工作流

---

## 常见问题

### 问题1: 端口已被占用

**症状**: 启动时提示端口3200已被占用

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :3200

# 终止进程
kill -9 <PID>

# 或修改.env文件中的端口
APP_PORT=3201
```

### 问题2: 数据库连接失败

**症状**: 启动时提示无法连接数据库

**解决方案**:
```bash
# 检查PostgreSQL服务状态
sudo systemctl status postgresql

# 启动PostgreSQL服务
sudo systemctl start postgresql

# 检查数据库是否存在
psql -U postgres -l

# 创建数据库
createdb -U postgres yyc3_db
```

### 问题3: Redis连接失败

**症状**: 启动时提示无法连接Redis

**解决方案**:
```bash
# 检查Redis服务状态
redis-cli ping

# 启动Redis服务
redis-server

# 或使用Docker启动
docker run -d -p 6379:6379 redis:7-alpine
```

### 问题4: API密钥无效

**症状**: AI功能无法使用，提示API密钥无效

**解决方案**:
1. 检查`.env`文件中的API密钥是否正确
2. 确认API密钥是否已激活
3. 检查API密钥是否有足够的配额
4. 重新生成API密钥

### 问题5: 依赖安装失败

**症状**: `pnpm install` 命令失败

**解决方案**:
```bash
# 清理缓存
pnpm store prune

# 删除node_modules
rm -rf node_modules

# 重新安装
pnpm install

# 或使用npm安装
npm install
```

---

## 下一步

快速开始完成后，建议阅读以下文档：

1. [安装部署指南](./02-安装部署指南.md) - 详细部署配置
2. [配置管理指南](./03-配置管理指南.md) - 深入配置说明
3. [智能AI浮窗系统](./04-智能AI浮窗系统.md) - 核心功能使用

---

## 📞 获取帮助

如果您在快速开始过程中遇到问题，可以通过以下方式获取帮助：

- **GitHub Issues**: [提交问题](https://github.com/YYC-Cube/YYC3-PortAISys/issues)
- **邮件支持**: admin@0379.email
- **在线文档**: [完整文档](../README.md)

---
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
