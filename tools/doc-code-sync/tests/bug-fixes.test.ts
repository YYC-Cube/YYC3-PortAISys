import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { BidirectionalSyncTrigger } from '../src/sync-trigger';
import { MappingRuleParser } from '../src/mapping-parser';

describe('BUG-001: 同步文件生成测试', () => {
  const testDir = path.join(__dirname, 'temp-test-bug001');
  const docsDir = path.join(testDir, 'docs');
  const coreDir = path.join(testDir, 'core');
  const configPath = path.join(testDir, '.doc-code-mapping.json');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(docsDir, { recursive: true });
    fs.mkdirSync(coreDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('应该能够生成不存在的代码文件', async () => {
    const docContent = `# 测试文档

## 功能描述
这是一个测试功能，用于验证BUG-001的修复。

## API 接口
\`\`\`typescript
interface TestAPI {
  test(): void;
}
\`\`\`
`;

    const docFile = path.join(docsDir, 'test.md');
    fs.writeFileSync(docFile, docContent, 'utf-8');

    const config = {
      version: '1.0',
      mappings: [
        {
          id: 'mapping-001',
          document: docFile,
          codeFiles: [path.join(coreDir, 'test.ts')],
          type: 'one-to-one',
          syncEnabled: true,
          syncStatus: 'pending'
        }
      ],
      globalSettings: {
        autoSync: true,
        syncInterval: 300,
        conflictResolution: 'manual',
        notificationEnabled: true
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

    const trigger = new BidirectionalSyncTrigger(configPath);
    const result = await trigger.manualSync(docFile);

    expect(result.success).toBe(true);
    expect(fs.existsSync(path.join(coreDir, 'test.ts'))).toBe(true);

    const codeContent = fs.readFileSync(path.join(coreDir, 'test.ts'), 'utf-8');
    expect(codeContent).toContain('这是一个测试功能，用于验证BUG-001的修复。');
    expect(codeContent).toContain('export class Test');
  });

  it('应该能够创建不存在的目录', async () => {
    const docContent = `# 测试文档

## 功能描述
这是一个测试功能，用于验证目录创建。
`;

    const docFile = path.join(docsDir, 'test.md');
    fs.writeFileSync(docFile, docContent, 'utf-8');

    const nestedDir = path.join(coreDir, 'nested', 'dir');
    const config = {
      version: '1.0',
      mappings: [
        {
          id: 'mapping-001',
          document: docFile,
          codeFiles: [path.join(nestedDir, 'test.ts')],
          type: 'one-to-one',
          syncEnabled: true,
          syncStatus: 'pending'
        }
      ],
      globalSettings: {
        autoSync: true,
        syncInterval: 300,
        conflictResolution: 'manual',
        notificationEnabled: true
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

    const trigger = new BidirectionalSyncTrigger(configPath);
    const result = await trigger.manualSync(docFile);

    expect(result.success).toBe(true);
    expect(fs.existsSync(nestedDir)).toBe(true);
    expect(fs.existsSync(path.join(nestedDir, 'test.ts'))).toBe(true);
  });

  it('应该能够更新已存在的代码文件', async () => {
    const docContent = `# 测试文档

## 功能描述
这是更新后的功能描述。
`;

    const existingCode = `/**
 * 旧的描述
 */

export class Test {
  constructor() {
    // TODO: 实现构造函数
  }
}
`;

    const docFile = path.join(docsDir, 'test.md');
    const codeFile = path.join(coreDir, 'test.ts');

    fs.writeFileSync(docFile, docContent, 'utf-8');
    fs.writeFileSync(codeFile, existingCode, 'utf-8');

    const config = {
      version: '1.0',
      mappings: [
        {
          id: 'mapping-001',
          document: docFile,
          codeFiles: [codeFile],
          type: 'one-to-one',
          syncEnabled: true,
          syncStatus: 'pending'
        }
      ],
      globalSettings: {
        autoSync: true,
        syncInterval: 300,
        conflictResolution: 'manual',
        notificationEnabled: true
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

    const trigger = new BidirectionalSyncTrigger(configPath);
    const result = await trigger.manualSync(docFile);

    expect(result.success).toBe(true);

    const updatedCode = fs.readFileSync(codeFile, 'utf-8');
    expect(updatedCode).toContain('这是更新后的功能描述。');
    expect(updatedCode).not.toContain('旧的描述');
  });
});

describe('BUG-002: 映射规则热重载测试', () => {
  const testDir = path.join(__dirname, 'temp-test-bug002');
  const docsDir = path.join(testDir, 'docs');
  const coreDir = path.join(testDir, 'core');
  const configPath = path.join(testDir, '.doc-code-mapping.json');

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(docsDir, { recursive: true });
    fs.mkdirSync(coreDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('应该能够重新加载配置', () => {
    const initialConfig = {
      version: '1.0',
      mappings: [
        {
          id: 'mapping-001',
          document: 'docs/test.md',
          codeFiles: ['core/test.ts'],
          type: 'one-to-one',
          syncEnabled: true,
          syncStatus: 'pending'
        }
      ],
      globalSettings: {
        autoSync: true,
        syncInterval: 300,
        conflictResolution: 'manual',
        notificationEnabled: true
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(initialConfig, null, 2), 'utf-8');

    const parser = new MappingRuleParser(configPath);
    const initialMappings = parser.getAllMappings();

    expect(initialMappings.length).toBe(1);
    expect(initialMappings[0].id).toBe('mapping-001');

    const updatedConfig = {
      version: '1.0',
      mappings: [
        {
          id: 'mapping-001',
          document: 'docs/test.md',
          codeFiles: ['core/test.ts'],
          type: 'one-to-one',
          syncEnabled: false,
          syncStatus: 'pending'
        },
        {
          id: 'mapping-002',
          document: 'docs/test2.md',
          codeFiles: ['core/test2.ts'],
          type: 'one-to-one',
          syncEnabled: true,
          syncStatus: 'pending'
        }
      ],
      globalSettings: {
        autoSync: true,
        syncInterval: 300,
        conflictResolution: 'manual',
        notificationEnabled: true
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

    parser.reloadConfig();
    const updatedMappings = parser.getAllMappings();

    expect(updatedMappings.length).toBe(2);
    expect(updatedMappings[0].syncEnabled).toBe(false);
    expect(updatedMappings[1].id).toBe('mapping-002');
  });

  it('应该能够获取配置路径', () => {
    const config = {
      version: '1.0',
      mappings: [],
      globalSettings: {
        autoSync: true,
        syncInterval: 300,
        conflictResolution: 'manual',
        notificationEnabled: true
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

    const parser = new MappingRuleParser(configPath);
    const retrievedPath = parser.getConfigPath();

    expect(retrievedPath).toBe(configPath);
  });

  it('应该能够触发配置重载事件', (done) => {
    const config = {
      version: '1.0',
      mappings: [
        {
          id: 'mapping-001',
          document: 'docs/test.md',
          codeFiles: ['core/test.ts'],
          type: 'one-to-one',
          syncEnabled: true,
          syncStatus: 'pending'
        }
      ],
      globalSettings: {
        autoSync: true,
        syncInterval: 300,
        conflictResolution: 'manual',
        notificationEnabled: true
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

    const trigger = new BidirectionalSyncTrigger(configPath);

    let eventFired = false;
    trigger.on('config-reloaded', () => {
      eventFired = true;
      done();
    });

    setTimeout(() => {
      trigger.reloadConfig();
    }, 100);

    setTimeout(() => {
      if (!eventFired) {
        done.fail('配置重载事件未触发');
      }
    }, 1000);
  });

  it('应该能够应用新的映射规则', async () => {
    const docContent1 = `# 测试文档1

## 功能描述
这是第一个测试文档。
`;

    const docContent2 = `# 测试文档2

## 功能描述
这是第二个测试文档。
`;

    const docFile1 = path.join(docsDir, 'test1.md');
    const docFile2 = path.join(docsDir, 'test2.md');
    const codeFile1 = path.join(coreDir, 'test1.ts');
    const codeFile2 = path.join(coreDir, 'test2.ts');

    fs.writeFileSync(docFile1, docContent1, 'utf-8');
    fs.writeFileSync(docFile2, docContent2, 'utf-8');

    const initialConfig = {
      version: '1.0',
      mappings: [
        {
          id: 'mapping-001',
          document: docFile1,
          codeFiles: [codeFile1],
          type: 'one-to-one',
          syncEnabled: true,
          syncStatus: 'pending'
        }
      ],
      globalSettings: {
        autoSync: true,
        syncInterval: 300,
        conflictResolution: 'manual',
        notificationEnabled: true
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(initialConfig, null, 2), 'utf-8');

    const trigger = new BidirectionalSyncTrigger(configPath);
    let result1 = await trigger.manualSync(docFile1);

    expect(result1.success).toBe(true);
    expect(fs.existsSync(codeFile1)).toBe(true);
    expect(fs.existsSync(codeFile2)).toBe(false);

    const updatedConfig = {
      version: '1.0',
      mappings: [
        {
          id: 'mapping-001',
          document: docFile1,
          codeFiles: [codeFile1],
          type: 'one-to-one',
          syncEnabled: true,
          syncStatus: 'pending'
        },
        {
          id: 'mapping-002',
          document: docFile2,
          codeFiles: [codeFile2],
          type: 'one-to-one',
          syncEnabled: true,
          syncStatus: 'pending'
        }
      ],
      globalSettings: {
        autoSync: true,
        syncInterval: 300,
        conflictResolution: 'manual',
        notificationEnabled: true
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

    trigger.reloadConfig();

    let result2 = await trigger.manualSync(docFile2);

    expect(result2.success).toBe(true);
    expect(fs.existsSync(codeFile2)).toBe(true);
  });
});
