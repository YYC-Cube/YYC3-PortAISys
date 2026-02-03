# 知识库API

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 知识库API文档

## 概述

知识库API提供完整的知识库管理功能，支持知识库创建、文档管理、向量检索、知识图谱构建、智能问答和知识库优化等高级功能。

## 功能特性

- ✅ 知识库创建和管理
- ✅ 文档上传和解析
- ✅ 向量化和索引
- ✅ 语义检索和相似度搜索
- ✅ 知识图谱构建
- ✅ 智能问答（RAG）
- ✅ 知识库版本控制
- ✅ 知识库权限管理
- ✅ 知识库统计和监控
- ✅ 知识库导出和导入

## 认证

所有知识库API都需要认证。使用Bearer Token认证方式：

```http
Authorization: Bearer <access_token>
```

## API端点

### 1. 知识库管理

#### 1.1 创建知识库

创建新的知识库。

**请求**

```http
POST /v1/knowledge-bases
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "产品文档知识库",
  "description": "包含所有产品相关文档的知识库",
  "type": "document",
  "embeddingModel": "text-embedding-ada-002",
  "chunkSize": 1000,
  "chunkOverlap": 200,
  "indexType": "hnsw",
  "metadata": {
    "category": "product",
    "language": "zh-CN"
  },
  "options": {
    "enableReranking": true,
    "enableHybridSearch": true,
    "enableGraph": true
  }
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| name | string | 是 | 知识库名称 |
| description | string | 否 | 知识库描述 |
| type | string | 是 | 知识库类型：document、qa、graph |
| embeddingModel | string | 是 | 嵌入模型 |
| chunkSize | number | 否 | 分块大小，默认为1000 |
| chunkOverlap | number | 否 | 分块重叠，默认为200 |
| indexType | string | 否 | 索引类型：hnsw、ivf、flat，默认为hnsw |
| metadata | object | 否 | 元数据 |
| options | object | 否 | 配置选项 |

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "knowledgeBase": {
      "id": "kb-abc123",
      "name": "产品文档知识库",
      "description": "包含所有产品相关文档的知识库",
      "type": "document",
      "embeddingModel": "text-embedding-ada-002",
      "chunkSize": 1000,
      "chunkOverlap": 200,
      "indexType": "hnsw",
      "metadata": {
        "category": "product",
        "language": "zh-CN"
      },
      "options": {
        "enableReranking": true,
        "enableHybridSearch": true,
        "enableGraph": true
      },
      "status": "created",
      "documentCount": 0,
      "chunkCount": 0,
      "size": 0,
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "知识库创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.2 获取知识库列表

获取所有知识库列表。

**请求**

```http
GET /v1/knowledge-bases
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| type | string | 否 | 知识库类型筛选 |
| status | string | 否 | 状态筛选：created、indexing、ready、error |
| sortBy | string | 否 | 排序字段：name、createdAt、documentCount，默认为createdAt |
| sortOrder | string | 否 | 排序方向：asc、desc，默认为desc |
| page | number | 否 | 页码，默认为1 |
| limit | number | 否 | 每页数量，默认为20 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "knowledgeBases": [
      {
        "id": "kb-abc123",
        "name": "产品文档知识库",
        "description": "包含所有产品相关文档的知识库",
        "type": "document",
        "embeddingModel": "text-embedding-ada-002",
        "status": "ready",
        "documentCount": 100,
        "chunkCount": 1000,
        "size": 104857600,
        "createdAt": "2026-02-03T12:00:00.000Z",
        "updatedAt": "2026-02-03T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.3 获取知识库详情

获取知识库的详细信息。

**请求**

```http
GET /v1/knowledge-bases/{knowledgeBaseId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "knowledgeBase": {
      "id": "kb-abc123",
      "name": "产品文档知识库",
      "description": "包含所有产品相关文档的知识库",
      "type": "document",
      "embeddingModel": "text-embedding-ada-002",
      "chunkSize": 1000,
      "chunkOverlap": 200,
      "indexType": "hnsw",
      "metadata": {
        "category": "product",
        "language": "zh-CN"
      },
      "options": {
        "enableReranking": true,
        "enableHybridSearch": true,
        "enableGraph": true
      },
      "status": "ready",
      "documentCount": 100,
      "chunkCount": 1000,
      "size": 104857600,
      "indexSize": 52428800,
      "graph": {
        "nodeCount": 500,
        "edgeCount": 2000
      },
      "owner": {
        "id": "user-123",
        "name": "John Doe"
      },
      "permissions": {
        "read": true,
        "write": true,
        "delete": true,
        "share": true
      },
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.4 更新知识库

更新知识库信息。

**请求**

```http
PATCH /v1/knowledge-bases/{knowledgeBaseId}
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "产品文档知识库v2",
  "description": "更新后的产品文档知识库",
  "options": {
    "enableReranking": true,
    "enableHybridSearch": true,
    "enableGraph": true,
    "rerankModel": "cross-encoder"
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "knowledgeBase": {
      "id": "kb-abc123",
      "name": "产品文档知识库v2",
      "description": "更新后的产品文档知识库",
      "options": {
        "enableReranking": true,
        "enableHybridSearch": true,
        "enableGraph": true,
        "rerankModel": "cross-encoder"
      },
      "updatedAt": "2026-02-03T12:30:00.000Z"
    }
  },
  "message": "知识库更新成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

#### 1.5 删除知识库

删除知识库。

**请求**

```http
DELETE /v1/knowledge-bases/{knowledgeBaseId}
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| force | boolean | 否 | 是否强制删除，默认为false |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "knowledgeBaseId": "kb-abc123",
    "deleted": true,
    "deletedAt": "2026-02-03T12:30:00.000Z"
  },
  "message": "知识库删除成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 2. 文档管理

#### 2.1 上传文档

上传文档到知识库。

**请求**

```http
POST /v1/knowledge-bases/{knowledgeBaseId}/documents
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| file | File | 是 | 文档文件（支持PDF、DOCX、TXT、MD等格式） |
| title | string | 否 | 文档标题 |
| description | string | 否 | 文档描述 |
| metadata | object | 否 | 文档元数据 |
| tags | array | 否 | 文档标签 |

**请求示例**

```bash
curl -X POST https://api.yyc3.com/v1/knowledge-bases/kb-abc123/documents \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/document.pdf" \
  -F "title=产品使用手册" \
  -F "description=YYC³产品使用手册" \
  -F 'metadata={"version":"1.0.0","category":"manual"}' \
  -F 'tags=["manual","product"]'
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "doc-abc123",
      "knowledgeBaseId": "kb-abc123",
      "title": "产品使用手册",
      "description": "YYC³产品使用手册",
      "fileName": "document.pdf",
      "fileSize": 1048576,
      "fileType": "application/pdf",
      "metadata": {
        "version": "1.0.0",
        "category": "manual"
      },
      "tags": ["manual", "product"],
      "status": "processing",
      "chunkCount": 0,
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "文档上传成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 2.2 批量上传文档

批量上传文档到知识库。

**请求**

```http
POST /v1/knowledge-bases/{knowledgeBaseId}/documents/batch
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| files | File[] | 是 | 文档文件数组 |

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "doc-abc123",
        "title": "document1.pdf",
        "status": "processing"
      },
      {
        "id": "doc-def456",
        "title": "document2.pdf",
        "status": "processing"
      },
      {
        "id": "doc-ghi789",
        "title": "document3.pdf",
        "status": "processing"
      }
    ],
    "summary": {
      "total": 3,
      "success": 3,
      "failed": 0
    }
  },
  "message": "批量上传成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 2.3 从URL导入文档

