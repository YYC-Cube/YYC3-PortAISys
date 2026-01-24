# YYC³ 文档同步工具快速启动指南

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- 操作系统: macOS / Linux / Windows (WSL)

### 1. 初始化系统（5分钟）

```bash
# 进入工具目录
cd /Users/my/yyc3-Portable-Intelligent-AI-System/tools/doc-code-sync

# 运行初始化脚本
./init.sh
```

**初始化脚本会自动完成**:
- ✅ 检查Node.js版本
- ✅ 安装依赖包
- ✅ 构建项目
- ✅ 创建必要的目录（docs、core）
- ✅ 扫描文档和代码文件
- ✅ 生成映射规则
- ✅ 创建配置文件

### 2. 查看配置（1分钟）

```bash
# 查看生成的配置文件
cat .doc-code-mapping.json
```

**配置文件包含**:
- 映射规则列表
- 全局设置（自动同步、同步间隔、冲突解决策略等）

### 3. 启动监控服务（1分钟）

```bash
# 启动文件监控
./start.sh
```

**监控服务会**:
- 👀 监控docs和core目录的文件变更
- 🔄 自动触发同步
- 📊 实时显示同步状态
- ⚠️ 显示错误和警告信息

**停止监控**: 按 `Ctrl+C`

### 4. 测试同步功能（2分钟）

**测试1: 文档到代码同步**

```bash
# 在新终端中，修改文档文件
echo "# 新增内容" >> docs/example.md

# 观察监控终端，应该看到同步触发
```

**测试2: 代码到文档同步**

```bash
# 在新终端中，修改代码文件
echo "// 新增代码" >> core/example.ts

# 观察监控终端，应该看到同步触发
```

### 5. 查看同步状态（1分钟）

```bash
# 在新终端中，查看同步状态
node dist/index.js status
```

**状态信息包括**:
- 总映射数
- 已同步数量
- 失败数量
- 待同步映射
- 最后同步时间

---

## 📋 常用命令

### 基础命令

```bash
# 初始化配置
./init.sh

# 启动监控
./start.sh

# 查看状态
node dist/index.js status

# 查看帮助
node dist/index.js --help
```

### 监控命令

```bash
# 启动监控（默认目录）
node dist/index.js watch

# 指定文档和代码目录
node dist/index.js watch --docs-dir ./docs --code-dir ./core

# 指定配置文件
node dist/index.js watch --config .doc-code-mapping.json
```

### 同步命令

```bash
# 执行所有同步
node dist/index.js sync

# 同步指定文件
node dist/index.js sync --file docs/example.md

# 同步指定映射
node dist/index.js sync --mapping mapping-001
```

### 配置命令

```bash
# 添加映射规则
node dist/index.js add-mapping --doc docs/new.md --code core/new.ts

# 删除映射规则
node dist/index.js remove-mapping --id mapping-001

# 更新映射规则
node dist/index.js update-mapping --id mapping-001 --sync-enabled false
```

---

## 📁 目录结构

```
tools/doc-code-sync/
├── .doc-code-mapping.json    # 配置文件
├── dist/                      # 编译输出
├── docs/                      # 文档目录
│   └── example.md
├── core/                      # 代码目录
│   └── example.ts
├── src/                       # 源代码
│   ├── index.ts
│   ├── mapping-parser.ts
│   ├── sync-trigger.ts
│   ├── monitor.ts
│   └── ...
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript配置
├── init.sh                  # 初始化脚本
├── start.sh                 # 启动脚本
└── README.md                # 使用文档
```

---

## ⚙️ 配置说明

### 映射规则

映射规则定义了文档文件和代码文件之间的同步关系。

**映射类型**:
- `one-to-one`: 一个文档对应一个代码文件
- `one-to-many`: 一个文档对应多个代码文件
- `many-to-one`: 多个文档对应一个代码文件

**示例配置**:
```json
{
  "mappings": [
    {
      "id": "mapping-001",
      "document": "docs/example.md",
      "codeFiles": ["core/example.ts"],
      "type": "one-to-one",
      "syncEnabled": true,
      "syncStatus": "pending"
    }
  ]
}
```

### 全局设置

```json
{
  "globalSettings": {
    "autoSync": true,              // 自动同步
    "syncInterval": 300,           // 同步间隔（秒）
    "conflictResolution": "manual", // 冲突解决策略
    "notificationEnabled": true      // 启用通知
  }
}
```

**冲突解决策略**:
- `manual`: 手动解决
- `latest`: 使用最新版本
- `document`: 文档优先
- `code`: 代码优先

