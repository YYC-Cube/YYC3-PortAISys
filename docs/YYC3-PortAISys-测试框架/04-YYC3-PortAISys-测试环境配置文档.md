---
@file: 04-YYC3-PortAISys-测试环境配置文档.md
@description: YYC3-PortAISys-测试环境配置文档 文档
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

# YYC³ PortAISys - 测试环境配置文档


## 📋 文档概述

本文档定义了 YYC³ PortAISys 项目的测试环境配置，包括环境类型、配置要求、部署步骤、维护指南和故障排除。测试环境配置是确保测试工作顺利进行的基础保障。

---

## 🌍 环境类型

### 环境分层

```
┌─────────────────────────────────────────────────────────┐
│                  测试环境分层架构                      │
├─────────────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────────┐                                │
│  │  生产环境     │  线上生产环境                 │
│  │  Production  │  生产监控、性能监控             │
│  └──────────────┘                                │
│         ↓                                          │
│  ┌──────────────────┐                             │
│  │   预发布环境      │  预发布服务器               │
│  │   Staging       │  验收测试、回归测试           │
│  └──────────────────┘                             │
│         ↓                                          │
│  ┌──────────────────────┐                         │
│  │     测试环境          │  独立测试服务器             │
│  │     Testing        │  集成测试、系统测试           │
│  └──────────────────────┘                         │
│         ↓                                          │
│  ┌──────────────────────────┐                     │
│  │       开发环境            │  本地开发机器             │
│  │       Development      │  单元测试、开发调试           │
│  └──────────────────────────┘                     │
│                                                   │
└─────────────────────────────────────────────────────────┘
```

### 环境对比

| 环境类型 | 用途 | 配置 | 访问权限 | 数据 |
|----------|------|------|----------|------|
| 开发环境 | 单元测试、开发调试 | 本地开发机器 | 开发者 | Mock数据 |
| 测试环境 | 集成测试、系统测试 | 独立测试服务器 | 测试团队 | 测试数据 |
| 预发布环境 | 验收测试、回归测试 | 预发布服务器 | 测试团队、产品经理 | 准生产数据 |
| 生产环境 | 生产监控、性能监控 | 生产服务器 | 运维团队 | 生产数据 |

---

## 💻 开发环境配置

### 系统要求

| 组件 | 最低要求 | 推荐配置 |
|------|----------|----------|
| 操作系统 | macOS 12+ / Ubuntu 20.04+ / Windows 10+ | macOS 13+ / Ubuntu 22.04+ |
| CPU | 4核心 | 8核心 |
| 内存 | 8GB | 16GB |
| 磁盘 | 50GB | 100GB SSD |
| Node.js | 18.x | 20.x |
| pnpm | 8.x | 9.x |
| Git | 2.30+ | 2.40+ |

### 软件安装

#### 1. 安装 Node.js

```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

#### 2. 安装 pnpm

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 或使用 curl 安装
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

#### 3. 安装 Playwright 浏览器

```bash
# 安装 Playwright 浏览器
pnpm install
pnpm exec playwright install

# 安装所有浏览器
pnpm exec playwright install --with-deps
```

### 环境变量配置

创建 `.env.test` 文件：

```bash
# 应用配置
NODE_ENV=test
PORT=3201

# 数据库配置
DATABASE_URL=postgresql://test:test@localhost:5432/yyc3_test
DATABASE_POOL_SIZE=10

# Redis配置
REDIS_URL=redis://localhost:6379/1
REDIS_PASSWORD=

# AI服务配置
OPENAI_API_KEY=sk-test-key
OPENAI_API_BASE=https://api.openai.com/v1

# 日志配置
LOG_LEVEL=debug
LOG_DIR=./logs

# 测试配置
TEST_TIMEOUT=10000
TEST_RETRIES=2
```

### 本地数据库配置

#### PostgreSQL 配置

```bash
# 安装 PostgreSQL
brew install postgresql@15

# 启动 PostgreSQL
brew services start postgresql@15

# 创建测试数据库
createdb yyc3_test

# 运行数据库迁移
pnpm db:migrate
```

#### Redis 配置

```bash
# 安装 Redis
brew install redis

# 启动 Redis
brew services start redis