从URL导入文档到知识库。

**请求**

```http
POST /v1/knowledge-bases/{knowledgeBaseId}/documents/import
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "urls": [
    "https://example.com/document1.pdf",
    "https://example.com/document2.pdf"
  ],
  "options": {
    "followRedirects": true,
    "timeout": 30000
  }
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "taskId": "import-abc123",
    "knowledgeBaseId": "kb-abc123",
    "urls": [
      "https://example.com/document1.pdf",
      "https://example.com/document2.pdf"
    ],
    "status": "processing",
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "文档导入任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 2.4 列出文档

列出知识库中的所有文档。

**请求**

```http
GET /v1/knowledge-bases/{knowledgeBaseId}/documents
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| status | string | 否 | 状态筛选：processing、indexed、error |
| tags | string | 否 | 标签筛选（逗号分隔） |
| sortBy | string | 否 | 排序字段：title、createdAt、fileSize，默认为createdAt |
| sortOrder | string | 否 | 排序方向：asc、desc，默认为desc |
| page | number | 否 | 页码，默认为1 |
| limit | number | 否 | 每页数量，默认为20 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "doc-abc123",
        "knowledgeBaseId": "kb-abc123",
        "title": "产品使用手册",
        "description": "YYC³产品使用手册",
        "fileName": "document.pdf",
        "fileSize": 1048576,
        "fileType": "application/pdf",
        "metadata": {
          "version": "1.0.0",
          "category": "manual"
        },
        "tags": ["manual", "product"],
        "status": "indexed",
        "chunkCount": 100,
        "createdAt": "2026-02-03T12:00:00.000Z",
        "updatedAt": "2026-02-03T12:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 2.5 删除文档

