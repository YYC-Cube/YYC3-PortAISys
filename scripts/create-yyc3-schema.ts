/**
 * @file scripts/create-yyc3-schema.ts
 * @description 为 YYC³ 项目创建专用 Schema
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-08
 * @updated 2026-03-08
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

/* eslint-disable no-console */

import { Client } from 'pg';

const DATABASE_URL = 'postgresql://yanyu:My151001@localhost:5433/yyc3_aify';
const SCHEMA_NAME = 'yyc3_widget';

async function connectDatabase(): Promise<Client> {
  const client = new Client({
    connectionString: DATABASE_URL,
  });
  await client.connect();
  return client;
}

async function checkOrCreateSchema(client: Client): Promise<void> {
  const checkResult = await client.query(`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name = $1
  `, [SCHEMA_NAME]);

  if (checkResult.rows.length > 0) {
    console.log(`⚠️  Schema "${SCHEMA_NAME}" 已存在`);
    console.log('🔄 将删除并重新创建...\n');
    await client.query(`DROP SCHEMA IF EXISTS ${SCHEMA_NAME} CASCADE`);
    console.log('✅ 旧 Schema 已删除');
  }

  await client.query(`CREATE SCHEMA ${SCHEMA_NAME}`);
  console.log(`✅  Schema "${SCHEMA_NAME}" 创建成功\n`);

  await client.query(`
    GRANT ALL ON SCHEMA ${SCHEMA_NAME} TO yanyu
  `);
  console.log('✅  Schema 权限已授予\n');
}