# 测试连接
redis-cli ping
```

---

## 🧪 测试环境配置

### 服务器配置

| 组件 | 配置 | 说明 |
|------|------|------|
| 操作系统 | Ubuntu 22.04 LTS | Linux服务器 |
| CPU | 8核心 | 虚拟机 |
| 内存 | 32GB | 虚拟机 |
| 磁盘 | 200GB SSD | 虚拟机 |
| Node.js | 20.x | LTS版本 |
| PostgreSQL | 15.x | 数据库 |
| Redis | 7.x | 缓存 |

### 网络配置

```
测试环境网络拓扑
┌─────────────────────────────────────────────────────────┐
│                                                   │
│  ┌──────────────┐                                │
│  │  测试服务器    │  192.168.1.100              │
│  │  Test Server │  - 应用服务: 3201            │
│  └──────────────┘  - 数据库: 5432              │
│         ↓          - Redis: 6379               │
│  ┌──────────────────┐                             │
│  │   CI/CD服务器    │  192.168.1.200             │
│  │   CI/CD Server  │  - GitHub Actions Runner    │
│  └──────────────────┘                             │
│                                                   │
└─────────────────────────────────────────────────────────┘
```

### 端口配置

| 服务 | 端口 | 协议 | 用途 |
|------|------|------|------|
| 应用服务 | 3201 | HTTP | Web应用（测试环境） |
| 应用服务 | 3443 | HTTPS | Web应用（SSL） |
| PostgreSQL | 5432 | TCP | 数据库 |
| Redis | 6379 | TCP | 缓存 |
| Vitest UI | 51204 | HTTP | 测试UI界面 |

### 环境变量配置

创建 `/etc/environment` 或使用 systemd 环境变量：

```bash
# 应用配置
NODE_ENV=test
PORT=3201

# 数据库配置
DATABASE_URL=postgresql://test:test@localhost:5432/yyc3_test
DATABASE_POOL_SIZE=20

# Redis配置
REDIS_URL=redis://localhost:6379/1
REDIS_PASSWORD=

# AI服务配置
OPENAI_API_KEY=sk-test-key
OPENAI_API_BASE=https://api.openai.com/v1

# 日志配置
LOG_LEVEL=info
LOG_DIR=/var/log/yyc3

# 测试配置
TEST_TIMEOUT=10000
TEST_RETRIES=2
```

---

## 🚀 预发布环境配置

### 服务器配置

| 组件 | 配置 | 说明 |
|------|------|------|
| 操作系统 | Ubuntu 22.04 LTS | Linux服务器 |
| CPU | 16核心 | 虚拟机 |
| 内存 | 64GB | 虚拟机 |
| 磁盘 | 500GB SSD | 虚拟机 |
| Node.js | 20.x | LTS版本 |
| PostgreSQL | 15.x | 数据库 |
| Redis | 7.x | 缓存 |

### 网络配置

```
预发布环境网络拓扑
┌─────────────────────────────────────────────────────────┐
│                                                   │
│  ┌──────────────┐                                │
│  │  预发布服务器  │  192.168.2.100              │
│  │  Staging     │  - 应用服务: 3202            │
│  └──────────────┘  - 数据库: 5432              │
│         ↓          - Redis: 6379               │
│  ┌──────────────────┐                             │
│  │   负载均衡器     │  192.168.2.200             │
│  │   Load Balancer│  - Nginx                   │
│  └──────────────────┘                             │
│                                                   │
└─────────────────────────────────────────────────────────┘
```

### 端口配置

| 服务 | 端口 | 协议 | 用途 |
|------|------|------|------|
| 应用服务 | 3202 | HTTP | Web应用（预发布环境） |
| 应用服务 | 3443 | HTTPS | Web应用（SSL） |
| PostgreSQL | 5432 | TCP | 数据库 |
| Redis | 6379 | TCP | 缓存 |
| Nginx | 80 | HTTP | 负载均衡 |
| Nginx | 443 | HTTPS | 负载均衡（SSL） |

---

## 🏭 生产环境配置

### 服务器配置

| 组件 | 配置 | 说明 |
|------|------|------|
| 操作系统 | Ubuntu 22.04 LTS | Linux服务器 |
| CPU | 32核心 | 虚拟机 |
| 内存 | 128GB | 虚拟机 |
| 磁盘 | 1TB SSD | 虚拟机 |
| Node.js | 20.x | LTS版本 |
| PostgreSQL | 15.x | 数据库 |
| Redis | 7.x | 缓存 |

### 网络配置

```
生产环境网络拓扑
┌─────────────────────────────────────────────────────────┐
│                                                   │
│  ┌──────────────┐                                │
│  │  生产服务器    │  192.168.3.100              │
│  │  Production  │  - 应用服务: 3200            │
│  └──────────────┘  - 数据库: 5432              │
│         ↓          - Redis: 6379               │
│  ┌──────────────────┐                             │
│  │   负载均衡器     │  192.168.3.200             │
│  │   Load Balancer│  - Nginx                   │
│  └──────────────────┘                             │
│         ↓                                          │
│  ┌──────────────────────┐                         │
│  │   CDN/防火墙        │  公网IP                  │
│  │   CDN/Firewall    │  - Cloudflare             │
│  └──────────────────────┘                         │
│                                                   │
└─────────────────────────────────────────────────────────┘
```

### 端口配置

| 服务 | 端口 | 协议 | 用途 |
|------|------|------|------|
| 应用服务 | 3200 | HTTP | Web应用（内网） |
| 应用服务 | 3443 | HTTPS | Web应用（内网SSL） |
| PostgreSQL | 5432 | TCP | 数据库（内网） |
| Redis | 6379 | TCP | 缓存（内网） |
| Nginx | 80 | HTTP | 负载均衡 |
| Nginx | 443 | HTTPS | 负载均衡（SSL） |

---

## 📦 部署步骤

### 开发环境部署

```bash
# 1. 克隆代码仓库
git clone https://github.com/yyc3/yyc3-Portable-Intelligent-AI-System.git
cd yyc3-Portable-Intelligent-AI-System

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env.test
vi .env.test

