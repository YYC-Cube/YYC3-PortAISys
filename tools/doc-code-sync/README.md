# YYC³ 文档与代码双向同步工具

## 简介

YYC³ 文档与代码双向同步工具是一个自动化工具，用于确保项目文档与代码实现保持一致性。该工具支持文档与代码的双向同步，提供实时监控和异常提醒功能。

## 功能特性

- ✅ **双向同步**: 支持文档到代码和代码到文档的双向同步
- ✅ **实时监控**: 实时监控文档和代码的文件变更
- ✅ **自动映射**: 自动生成文档与代码的映射规则
- ✅ **冲突检测**: 检测并处理同步冲突
- ✅ **状态监控**: 实时监控同步状态和历史记录
- ✅ **异常提醒**: 同步失败时自动发送告警通知
- ✅ **命令行工具**: 提供简单易用的命令行界面

## 安装

### 前置要求

- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本

### 安装步骤

```bash
# 进入工具目录
cd tools/doc-code-sync

# 安装依赖
npm install

# 构建项目
npm run build

# 全局安装（可选）
npm link
```

## 快速开始

### 1. 初始化配置

```bash
# 初始化文档同步配置
yyc3-doc-sync init

# 指定文档和代码目录
yyc3-doc-sync init --docs-dir docs --code-dir core
```

初始化过程会：
- 扫描文档目录和代码目录
- 自动生成映射规则
- 验证映射规则有效性
- 创建配置文件 `.doc-code-mapping.json`

### 2. 启动监控

```bash
# 启动文件监控
yyc3-doc-sync watch

# 指定文档和代码目录
yyc3-doc-sync watch --docs-dir docs --code-dir core

# 指定配置文件
yyc3-doc-sync watch --config .doc-code-mapping.json
```

启动监控后，工具会：
- 监控文档和代码目录的文件变更
- 自动触发同步操作
- 实时显示同步结果
- 发送异常告警通知

### 3. 手动同步

```bash
# 同步指定文件
yyc3-doc-sync sync docs/YYC3-PortAISys-智能浮窗/00-YYC3-PortAISys-AutonomousAIEngine实现文档.md

# 同步代码文件
yyc3-doc-sync sync core/AutonomousAIEngine.ts
```

### 4. 查看状态

```bash
# 查看同步状态
yyc3-doc-sync status

# 查看所有映射规则
yyc3-doc-sync list
```

## 命令说明

### init

初始化文档同步配置。

```bash
yyc3-doc-sync init [options]
```

**选项**:
- `-d, --docs-dir <path>`: 文档目录路径（默认: docs）
- `-c, --code-dir <path>`: 代码目录路径（默认: core）

**示例**:
```bash
yyc3-doc-sync init
yyc3-doc-sync init --docs-dir docs --code-dir core
```

### watch

监控文件变更并自动同步。

```bash
yyc3-doc-sync watch [options]
```

**选项**:
- `-d, --docs-dir <path>`: 文档目录路径（默认: docs）
- `-c, --code-dir <path>`: 代码目录路径（默认: core）
- `-c, --config <path>`: 配置文件路径（默认: .doc-code-mapping.json）

**示例**:
```bash
yyc3-doc-sync watch
yyc3-doc-sync watch --docs-dir docs --code-dir core
```

### sync

手动同步指定文件。

```bash
yyc3-doc-sync sync <file> [options]
```

**参数**:
- `<file>`: 要同步的文件路径

**选项**:
- `-c, --config <path>`: 配置文件路径（默认: .doc-code-mapping.json）

**示例**:
```bash
yyc3-doc-sync sync docs/YYC3-PortAISys-智能浮窗/00-YYC3-PortAISys-AutonomousAIEngine实现文档.md
yyc3-doc-sync sync core/AutonomousAIEngine.ts
```

### status

查看同步状态。

```bash
yyc3-doc-sync status [options]
```

**选项**:
- `-c, --config <path>`: 配置文件路径（默认: .doc-code-mapping.json）

**示例**:
```bash
yyc3-doc-sync status
```

### list

列出所有映射规则。

```bash
yyc3-doc-sync list [options]
```

**选项**:
- `-c, --config <path>`: 配置文件路径（默认: .doc-code-mapping.json）

**示例**:
```bash
yyc3-doc-sync list
```

### add

添加新的映射规则。

```bash
yyc3-doc-sync add
```

**示例**:
```bash
yyc3-doc-sync add
```

### remove

删除映射规则。

```bash
yyc3-doc-sync remove <id> [options]
```

**参数**:
- `<id>`: 映射 ID

