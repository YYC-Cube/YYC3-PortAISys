/**
 * @file tools/doc-code-sync/src/index.ts
 * @description Index 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import * as path from 'path';
import { BidirectionalSyncTrigger } from './sync-trigger';
import { OptimizedBidirectionalSyncTrigger } from './optimized-sync-trigger';
import { SyncMonitor, NotificationManager } from './monitor';
import { MappingRuleParser, MappingRuleValidator } from './mapping-parser';
import { Mapping, SyncDetail } from './types';
import { WorkerManager, SyncTaskData, AnalyzeTaskData, ProcessTaskData, ValidateTaskData } from './worker';
import { PerformanceTestSuite } from './performance';

const program = new Command();

program
  .name('yyc3-doc-sync')
  .description('YYC³ 文档与代码双向同步工具')
  .version('1.0.0');

program
  .command('init')
  .description('初始化文档同步配置')
  .option('-d, --docs-dir <path>', '文档目录路径', 'docs')
  .option('-c, --code-dir <path>', '代码目录路径', 'core')
  .action(async (options) => {
    const spinner = ora('正在初始化文档同步配置...').start();

    try {
      const parser = new MappingRuleParser();
      const validator = new MappingRuleValidator();

      spinner.text = '正在扫描文档和代码文件...';

      const mappings = await generateMappings(options.docsDir, options.codeDir);

      spinner.text = '正在验证映射规则...';

      const config = {
        version: '1.0',
        mappings,
        globalSettings: {
          autoSync: true,
          syncInterval: 300,
          conflictResolution: 'manual' as const,
          notificationEnabled: true
        }
      };

      const validationResult = validator.validateConfig(config);

      if (!validationResult.isValid) {
        spinner.fail('映射规则验证失败');
        console.error(chalk.red('错误:'));
        validationResult.errors.forEach(error => {
          console.error(chalk.red(`  - ${error}`));
        });
        process.exit(1);
      }

      spinner.text = '正在保存配置文件...';

      const fs = require('fs');
      fs.writeFileSync(
        '.doc-code-mapping.json',
        JSON.stringify(config, null, 2)
      );

      spinner.succeed('文档同步配置初始化完成');
      console.log(chalk.green(`\n✅ 已创建 ${mappings.length} 个映射规则`));
      console.log(chalk.yellow(`\n📝 配置文件: .doc-code-mapping.json`));
      console.log(chalk.cyan(`\n💡 提示: 运行 'yyc3-doc-sync watch' 开始监控文件变更`));
    } catch (error) {
      spinner.fail('初始化失败');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('监控文件变更并自动同步')
  .option('-d, --docs-dir <path>', '文档目录路径', 'docs')
  .option('-c, --code-dir <path>', '代码目录路径', 'core')
  .option('-C, --config <path>', '配置文件路径', '.doc-code-mapping.json')
  .option('-O, --optimized', '使用优化版同步触发器', false)
  .action((options) => {
    console.log(chalk.cyan('🚀 YYC³ 文档与代码双向同步工具'));
    console.log(chalk.gray('按 Ctrl+C 停止监控\n'));

    const TriggerClass = options.optimized ? OptimizedBidirectionalSyncTrigger : BidirectionalSyncTrigger;
    const trigger = new TriggerClass(options.config);
    const monitor = new SyncMonitor(options.config);
    const notificationManager = new NotificationManager();

    if (options.optimized) {
      console.log(chalk.green('✅ 已启用优化版同步触发器'));
      console.log(chalk.gray('   - 分块处理: 启用'));
      console.log(chalk.gray('   - 二级缓存: 启用'));
      console.log(chalk.gray('   - 并发处理: 启用\n'));
    }

    trigger.on('doc-change', (event) => {
      console.log(chalk.blue(`📄 文档变更: ${event.path}`));
    });

    trigger.on('code-change', (event) => {
      console.log(chalk.yellow(`💻 代码变更: ${event.path}`));
    });

    trigger.on('sync-completed', (result) => {
      if (result.success) {
        console.log(chalk.green(`✅ 同步成功: ${result.message}`));
        if (result.details) {
          result.details.forEach((detail: SyncDetail) => {
            console.log(chalk.gray(`   - ${detail.file}: ${detail.message}`));
          });
        }
      }
    });

    trigger.on('sync-failed', (result) => {
      console.log(chalk.red(`❌ 同步失败: ${result.message}`));
      if (result.details) {
        result.details.forEach((detail: SyncDetail) => {
          console.log(chalk.gray(`   - ${detail.file}: ${detail.message}`));
        });
      }
    });

    trigger.on('config-reloaded', () => {
      console.log(chalk.green('✅ 配置已重新加载'));
    });

    monitor.on('alert', (notification) => {
      notificationManager.send(notification);
    });

    monitor.startMonitoring();

    trigger.startWatching(options.docsDir, options.codeDir);

    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n正在停止监控...'));
      trigger.stopWatching();
      monitor.stopMonitoring();
      console.log(chalk.green('监控已停止'));
      process.exit(0);
    });
  });

program
  .command('sync')
  .description('手动同步指定文件')
  .argument('<file>', '要同步的文件路径')
  .option('-c, --config <path>', '配置文件路径', '.doc-code-mapping.json')
  .action(async (file, options) => {
    const spinner = ora('正在同步文件...').start();

    try {
      const trigger = new BidirectionalSyncTrigger(options.config);
      const result = await trigger.manualSync(file);

      if (result.success) {
        spinner.succeed(result.message);
        if (result.details) {
          result.details.forEach(detail => {
            console.log(chalk.gray(`   - ${detail.file}: ${detail.message}`));
          });
        }
      } else {
        spinner.fail(result.message);
        process.exit(1);
      }
    } catch (error) {
      spinner.fail('同步失败');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

program
  .command('status')
  .description('查看同步状态')
  .option('-c, --config <path>', '配置文件路径', '.doc-code-mapping.json')
  .action((options) => {
    const monitor = new SyncMonitor(options.config);
    const status = monitor.getStatus();

    console.log(chalk.cyan('\n📊 同步状态\n'));
    console.log(chalk.white(`总映射数: ${status.totalMappings}`));
    console.log(chalk.green(`已同步: ${status.syncedMappings}`));
    console.log(chalk.red(`失败: ${status.failedMappings}`));
    console.log(chalk.gray(`最后同步时间: ${status.lastSyncTime || '未同步'}`));

    const failedMappings = monitor.getFailedMappings();
    if (failedMappings.length > 0) {
      console.log(chalk.red(`\n❌ 失败的映射:`));
      failedMappings.forEach(id => {
        console.log(chalk.red(`   - ${id}`));
      });
    }

    const pendingMappings = monitor.getPendingMappings();
    if (pendingMappings.length > 0) {
      console.log(chalk.yellow(`\n⏳ 待同步的映射:`));
      pendingMappings.forEach(id => {
        console.log(chalk.yellow(`   - ${id}`));
      });
    }
  });

program
  .command('list')
  .description('列出所有映射规则')
  .option('-c, --config <path>', '配置文件路径', '.doc-code-mapping.json')
  .action((options) => {
    const parser = new MappingRuleParser(options.config);
    const mappings = parser.getAllMappings();

    console.log(chalk.cyan(`\n📋 映射规则列表 (${mappings.length})\n`));

    mappings.forEach((mapping, index) => {
      console.log(chalk.white(`${index + 1}. ${mapping.id}`));
      console.log(chalk.gray(`   文档: ${mapping.document}`));
      console.log(chalk.gray(`   代码: ${mapping.codeFiles.join(', ')}`));
      console.log(chalk.gray(`   类型: ${mapping.type}`));
      console.log(chalk.gray(`   状态: ${mapping.syncStatus || 'pending'}`));
      console.log(chalk.gray(`   同步: ${mapping.syncEnabled ? '启用' : '禁用'}`));
      if (mapping.lastSync) {
        console.log(chalk.gray(`   最后同步: ${mapping.lastSync}`));
      }
      console.log('');
    });
  });

program
  .command('add')
  .description('添加新的映射规则')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'document',
        message: '文档文件路径:',
        validate: (input) => {
          if (!input.trim()) {
            return '文档文件路径不能为空';
          }
          if (!require('fs').existsSync(input)) {
            return '文档文件不存在';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'codeFiles',
        message: '代码文件路径 (多个文件用逗号分隔):',
        validate: (input) => {
          if (!input.trim()) {
            return '代码文件路径不能为空';
          }
          const files = input.split(',').map((f: string) => f.trim());
          const fs = require('fs');
          for (const file of files) {
            if (!fs.existsSync(file)) {
              return `代码文件不存在: ${file}`;
            }
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'type',
        message: '映射类型:',
        choices: ['one-to-one', 'one-to-many', 'many-to-one']
      },
      {
        type: 'confirm',
        name: 'syncEnabled',
        message: '启用同步?',
        default: true
      }
    ]);

    const parser = new MappingRuleParser();
    const mappings = parser.getAllMappings();
    const newId = `mapping-${String(mappings.length + 1).padStart(3, '0')}`;

    const newMapping: Mapping = {
      id: newId,
      document: answers.document,
      codeFiles: answers.codeFiles.split(',').map((f: string) => f.trim()),
      type: answers.type,
      syncEnabled: answers.syncEnabled,
      syncStatus: 'pending'
    };

    parser.addMapping(newMapping);

    console.log(chalk.green(`\n✅ 映射规则已添加: ${newId}`));
  });

program
  .command('remove')
  .description('删除映射规则')
  .argument('<id>', '映射 ID')
  .option('-c, --config <path>', '配置文件路径', '.doc-code-mapping.json')
  .action((id, options) => {
    const parser = new MappingRuleParser(options.config);
    const mapping = parser.getMappingById(id);

    if (!mapping) {
      console.log(chalk.red(`❌ 未找到映射: ${id}`));
      process.exit(1);
    }

    inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `确认删除映射 ${id}?`,
        default: false
      }
    ]).then((answers) => {
      if (answers.confirm) {
        parser.deleteMapping(id);
        console.log(chalk.green(`✅ 映射已删除: ${id}`));
      } else {
        console.log(chalk.yellow('操作已取消'));
      }
    });
  });

async function generateMappings(docsDir: string, codeDir: string): Promise<Mapping[]> {
  const fs = require('fs');
  const mappings: Mapping[] = [];

  const getAllMarkdownFiles = (dir: string): string[] => {
    const files: string[] = [];
    const items = fs.readdirSync(dir);

    items.forEach((item: string) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...getAllMarkdownFiles(fullPath));
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    });

    return files;
  };

  const findRelatedCodeFiles = (docFile: string): string[] => {
    const docFileName = path.basename(docFile, '.md');
    const codeFiles: string[] = [];

    const walk = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);

      items.forEach((item: string) => {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (
          (item.endsWith('.ts') || item.endsWith('.tsx')) &&
          (item.startsWith(docFileName) || 
           item === `${docFileName}.ts` ||
           item === `${docFileName}.tsx`)
        ) {
          codeFiles.push(fullPath);
        }
      });
    };

    walk(codeDir);
    return codeFiles;
  };

  const docFiles = getAllMarkdownFiles(docsDir);

  docFiles.forEach((docFile, index) => {
    const relativeDocPath = path.relative(process.cwd(), docFile);
    const codeFiles = findRelatedCodeFiles(docFile);

    if (codeFiles.length > 0) {
      mappings.push({
        id: `mapping-${String(index + 1).padStart(3, '0')}`,
        document: relativeDocPath,
        codeFiles: codeFiles.map(cf => path.relative(process.cwd(), cf)),
        type: codeFiles.length === 1 ? 'one-to-one' : 'one-to-many',
        syncEnabled: true,
        syncStatus: 'pending'
      });
    }
  });

  return mappings;
}

program
  .command('worker')
  .description('使用Worker执行任务')
  .option('-t, --task <type>', '任务类型: sync, analyze, process, validate', 'sync')
  .option('-f, --file <path>', '文件路径')
  .option('-m, --mapping <id>', '映射ID')
  .option('-w, --workers <number>', 'Worker数量', '4')
  .option('-T, --timeout <number>', '任务超时时间(ms)', '30000')
  .action(async (options) => {
    const spinner = ora('正在初始化Worker管理器...').start();

    try {
      const workerManager = new WorkerManager({
        maxWorkers: parseInt(options.workers),
        workerScript: path.join(__dirname, 'worker/worker-entry.js'),
        config: {
          maxMemoryMB: 512,
          maxTaskDuration: parseInt(options.timeout),
          enableProfiling: false,
          logLevel: 'info',
        },
        taskTimeout: parseInt(options.timeout),
        retryAttempts: 3,
        retryDelay: 1000,
      });

      spinner.succeed('Worker管理器初始化完成');

      switch (options.task) {
        case 'sync':
          await handleSyncTask(workerManager, options, spinner);
          break;
        case 'analyze':
          await handleAnalyzeTask(workerManager, options, spinner);
          break;
        case 'process':
          await handleProcessTask(workerManager, options, spinner);
          break;
        case 'validate':
          await handleValidateTask(workerManager, options, spinner);
          break;
        default:
          console.log(chalk.red(`未知的任务类型: ${options.task}`));
          process.exit(1);
      }

      const stats = workerManager.getStats();
      console.log(chalk.cyan('\n📊 Worker统计:'));
      console.log(chalk.white(`总Worker数: ${stats.totalWorkers}`));
      console.log(chalk.green(`活跃Worker数: ${stats.activeWorkers}`));
      console.log(chalk.gray(`空闲Worker数: ${stats.idleWorkers}`));
      console.log(chalk.yellow(`队列任务数: ${stats.queuedTasks}`));
      console.log(chalk.white(`已处理任务: ${stats.totalTasksProcessed}`));
      console.log(chalk.green(`成功任务: ${stats.totalTasksSucceeded}`));
      console.log(chalk.red(`失败任务: ${stats.totalTasksFailed}`));
      console.log(chalk.white(`平均处理时间: ${stats.averageProcessingTime.toFixed(2)}ms`));
      console.log(chalk.white(`总处理字节数: ${stats.totalBytesProcessed}`));

      await workerManager.shutdown();
    } catch (error) {
      spinner.fail('Worker任务执行失败');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

async function handleSyncTask(workerManager: WorkerManager, options: any, spinner: any) {
  if (!options.mapping || !options.file) {
    console.log(chalk.red('同步任务需要 --mapping 和 --file 参数'));
    process.exit(1);
  }

  spinner.start('正在执行同步任务...');

  const taskData: SyncTaskData = {
    mappingId: options.mapping,
    documentPath: options.file,
    codePaths: [options.file.replace('.md', '.ts')],
    direction: 'doc-to-code',
    options: {
      validateBeforeSync: true,
      createBackup: true,
      skipConflicts: false,
    },
  };

  const result = await workerManager.executeSyncTask(taskData);

  if (result.success) {
    spinner.succeed('同步任务完成');
    console.log(chalk.green(`✅ 同步成功: ${result.syncedFiles.length} 个文件`));
    console.log(chalk.gray(`⏭️ 跳过: ${result.skippedFiles.length} 个文件`));
    if (result.conflicts.length > 0) {
      console.log(chalk.yellow(`⚠️ 冲突: ${result.conflicts.length} 个`));
      result.conflicts.forEach(conflict => {
        console.log(chalk.yellow(`   - ${conflict.path}: ${conflict.reason}`));
      });
    }
    console.log(chalk.white(`⏱️ 耗时: ${result.duration}ms`));
    console.log(chalk.white(`📦 处理字节: ${result.bytesProcessed}`));
  } else {
    spinner.fail('同步任务失败');
    console.log(chalk.red(`❌ 冲突: ${result.conflicts.length} 个`));
    result.conflicts.forEach(conflict => {
      console.log(chalk.red(`   - ${conflict.path}: ${conflict.reason}`));
    });
  }
}

async function handleAnalyzeTask(workerManager: WorkerManager, options: any, spinner: any) {
  if (!options.file) {
    console.log(chalk.red('分析任务需要 --file 参数'));
    process.exit(1);
  }

  spinner.start('正在执行分析任务...');

  const taskData: AnalyzeTaskData = {
    filePath: options.file,
    analysisType: 'structure',
    options: {
      includeLineNumbers: true,
      includeComments: true,
      maxDepth: 10,
    },
  };

  const result = await workerManager.executeAnalyzeTask(taskData);

  spinner.succeed('分析任务完成');
  console.log(chalk.green(`✅ 文件: ${result.filePath}`));
  console.log(chalk.white(`📊 分析类型: ${result.analysisType}`));
  console.log(chalk.white(`⏱️ 耗时: ${result.duration}ms`));
  console.log(chalk.cyan('\n分析结果:'));
  console.log(JSON.stringify(result.result, null, 2));
}

async function handleProcessTask(workerManager: WorkerManager, options: any, spinner: any) {
  if (!options.file) {
    console.log(chalk.red('处理任务需要 --file 参数'));
    process.exit(1);
  }

  spinner.start('正在执行处理任务...');

  const taskData: ProcessTaskData = {
    filePath: options.file,
    operation: 'format',
    options: {
      preserveComments: true,
      indentSize: 2,
      outputFormat: 'utf-8',
    },
  };

  const result = await workerManager.executeProcessTask(taskData);

  spinner.succeed('处理任务完成');
  console.log(chalk.green(`✅ 文件: ${result.filePath}`));
  console.log(chalk.white(`🔧 操作: ${result.operation}`));
  console.log(chalk.white(`⏱️ 耗时: ${result.duration}ms`));
  console.log(chalk.white(`📦 原始大小: ${result.originalSize} 字节`));
  console.log(chalk.white(`📦 处理大小: ${result.processedSize} 字节`));
  if (result.outputPath) {
    console.log(chalk.cyan(`📁 输出路径: ${result.outputPath}`));
  }
}

async function handleValidateTask(workerManager: WorkerManager, options: any, spinner: any) {
  if (!options.file) {
    console.log(chalk.red('验证任务需要 --file 参数'));
    process.exit(1);
  }

  spinner.start('正在执行验证任务...');

  const taskData: ValidateTaskData = {
    filePath: options.file,
    validationType: 'syntax',
    options: {
      strictMode: true,
      customRules: [],
    },
  };

  const result = await workerManager.executeValidateTask(taskData);

  spinner.succeed('验证任务完成');
  console.log(chalk.green(`✅ 文件: ${result.filePath}`));
  console.log(chalk.white(`🔍 验证类型: ${result.validationType}`));
  console.log(chalk.white(`⏱️ 耗时: ${result.duration}ms`));
  console.log(chalk.white(`✅ 有效: ${result.valid}`));
  
  if (result.errors.length > 0) {
    console.log(chalk.red(`\n❌ 错误 (${result.errors.length}):`));
    result.errors.forEach(error => {
      console.log(chalk.red(`   [${error.line}:${error.column}] ${error.message}`));
    });
  }
  
  if (result.warnings.length > 0) {
    console.log(chalk.yellow(`\n⚠️ 警告 (${result.warnings.length}):`));
    result.warnings.forEach(warning => {
      console.log(chalk.yellow(`   [${warning.line}:${warning.column}] ${warning.message}`));
      if (warning.suggestion) {
        console.log(chalk.gray(`      💡 建议: ${warning.suggestion}`));
      }
    });
  }
}

program
  .command('performance')
  .description('执行性能测试')
  .option('-o, --output <path>', '报告输出路径', 'performance-report.md')
  .option('-t, --type <type>', '测试类型: all, benchmark, stress, load', 'all')
  .action(async (options) => {
    const spinner = ora('正在初始化性能测试套件...').start();

    try {
      const suite = new PerformanceTestSuite();

      spinner.succeed('性能测试套件初始化完成');
      console.log(chalk.cyan('\n🚀 开始执行性能测试...\n'));

      let report: any;

      switch (options.type) {
        case 'all':
          report = await suite.runAllTests();
          break;
        case 'benchmark':
          await suite.runBenchmarkTests();
          break;
        case 'stress':
          await suite.runStressTests();
          break;
        case 'load':
          await suite.runLoadTests();
          break;
        default:
          console.log(chalk.red(`未知的测试类型: ${options.type}`));
          process.exit(1);
      }

      if (options.type === 'all' && report) {
        await suite.saveReport(report, options.output);
      }

      console.log(chalk.green('\n✅ 性能测试完成'));
    } catch (error) {
      spinner.fail('性能测试失败');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

program.parse();