删除知识库中的文档。

**请求**

```http
DELETE /v1/knowledge-bases/{knowledgeBaseId}/documents/{documentId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "documentId": "doc-abc123",
    "deleted": true,
    "deletedChunks": 100
  },
  "message": "文档删除成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 3. 向量检索

#### 3.1 语义检索

执行语义检索。

**请求**

```http
POST /v1/knowledge-bases/{knowledgeBaseId}/search/semantic
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "query": "如何使用YYC³系统？",
  "topK": 5,
  "filter": {
    "tags": ["manual"],
    "metadata": {
      "category": "manual"
    }
  },
  "options": {
    "enableReranking": true,
    "rerankTopK": 10,
    "minScore": 0.7
  }
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| query | string | 是 | 查询文本 |
| topK | number | 否 | 返回结果数量，默认为5 |
| filter | object | 否 | 过滤条件 |
| options | object | 否 | 检索选项 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "query": "如何使用YYC³系统？",
    "results": [
      {
        "chunkId": "chunk-abc123",
        "documentId": "doc-abc123",
        "documentTitle": "产品使用手册",
        "content": "YYC³系统是一个基于云原生架构的便携式智能AI系统...",
        "score": 0.95,
        "metadata": {
          "page": 1,
          "section": "introduction"
        },
        "highlight": "YYC³<mark>系统</mark>是一个基于云原生架构的便携式智能AI<mark>系统</mark>..."
      },
      {
        "chunkId": "chunk-def456",
        "documentId": "doc-abc123",
        "documentTitle": "产品使用手册",
        "content": "使用YYC³系统非常简单，只需按照以下步骤操作...",
        "score": 0.92,
        "metadata": {
          "page": 5,
          "section": "quick-start"
        },
        "highlight": "<mark>使用</mark>YYC³<mark>系统</mark>非常简单，只需按照以下步骤<mark>操作</mark>..."
      }
    ],
    "total": 2,
    "searchTime": 50
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 3.2 混合检索

执行混合检索（语义+关键词）。

**请求**

