---
@file: 03-YYC3-PortAISys-配置管理指南.md
@description: YYC3-PortAISys-配置管理指南 文档
@author: YanYuCloudCube Team <admin@0379.email>
@version: v1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: stable
@tags: technical,code,documentation,zh-CN
@category: deployment
@language: zh-CN
@audience: developers
@complexity: advanced
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ PortAISys 配置管理指南

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| **文档名称** | YYC³ PortAISys 配置管理指南 |
| **文档版本** | v1.0.0 |
| **创建日期** | 2026-02-03 |
| **最后更新** | 2026-02-03 |
| **文档状态** | 📋 正式发布 |
| **作者** | YYC³ Team |

---

## 🎯 概述

本文档详细说明 YYC³ PortAISys 的配置管理，包括环境变量、配置文件、多环境配置和配置安全。

---

## 📁 配置文件结构

```
yyc3-Portable-Intelligent-AI-System/
├── .env                    # 开发环境变量（本地，不提交）
├── .env.example            # 环境变量模板
├── .env.test               # 测试环境变量
├── .env.production         # 生产环境变量（不提交）
├── .gitignore              # Git忽略文件（包含敏感配置）
├── next.config.ts          # Next.js配置
├── tsconfig.json           # TypeScript配置
├── tailwind.config.ts      # Tailwind CSS配置
├── web-dashboard/
│   ├── next.config.ts      # Dashboard Next.js配置
│   ├── tailwind.config.ts  # Dashboard Tailwind配置
│   └── tsconfig.json       # Dashboard TypeScript配置
└── prisma/
    └── schema.prisma       # Prisma数据库配置
```

---

## 🔐 环境变量管理

### 环境变量分类

| 分类 | 文件 | 用途 | 提交Git |
|------|------|------|---------|
| **模板** | `.env.example` | 配置参考 | ✅ 是 |
| **开发** | `.env` | 本地开发 | ❌ 否 |
| **测试** | `.env.test` | 测试环境 | ❌ 否 |
| **预发** | `.env.staging` | 预发环境 | ❌ 否 |
| **生产** | `.env.production` | 生产环境 | ❌ 否 |

### 完整环境变量配置

```env
# ================================
# 应用基础配置
# ================================
NODE_ENV=development
APP_NAME=YYC3-PortAISys
APP_VERSION=1.0.0
APP_PORT=3200
APP_URL=http://localhost:3200
APP_DESCRIPTION=YYC³ Portable Intelligent AI System

# ================================
# 数据库配置
# ================================
DATABASE_URL="postgresql://user:password@localhost:5432/yyc3_db?schema=public"
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000

# ================================
# Redis配置
# ================================
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""
REDIS_DB=0
REDIS_PREFIX="yyc3:"
REDIS_MAX_RETRIES=3

# ================================
# NextAuth配置
# ================================
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3200"
NEXTAUTH_SESSION_MAX_AGE=604800
NEXTAUTH_SESSION_UPDATE_AGE=86400

# ================================
# OAuth配置（可选）
# ================================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ================================
# AI模型配置
# ================================
OPENAI_API_KEY="sk-..."
OPENAI_API_BASE="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4"
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7

ANTHROPIC_API_KEY="sk-ant-..."
ANTHROPIC_MODEL="claude-3-opus-20240229"
ANTHROPIC_MAX_TOKENS=4096
ANTHROPIC_TEMPERATURE=0.7

GOOGLE_API_KEY="AIza..."
GOOGLE_MODEL="gemini-pro"

# ================================
# 日志配置
# ================================
LOG_LEVEL=debug
LOG_FORMAT=json
LOG_FILE_PATH=./logs
LOG_MAX_SIZE=10485760
LOG_MAX_FILES=10

# ================================
# OpenTelemetry配置
# ================================
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
OTEL_SERVICE_NAME="yyc3-portaisys"
OTEL_SERVICE_VERSION="1.0.0"
OTEL_RESOURCE_ATTRIBUTES="deployment.environment=development"
OTEL_TRACES_EXPORTER="otlp"
OTEL_METRICS_EXPORTER="otlp"
OTEL_LOGS_EXPORTER="otlp"

# ================================
# 邮件配置（可选）
# ================================
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreply@example.com"
SMTP_PASS="password"
SMTP_FROM="YYC³ PortAISys <noreply@example.com>"

# ================================
# 存储配置（可选）
# ================================
S3_ENDPOINT=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_BUCKET=""
S3_REGION="us-east-1"
S3_USE_SSL=true

# ================================
# 限流配置
# ================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ================================
# CORS配置
# ================================
CORS_ENABLED=true
CORS_ORIGIN="http://localhost:3200,http://localhost:3201"
CORS_CREDENTIALS=true
CORS_METHODS="GET,POST,PUT,DELETE,PATCH"
CORS_HEADERS="Content-Type,Authorization"

# ================================
# 安全配置
# ================================
BCRYPT_ROUNDS=12
JWT_EXPIRES_IN="1h"
REFRESH_TOKEN_EXPIRES_IN="7d"
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBER=true
PASSWORD_REQUIRE_SPECIAL=true

# ================================
# 功能开关
# ================================
FEATURE_REGISTRATION_ENABLED=true
FEATURE_AI_ANALYTICS_ENABLED=true
FEATURE_WORKFLOWS_ENABLED=true
FEATURE_DASHBOARD_ENABLED=true

# ================================
# 第三方集成（可选）
# ================================
SLACK_WEBHOOK_URL=""
DISCORD_WEBHOOK_URL=""
TELEGRAM_BOT_TOKEN=""

# ================================
# 监控配置（可选）
# ================================
SENTRY_DSN=""
SENTRY_ENVIRONMENT="development"
SENTRY_TRACES_SAMPLE_RATE=1.0
```