# 4. 初始化数据库
pnpm db:migrate

# 5. 启动开发服务器
pnpm dev

# 6. 运行测试
pnpm test:all
```

### 测试环境部署

```bash
# 1. 连接到测试服务器
ssh test@192.168.1.100

# 2. 克隆代码仓库
git clone https://github.com/yyc3/yyc3-Portable-Intelligent-AI-System.git
cd yyc3-Portable-Intelligent-AI-System

# 3. 安装依赖
pnpm install

# 4. 配置环境变量
sudo cp .env.example /etc/environment
sudo vi /etc/environment

# 5. 初始化数据库
pnpm db:migrate

# 6. 创建系统服务
sudo cp systemd/yyc3-test.service /etc/systemd/system/
sudo systemctl enable yyc3-test
sudo systemctl start yyc3-test

# 7. 配置Nginx
sudo cp nginx/yyc3-test.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/yyc3-test.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 8. 运行测试
pnpm test:all
```

### 预发布环境部署

```bash
# 1. 连接到预发布服务器
ssh staging@192.168.2.100

# 2. 拉取最新代码
cd /var/www/yyc3
git pull origin main

# 3. 安装依赖
pnpm install

# 4. 运行数据库迁移
pnpm db:migrate

# 5. 重启服务
sudo systemctl restart yyc3-staging

# 6. 运行测试
pnpm test:all
```

### 生产环境部署

```bash
# 1. 连接到生产服务器
ssh production@192.168.3.100

# 2. 拉取最新代码
cd /var/www/yyc3
git pull origin main

# 3. 安装依赖
pnpm install

# 4. 运行数据库迁移
pnpm db:migrate

# 5. 重启服务（零停机部署）
sudo systemctl reload yyc3-production

# 6. 验证部署
curl https://api.yyc3.com/health
```

---

## 🔧 维护指南

### 日常维护

#### 1. 日志监控

```bash
# 查看应用日志
tail -f /var/log/yyc3/application.log

# 查看错误日志
tail -f /var/log/yyc3/error.log

# 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

#### 2. 性能监控

```bash
# 查看CPU使用率
top

# 查看内存使用率
free -h

# 查看磁盘使用率
df -h

# 查看网络连接
netstat -an | grep ESTABLISHED
```

#### 3. 数据库维护