```http
POST /v1/knowledge-bases/{knowledgeBaseId}/search/hybrid
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "query": "如何使用YYC³系统？",
  "topK": 5,
  "weights": {
    "semantic": 0.7,
    "keyword": 0.3
  },
  "filter": {
    "tags": ["manual"]
  },
  "options": {
    "enableReranking": true,
    "minScore": 0.6
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "query": "如何使用YYC³系统？",
    "results": [
      {
        "chunkId": "chunk-abc123",
        "documentId": "doc-abc123",
        "documentTitle": "产品使用手册",
        "content": "YYC³系统是一个基于云原生架构的便携式智能AI系统...",
        "semanticScore": 0.95,
        "keywordScore": 0.8,
        "combinedScore": 0.905,
        "highlight": "YYC³<mark>系统</mark>是一个基于云原生架构的便携式智能AI<mark>系统</mark>..."
      }
    ],
    "total": 1,
    "searchTime": 80
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 3.3 多路召回

执行多路召回并融合结果。

**请求**

```http
POST /v1/knowledge-bases/{knowledgeBaseId}/search/multi
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "query": "如何使用YYC³系统？",
  "strategies": [
    {
      "type": "semantic",
      "topK": 10,
      "weight": 0.5
    },
    {
      "type": "keyword",
      "topK": 10,
      "weight": 0.3
    },
    {
      "type": "graph",
      "topK": 10,
      "weight": 0.2
    }
  ],
  "fusion": {
    "method": "rrf",
    "k": 60
  },
  "topK": 5
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "query": "如何使用YYC³系统？",
    "results": [
      {
        "chunkId": "chunk-abc123",
        "documentId": "doc-abc123",
        "documentTitle": "产品使用手册",
        "content": "YYC³系统是一个基于云原生架构的便携式智能AI系统...",
        "rrfScore": 0.95,
        "strategies": {
          "semantic": {
            "score": 0.95,
            "rank": 1
          },
          "keyword": {
            "score": 0.8,
            "rank": 2
          },
          "graph": {
            "score": 0.7,
            "rank": 3
          }
        }
      }
    ],
    "total": 1,
    "searchTime": 120
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 4. 智能问答

#### 4.1 创建问答

基于知识库创建问答。

**请求**

```http
POST /v1/knowledge-bases/{knowledgeBaseId}/qa
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "question": "如何使用YYC³系统？",
  "model": "gpt-4",
  "retrieval": {
    "topK": 5,
    "enableReranking": true,
    "minScore": 0.7
  },
  "generation": {
    "maxTokens": 1000,
    "temperature": 0.7,
    "enableCitations": true
  },
  "options": {
    "stream": false
  }
}
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| question | string | 是 | 问题 |
| model | string | 是 | 生成模型 |
| retrieval | object | 否 | 检索配置 |
| generation | object | 否 | 生成配置 |
| options | object | 否 | 其他选项 |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "id": "qa-abc123",
    "question": "如何使用YYC³系统？",
    "answer": "YYC³系统是一个基于云原生架构的便携式智能AI系统。使用YYC³系统非常简单，只需按照以下步骤操作：\n\n1. 注册账号并登录\n2. 创建工作空间\n3. 上传数据\n4. 配置AI模型\n5. 开始使用\n\n详细的使用说明请参考产品使用手册。",
    "citations": [
      {
        "chunkId": "chunk-abc123",
        "documentId": "doc-abc123",
        "documentTitle": "产品使用手册",
        "content": "YYC³系统是一个基于云原生架构的便携式智能AI系统...",
        "page": 1
      },
      {
        "chunkId": "chunk-def456",
        "documentId": "doc-abc123",
        "documentTitle": "产品使用手册",
        "content": "使用YYC³系统非常简单，只需按照以下步骤操作...",
        "page": 5
      }
    ],
    "retrieval": {
      "topK": 5,
      "results": 2,
      "searchTime": 50
    },
    "usage": {
      "promptTokens": 500,
      "completionTokens": 200,
      "totalTokens": 700
    },
    "latency": 1500,
    "timestamp": "2026-02-03T12:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:01.500Z"
}
```

#### 4.2 流式问答

流式生成问答。

**请求**

```http
POST /v1/knowledge-bases/{knowledgeBaseId}/qa/stream
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "question": "如何使用YYC³系统？",
  "model": "gpt-4",
  "retrieval": {
    "topK": 5
  },
  "generation": {
    "maxTokens": 1000,
    "temperature": 0.7
  },
  "options": {
    "stream": true
  }
}
```

**响应**

