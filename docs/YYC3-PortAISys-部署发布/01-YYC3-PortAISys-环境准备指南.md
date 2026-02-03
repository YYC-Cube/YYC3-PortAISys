# YYC³ PortAISys 环境准备指南

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| **文档名称** | YYC³ PortAISys 环境准备指南 |
| **文档版本** | v1.0.0 |
| **创建日期** | 2026-02-03 |
| **最后更新** | 2026-02-03 |
| **文档状态** | 📋 正式发布 |
| **作者** | YYC³ Team |

---

## 🎯 概述

本文档描述 YYC³ PortAISys 部署所需的环境准备工作，包括开发环境、测试环境和生产环境的准备。

---

## 💻 系统要求

### 硬件要求

| 环境 | CPU | 内存 | 磁盘 | 网络 |
|------|-----|------|------|------|
| **开发环境** | 4核+ | 8GB+ | 50GB+ | 宽带 |
| **测试环境** | 8核+ | 16GB+ | 100GB+ | 100Mbps+ |
| **生产环境** | 16核+ | 32GB+ | 500GB+ | 1Gbps+ |

### 软件要求

| 软件 | 版本 | 用途 | 必需 |
|------|------|------|------|
| **Node.js** | >= 20.19.0 | 运行时环境 | ✅ 是 |
| **pnpm** | >= 8.0.0 | 包管理器 | ✅ 是 |
| **PostgreSQL** | >= 15.0 | 数据库 | ✅ 是 |
| **Redis** | >= 7.0 | 缓存 | ✅ 是 |
| **Docker** | Latest | 容器化 | ⚠️ 推荐 |
| **Git** | >= 2.30 | 版本控制 | ✅ 是 |

---

## 🔧 本地开发环境

### macOS

```bash
# 1. 安装 Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装 Node.js
brew install node@20

# 3. 安装 pnpm
npm install -g pnpm

# 4. 安装 PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# 5. 安装 Redis
brew install redis
brew services start redis

# 6. 安装 Docker（可选）
brew install --cask docker

# 7. 克隆项目
git clone https://github.com/YYC-Cube/YYC3-PortAISys.git
cd YYC3-PortAISys

# 8. 安装依赖
pnpm install
```

### Linux (Ubuntu/Debian)

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 pnpm
npm install -g pnpm

# 4. 安装 PostgreSQL
sudo apt install -y postgresql-15 postgresql-contrib-15
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 5. 安装 Redis
sudo apt install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis

# 6. 安装 Docker（可选）
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 7. 克隆项目
git clone https://github.com/YYC-Cube/YYC3-PortAISys.git
cd YYC3-PortAISys

# 8. 安装依赖
pnpm install
```

### Windows

```powershell
# 1. 安装 Chocolatey（如果未安装）
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 2. 安装 Node.js
choco install nodejs-lts -y

# 3. 安装 pnpm
npm install -g pnpm

# 4. 安装 PostgreSQL
choco install postgresql -y

# 5. 安装 Redis
choco install redis-64 -y

# 6. 安装 Docker Desktop（可选）
choco install docker-desktop -y

# 7. 克隆项目
git clone https://github.com/YYC-Cube/YYC3-PortAISys.git
cd YYC3-PortAISys

# 8. 安装依赖
pnpm install
```

---

## 🗄️ 数据库准备

### PostgreSQL 配置

```bash
# 1. 创建数据库用户
sudo -u postgres createuser --interactive --pwprompt yyc3_user

# 2. 创建数据库
sudo -u postgres createdb -O yyc3_user yyc3_db

# 3. 授予权限
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE yyc3_db TO yyc3_user;"

# 4. 测试连接
psql -h localhost -U yyc3_user -d yyc3_db
```

### Prisma 配置

```bash
# 1. 生成 Prisma Client
npx prisma generate

# 2. 运行数据库迁移
npx prisma migrate deploy

# 3. （可选）填充种子数据
npx prisma db seed
```

### Redis 配置

```bash
# 1. 启动 Redis
redis-server

# 2. 测试连接
redis-cli ping
# 应该返回: PONG

# 3. 配置密码（生产环境）
# 编辑 redis.conf
requirepass your_redis_password