```bash
# 连接到数据库
psql -U test -d yyc3_test

# 查看数据库大小
SELECT pg_size_pretty(pg_database_size('yyc3_test'));

# 查看表大小
SELECT pg_size_pretty(pg_total_relation_size('table_name'));

# 清理数据库
VACUUM ANALYZE;
```

#### 4. 缓存维护

```bash
# 连接到Redis
redis-cli

# 查看内存使用
INFO memory

# 清理过期键
SCAN 0 MATCH * COUNT 1000

# 清空缓存（谨慎使用）
FLUSHDB
```

### 定期维护

#### 1. 每日维护

- [ ] 检查应用日志
- [ ] 检查错误日志
- [ ] 检查系统资源使用
- [ ] 运行每日测试

#### 2. 每周维护

- [ ] 数据库备份
- [ ] 清理过期日志
- [ ] 更新依赖包
- [ ] 安全扫描

#### 3. 每月维护

- [ ] 性能评估
- [ ] 容量规划
- [ ] 灾难恢复演练
- [ ] 环境升级

---

## 🚨 故障排除

### 常见问题

#### 1. 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3201

# 杀死进程
kill -9 <PID>

# 或使用fuser
fuser -k 3201/tcp
```

#### 2. 数据库连接失败

```bash
# 检查PostgreSQL服务状态
sudo systemctl status postgresql

# 启动PostgreSQL
sudo systemctl start postgresql

# 检查连接
psql -U test -d yyc3_test -h localhost
```

#### 3. Redis连接失败

```bash
# 检查Redis服务状态
sudo systemctl status redis

# 启动Redis
sudo systemctl start redis

# 检查连接
redis-cli ping
```

#### 4. 测试超时

```bash
# 增加测试超时时间
export TEST_TIMEOUT=30000

# 或修改vitest.config.ts
testTimeout: 30000
```

#### 5. 内存不足

```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 或修改package.json
"test": "node --max-old-space-size=4096 node_modules/.bin/vitest"
```

### 日志分析

#### 1. 错误日志分析

```bash
# 查找错误日志
grep "ERROR" /var/log/yyc3/application.log

# 查找特定错误
grep "Connection refused" /var/log/yyc3/application.log

# 统计错误数量
grep "ERROR" /var/log/yyc3/application.log | wc -l
```

#### 2. 性能日志分析

```bash
# 查找慢查询
grep "slow query" /var/log/yyc3/application.log

# 查找高CPU使用
grep "high cpu" /var/log/yyc3/application.log

# 查找内存泄漏
grep "memory leak" /var/log/yyc3/application.log
```

---

## 🔐 安全配置

### 1. 防火墙配置

```bash
# 配置UFW防火墙
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # 应用服务（内网）
sudo ufw enable
```

### 2. SSL证书配置

```bash
# 安装Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d api.yyc3.com

# 自动续期
sudo certbot renew --dry-run
```

### 3. 数据库安全

```bash
# 修改默认密码
sudo -u postgres psql
ALTER USER test WITH PASSWORD 'strong_password';

# 限制远程访问
sudo vi /etc/postgresql/15/main/pg_hba.conf
# 只允许本地连接
host    yyc3_test    test    127.0.0.1/32    md5
```

### 4. Redis安全

```bash
# 设置Redis密码
sudo vi /etc/redis/redis.conf
requirepass strong_password

# 重启Redis
sudo systemctl restart redis
```

---

## 📋 相关文档

1. [测试策略文档](./01-YYC3-PortAISys-测试策略文档.md) - 测试策略
2. [测试计划文档](./02-YYC3-PortAISys-测试计划文档.md) - 测试计划
3. [测试用例规范文档](./03-YYC3-PortAISys-测试用例规范文档.md) - 测试用例规范
4. [缺陷管理流程文档](./05-YYC3-PortAISys-缺陷管理流程文档.md) - 缺陷管理流程
5. [测试报告模板](./06-YYC3-PortAISys-测试报告模板.md) - 测试报告模板

---

## 📞 联系方式

如有测试环境配置相关问题，请联系：

- **运维团队**: ops@yyc3.com
- **测试团队**: test@yyc3.com
- **技术支持**: tech@yyc3.com

---
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