Server-Sent Events (SSE) 流式响应：

```
data: {"id":"qa-abc123","question":"如何使用YYC³系统？","answer":"YYC³系统是一个基于云原生架构的便携式智能AI系统。","citations":null,"done":false}

data: {"id":"qa-abc123","question":"如何使用YYC³系统？","answer":"使用YYC³系统非常简单，只需按照以下步骤操作：","citations":null,"done":false}

data: {"id":"qa-abc123","question":"如何使用YYC³系统？","answer":"\n\n1. 注册账号并登录\n2. 创建工作空间\n3. 上传数据\n4. 配置AI模型\n5. 开始使用","citations":null,"done":false}

...

data: {"id":"qa-abc123","question":"如何使用YYC³系统？","answer":"...","citations":[{"chunkId":"chunk-abc123","documentId":"doc-abc123","documentTitle":"产品使用手册","content":"...","page":1}],"done":true}
```

### 5. 知识图谱

#### 5.1 构建知识图谱

构建知识图谱。

**请求**

```http
POST /v1/knowledge-bases/{knowledgeBaseId}/graph/build
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "model": "gpt-4",
  "extraction": {
    "entityTypes": ["person", "organization", "location", "concept"],
    "relationTypes": ["belongs_to", "located_in", "related_to", "part_of"],
    "minConfidence": 0.7
  },
  "options": {
    "enableClustering": true,
    "enableSummarization": true
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "taskId": "graph-build-abc123",
    "knowledgeBaseId": "kb-abc123",
    "status": "processing",
    "estimatedTime": 300,
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "知识图谱构建任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 5.2 查询知识图谱

查询知识图谱。

**请求**

```http
POST /v1/knowledge-bases/{knowledgeBaseId}/graph/query
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "query": "YYC³系统包含哪些功能？",
  "type": "natural_language",
  "options": {
    "maxDepth": 2,
    "maxResults": 10
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "query": "YYC³系统包含哪些功能？",
    "results": [
      {
        "entity": {
          "id": "entity-abc123",
          "type": "concept",
          "name": "YYC³系统",
          "properties": {
            "description": "基于云原生架构的便携式智能AI系统"
          }
        },
        "relations": [
          {
            "type": "contains",
            "target": {
              "id": "entity-def456",
              "type": "concept",
              "name": "智能AI浮窗"
            }
          },
          {
            "type": "contains",
            "target": {
              "id": "entity-ghi789",
              "type": "concept",
              "name": "五维闭环系统"
            }
          }
        ]
      }
    ],
    "total": 1,
    "queryTime": 100
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 6. 知识库统计

#### 6.1 获取知识库统计

获取知识库统计信息。

**请求**

```http
GET /v1/knowledge-bases/{knowledgeBaseId}/stats
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "knowledgeBase": {
      "id": "kb-abc123",
      "name": "产品文档知识库"
    },
    "overview": {
      "documentCount": 100,
      "chunkCount": 1000,
      "totalSize": 104857600,
      "indexSize": 52428800
    },
    "documents": {
      "byType": {
        "pdf": 50,
        "docx": 30,
        "txt": 20
      },
      "byStatus": {
        "indexed": 95,
        "processing": 3,
        "error": 2
      },
      "byTag": {
        "manual": 40,
        "product": 60
      }
    },
    "search": {
      "totalSearches": 10000,
      "avgSearchTime": 50,
      "avgTopK": 5,
      "avgScore": 0.85
    },
    "qa": {
      "totalQuestions": 5000,
      "avgAnswerTime": 1500,
      "avgAnswerLength": 200
    },
    "graph": {
      "nodeCount": 500,
      "edgeCount": 2000,
      "avgDegree": 8
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 7. 知识库导出

#### 7.1 导出知识库

导出知识库。

**请求**

```http
POST /v1/knowledge-bases/{knowledgeBaseId}/export
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "format": "json",
  "include": {
    "documents": true,
    "chunks": true,
    "graph": true,
    "metadata": true
  },
  "compression": true
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "exportId": "export-abc123",
    "knowledgeBaseId": "kb-abc123",
    "format": "json",
    "status": "processing",
    "estimatedSize": 104857600,
    "createdAt": "2026-02-03T12:00:00.000Z"
  },
  "message": "知识库导出任务创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 7.2 下载导出文件