async function createTables(client: Client): Promise<void> {
  console.log('📋 创建 YYC³ 核心表...\n');

  await client.query(`
    CREATE TABLE ${SCHEMA_NAME}.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      role VARCHAR(50) DEFAULT 'user'
    )
  `);
  console.log('✅  users 表创建成功');

  await client.query(`
    CREATE TABLE ${SCHEMA_NAME}.conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES ${SCHEMA_NAME}.users(id) ON DELETE CASCADE,
      title VARCHAR(500),
      model_used VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB DEFAULT '{}'
    )
  `);
  console.log('✅  conversations 表创建成功');

  await client.query(`
    CREATE TABLE ${SCHEMA_NAME}.messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID REFERENCES ${SCHEMA_NAME}.conversations(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      tokens_used INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSONB DEFAULT '{}'
    )
  `);
  console.log('✅  messages 表创建成功');

  await client.query(`
    CREATE TABLE ${SCHEMA_NAME}.ai_models (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      provider VARCHAR(100) NOT NULL,
      model_id VARCHAR(255) NOT NULL,
      version VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      config JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅  ai_models 表创建成功');

  await client.query(`
    CREATE TABLE ${SCHEMA_NAME}.knowledge_base (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(255),
      tags TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by UUID REFERENCES ${SCHEMA_NAME}.users(id) ON DELETE SET NULL
    )
  `);
  console.log('✅  knowledge_base 表创建成功');

  await client.query(`
    CREATE TABLE ${SCHEMA_NAME}.plugins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) UNIQUE NOT NULL,
      version VARCHAR(50),
      description TEXT,
      author VARCHAR(255),
      is_enabled BOOLEAN DEFAULT true,
      config JSONB DEFAULT '{}',
      installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅  plugins 表创建成功');

  await client.query(`
    CREATE TABLE ${SCHEMA_NAME}.audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES ${SCHEMA_NAME}.users(id) ON DELETE SET NULL,
      action VARCHAR(100) NOT NULL,
      resource_type VARCHAR(100),
      resource_id UUID,
      ip_address INET,
      user_agent TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅  audit_logs 表创建成功');

  await client.query(`
    CREATE TABLE ${SCHEMA_NAME}.performance_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      metric_name VARCHAR(255) NOT NULL,
      metric_value FLOAT NOT NULL,
      metric_unit VARCHAR(50),
      dimensions JSONB DEFAULT '{}',
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅  performance_metrics 表创建成功');
}

async function createIndexes(client: Client): Promise<void> {
  console.log('📋 创建索引...\n');

  await client.query(`CREATE INDEX idx_users_email ON ${SCHEMA_NAME}.users(email)`);
  await client.query(`CREATE INDEX idx_users_username ON ${SCHEMA_NAME}.users(username)`);
  await client.query(`CREATE INDEX idx_conversations_user_id ON ${SCHEMA_NAME}.conversations(user_id)`);
  await client.query(`CREATE INDEX idx_messages_conversation_id ON ${SCHEMA_NAME}.messages(conversation_id)`);
  await client.query(`CREATE INDEX idx_knowledge_base_tags ON ${SCHEMA_NAME}.knowledge_base USING GIN(tags)`);
  await client.query(`CREATE INDEX idx_audit_logs_user_id ON ${SCHEMA_NAME}.audit_logs(user_id)`);
  await client.query(`CREATE INDEX idx_audit_logs_created_at ON ${SCHEMA_NAME}.audit_logs(created_at)`);
  await client.query(`CREATE INDEX idx_performance_metrics_recorded_at ON ${SCHEMA_NAME}.performance_metrics(recorded_at)`);

  console.log('✅  索引创建成功\n');
}

async function insertInitialData(client: Client): Promise<void> {
  console.log('📝 插入初始数据...\n');

  await client.query(`
    INSERT INTO ${SCHEMA_NAME}.ai_models (name, provider, model_id, version, is_active, config)
    VALUES 
      ('GPT-4 Turbo', 'openai', 'gpt-4-turbo-preview', '2024-04-09', true, '{"max_tokens": 4096, "temperature": 0.7}'),
      ('Claude 3 Opus', 'anthropic', 'claude-3-opus-20240229', '2024-02-29', true, '{"max_tokens": 4096, "temperature": 0.7}'),
      ('Local LLaMA', 'local', 'llama-2-7b', '1.0.0', false, '{"max_tokens": 2048, "temperature": 0.8}')
  `);
  console.log('✅  AI 模型数据插入成功');

  await client.query(`
    INSERT INTO ${SCHEMA_NAME}.plugins (name, version, description, author, is_enabled)
    VALUES 
      ('Core Widget', '1.0.0', '核心智能窗口插件', 'YYC³ Team', true),
      ('Knowledge Base', '1.0.0', '知识库集成插件', 'YYC³ Team', true),
      ('Multi-Model', '1.0.0', '多模型管理插件', 'YYC³ Team', true)
  `);
  console.log('✅  插件数据插入成功\n');
}

async function verifySchema(client: Client): Promise<void> {
  console.log('🔍 验证创建结果...\n');

  const tablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = $1
    ORDER BY table_name
  `, [SCHEMA_NAME]);

  console.log(`📋  Schema "${SCHEMA_NAME}" 中的表：`);
  tablesResult.rows.forEach((row, index) => {
    console.log(`  ${index + 1}. ${row.table_name}`);
  });

  const countResult = await client.query(`
    SELECT COUNT(*) as count
    FROM information_schema.tables
    WHERE table_schema = $1
  `, [SCHEMA_NAME]);

  console.log(`\n📊 总计：${countResult.rows[0].count} 个表\n`);
}

async function createSchema() {
  console.log('🔨 开始创建 YYC³ 专用 Schema...\n');

  const client = await connectDatabase();

  try {
    console.log('✅ 数据库连接成功！\n');

    await checkOrCreateSchema(client);
    await createTables(client);
    await createIndexes(client);
    await insertInitialData(client);
    await verifySchema(client);

    console.log('🎉 YYC³ Schema 创建完成！');
    console.log(`\n✅  Schema 名称：${SCHEMA_NAME}`);
    console.log(`✅  数据库：yyc3_aify`);
    console.log(`✅  用户：yanyu`);
    console.log(`✅  表数量：8`);
    console.log(`✅  索引：已创建`);
    console.log(`✅  初始数据：已插入\n`);
    console.log('🚀 现在可以使用 YYC³ 项目了！');

  } catch (error) {
    console.error('❌ 创建 Schema 失败：');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

createSchema();