---

## 🔧 故障排除

### 问题1: 初始化失败

**错误**: `ENOENT: no such file or directory, scandir 'docs'`

**解决方案**:
```bash
# 创建必要的目录
mkdir -p docs core

# 重新初始化
./init.sh
```

### 问题2: 端口占用

**错误**: `Error: listen EADDRINUSE: address already in use :::3100`

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :3100

# 终止进程
kill -9 <PID>
```

### 问题3: 依赖缺失

**错误**: `Cannot find module 'xxx'`

**解决方案**:
```bash
# 重新安装依赖
cd tools/doc-code-sync
npm install
```

### 问题4: 权限错误

**错误**: `Permission denied`

**解决方案**:
```bash
# 赋予执行权限
chmod +x init.sh start.sh
```

### 问题5: 配置文件错误

**错误**: `映射规则验证失败`

**解决方案**:
```bash
# 删除配置文件
rm .doc-code-mapping.json

# 重新初始化
./init.sh
```

---

## 📊 监控和日志

### 查看实时日志

```bash
# 启动监控时，日志会实时显示
./start.sh
```

**日志级别**:
- `INFO`: 一般信息
- `SUCCESS`: 成功操作
- `WARNING`: 警告信息
- `ERROR`: 错误信息

### 查看历史日志

```bash
# 日志文件位置
cat logs/sync.log

# 查看最近的错误
grep ERROR logs/sync.log

# 查看最近的同步记录
tail -f logs/sync.log
```

---

## 🎯 最佳实践

### 1. 定期备份

```bash
# 备份配置文件
cp .doc-code-mapping.json .doc-code-mapping.json.backup

# 备份文档和代码
tar -czf backup-$(date +%Y%m%d).tar.gz docs core
```

### 2. 版本控制

```bash
# 将配置文件纳入版本控制
git add .doc-code-mapping.json
git commit -m "Add sync configuration"
```

### 3. 定期检查

```bash
# 定期查看同步状态
node dist/index.js status

# 定期检查映射规则
cat .doc-code-mapping.json
```

### 4. 性能优化

- 避免频繁修改大文件
- 使用增量同步
- 合理设置同步间隔
- 定期清理日志文件

---

## 📚 更多资源

### 文档

- [详细实施计划](file:///Users/my/yyc3-Portable-Intelligent-AI-System/docs/YYC3-PortAISys-缺失补全/文档同步工具详细实施计划.md)
- [监控系统实施方案](file:///Users/my/yyc3-Portable-Intelligent-AI-System/docs/YYC3-PortAISys-缺失补全/文档同步监控系统实施方案.md)
- [性能测试与优化方案](file:///Users/my/yyc3-Portable-Intelligent-AI-System/docs/YYC3-PortAISys-缺失补全/文档同步工具性能测试与优化方案.md)
- [功能扩展路线图](file:///Users/my/yyc3-Portable-Intelligent-AI-System/docs/YYC3-PortAISys-缺失补全/文档同步工具功能扩展路线图.md)
- [用户反馈收集方案](file:///Users/my/yyc3-Portable-Intelligent-AI-System/docs/YYC3-PortAISys-缺失补全/用户反馈收集渠道实施方案.md)

### 工具文档

- [README.md](file:///Users/my/yyc3-Portable-Intelligent-AI-System/tools/doc-code-sync/README.md)

---

## 🆘 获取帮助

### 命令行帮助

```bash
# 查看所有命令
node dist/index.js --help

# 查看特定命令帮助
node dist/index.js watch --help
node dist/index.js sync --help
node dist/index.js status --help
```

### 问题反馈

如果您遇到问题或有建议，请通过以下方式反馈：

- 邮件: feedback@yyc3.com
- GitHub Issues: https://github.com/yyc3/doc-code-sync/issues
- 钉钉群: YYC³用户反馈群

---

## ✅ 快速检查清单

在开始使用之前，请确认以下事项：

- [ ] Node.js版本 >= 18.0.0
- [ ] 已运行 `./init.sh` 初始化系统
- [ ] 配置文件 `.doc-code-mapping.json` 已生成
- [ ] docs和core目录已创建
- [ ] 至少有一个映射规则
- [ ] 可以运行 `./start.sh` 启动监控
- [ ] 可以运行 `node dist/index.js status` 查看状态

---

**祝您使用愉快！** 🎉

如有任何问题，请随时联系我们的支持团队。

---

**文档版本**: v1.0  
**最后更新**: 2026-01-20  
**维护团队**: YYC³ 技术团队