下载导出文件。

**请求**

```http
GET /v1/knowledge-bases/{knowledgeBaseId}/exports/{exportId}/download
Authorization: Bearer <access_token>
```

**响应**

文件内容以二进制流形式返回。

## 错误代码

| 错误代码 | 描述 | HTTP状态码 |
|----------|------|------------|
| E1001 | 知识库不存在 | 404 |
| E1002 | 文档不存在 | 404 |
| E1003 | 文档格式不支持 | 400 |
| E1004 | 索引失败 | 500 |
| E1005 | 检索失败 | 500 |
| E1006 | 问答失败 | 500 |
| E1007 | 知识图谱构建失败 | 500 |
| E1008 | 导出失败 | 500 |
| E1009 | 权限不足 | 403 |

## 使用示例

### JavaScript/TypeScript

```typescript
import { KnowledgeBaseService } from '@yyc3/sdk';

const kbService = new KnowledgeBaseService({
  apiKey: 'your-api-key',
  baseURL: 'https://api.yyc3.com'
});

// 创建知识库
const kb = await kbService.create({
  name: '产品文档知识库',
  description: '包含所有产品相关文档的知识库',
  type: 'document',
  embeddingModel: 'text-embedding-ada-002'
});

console.log('知识库创建成功:', kb);

// 上传文档
const doc = await kbService.uploadDocument(kb.id, {
  file: document.getElementById('fileInput').files[0],
  title: '产品使用手册',
  description: 'YYC³产品使用手册',
  tags: ['manual', 'product']
});

console.log('文档上传成功:', doc);

// 语义检索
const results = await kbService.semanticSearch(kb.id, {
  query: '如何使用YYC³系统？',
  topK: 5
});

console.log('检索结果:', results);

// 智能问答
const qa = await kbService.qa(kb.id, {
  question: '如何使用YYC³系统？',
  model: 'gpt-4'
});

console.log('问答结果:', qa.answer);
```

### Python

```python
from yyc3 import KnowledgeBaseService

kb_service = KnowledgeBaseService(
    api_key='your-api-key',
    base_url='https://api.yyc3.com'
)

# 创建知识库
kb = kb_service.create(
    name='产品文档知识库',
    description='包含所有产品相关文档的知识库',
    type='document',
    embedding_model='text-embedding-ada-002'
)

print(f'知识库创建成功: {kb}')

# 上传文档
with open('document.pdf', 'rb') as f:
    doc = kb_service.upload_document(
        kb_id=kb.id,
        file=f,
        title='产品使用手册',
        description='YYC³产品使用手册',
        tags=['manual', 'product']
    )

print(f'文档上传成功: {doc}')

# 语义检索
results = kb_service.semantic_search(
    kb_id=kb.id,
    query='如何使用YYC³系统？',
    top_k=5
)

print(f'检索结果: {results}')

# 智能问答
qa = kb_service.qa(
    kb_id=kb.id,
    question='如何使用YYC³系统？',
    model='gpt-4'
)

print(f'问答结果: {qa.answer}')
```

## 最佳实践

1. **知识库设计**
   - 合理设置分块大小和重叠
   - 选择合适的嵌入模型
   - 使用标签和元数据组织文档

2. **检索优化**
   - 使用混合检索提高准确率
   - 配置重排序优化结果
   - 设置合理的过滤条件

3. **问答质量**
   - 优化检索参数提高相关性
   - 启用引用增强可信度
   - 调整生成参数控制输出

4. **性能优化**
   - 定期重建索引
   - 使用缓存减少重复检索
   - 监控检索延迟和准确率

5. **安全考虑**
   - 控制知识库访问权限
   - 加密敏感文档
   - 定期审核文档内容

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
