/**
 * @file scripts/verify-yyc3-schema.ts
 * @description 验证 YYC³ Schema 配置
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

async function verifySchemaExists(client: Client): Promise<void> {
  console.log('✅ 数据库连接成功！\n');

  const schemaResult = await client.query(`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name = $1
  `, [SCHEMA_NAME]);

  if (schemaResult.rows.length === 0) {
    console.error(`❌  Schema "${SCHEMA_NAME}" 不存在`);
    process.exit(1);
  }
  console.log(`✅  Schema "${SCHEMA_NAME}" 存在\n`);
}

async function verifyTables(client: Client): Promise<void> {
  const tablesResult = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = $1
    ORDER BY table_name
  `, [SCHEMA_NAME]);

  const expectedTables = [
    'users',
    'conversations',
    'messages',
    'ai_models',
    'knowledge_base',
    'plugins',
    'audit_logs',
    'performance_metrics'
  ];

  console.log('📋 验证表结构：');
  tablesResult.rows.forEach((row, index) => {
    const isExpected = expectedTables.includes(row.table_name);
    const icon = isExpected ? '✅' : '⚠️';
    console.log(`  ${icon} ${index + 1}. ${row.table_name}`);
  });
  console.log();

  const missingTables = expectedTables.filter(
    table => !tablesResult.rows.some(row => row.table_name === table)
  );

  if (missingTables.length > 0) {
    console.log('⚠️  缺失的表：');
    missingTables.forEach(table => console.log(`  - ${table}`));
    console.log();
  }
}

async function verifyIndexes(client: Client): Promise<void> {
  const indexResult = await client.query(`
    SELECT indexname, tablename
    FROM pg_indexes
    WHERE schemaname = $1
    ORDER BY tablename, indexname
  `, [SCHEMA_NAME]);

  console.log('📊 索引统计：');
  const indexCount = indexResult.rows.length;
  console.log(`  总计：${indexCount} 个索引\n`);
}

async function verifyInitialData(client: Client): Promise<void> {
  console.log('📝 验证初始数据：\n');

  const modelsResult = await client.query(`
    SELECT name, provider, model_id, is_active
    FROM ${SCHEMA_NAME}.ai_models
    ORDER BY name
  `);
  console.log('  AI 模型：');
  modelsResult.rows.forEach((row, index) => {
    const status = row.is_active ? '✅' : '⚪';
    console.log(`    ${status} ${index + 1}. ${row.name} (${row.provider})`);
  });
  console.log();

  const pluginsResult = await client.query(`
    SELECT name, version, is_enabled
    FROM ${SCHEMA_NAME}.plugins
    ORDER BY name
  `);
  console.log('  插件：');
  pluginsResult.rows.forEach((row, index) => {
    const status = row.is_enabled ? '✅' : '⚪';
    console.log(`    ${status} ${index + 1}. ${row.name} v${row.version}`);
  });
  console.log();
}

async function testCRUD(client: Client): Promise<void> {
  console.log('🧪 测试 CRUD 操作...\n');

  const insertResult = await client.query(`
    INSERT INTO ${SCHEMA_NAME}.users (username, email, password_hash, full_name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email
  `, ['test_user', 'test@example.com', 'hashed_password', 'Test User']);
  console.log('✅  Create：用户创建成功');
  const testUserId = insertResult.rows[0].id;

  const selectResult = await client.query(`
    SELECT id, username, email, full_name
    FROM ${SCHEMA_NAME}.users
    WHERE id = $1
  `, [testUserId]);
  console.log('✅  Read：用户查询成功');
  console.log(`    用户：${selectResult.rows[0].username} (${selectResult.rows[0].email})`);

  await client.query(`
    UPDATE ${SCHEMA_NAME}.users
    SET full_name = $1
    WHERE id = $2
  `, ['Updated Test User', testUserId]);
  console.log('✅  Update：用户更新成功');

  await client.query(`
    DELETE FROM ${SCHEMA_NAME}.users
    WHERE id = $1
  `, [testUserId]);
  console.log('✅  Delete：用户删除成功\n');
}

async function testJSONB(client: Client): Promise<string> {
  console.log('🧪 测试 JSONB 操作...\n');

  const jsonbInsertResult = await client.query(`
    INSERT INTO ${SCHEMA_NAME}.conversations (user_id, title, model_used, metadata)
    VALUES ($1, $2, $3, $4)
    RETURNING id, metadata
  `, [null, 'Test Conversation', 'gpt-4-turbo', '{"test": true, "tags": ["test"]}']);
  console.log('✅  JSONB 插入成功');
  console.log(`    元数据：${JSON.stringify(jsonbInsertResult.rows[0].metadata)}`);

  const jsonbQueryResult = await client.query(`
    SELECT metadata->>'test' as is_test, metadata->'tags' as tags
    FROM ${SCHEMA_NAME}.conversations
    WHERE id = $1
  `, [jsonbInsertResult.rows[0].id]);
  console.log('✅  JSONB 查询成功');
  console.log(`    标签：${JSON.stringify(jsonbQueryResult.rows[0].tags)}\n`);

  return jsonbInsertResult.rows[0].id;
}

async function testArrays(client: Client): Promise<string> {
  console.log('🧪 测试数组操作...\n');

  const arrayInsertResult = await client.query(`
    INSERT INTO ${SCHEMA_NAME}.knowledge_base (title, content, category, tags)
    VALUES ($1, $2, $3, ARRAY[$4, $5, $6]::TEXT[])
    RETURNING id, tags
  `, ['Test Article', 'Test content', 'test', 'tag1', 'tag2', 'tag3']);
  console.log('✅  数组插入成功');
  console.log(`    标签：${arrayInsertResult.rows[0].tags.join(', ')}\n`);

  return arrayInsertResult.rows[0].id;
}

async function testPerformance(client: Client): Promise<void> {
  console.log('⚡ 性能测试...\n');

  const startTime = Date.now();

  await client.query(`
    INSERT INTO ${SCHEMA_NAME}.performance_metrics (metric_name, metric_value, metric_unit, dimensions)
    SELECT 'test_metric', random() * 100, 'ms', '{"test": "performance"}'
    FROM generate_series(1, 100)
  `);

  const perfResult = await client.query(`
    SELECT count(*) as count
    FROM ${SCHEMA_NAME}.performance_metrics
    WHERE metric_name = 'test_metric'
  `);

  const duration = Date.now() - startTime;
  console.log(`✅  批量插入 ${perfResult.rows[0].count} 条记录`);
  console.log(`    耗时：${duration}ms\n`);
}

async function cleanupTestData(client: Client, conversationId?: string, articleId?: string): Promise<void> {
  console.log('🧹 清理测试数据...\n');

  if (conversationId) {
    await client.query(`
      DELETE FROM ${SCHEMA_NAME}.conversations
      WHERE id = $1
    `, [conversationId]);
  }

  if (articleId) {
    await client.query(`
      DELETE FROM ${SCHEMA_NAME}.knowledge_base
      WHERE id = $1
    `, [articleId]);
  }

  console.log('✅  测试数据已清理\n');
}

async function printSummary(client: Client): Promise<void> {
  const tablesResult = await client.query(`
    SELECT COUNT(*) as count
    FROM information_schema.tables
    WHERE table_schema = $1
  `, [SCHEMA_NAME]);

  const indexResult = await client.query(`
    SELECT COUNT(*) as count
    FROM pg_indexes
    WHERE schemaname = $1
  `, [SCHEMA_NAME]);

  const modelsResult = await client.query(`
    SELECT COUNT(*) as count
    FROM ${SCHEMA_NAME}.ai_models
  `);

  const pluginsResult = await client.query(`
    SELECT COUNT(*) as count
    FROM ${SCHEMA_NAME}.plugins
  `);

  console.log('🎉 所有验证通过！YYC³ Schema 配置正确。');
  console.log('\n📊 配置摘要：');
  console.log(`  🗄️  数据库：yyc3_aify`);
  console.log(`  📁  Schema：${SCHEMA_NAME}`);
  console.log(`  📋  表数量：${tablesResult.rows[0].count}`);
  console.log(`  📊  索引数量：${indexResult.rows[0].count}`);
  console.log(`  🤖  AI 模型：${modelsResult.rows[0].count}`);
  console.log(`  🔌  插件：${pluginsResult.rows[0].count}`);
  console.log('\n🚀 YYC³ 项目已准备就绪！');
}

async function verifySchema() {
  console.log('🔍 开始验证 YYC³ Schema 配置...\n');

  const client = await connectDatabase();

  try {
    await verifySchemaExists(client);
    await verifyTables(client);
    await verifyIndexes(client);
    await verifyInitialData(client);
    await testCRUD(client);
    const conversationId = await testJSONB(client);
    const articleId = await testArrays(client);
    await testPerformance(client);
    await cleanupTestData(client, conversationId, articleId);
    await printSummary(client);

  } catch (error) {
    console.error('❌ 验证失败：');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

verifySchema();
