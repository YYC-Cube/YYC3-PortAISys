# YYC³ PortAISys Docker容器化

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| **文档名称** | YYC³ PortAISys Docker容器化 |
| **文档版本** | v1.0.0 |
| **创建日期** | 2026-02-03 |
| **最后更新** | 2026-02-03 |
| **文档状态** | 📋 正式发布 |
| **作者** | YYC³ Team |

---

## 🎯 概述

本文档详细说明 YYC³ PortAISys 的 Docker 容器化部署方案，包括镜像构建、容器编排和生产环境部署。

---

## 🐳 Docker 架构

### 容器架构图

```
┌─────────────────────────────────────────────────────────┐
│                       Docker Network                    │
│                      yyc3-network                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Nginx     │  │ Web Dashboard│  │  API Server  │  │
│  │   Container  │  │   Container  │  │   Container  │  │
│  │  (Port 80)   │  │ (Port 3000)  │  │ (Port 3001)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                 │                  │          │
│         └─────────────────┴──────────────────┘          │
│                           │                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │   MinIO      │  │
│  │   Container  │  │   Container  │  │   Container  │  │
│  │(Port 5432)   │  │  (Port 6379) │  │  (Port 9000) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📄 Dockerfile

### 主应用 Dockerfile

```dockerfile
# Dockerfile
# ===========================================
# 阶段 1: 依赖安装
# ===========================================
FROM node:20-alpine AS deps

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# ===========================================
# 阶段 2: 构建应用
# ===========================================
FROM node:20-alpine AS builder

WORKDIR /app

# 从 deps 阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 安装 pnpm
RUN npm install -g pnpm

# 构建应用
RUN pnpm build

# ===========================================
# 阶段 3: 生产运行
# ===========================================
FROM node:20-alpine AS runner

WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3200
ENV HOSTNAME="0.0.0.0"

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# 复制构建输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3200

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3200/api/health || exit 1

# 启动应用
CMD ["node", "server.js"]
```

### Web Dashboard Dockerfile

```dockerfile
# web-dashboard/Dockerfile
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm
RUN pnpm build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV PORT=3200

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3200

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3200/api/health || exit 1

CMD ["node", "server.js"]
```

---

## 🐋 Docker Compose

### 完整配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ===========================================
  # PostgreSQL 数据库
  # ===========================================
  postgres:
    image: postgres:15-alpine
    container_name: yyc3-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: yyc3_user
      POSTGRES_PASSWORD: yyc3_password
      POSTGRES_DB: yyc3_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U yyc3_user"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - yyc3-network

  # ===========================================
  # Redis 缓存
  # ===========================================
  redis:
    image: redis:7-alpine
    container_name: yyc3-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass yyc3_redis_password
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - yyc3-network

  # ===========================================
  # 主应用
  # ===========================================
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: yyc3-app
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3200
      DATABASE_URL: postgresql://yyc3_user:yyc3_password@postgres:5432/yyc3_db
      REDIS_URL: redis://:yyc3_redis_password@redis:6379
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    ports:
      - "3200:3200"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3200/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - yyc3-network

  # ===========================================
  # Web Dashboard
  # ===========================================
  dashboard:
    build:
      context: ./web-dashboard
      dockerfile: Dockerfile
    container_name: yyc3-dashboard
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://yyc3_user:yyc3_password@postgres:5432/yyc3_db
      REDIS_URL: redis://:yyc3_redis_password@redis:6379
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
    ports:
      - "3202:3200"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3200/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - yyc3-network

  # ===========================================
  # Nginx 反向代理
  # ===========================================
  nginx:
    image: nginx:alpine
    container_name: yyc3-nginx
    restart: unless-stopped
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app
      - dashboard
    networks:
      - yyc3-network

networks:
  yyc3-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

---

## 🔧 Docker 优化

### 镜像优化

#### 1. 多阶段构建

```dockerfile
# ✅ 优化前: 单阶段构建
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
RUN npm prune --production
CMD ["npm", "start"]

# ✅ 优化后: 多阶段构建
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
CMD ["npm", "start"]
```

#### 2. 层缓存优化

```dockerfile
# ✅ 优化后: 充分利用层缓存
FROM node:20-alpine
WORKDIR /app

# 先复制依赖文件，利用缓存
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 再复制源代码
COPY . .

# 构建应用
RUN pnpm build
```

#### 3. .dockerignore

```dockerfile
# .dockerignore
node_modules
npm-debug.log
dist
.git
.gitignore
.env
.env.local
.env.*.local
.next
coverage
.nyc_output
.vscode
.idea
*.md
Dockerfile
docker-compose.yml
.dockerignore
```

### 运行时优化

#### 1. 内存限制

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

#### 2. CPU 限制

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
        reservations:
          cpus: '0.5'
```

#### 3. 日志配置

```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🚀 部署命令

### 构建镜像

```bash
# 构建主应用镜像
docker build -t yyc3-portaisys:latest .

# 构建 Dashboard 镜像
docker build -t yyc3-dashboard:latest ./web-dashboard

# 使用 buildx 构建多平台镜像
docker buildx build --platform linux/amd64,linux/arm64 -t yyc3-portaisys:latest .
```

### 运行容器

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

### 管理命令

```bash
# 查看运行状态
docker-compose ps

# 进入容器
docker-compose exec app sh

# 重启服务
docker-compose restart app

# 查看资源使用
docker stats
```

---

## 🐳 生产环境部署

### 生产环境 Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: yyc3-portaisys:latest
    restart: always
    environment:
      NODE_ENV: production
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      rollback_config:
        parallelism: 0
        order: stop-first
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 滚动更新

```bash
# 拉取最新镜像
docker-compose pull

# 滚动更新
docker-compose up -d --remove-orphans

# 查看更新状态
docker-compose ps
```

---

## 🔍 监控与调试

### 容器监控

```bash
# 查看容器状态
docker ps

# 查看容器详细信息
docker inspect yyc3-app

# 查看资源使用
docker stats yyc3-app

# 查看日志
docker logs yyc3-app
docker logs -f --tail=100 yyc3-app
```

### 调试技巧

```bash
# 进入容器
docker exec -it yyc3-app sh

# 查看环境变量
docker exec yyc3-app env

# 查看进程
docker exec yyc3-app ps aux

# 网络调试
docker exec yyc3-app ping postgres
```

---

## 📚 相关文档

- [04-构建流程指南](./04-构建流程指南.md)
- [08-云平台部署指南](./08-云平台部署指南.md)
- [09-Kubernetes部署指南](./09-Kubernetes部署指南.md)

---

## 📞 联系方式

- **项目主页**: https://github.com/YYC-Cube/YYC3-PortAISys
- **问题反馈**: https://github.com/YYC-Cube/YYC3-PortAISys/issues
- **邮箱**: admin@0379.email

---

> **「万象归元于云枢 | 深栈智启新纪元」**
> **All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence**

Made with ❤️ by YYC³ Team