---

## 🔧 应用配置文件

### Next.js 配置

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 输出配置
  output: 'standalone',

  // 实验性功能
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // 环境变量
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.APP_NAME || 'YYC³ PortAISys',
    NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION || '1.0.0',
  },

  // 图片优化
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  // 编译配置
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // 重定向
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

### TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["node"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./core/*"],
      "@/components/*": ["./web-dashboard/src/components/*"],
      "@/lib/*": ["./web-dashboard/src/lib/*"],
      "@tests/*": ["./tests/*"]
    },
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": [
    "core/**/*",
    "tests/**/*",
    "scripts/**/*.ts",
    "web-dashboard/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts",
    ".next",
    "out"
  ]
}
```

### Tailwind CSS 配置

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./web-dashboard/src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./web-dashboard/src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./web-dashboard/src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### Prisma 配置

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户模型
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(USER)
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  ADMIN
  USER
  VIEWER
}

// ... 其他模型定义
```

---

## 🌍 多环境配置

### 环境配置策略

```
┌─────────────────────────────────────────────────────────┐
│                   配置层级结构                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. 默认配置 (.env.example)                              │
│         │                                               │
│         ▼                                               │
│  2. 环境配置 (.env.${NODE_ENV})                          │
│         │                                               │
│         ▼                                               │
│  3. 本地覆盖 (.env.local)                                │
│         │                                               │
│         ▼                                               │
│  4. 系统环境变量                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 配置加载

```typescript
// config/index.ts
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
const env = process.env.NODE_ENV || 'development';

// 配置文件路径
const configPaths = [
  path.resolve(process.cwd(), `.env.${env}.local`),
  path.resolve(process.cwd(), `.env.${env}`),
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
];

// 加载配置
configPaths.forEach((configPath) => {
  dotenv.config({ path: configPath });
});

// 配置导出
export const config = {
  env,
  port: parseInt(process.env.APP_PORT || '3200', 10),
  database: {
    url: process.env.DATABASE_URL!,
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
  },
  redis: {
    url: process.env.REDIS_URL!,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  // ... 其他配置
} as const;

export type Config = typeof config;
```

---

## 🔐 配置安全

### 敏感信息保护

```bash
# .gitignore 确保敏感配置不被提交
.env
.env.local
.env.*.local
*.pem
*.key
credentials.json
service-account.json
```

### 配置加密

```typescript
// config/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.CONFIG_ENCRYPTION_KEY || '';
const ALGORITHM = 'aes-256-gcm';

export function encryptConfig(value: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptConfig(encrypted: string): string {
  const [ivHex, authTagHex, encryptedValue] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## ✅ 配置验证

### Zod 配置验证

```typescript
// config/validation.ts
import { z } from 'zod';

// 环境变量验证模式
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  APP_PORT: z.string().transform(Number).pipe(z.number().min(1000).max(65535)),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
});

// 验证并导出配置
export const validatedEnv = envSchema.parse(process.env);

// 类型导出
export type Env = z.infer<typeof envSchema>;
```

---

## 📚 相关文档

- [01-环境准备指南](./01-环境准备指南.md)
- [02-依赖安装指南](./02-依赖安装指南.md)

---

## 📞 联系方式

- **项目主页**: https://github.com/YYC-Cube/YYC3-PortAISys
- **问题反馈**: https://github.com/YYC-Cube/YYC3-PortAISys/issues
- **邮箱**: admin@0379.email

---
> **All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence**

Made with ❤️ by YYC³ Team

---
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