**选项**:
- `-c, --config <path>`: 配置文件路径（默认: .doc-code-mapping.json）

**示例**:
```bash
yyc3-doc-sync remove mapping-001
```

## 配置说明

### 配置文件结构

配置文件位置: `.doc-code-mapping.json`

```json
{
  "version": "1.0",
  "mappings": [
    {
      "id": "mapping-001",
      "document": "docs/YYC3-PortAISys-智能浮窗/00-YYC3-PortAISys-AutonomousAIEngine实现文档.md",
      "codeFiles": [
        "core/autonomous-ai-widget/AutonomousAIEngine.ts",
        "core/autonomous-ai-widget/types.ts"
      ],
      "type": "one-to-many",
      "syncEnabled": true,
      "lastSync": "2026-01-20T10:30:00Z",
      "syncStatus": "success"
    }
  ],
  "globalSettings": {
    "autoSync": true,
    "syncInterval": 300,
    "conflictResolution": "manual",
    "notificationEnabled": true
  }
}
```

### 配置参数说明

**映射规则参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 映射唯一标识符 |
| document | string | 是 | 文档文件路径 |
| codeFiles | array | 是 | 代码文件路径数组 |
| type | string | 是 | 映射类型（one-to-one、one-to-many、many-to-one） |
| syncEnabled | boolean | 否 | 是否启用同步（默认 true） |
| lastSync | string | 否 | 最后同步时间（ISO 8601 格式） |
| syncStatus | string | 否 | 同步状态（success、failed、pending） |

**全局设置参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| autoSync | boolean | 否 | 是否自动同步（默认 true） |
| syncInterval | number | 否 | 同步间隔（秒，默认 300） |
| conflictResolution | string | 否 | 冲突解决策略（manual、auto、latest，默认 manual） |
| notificationEnabled | boolean | 否 | 是否启用通知（默认 true） |

## 最佳实践

### 文档编写规范

**文档结构规范**:
```markdown
# 文档标题

## 功能描述
[功能描述内容]

## API 接口
[API 接口说明]

## 使用示例
[使用示例代码]

## 注意事项
[注意事项说明]
```

**文档命名规范**:
- 使用清晰的描述性名称
- 使用统一的命名前缀
- 使用连字符分隔单词
- 避免使用特殊字符

### 代码编写规范

**代码注释规范**:
```typescript
/**
 * 类/函数/方法的描述
 * 
 * @param paramName - 参数说明
 * @returns 返回值说明
 * @throws {Error} 错误说明
 */
export class ClassName {
  // 代码实现
}
```

**代码命名规范**:
- 使用 PascalCase 命名类和接口
- 使用 camelCase 命名变量和函数
- 使用 kebab-case 命名目录
- 避免使用缩写

### 同步使用建议

**同步建议**:
1. **及时保存**: 编辑完成后及时保存文档和代码
2. **定期检查**: 定期检查同步状态和历史记录
3. **处理冲突**: 及时处理同步冲突
4. **更新映射**: 及时更新映射规则
5. **查看日志**: 定期查看同步日志

## 故障排除

### 常见问题

**问题1: 同步失败**
- **原因**: 文件不存在或权限不足
- **解决**: 检查文件路径和权限

**问题2: 映射规则无效**
- **原因**: 映射规则配置错误
- **解决**: 检查映射规则配置文件

**问题3: 监控不工作**
- **原因**: 文件监控服务未启动
- **解决**: 重新启动监控服务

**问题4: 冲突无法解决**
- **原因**: 冲突解决策略配置不当
- **解决**: 调整冲突解决策略或手动解决

### 日志查看

**日志文件位置**: `./sync-monitor.log`

**日志内容示例**:
```
[2026-01-20T10:30:00.000Z] 监控服务已启动
[2026-01-20T10:30:05.000Z] 同步结果: 成功 - 同步完成: 1 个映射
[2026-01-20T10:30:10.000Z] 告警: [error] 同步失败告警 - 检测到 5 个映射同步失败
```

## 开发

### 项目结构

```
tools/doc-code-sync/
├── package.json              # 项目配置文件
├── tsconfig.json            # TypeScript 配置文件
├── README.md               # 使用说明文档
├── src/
│   ├── index.ts            # 命令行入口
│   ├── types.ts            # 类型定义
│   ├── mapping-parser.ts    # 映射规则解析器
│   ├── sync-trigger.ts     # 同步触发器
│   └── monitor.ts          # 监控告警器
├── dist/                   # 编译输出目录
└── tests/                  # 测试目录
```

### 开发命令

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 贡献

欢迎贡献代码、报告问题或提出建议！

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系 YYC³ 团队。
