---
@file: 24-YYC3-PortAISys-故障排除指南.md
@description: YYC3-PortAISys-故障排除指南 文档
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

# YYC³ PortAISys - 故障排除指南


## 📋 目录

- [快速诊断](#快速诊断)
- [常见问题](#常见问题)
- [错误代码](#错误代码)
- [性能问题](#性能问题)
- [网络问题](#网络问题)
- [数据库问题](#数据库问题)
- [AI模型问题](#ai模型问题)
- [安全问题](#安全问题)
- [获取帮助](#获取帮助)

---

## 快速诊断

### 健康检查端点

```bash
# 检查应用健康状态
curl http://localhost:3200/health

# 检查数据库连接
curl http://localhost:3200/api/health/database

# 检查Redis连接
curl http://localhost:3200/api/health/redis

# 检查AI模型连接
curl http://localhost:3200/api/health/ai
```

### 系统状态检查

```bash
# 检查应用服务状态
sudo systemctl status yyc3-portaisys

# 检查PostgreSQL状态
sudo systemctl status postgresql

# 检查Redis状态
sudo systemctl status redis

# 检查Nginx状态
sudo systemctl status nginx

# 检查系统资源使用
htop
```

### 日志查看

```bash
# 查看应用日志
sudo journalctl -u yyc3-portaisys -f

# 查看Nginx日志
sudo tail -f /var/log/nginx/yyc3-error.log

# 查看PostgreSQL日志
sudo tail -f /var/log/postgresql/postgresql-*.log

# 查看Redis日志
sudo tail -f /var/log/redis/redis-server.log
```

---

## 常见问题

### 问题1: 应用无法启动

**症状**: 运行`pnpm dev`或`pnpm start`后应用无法启动

**可能原因**:
- 端口已被占用
- 环境变量未配置
- 依赖未正确安装
- 数据库连接失败

**解决方案**:

#### 检查端口占用
```bash
# 查找占用端口的进程
lsof -i :3200

# 或使用netstat
netstat -tlnp | grep :3200

# 终止占用端口的进程
kill -9 <PID>

# 或修改.env中的端口
APP_PORT=3201
```

#### 检查环境变量
```bash
# 验证.env文件存在
ls -la .env

# 检查必需的环境变量
grep -E "APP_NAME|APP_ENV|DATABASE_URL|REDIS_URL" .env

# 加载环境变量
source .env

# 验证环境变量
echo $APP_NAME
echo $DATABASE_URL
```

#### 重新安装依赖
```bash
# 清理缓存
pnpm store prune

# 删除node_modules
rm -rf node_modules

# 重新安装
pnpm install
```

### 问题2: 数据库连接失败

**症状**: 应用启动时提示无法连接到数据库

**可能原因**:
- PostgreSQL服务未启动
- 数据库不存在
- 用户名或密码错误
- 网络连接问题

**解决方案**:

#### 检查PostgreSQL服务
```bash
# 检查服务状态
sudo systemctl status postgresql

# 启动服务
sudo systemctl start postgresql

# 设置开机自启
sudo systemctl enable postgresql
```

#### 验证数据库连接
```bash
# 使用psql测试连接
psql -U yyc3 -h localhost -p 5432 -d yyc3_prod

# 或使用连接字符串
psql "$DATABASE_URL"

# 检查数据库是否存在
psql -U postgres -l | grep yyc3_prod
```

#### 创建数据库
```bash
# 切换到postgres用户
sudo su - postgres

# 创建数据库
createdb yyc3_prod

# 创建用户
createuser --pwprompt yyc3

# 授权
psql -c "GRANT ALL PRIVILEGES ON DATABASE yyc3_prod TO yyc3;"
```

#### 检查防火墙
```bash
# 检查防火墙状态
sudo ufw status

# 允许PostgreSQL端口
sudo ufw allow 5432/tcp

# 或使用iptables
sudo iptables -A INPUT -p tcp --dport 5432 -j ACCEPT
```

### 问题3: Redis连接失败

**症状**: 应用启动时提示无法连接到Redis

**可能原因**:
- Redis服务未启动
- Redis配置错误
- 密码错误
- 网络连接问题

**解决方案**:

#### 检查Redis服务
```bash
# 检查服务状态
sudo systemctl status redis

# 启动服务
sudo systemctl start redis

# 设置开机自启
sudo systemctl enable redis
```

#### 测试Redis连接
```bash
# 使用redis-cli测试
redis-cli -a your_password ping

# 预期输出: PONG

# 测试连接字符串
redis-cli -u "$REDIS_URL" ping
```

#### 检查Redis配置
```bash
# 查看Redis配置
redis-cli CONFIG GET bind
redis-cli CONFIG GET port
redis-cli CONFIG GET requirepass

# 修改配置
sudo vim /etc/redis/redis.conf

# 重启Redis
sudo systemctl restart redis
```

### 问题4: AI模型调用失败

**症状**: AI功能无法使用，提示API密钥无效或请求失败

**可能原因**:
- API密钥无效或过期
- API配额不足
- 网络连接问题
- 请求参数错误

**解决方案**:

#### 验证API密钥
```bash
# 检查.env中的API密钥
grep -E "OPENAI_API_KEY|ANTHROPIC_API_KEY|GOOGLE_API_KEY" .env

# 测试OpenAI密钥
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 测试Anthropic密钥
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

#### 检查API配额
```bash
# OpenAI配额
# 访问: https://platform.openai.com/usage

# Anthropic配额
# 访问: https://console.anthropic.com/settings/usage

# Google配额
# 访问: https://console.cloud.google.com/apis/dashboard
```

#### 测试网络连接
```bash
# 测试OpenAI连接
curl -I https://api.openai.com

# 测试Anthropic连接
curl -I https://api.anthropic.com

# 测试Google连接
curl -I https://generativelanguage.googleapis.com
```

### 问题5: 页面加载缓慢

**症状**: 网站访问速度慢，响应时间长

**可能原因**:
- 数据库查询慢
- 缓存未启用
- 资源未压缩
- 网络带宽不足

**解决方案**:

#### 检查数据库性能
```bash
# 查看慢查询日志
sudo tail -f /var/log/postgresql/postgresql-slow.log

# 分析查询性能
psql -U yyc3 -d yyc3_prod -c "
  SELECT query, mean_exec_time, calls
  FROM pg_stat_statements
  ORDER BY mean_exec_time DESC
  LIMIT 10;
"
```

#### 检查缓存状态
```bash
# 检查Redis缓存命中率
redis-cli INFO stats | grep keyspace_hits

# 检查缓存使用情况
redis-cli INFO memory | grep used_memory_human

# 清理缓存
redis-cli FLUSHDB
```

#### 启用压缩
```bash
# 检查Nginx压缩配置
sudo grep -E "gzip|brotli" /etc/nginx/nginx.conf

# 启用Gzip压缩
sudo vim /etc/nginx/nginx.conf
# 添加以下配置
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
gzip_proxied any;

# 重载Nginx
sudo systemctl reload nginx
```

### 问题6: 内存占用过高

**症状**: 应用内存使用持续增长，最终导致OOM

**可能原因**:
- 内存泄漏
- 缓存配置不当
- 数据库连接池过大
- Worker线程过多

**解决方案**:

#### 检查内存使用
```bash
# 查看进程内存使用
ps aux | grep node

# 使用htop监控
htop

# 查看系统内存
free -h

# 查看Node.js堆内存
node --max-old-space-size=4096 --inspect
```

#### 优化数据库连接池
```env
# 减少连接池大小
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# 设置连接超时
DATABASE_CONNECTION_TIMEOUT=10000
```

#### 优化缓存配置
```env
# 限制缓存大小
CACHE_MEMORY_SIZE=128
CACHE_MAX_ENTRIES=5000

# 设置缓存过期时间
CACHE_DEFAULT_TTL=1800
```

#### 启用内存限制
```bash
# 在Systemd服务中添加内存限制
sudo vim /etc/systemd/system/yyc3-portaisys.service

# 添加以下配置
MemoryMax=2G
MemorySwapMax=2G

# 重载并重启
sudo systemctl daemon-reload
sudo systemctl restart yyc3-portaisys
```

### 问题7: CPU占用过高

**症状**: 应用CPU使用率持续在90%以上

**可能原因**:
- 死循环
- 无限递归
- 计算密集型任务
- Worker线程过多

**解决方案**:

#### 检查CPU使用
```bash
# 查看进程CPU使用
ps aux | grep node

# 使用htop监控
htop

# 查看系统CPU
top -bn1 | grep "Cpu(s)"

# 查看Node.js CPU分析
node --prof
```

#### 优化Worker配置
```env
# 减少Worker线程数
WORKER_COUNT=2

# 设置Worker超时
WORKER_TASK_TIMEOUT=10000
```

#### 启用CPU限制
```bash
# 在Systemd服务中添加CPU限制
sudo vim /etc/systemd/system/yyc3-portaisys.service

# 添加以下配置
CPUQuota=200%
CPUShares=1024

# 重载并重启
sudo systemctl daemon-reload
sudo systemctl restart yyc3-portaisys
```

---

## 错误代码

### HTTP错误代码

| 代码 | 名称 | 描述 | 解决方案 |
| ---- | ---- | ---- | ---- |
| **400** | Bad Request | 请求参数错误，检查请求格式 |
| **401** | Unauthorized | 未授权，检查认证信息 |
| **403** | Forbidden | 无权限，检查用户权限 |
| **404** | Not Found | 资源不存在，检查URL |
| **429** | Too Many Requests | 请求过多，检查速率限制 |
| **500** | Internal Server Error | 服务器错误，查看日志 |
| **502** | Bad Gateway | 网关错误，检查后端服务 |
| **503** | Service Unavailable | 服务不可用，检查服务状态 |
| **504** | Gateway Timeout | 网关超时，检查超时设置 |

### 应用错误代码

| 代码 | 名称 | 描述 | 解决方案 |
| ---- | ---- | ---- | ---- |
| **E001** | Database Connection Error | 数据库连接失败，检查数据库配置 |
| **E002** | Redis Connection Error | Redis连接失败，检查Redis配置 |
| **E003** | AI Model Error | AI模型错误，检查API密钥 |
| **E004** | Authentication Error | 认证错误，检查用户凭证 |
| **E005** | Authorization Error | 授权错误，检查用户权限 |
| **E006** | Validation Error | 验证错误，检查请求参数 |
| **E007** | Rate Limit Error | 速率限制，减少请求频率 |
| **E008** | Cache Error | 缓存错误，检查缓存配置 |
| **E009** | File Upload Error | 文件上传错误，检查文件大小和类型 |
| **E010** | Workflow Error | 工作流错误，检查工作流配置 |

---

## 性能问题

### 响应时间慢

**诊断步骤**:
```bash
# 使用curl测试响应时间
time curl http://localhost:3200/api/health

# 使用ab进行压力测试
ab -n 1000 -c 10 http://localhost:3200/

# 使用wrk进行性能测试
wrk -t4 -c100 -d30s http://localhost:3200/
```

**优化建议**:
1. 启用缓存
2. 优化数据库查询
3. 使用CDN加速静态资源
4. 启用HTTP/2
5. 压缩响应数据

### 并发处理能力不足

**诊断步骤**:
```bash
# 查看当前连接数
netstat -an | grep :3200 | wc -l

# 查看数据库连接数
psql -U yyc3 -d yyc3_prod -c "SELECT count(*) FROM pg_stat_activity;"

# 查看Redis连接数
redis-cli CLIENT LIST | wc -l
```

**优化建议**:
1. 增加Worker线程数
2. 优化数据库连接池
3. 使用负载均衡
4. 启用水平扩展
5. 优化代码逻辑

---

## 网络问题

### 端口无法访问

**诊断步骤**:
```bash
# 检查端口监听
netstat -tlnp | grep :3200

# 检查防火墙规则
sudo iptables -L -n -v

# 检查SELinux状态
getenforce

# 测试端口连通性
telnet localhost 3200
```

**解决方案**:
1. 检查应用配置
2. 配置防火墙规则
3. 调整SELinux策略
4. 检查网络配置

### DNS解析失败

**诊断步骤**:
```bash
# 测试DNS解析
nslookup your-domain.com

# 测试反向DNS
dig -x your-ip-address

# 检查/etc/hosts
cat /etc/hosts
```

**解决方案**:
1. 检查DNS配置
2. 清除DNS缓存
3. 使用公共DNS
4. 检查域名注册商配置

---

## 数据库问题

### 查询超时

**诊断步骤**:
```bash
# 查看当前运行的查询
psql -U yyc3 -d yyc3_prod -c "
  SELECT pid, now() - query_start AS duration, query
  FROM pg_stat_activity
  WHERE state = 'active'
  ORDER BY duration DESC;
"

# 查看锁等待
psql -U yyc3 -d yyc3_prod -c "
  SELECT * FROM pg_stat_activity
  WHERE wait_event IS NOT NULL;
"
```

**解决方案**:
1. 优化慢查询
2. 添加适当的索引
3. 调整数据库参数
4. 增加查询超时时间
5. 使用连接池

### 连接池耗尽

**诊断步骤**:
```bash
# 查看连接池状态
psql -U yyc3 -d yyc3_prod -c "
  SELECT count(*) as active_connections
  FROM pg_stat_activity;
"

# 查看最大连接数
psql -U yyc3 -d yyc3_prod -c "SHOW max_connections;"
```

**解决方案**:
1. 增加连接池大小
2. 减少连接保持时间
3. 优化查询执行时间
4. 使用连接复用
5. 实施连接超时

---

## AI模型问题

### API配额不足

**诊断步骤**:
```bash
# 检查OpenAI配额
curl https://api.openai.com/v1/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 检查Anthropic配额
curl https://api.anthropic.com/v1/messages/batches \
  -H "x-api-key: $ANTHROPIC_API_KEY"
```

**解决方案**:
1. 升级API计划
2. 实施请求缓存
3. 使用更高效的模型
4. 优化提示词
5. 实施请求队列

### 模型响应慢

**诊断步骤**:
```bash
# 测试模型响应时间
time curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Hello"}]}'
```

**解决方案**:
1. 使用更快的模型
2. 减少请求Token数
3. 启用流式响应
4. 实施请求缓存
5. 使用多个API提供商

---

## 安全问题

### SQL注入攻击

**防护措施**:
```typescript
// 使用参数化查询
const query = 'SELECT * FROM users WHERE id = $1';
const result = await prisma.$queryRawUnsafe(query, [userId]);

// 使用Prisma的查询构建器
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// 输入验证
if (!isValidUserId(userId)) {
  throw new Error('Invalid user ID');
}
```

### XSS攻击

**防护措施**:
```typescript
// 输出编码
import { OutputEncoder } from '@/security/OutputEncoder';

const encoder = new OutputEncoder();
const safeOutput = encoder.encode(userInput);

// 使用React的自动转义
<div>{userInput}</div>

// CSP头配置
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';
```

### CSRF攻击

**防护措施**:
```typescript
// 使用CSRF令牌
import { csrf } from '@/lib/csrf';

const csrfToken = csrf.createToken(req);

// 验证CSRF令牌
if (!csrf.verify(req, csrfToken)) {
  throw new Error('Invalid CSRF token');
}

// SameSite Cookie
Set-Cookie: sessionid=xxx; SameSite=Lax; Secure; HttpOnly
```

---

## 获取帮助

### 日志收集

```bash
# 收集应用日志
sudo journalctl -u yyc3-portaisys --since "1 hour ago" > app.log

# 收集Nginx日志
sudo tail -1000 /var/log/nginx/yyc3-error.log > nginx.log

# 收集PostgreSQL日志
sudo tail -1000 /var/log/postgresql/postgresql-*.log > postgres.log

# 收集系统日志
dmesg | tail -1000 > system.log

# 打包日志
tar -czf logs-$(date +%Y%m%d_%H%M%S).tar.gz *.log
```

### 问题报告

**问题报告模板**:

```markdown
## 问题描述

简要描述遇到的问题

## 环境信息

- 操作系统:
- Node.js版本:
- 应用版本:
- 部署环境:

## 重现步骤

1. 第一步
2. 第二步
3. 第三步

## 预期行为

描述期望的正常行为

## 实际行为

描述实际发生的行为

## 错误信息

粘贴相关的错误信息或日志

## 已尝试的解决方案

列出已经尝试过的解决方案
```

**提交问题**:
- GitHub Issues: https://github.com/YYC-Cube/YYC3-PortAISys/issues
- 邮件支持: admin@0379.email

---
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
