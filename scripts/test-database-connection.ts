/**
 * @file scripts/test-database-connection.ts
 * @description 测试 PostgreSQL 数据库连接
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

async function testConnection() {
  console.log('🔍 开始测试 PostgreSQL 数据库连接...\n');

  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ 数据库连接成功！\n');

    // 1. 获取数据库版本
    const versionResult = await client.query('SELECT version()');
    console.log('📦 数据库版本：');
    console.log(versionResult.rows[0].version);
    console.log();

    // 2. 获取当前数据库名称
    const dbResult = await client.query('SELECT current_database()');
    console.log('🗄️ 当前数据库：');
    console.log(dbResult.rows[0].current_database);
    console.log();

    // 3. 获取当前用户
    const userResult = await client.query('SELECT current_user');
    console.log('👤 当前用户：');
    console.log(userResult.rows[0].current_user);
    console.log();

    // 4. 获取数据库大小
    const sizeResult = await client.query(`
      SELECT
        pg_size_pretty(pg_database_size(current_database())) as size
    `);
    console.log('📊 数据库大小：');
    console.log(sizeResult.rows[0].size);
    console.log();

    // 5. 获取表数量
    const tableResult = await client.query(`
      SELECT count(*) as table_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log('📋 公共 Schema 表数量：');
    console.log(tableResult.rows[0].table_count);
    console.log();

    // 6. 获取所有表
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📋 现有表：');
    if (tablesResult.rows.length === 0) {
      console.log('  (无表)');
    } else {
      tablesResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name}`);
      });
    }
    console.log();

    // 7. 获取连接数
    const connectionResult = await client.query(`
      SELECT count(*) as connection_count
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);
    console.log('🔗 当前连接数：');
    console.log(connectionResult.rows[0].connection_count);
    console.log();

    // 8. 测试创建临时表
    console.log('🧪 测试创建临时表...');
    await client.query(`
      CREATE TEMPORARY TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ 临时表创建成功');

    // 9. 测试插入数据
    console.log('🧪 测试插入数据...');
    await client.query(`
      INSERT INTO test_table (name) VALUES ($1), ($2), ($3)
    `, ['测试1', '测试2', '测试3']);
    console.log('✅ 数据插入成功');

    // 10. 测试查询数据
    console.log('🧪 测试查询数据...');
    const selectResult = await client.query('SELECT * FROM test_table');
    console.log('✅ 查询成功，返回', selectResult.rows.length, '条记录');
    console.log();

    // 11. 检查 Schema
    const schemaResult = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name
    `);
    console.log('📁 自定义 Schema：');
    if (schemaResult.rows.length === 0) {
      console.log('  (无自定义 Schema)');
    } else {
      schemaResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.schema_name}`);
      });
    }
    console.log();

    // 12. 检查扩展
    const extensionResult = await client.query(`
      SELECT extname, extversion
      FROM pg_extension
      ORDER BY extname
    `);
    console.log('🔌 已安装的扩展：');
    if (extensionResult.rows.length === 0) {
      console.log('  (无扩展)');
    } else {
      extensionResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.extname} (v${row.extversion})`);
      });
    }
    console.log();

    // 13. 测试 JSONB 支持
    console.log('🧪 测试 JSONB 支持...');
    const jsonbResult = await client.query(`
      SELECT '{"name": "YYC3", "version": "1.0.0"}'::jsonb as data
    `);
    console.log('✅ JSONB 支持：', jsonbResult.rows[0].data);
    console.log();

    console.log('🎉 所有测试通过！数据库连接正常，功能完整。');

  } catch (error) {
    console.error('❌ 数据库连接或操作失败：');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 数据库连接已关闭');
  }
}

testConnection();
