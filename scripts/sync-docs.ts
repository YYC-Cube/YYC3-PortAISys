/**
 * @file 文档同步脚本
 * @description 用于手动触发文档与代码的同步
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2026-01-25
 * @updated 2026-01-25
 */

import { DocumentSyncManager } from '../core/documentation/DocumentSyncManager';

async function main() {
  console.log('🚀 启动文档同步...');
  
  const syncManager = new DocumentSyncManager({
    enableAutoSync: false
  });

  // 订阅事件
  syncManager.on('syncStarted', (data) => {
    console.log(`📋 开始同步，共 ${data.totalFiles} 个文件`);
  });

  syncManager.on('syncCompleted', (data) => {
    console.log('✅ 同步完成');
    console.log(`📊 同步结果:`);
    console.log(`   - 成功同步: ${data.syncedFiles} 个文件`);
    console.log(`   - 未更新: ${data.outdatedFiles} 个文件`);
    console.log(`   - 错误: ${data.errors} 个文件`);
    console.log(`   - 总体状态: ${data.success ? '成功' : '失败'}`);
  });

  syncManager.on('docUpdated', (data) => {
    console.log(`📄 更新文档: ${data.docPath}`);
  });

  syncManager.on('codeUpdated', (data) => {
    console.log(`💻 更新代码: ${data.codePath}`);
  });

  try {
    const result = await syncManager.sync();
    console.log('🎉 文档同步任务完成');
  } catch (error) {
    console.error('❌ 同步过程中发生错误:', error);
  } finally {
    syncManager.shutdown();
  }
}

main();
