---
@file: 02-YYC3-PortAISys-安装部署指南.md
@description: YYC3-PortAISys-安装部署指南 文档
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

# YYC³ PortAISys - 安装部署指南


## 📋 目录

- [部署架构](#部署架构)
- [环境准备](#环境准备)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [Docker部署](#docker部署)
- [Kubernetes部署](#kubernetes部署)
- [升级维护](#升级维护)
- [故障排除](#故障排除)

---

## 部署架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    YYC³ PortAISys 部署架构                │
├─────────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐│
│  │  Web Server  │───▶│  App Server  │───▶│  Database    ││
│  │  Nginx/SSL  │    │  Node.js     │    │  PostgreSQL  ││
│  └──────────────┘    └──────────────┘    └──────────────┘│
│         │                    │                    │           │
│         │                    ▼                    │           │
│  ┌──────────────┐    ┌──────────────┐              │           │
│  │  Load Balancer│    │  Redis Cache │              │           │
│  │  HAProxy/NLB │    │  Redis 7.0  │              │           │
│  └──────────────┘    └──────────────┘              │           │
│         │                                         │           │
│         ▼                                         │           │
│  ┌──────────────┐                                 │           │
│  │  Monitoring  │◀─────────────────────────────────┘           │
│  │  Prometheus  │                                             │
│  └──────────────┘                                             │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────┐                                             │
│  │  Alerting    │                                             │
│  │  Grafana    │                                             │
│  └──────────────┘                                             │
│                                                         │
└─────────────────────────────────────────────────────────────┘
```

### 端口规划

| 服务 | 端口 | 协议 | 说明 |
| ---- | ---- | ---- | ---- |
| **Web Server** | 80/443 | HTTP/HTTPS | 对外服务端口 |
| **App Server** | 3200 | HTTP | 应用服务端口 |
| **PostgreSQL** | 5432 | TCP | 数据库端口 |
| **Redis** | 6379 | TCP | 缓存端口 |
| **Prometheus** | 9090 | HTTP | 监控端口 |
| **Grafana** | 3000 | HTTP | 可视化端口 |
| **OpenTelemetry** | 4318 | HTTP | 追踪端口 |

---

## 环境准备

### 系统要求

#### 操作系统

- **推荐**: Ubuntu 22.04 LTS / CentOS 8+ / Debian 11+
- **支持**: Windows Server 2019+ / macOS 12+

#### 硬件配置

| 环境 | CPU | 内存 | 磁盘 | 网络 |
| ---- | ---- | ---- | ---- | ---- |
| **开发环境** | 4核心 | 8GB | 50GB SSD | 10Mbps |
| **测试环境** | 8核心 | 16GB | 100GB SSD | 100Mbps |
| **生产环境** | 16核心+ | 32GB+ | 500GB+ SSD | 1Gbps+ |

#### 软件依赖

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y \
  curl \
  wget \
  git \
  vim \
  htop \
  net-tools \
  build-essential

# 安装Node.js (使用nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# 安装pnpm
npm install -g pnpm

# 安装PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 安装Redis
sudo apt install -y redis-server

# 安装Nginx
sudo apt install -y nginx

# 安装Docker (可选）
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

---

## 开发环境部署

### 步骤1: 克隆代码

```bash
# 克隆仓库
git clone https://github.com/YYC-Cube/YYC3-PortAISys.git
cd YYC3-PortAISys

# 切换到开发分支
git checkout develop
```

### 步骤2: 安装依赖

```bash
# 安装项目依赖
pnpm install

# 安装开发依赖
pnpm install -D
```

### 步骤3: 配置环境

```bash
# 复制环境变量模板
cp .env.example .env.development

# 编辑环境变量
vim .env.development
```

**开发环境配置示例**:
```env
# 应用配置
APP_NAME=YYC3-PortAISys
APP_ENV=development
APP_PORT=3200
NODE_ENV=development

# 数据库配置
DATABASE_URL=postgresql://yyc3:yyc3_password@localhost:5432/yyc3_dev?schema=public

# Redis配置
REDIS_URL=redis://localhost:6379

# AI模型配置
OPENAI_API_KEY=sk-dev-xxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-dev-xxxxxxxxxxxx
GOOGLE_API_KEY=AIza-dev-xxxxxxxxxxxx

# 认证配置
NEXTAUTH_SECRET=dev-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3200

# 日志配置
LOG_LEVEL=debug
LOG_FORMAT=pretty

# 开发工具配置
ENABLE_HOT_RELOAD=true
ENABLE_SOURCE_MAP=true
```

### 步骤4: 初始化数据库

```bash
# 创建开发数据库
sudo -u postgres createdb yyc3_dev

# 运行数据库迁移
pnpm prisma migrate dev

# 生成Prisma客户端
pnpm prisma generate

# 填充测试数据（可选）
pnpm prisma db seed
```

### 步骤5: 启动开发服务器

```bash
# 启动开发服务器
pnpm dev

# 或使用npm
npm run dev
```

**访问地址**: http://localhost:3200

---

## 生产环境部署

### 步骤1: 创建部署用户

```bash
# 创建应用用户
sudo useradd -m -s /bin/bash yyc3

# 设置密码
sudo passwd yyc3

# 添加到sudo组（可选）
sudo usermod -aG sudo yyc3
```

### 步骤2: 安装依赖

```bash
# 切换到应用用户
sudo su - yyc3

# 克隆代码
git clone https://github.com/YYC-Cube/YYC3-PortAISys.git
cd YYC3-PortAISys

# 安装依赖
pnpm install --production
```

### 步骤3: 配置生产环境

```bash
# 复制环境变量模板
cp .env.example .env.production

# 编辑环境变量
vim .env.production
```

**生产环境配置示例**:
```env
# 应用配置
APP_NAME=YYC3-PortAISys
APP_ENV=production
APP_PORT=3200
NODE_ENV=production

# 数据库配置
DATABASE_URL=postgresql://yyc3:strong_password@localhost:5432/yyc3_prod?schema=public&pool_timeout=20&connect_timeout=10

# Redis配置
REDIS_URL=redis://:redis_password@localhost:6379/0

# AI模型配置
OPENAI_API_KEY=sk-prod-xxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-prod-xxxxxxxxxxxx
GOOGLE_API_KEY=AIza-prod-xxxxxxxxxxxx

# 认证配置
NEXTAUTH_SECRET=very-strong-secret-key-change-immediately
NEXTAUTH_URL=https://your-domain.com

# 日志配置
LOG_LEVEL=info
LOG_FORMAT=json

# 性能配置
NODE_ENV=production
ENABLE_COMPRESSION=true
ENABLE_CACHING=true

# 安全配置
ENABLE_RATE_LIMIT=true
ENABLE_CORS=true
CORS_ORIGIN=https://your-domain.com

# 监控配置
ENABLE_METRICS=true
ENABLE_TRACING=true
```

### 步骤4: 配置PostgreSQL

```bash
# 切换到postgres用户
sudo su - postgres

# 创建生产数据库
createdb yyc3_prod

# 创建数据库用户
createuser --pwprompt yyc3

# 授权
psql -c "GRANT ALL PRIVILEGES ON DATABASE yyc3_prod TO yyc3;"

# 配置PostgreSQL
sudo vim /etc/postgresql/14/main/postgresql.conf
```

**PostgreSQL配置优化**:
```conf
# 连接设置
max_connections = 200
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# 查询优化
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB

# 日志设置
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'mod'
log_duration = on
```

### 步骤5: 配置Redis

```bash
# 备份配置
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# 编辑Redis配置
sudo vim /etc/redis/redis.conf
```

**Redis配置优化**:
```conf
# 网络配置
bind 127.0.0.1
port 6379
protected-mode yes

# 内存配置
maxmemory 4gb
maxmemory-policy allkeys-lru

# 持久化配置
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

# 日志配置
loglevel notice
logfile /var/log/redis/redis-server.log

# 安全配置
requirepass your_redis_password
rename-command FLUSHDB ""
rename-command FLUSHALL ""
```

### 步骤6: 构建应用

```bash
# 构建生产版本
pnpm build

# 验证构建
ls -la dist/
```

### 步骤7: 配置Systemd服务

```bash
# 创建服务文件
sudo vim /etc/systemd/system/yyc3-portaisys.service
```

**Systemd服务配置**:
```ini
[Unit]
Description=YYC³ PortAISys Application
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=yyc3
WorkingDirectory=/home/yyc3/YYC3-PortAISys
Environment="NODE_ENV=production"
EnvironmentFile=/home/yyc3/YYC3-PortAISys/.env.production
ExecStart=/home/yyc3/.nvm/versions/node/v20.19.5/bin/node /home/yyc3/YYC3-PortAISys/node_modules/.bin/next start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=yyc3-portaisys

[Install]
WantedBy=multi-user.target
```

```bash
# 重载systemd配置
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start yyc3-portaisys

# 设置开机自启
sudo systemctl enable yyc3-portaisys

# 查看服务状态
sudo systemctl status yyc3-portaisys
```

### 步骤8: 配置Nginx

```bash
# 创建Nginx配置
sudo vim /etc/nginx/sites-available/yyc3-portaisys
```

**Nginx配置**:
```nginx
upstream yyc3_backend {
    server 127.0.0.1:3200;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    # SSL证书配置
    ssl_certificate /etc/ssl/certs/yyc3.crt;
    ssl_certificate_key /etc/ssl/private/yyc3.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 日志配置
    access_log /var/log/nginx/yyc3-access.log;
    error_log /var/log/nginx/yyc3-error.log;

    # 代理配置
    location / {
        proxy_pass http://yyc3_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://yyc3_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }

    # 健康检查
    location /health {
        proxy_pass http://yyc3_backend;
        access_log off;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/yyc3-portaisys /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载Nginx
sudo systemctl reload nginx
```

---

## Docker部署

### 创建Dockerfile

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache postgresql-client

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 切换用户
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 创建docker-compose.yml

```yaml
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    container_name: yyc3-postgres
    environment:
      POSTGRES_USER: yyc3
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: yyc3_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - yyc3-network
    restart: unless-stopped

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: yyc3-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - yyc3-network
    restart: unless-stopped

  # 应用服务
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: yyc3-app
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://yyc3:${DB_PASSWORD}@postgres:5432/yyc3_prod?schema=public
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379/0
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: https://your-domain.com
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    networks:
      - yyc3-network
    restart: unless-stopped

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: yyc3-nginx
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app
    networks:
      - yyc3-network
    restart: unless-stopped

  # Prometheus监控
  prometheus:
    image: prom/prometheus:latest
    container_name: yyc3-prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - yyc3-network
    restart: unless-stopped

  # Grafana可视化
  grafana:
    image: grafana/grafana:latest
    container_name: yyc3-grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
    networks:
      - yyc3-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  yyc3-network:
    driver: bridge
```

### 启动Docker服务

```bash
# 创建环境变量文件
cat > .env << EOF
DB_PASSWORD=your_strong_password
REDIS_PASSWORD=your_redis_password
OPENAI_API_KEY=sk-prod-xxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-prod-xxxxxxxxxxxx
NEXTAUTH_SECRET=very-strong-secret-key
GRAFANA_PASSWORD=your_grafana_password
EOF

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

---

## Kubernetes部署

### 创建Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: yyc3-portaisys
```

### 创建ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: yyc3-config
  namespace: yyc3-portaisys
data:
  NODE_ENV: "production"
  APP_PORT: "3000"
  LOG_LEVEL: "info"
```

### 创建Secret

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: yyc3-secrets
  namespace: yyc3-portaisys
type: Opaque
data:
  DATABASE_URL: cG9zdGdyZXNxbD15eWNzOl9zdHJvbmdfcGFzc3dvcmRAbG9jYWxob3N0OjU0MzIveXljM19wcm9kP3NjaGVtYT1wdWJsaWM=
  REDIS_URL: cmVkaXM6Oi9zdHJvbmdfcGFzc3dvcmRAcmVkaXM6NjM3OS8w
  OPENAI_API_KEY: c2stcHJkLXh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4
  ANTHROPIC_API_KEY: c2stYW50LXByb2QteHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4
  NEXTAUTH_SECRET: dmVyeS1zdHJvbmctc2VjcmV0LWtleS1jaGFuZ2UtaW1tZWRpYXRlbHk=
```

### 创建Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yyc3-app
  namespace: yyc3-portaisys
spec:
  replicas: 3
  selector:
    matchLabels:
      app: yyc3-app
  template:
    metadata:
      labels:
        app: yyc3-app
    spec:
      containers:
      - name: yyc3-app
        image: yyc3/portaisys:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: yyc3-config
        - secretRef:
            name: yyc3-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 创建Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: yyc3-service
  namespace: yyc3-portaisys
spec:
  type: LoadBalancer
  selector:
    app: yyc3-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  sessionAffinity: ClientIP
```

### 部署到Kubernetes

```bash
# 创建命名空间
kubectl apply -f namespace.yaml

# 创建配置
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# 部署应用
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# 查看部署状态
kubectl get pods -n yyc3-portaisys

# 查看服务
kubectl get svc -n yyc3-portaisys

# 查看日志
kubectl logs -f deployment/yyc3-app -n yyc3-portaisys
```

---

## 升级维护

### 应用升级

```bash
# 备份当前版本
sudo cp -r /home/yyc3/YYC3-PortAISys /home/yyc3/YYC3-PortAISys.backup

# 拉取最新代码
cd /home/yyc3/YYC3-PortAISys
git fetch origin
git checkout main
git pull origin main

# 安装新依赖
pnpm install

# 运行数据库迁移
pnpm prisma migrate deploy

# 重新构建
pnpm build

# 重启服务
sudo systemctl restart yyc3-portaisys

# 验证升级
curl http://localhost:3200/health
```

### 数据库备份

```bash
# 创建备份目录
mkdir -p /backup/postgres

# 执行备份
pg_dump -U yyc3 -h localhost -p 5432 yyc3_prod > /backup/postgres/yyc3_$(date +%Y%m%d_%H%M%S).sql

# 压缩备份
gzip /backup/postgres/yyc3_$(date +%Y%m%d_%H%M%S).sql

# 设置定时备份（可选）
crontab -e
# 添加以下行
# 0 2 * * * pg_dump -U yyc3 -h localhost -p 5432 yyc3_prod | gzip > /backup/postgres/yyc3_$(date +\%Y\%m\%d).sql.gz
```

### 日志轮转

```bash
# 创建日志轮转配置
sudo vim /etc/logrotate.d/yyc3-portaisys
```

**logrotate配置**:
```
/home/yyc3/YYC3-PortAISys/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 yyc3 yyc3
    sharedscripts
    postrotate
        sudo systemctl reload yyc3-portaisys > /dev/null 2>&1 || true
    endscript
}
```

---

## 故障排除

### 问题1: 服务无法启动

**症状**: Systemd服务启动失败

**排查步骤**:
```bash
# 查看服务状态
sudo systemctl status yyc3-portaisys

# 查看详细日志
sudo journalctl -u yyc3-portaisys -n 50

# 检查端口占用
sudo netstat -tlnp | grep :3200
```

**解决方案**:
- 检查环境变量配置
- 检查数据库连接
- 检查文件权限
- 查看应用日志

### 问题2: 数据库连接失败

**症状**: 应用无法连接到PostgreSQL

**排查步骤**:
```bash
# 检查PostgreSQL服务
sudo systemctl status postgresql

# 测试连接
psql -U yyc3 -h localhost -p 5432 -d yyc3_prod

# 检查防火墙
sudo ufw status
```

**解决方案**:
- 确保PostgreSQL服务运行
- 检查数据库用户权限
- 检查防火墙规则
- 验证连接字符串

### 问题3: Redis连接失败

**症状**: 应用无法连接到Redis

**排查步骤**:
```bash
# 检查Redis服务
sudo systemctl status redis

# 测试连接
redis-cli -a your_password ping

# 检查Redis日志
sudo tail -f /var/log/redis/redis-server.log
```

**解决方案**:
- 确保Redis服务运行
- 检查Redis密码配置
- 检查防火墙规则
- 验证连接字符串

---

## 下一步

部署完成后，建议阅读以下文档：

1. [配置管理指南](./03-配置管理指南.md) - 深入配置说明
2. [监控和告警系统](./13-监控和告警系统.md) - 配置监控告警
3. [故障排除指南](./24-故障排除指南.md) - 常见问题解决方案

---
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