# 4. 重启 Redis
redis-server /path/to/redis.conf
```

---

## 🔐 环境变量配置

### 环境变量文件

```bash
# 复制环境变量模板
cp .env.example .env
```

### .env 配置示例

```env
# ================================
# 应用配置
# ================================
NODE_ENV=development
APP_NAME=YYC3-PortAISys
APP_PORT=3200
APP_URL=http://localhost:3200

# ================================
# 数据库配置
# ================================
DATABASE_URL="postgresql://yyc3_user:password@localhost:5432/yyc3_db?schema=public"

# ================================
# Redis配置
# ================================
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# ================================
# NextAuth配置
# ================================
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3200"

# ================================
# AI模型配置
# ================================
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
GOOGLE_API_KEY="your-google-api-key"

# ================================
# 日志配置
# ================================
LOG_LEVEL=debug

# ================================
# OpenTelemetry配置
# ================================
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
OTEL_SERVICE_NAME="yyc3-portaisys"
```

---

## 🐳 Docker 环境（可选）

### Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: yyc3-postgres
    environment:
      POSTGRES_USER: yyc3_user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: yyc3_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: yyc3-redis
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  app:
    build: .
    container_name: yyc3-app
    ports:
      - "3200:3200"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://yyc3_user:password@postgres:5432/yyc3_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 启动 Docker 环境

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止服务并删除数据
docker-compose down -v
```

---

## 🧪 测试环境准备

### GitHub Actions 测试环境

测试环境通过 GitHub Actions 自动创建，无需手动准备。

### 本地测试环境

```bash
# 1. 创建测试数据库
createdb yyc3_test_db

# 2. 配置测试环境变量
cp .env.example .env.test
# 编辑 .env.test，设置测试数据库连接

# 3. 运行测试
pnpm test
```

---

## 🚀 生产环境准备

### 服务器准备

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装必要软件
sudo apt install -y curl git nginx ufw

# 3. 配置防火墙
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# 4. 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 5. 安装 pnpm
npm install -g pnpm

# 6. 安装 PM2
npm install -g pm2
```

### Nginx 配置

```nginx
# /etc/nginx/sites-available/yyc3-portaisys
server {
    listen 80;
    server_name app.yyc3.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.yyc3.com;

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/app.yyc3.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yyc3.com/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/yyc3-access.log;
    error_log /var/log/nginx/yyc3-error.log;

    # 代理配置
    location / {
        proxy_pass http://localhost:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3200;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL 证书配置

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d app.yyc3.com

# 自动续期
sudo certbot renew --dry-run
```

---

## ✅ 环境验证

### 验证脚本

```bash
#!/bin/bash
# verify-env.sh

echo "🔍 验证 YYC³ PortAISys 环境..."

# 检查 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js 未安装"
    exit 1
fi

# 检查 pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo "✅ pnpm: $PNPM_VERSION"
else
    echo "❌ pnpm 未安装"
    exit 1
fi

# 检查 PostgreSQL
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL: 已安装"
else
    echo "❌ PostgreSQL 未安装"
    exit 1
fi

# 检查 Redis
if command -v redis-cli &> /dev/null; then
    echo "✅ Redis: 已安装"
else
    echo "❌ Redis 未安装"
    exit 1
fi

# 检查环境变量文件
if [ -f .env ]; then
    echo "✅ .env 文件: 存在"
else
    echo "❌ .env 文件: 不存在"
    exit 1
fi

echo "🎉 环境验证完成！"
```

### 运行验证

```bash
# 赋予执行权限
chmod +x verify-env.sh

# 运行验证
./verify-env.sh
```

---

## 📚 下一步

环境准备完成后，请继续阅读：
- [02-依赖安装指南](./02-依赖安装指南.md)
- [03-配置管理指南](./03-配置管理指南.md)

---

## 📞 联系方式

- **项目主页**: https://github.com/YYC-Cube/YYC3-PortAISys
- **问题反馈**: https://github.com/YYC-Cube/YYC3-PortAISys/issues
- **邮箱**: admin@0379.email

---

> **「万象归元于云枢 | 深栈智启新纪元」**
> **All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence**

Made with ❤️ by YYC³ Team
