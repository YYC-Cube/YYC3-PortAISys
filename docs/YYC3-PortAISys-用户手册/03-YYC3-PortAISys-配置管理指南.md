# YYC³ PortAISys - 配置管理指南

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> **文档版本**: v1.0
> **创建日期**: 2026-02-03
> **文档状态**: ✅ 已完成
> **维护团队**: YYC³ 产品团队

---

## 📋 目录

- [配置概述](#配置概述)
- [环境变量配置](#环境变量配置)
- [应用配置](#应用配置)
- [数据库配置](#数据库配置)
- [缓存配置](#缓存配置)
- [AI模型配置](#ai模型配置)
- [安全配置](#安全配置)
- [监控配置](#监控配置)
- [高级配置](#高级配置)

---

## 配置概述

YYC³ PortAISys 使用分层配置系统，支持环境变量、配置文件和运行时配置。配置优先级从高到低为：

1. **环境变量** (最高优先级)
2. **配置文件** (.env, .env.local, .env.production)
3. **默认配置** (最低优先级)

### 配置文件位置

| 环境 | 配置文件 | 说明 |
| ---- | -------- | ---- |
| **开发环境** | .env.development | 开发环境配置 |
| **测试环境** | .env.test | 测试环境配置 |
| **生产环境** | .env.production | 生产环境配置 |
| **本地覆盖** | .env.local | 本地覆盖配置（不提交到版本控制） |

### 配置加载顺序

```
1. 加载 .env.example (模板）
2. 加载 .env (通用配置）
3. 加载 .env.{NODE_ENV} (环境特定配置）
4. 加载 .env.local (本地覆盖）
5. 应用环境变量（系统环境变量）
```

---

## 环境变量配置

### 基础配置

```env
# 应用名称
APP_NAME=YYC3-PortAISys

# 应用环境 (development|test|production)
APP_ENV=production

# 应用端口
APP_PORT=3200

# Node.js环境
NODE_ENV=production

# 时区设置
TZ=Asia/Shanghai
```

### 日志配置

```env
# 日志级别 (debug|info|warn|error)
LOG_LEVEL=info

# 日志格式 (json|pretty)
LOG_FORMAT=json

# 日志输出路径
LOG_PATH=/var/log/yyc3

# 日志文件最大大小（MB）
LOG_MAX_SIZE=100

# 日志文件保留天数
LOG_MAX_DAYS=30

# 启用控制台日志
LOG_CONSOLE_ENABLED=true

# 启用文件日志
LOG_FILE_ENABLED=true
```

### 性能配置

```env
# 启用压缩
ENABLE_COMPRESSION=true

# 启用缓存
ENABLE_CACHING=true

# 启用Gzip
ENABLE_GZIP=true

# 启用Brotli
ENABLE_BROTLI=true

# 最大并发连接数
MAX_CONCURRENT_CONNECTIONS=100

# 请求超时时间（毫秒）
REQUEST_TIMEOUT=30000

# 响应超时时间（毫秒）
RESPONSE_TIMEOUT=60000
```

---

## 应用配置

### Next.js配置

```env
# NextAuth配置
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-very-strong-secret-key-min-32-chars

# API路由前缀
API_PREFIX=/api

# 静态资源URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# 资源CDN URL（可选）
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com

# 图片域名
NEXT_PUBLIC_IMAGE_DOMAIN=https://images.your-domain.com
```

### 状态管理配置

```env
# 状态持久化类型 (memory|localStorage|sessionStorage|indexedDB)
STATE_PERSISTENCE_TYPE=localStorage

# 状态持久化键前缀
STATE_KEY_PREFIX=yyc3_

# 状态自动保存间隔（毫秒）
STATE_AUTO_SAVE_INTERVAL=5000

# 状态最大历史记录数
STATE_MAX_HISTORY=100
```

---

## 数据库配置

### PostgreSQL配置

```env
# 数据库连接字符串
DATABASE_URL=postgresql://username:password@host:port/database?schema=public

# 连接池配置
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20
DATABASE_POOL_IDLE_TIMEOUT=30000

# 查询超时（毫秒）
DATABASE_QUERY_TIMEOUT=30000

# 连接超时（毫秒）
DATABASE_CONNECTION_TIMEOUT=10000

# 启用查询日志
DATABASE_LOG_QUERIES=false

# 启用慢查询日志
DATABASE_LOG_SLOW_QUERIES=true
DATABASE_SLOW_QUERY_THRESHOLD=1000
```

### Prisma配置

```env
# Prisma日志级别 (query|error|warn|info)
PRISMA_LOG_LEVEL=error

# 启用Prisma调试
PRISMA_DEBUG=false

# 二进制目标目录
PRISMA_BINARY_TARGET=prisma

# Schema文件路径
PRISMA_SCHEMA_PATH=prisma/schema.prisma
```

### 数据库迁移配置

```env
# 迁移模式 (deploy|dev|shadow-db)
PRISMA_MIGRATE_MODE=deploy

# 启用自动迁移
PRISMA_AUTO_MIGRATE=false

# 迁移超时时间（秒）
PRISMA_MIGRATE_TIMEOUT=300
```

---

## 缓存配置

### Redis配置

```env
# Redis连接字符串
REDIS_URL=redis://:password@host:port/db

# Redis键前缀
REDIS_KEY_PREFIX=yyc3:

# Redis默认过期时间（秒）
REDIS_DEFAULT_TTL=3600

# 启用Redis集群
REDIS_CLUSTER_ENABLED=false

# Redis集群节点（逗号分隔）
REDIS_CLUSTER_NODES=redis://node1:6379,redis://node2:6379,redis://node3:6379

# Redis连接超时（毫秒）
REDIS_CONNECT_TIMEOUT=10000

# Redis命令超时（毫秒）
REDIS_COMMAND_TIMEOUT=5000
```

### 应用缓存配置

```env
# 缓存类型 (memory|redis|hybrid)
CACHE_TYPE=hybrid

# 内存缓存大小（MB）
CACHE_MEMORY_SIZE=256

# 缓存默认过期时间（秒）
CACHE_DEFAULT_TTL=3600

# 缓存最大条目数
CACHE_MAX_ENTRIES=10000

# 启用缓存预热
CACHE_WARMUP_ENABLED=true

# 缓存预热间隔（秒）
CACHE_WARMUP_INTERVAL=300
```

---

## AI模型配置

### OpenAI配置

```env
# OpenAI API密钥
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx

# OpenAI组织ID（可选）
OPENAI_ORGANIZATION_ID=org-xxxxxxxxxxxx

# OpenAI基础URL
OPENAI_BASE_URL=https://api.openai.com/v1

# OpenAI模型
OPENAI_MODEL=gpt-4

# 最大Token数
OPENAI_MAX_TOKENS=4096

# 温度参数（0-2）
OPENAI_TEMPERATURE=0.7

# Top P采样（0-1）
OPENAI_TOP_P=1.0

# 频率惩罚（-2.0-2.0）
OPENAI_FREQUENCY_PENALTY=0.0

# 存在惩罚（-2.0-2.0）
OPENAI_PRESENCE_PENALTY=0.0

# 启用流式响应
OPENAI_STREAM=true

# 请求超时（毫秒）
OPENAI_TIMEOUT=60000
```

### Anthropic配置

```env
# Anthropic API密钥
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx

# Anthropic基础URL
ANTHROPIC_BASE_URL=https://api.anthropic.com

# Anthropic模型
ANTHROPIC_MODEL=claude-3-opus-20240229

# 最大Token数
ANTHROPIC_MAX_TOKENS=4096

# 温度参数（0-1）
ANTHROPIC_TEMPERATURE=0.7

# Top K采样（0-40）
ANTHROPIC_TOP_K=40

# Top P采样（0-1）
ANTHROPIC_TOP_P=0.95

# 启用流式响应
ANTHROPIC_STREAM=true

# 请求超时（毫秒）
ANTHROPIC_TIMEOUT=60000
```

### Google配置

```env
# Google API密钥
GOOGLE_API_KEY=AIzaSyxxxxxxxxxxxx

# Google基础URL
GOOGLE_BASE_URL=https://generativelanguage.googleapis.com/v1

# Google模型
GOOGLE_MODEL=gemini-pro

# 最大Token数
GOOGLE_MAX_TOKENS=4096

# 温度参数（0-2）
GOOGLE_TEMPERATURE=0.7

# Top K采样（1-40）
GOOGLE_TOP_K=40

# Top P采样（0-1）
GOOGLE_TOP_P=0.95

# 启用流式响应
GOOGLE_STREAM=true

# 请求超时（毫秒）
GOOGLE_TIMEOUT=60000
```

### 模型选择策略

```env
# 模型选择策略 (performance|cost|quality|availability)
MODEL_SELECTION_STRATEGY=quality

# 启用模型自动切换
MODEL_AUTO_SWITCH=true

# 模型切换阈值（错误率）
MODEL_SWITCH_THRESHOLD=0.05

# 启用A/B测试
MODEL_AB_TESTING=false

# A/B测试流量分配（百分比）
MODEL_AB_TRAFFIC_SPLIT=50:50
```

---

## 安全配置

### 认证配置

```env
# JWT密钥
JWT_SECRET=your-very-strong-jwt-secret-min-32-chars

# JWT过期时间（秒）
JWT_EXPIRES_IN=86400

# JWT刷新过期时间（秒）
JWT_REFRESH_EXPIRES_IN=604800

# 启用JWT刷新
JWT_REFRESH_ENABLED=true

# 启用多设备登录
JWT_MULTI_DEVICE=true
```

### 密码配置

```env
# 密码最小长度
PASSWORD_MIN_LENGTH=8

# 密码最大长度
PASSWORD_MAX_LENGTH=128

# 密码复杂度要求
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true

# 密码哈希算法
PASSWORD_HASH_ALGORITHM=bcrypt

# 密码哈希轮数
PASSWORD_HASH_ROUNDS=12

# 密码重置令牌过期时间（秒）
PASSWORD_RESET_TOKEN_EXPIRES=3600
```

### CORS配置

```env
# 启用CORS
ENABLE_CORS=true

# 允许的源（逗号分隔）
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# 允许的方法（逗号分隔）
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS

# 允许的请求头（逗号分隔）
CORS_HEADERS=Content-Type,Authorization,X-Requested-With

# 允许的凭证
CORS_CREDENTIALS=true

# 预检请求缓存时间（秒）
CORS_MAX_AGE=86400
```

### 速率限制配置

```env
# 启用速率限制
ENABLE_RATE_LIMIT=true

# 速率限制窗口（毫秒）
RATE_LIMIT_WINDOW=60000

# 速率限制最大请求数
RATE_LIMIT_MAX_REQUESTS=100

# 速率限制跳过路径（逗号分隔）
RATE_LIMIT_SKIP_PATHS=/health,/metrics,/api/public

# 速率限制存储类型 (memory|redis)
RATE_LIMIT_STORAGE=redis

# 速率限制键前缀
RATE_LIMIT_KEY_PREFIX=rate_limit:
```

### 安全头配置

```env
# 启用安全头
ENABLE_SECURITY_HEADERS=true

# X-Frame-Options
SECURITY_FRAME_OPTIONS=SAMEORIGIN

# X-Content-Type-Options
SECURITY_CONTENT_TYPE_OPTIONS=nosniff

# X-XSS-Protection
SECURITY_XSS_PROTECTION=1; mode=block

# Strict-Transport-Security
SECURITY_STS=max-age=31536000; includeSubDomains; preload

# Content-Security-Policy
SECURITY_CSP=default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';

# Referrer-Policy
SECURITY_REFERRER_POLICY=strict-origin-when-cross-origin

# Permissions-Policy
SECURITY_PERMISSIONS_POLICY=camera=(), microphone=(), geolocation=()
```

---

## 监控配置

### Prometheus配置

```env
# 启用Prometheus指标
ENABLE_PROMETHEUS=true

# Prometheus端口
PROMETHEUS_PORT=9090

# Prometheus路径
PROMETHEUS_PATH=/metrics

# Prometheus指标前缀
PROMETHEUS_METRIC_PREFIX=yyc3_

# 启用默认指标
PROMETHEUS_DEFAULT_METRICS=true

# 启用自定义指标
PROMETHEUS_CUSTOM_METRICS=true
```

### OpenTelemetry配置

```env
# 启用分布式追踪
ENABLE_TRACING=true

# 追踪服务名称
TRACING_SERVICE_NAME=yyc3-portaisys

# 追踪端点
TRACING_ENDPOINT=http://localhost:4318

# 追踪采样率（0-1）
TRACING_SAMPLING_RATE=1.0

# 追踪导出器 (otlp|zipkin|jaeger)
TRACING_EXPORTER=otlp

# 启用追踪日志
TRACING_LOG_ENABLED=true

# 追踪日志级别
TRACING_LOG_LEVEL=info
```

### 告警配置

```env
# 启用告警
ENABLE_ALERTS=true

# 告警通知方式 (email|webhook|slack|teams)
ALERT_NOTIFICATION_TYPE=email

# 告警邮件配置
ALERT_EMAIL_FROM=alerts@your-domain.com
ALERT_EMAIL_TO=admin@your-domain.com
ALERT_EMAIL_SMTP_HOST=smtp.gmail.com
ALERT_EMAIL_SMTP_PORT=587
ALERT_EMAIL_SMTP_USER=alerts@your-domain.com
ALERT_EMAIL_SMTP_PASSWORD=your-smtp-password

# 告警Webhook配置
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/xxxxx
ALERT_WEBHOOK_TIMEOUT=5000

# 告警级别阈值
ALERT_LEVEL_ERROR=true
ALERT_LEVEL_WARN=true
ALERT_LEVEL_INFO=false
```

---

## 高级配置

### Worker配置

```env
# 启用Worker线程
ENABLE_WORKERS=true

# Worker线程数
WORKER_COUNT=4

# Worker最大任务队列大小
WORKER_MAX_QUEUE=1000

# Worker任务超时（毫秒）
WORKER_TASK_TIMEOUT=30000

# Worker心跳间隔（毫秒）
WORKER_HEARTBEAT_INTERVAL=5000
```

### 文件上传配置

```env
# 启用文件上传
ENABLE_FILE_UPLOAD=true

# 最大文件大小（MB）
FILE_UPLOAD_MAX_SIZE=10

# 允许的文件类型（逗号分隔）
FILE_UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf

# 文件上传路径
FILE_UPLOAD_PATH=/uploads

# 启用文件病毒扫描
FILE_UPLOAD_VIRUS_SCAN=false

# 文件保留天数
FILE_UPLOAD_RETENTION_DAYS=30
```

### 会话配置

```env
# 会话存储类型 (memory|redis|database)
SESSION_STORAGE_TYPE=redis

# 会话过期时间（秒）
SESSION_MAX_AGE=86400

# 会话密钥
SESSION_SECRET=your-session-secret-min-32-chars

# 会话Cookie名称
SESSION_COOKIE_NAME=yyc3_session

# 会话Cookie域名
SESSION_COOKIE_DOMAIN=.your-domain.com

# 会话Cookie路径
SESSION_COOKIE_PATH=/

# 会话Cookie安全设置
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE=lax
```

### 功能开关配置

```env
# 启用AI功能
FEATURE_AI_ENABLED=true

# 启用工作流功能
FEATURE_WORKFLOW_ENABLED=true

# 启用分析功能
FEATURE_ANALYTICS_ENABLED=true

# 启用监控功能
FEATURE_MONITORING_ENABLED=true

# 启用测试模式
FEATURE_TEST_MODE=false

# 启用维护模式
FEATURE_MAINTENANCE_MODE=false
```

---

## 配置验证

### 验证脚本

```bash
#!/bin/bash

# 检查必需的环境变量
required_vars=(
  "APP_NAME"
  "APP_ENV"
  "DATABASE_URL"
  "REDIS_URL"
  "NEXTAUTH_SECRET"
  "OPENAI_API_KEY"
)

missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "❌ 缺少必需的环境变量:"
  for var in "${missing_vars[@]}"; do
    echo "  - $var"
  done
  exit 1
fi

echo "✅ 所有必需的环境变量已配置"

# 验证数据库连接
if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo "✅ 数据库连接正常"
else
  echo "❌ 数据库连接失败"
  exit 1
fi

# 验证Redis连接
if redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
  echo "✅ Redis连接正常"
else
  echo "❌ Redis连接失败"
  exit 1
fi

echo "✅ 配置验证完成"
```

### 使用验证脚本

```bash
# 保存为validate-config.sh
chmod +x validate-config.sh

# 运行验证
./validate-config.sh
```

---

## 配置最佳实践

### 安全建议

1. **使用强密钥**: 所有密钥应至少32个字符，包含大小写字母、数字和特殊字符
2. **环境隔离**: 开发、测试、生产环境使用不同的配置
3. **密钥管理**: 使用密钥管理服务（如AWS Secrets Manager、HashiCorp Vault）
4. **定期轮换**: 定期更换API密钥和JWT密钥
5. **最小权限**: 数据库用户只授予必要的权限

### 性能建议

1. **连接池优化**: 根据负载调整数据库和Redis连接池大小
2. **缓存策略**: 合理设置缓存过期时间，避免缓存雪崩
3. **日志级别**: 生产环境使用info或error级别，避免过多日志
4. **压缩启用**: 启用Gzip和Brotli压缩，减少传输数据量
5. **超时设置**: 合理设置各种超时时间，避免资源泄漏

### 可维护性建议

1. **配置文档化**: 为每个配置项添加注释说明其用途
2. **版本控制**: 将配置模板提交到版本控制，敏感信息使用环境变量
3. **配置验证**: 启动前验证配置，避免运行时错误
4. **监控配置**: 监控配置变更，及时发现异常
5. **配置审计**: 记录配置变更历史，便于问题追踪

---

## 下一步

配置完成后，建议阅读以下文档：

1. [智能AI浮窗系统](./04-智能AI浮窗系统.md) - 核心功能使用
2. [五维闭环系统](./05-五维闭环系统.md) - 系统架构理解
3. [监控和告警系统](./13-监控和告警系统.md) - 监控配置

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
