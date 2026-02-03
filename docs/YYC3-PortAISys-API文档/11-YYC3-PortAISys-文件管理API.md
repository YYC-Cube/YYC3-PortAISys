# 文件管理API

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> YYC³ PortAISys 文件管理API文档

## 概述

文件管理API提供完整的文件上传、下载、管理和处理功能，支持多种文件类型、大文件分片上传、文件转换和预览等高级功能。

## 功能特性

- ✅ 文件上传（单文件、多文件、分片上传）
- ✅ 文件下载（直接下载、断点续传）
- ✅ 文件管理（重命名、移动、复制、删除）
- ✅ 文件夹管理（创建、删除、移动）
- ✅ 文件预览（图片、视频、文档）
- ✅ 文件转换（格式转换、压缩、裁剪）
- ✅ 文件权限管理
- ✅ 文件版本控制
- ✅ 文件搜索和筛选
- ✅ 文件存储桶管理

## 认证

所有文件管理API都需要认证。使用Bearer Token认证方式：

```http
Authorization: Bearer <access_token>
```

## API端点

### 1. 文件上传

#### 1.1 单文件上传

上传单个文件到指定目录。

**请求**

```http
POST /v1/files/upload
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| file | File | 是 | 要上传的文件 |
| path | string | 否 | 上传路径，默认为根目录 |
| overwrite | boolean | 否 | 是否覆盖同名文件，默认为false |
| metadata | object | 否 | 文件元数据 |
| tags | array | 否 | 文件标签 |

**请求示例**

```bash
curl -X POST https://api.yyc3.com/v1/files/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/document.pdf" \
  -F "path=/documents" \
  -F "metadata={\"author\":\"John Doe\",\"category\":\"report\"}" \
  -F "tags=[\"report\",\"2026\"]"
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-abc123",
      "name": "document.pdf",
      "path": "/documents/document.pdf",
      "size": 1048576,
      "mimeType": "application/pdf",
      "extension": "pdf",
      "url": "https://cdn.yyc3.com/files/file-abc123.pdf",
      "thumbnailUrl": "https://cdn.yyc3.com/thumbnails/file-abc123.jpg",
      "checksum": "sha256:abc123...",
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z",
      "metadata": {
        "author": "John Doe",
        "category": "report"
      },
      "tags": ["report", "2026"],
      "permissions": {
        "read": true,
        "write": true,
        "delete": true,
        "share": true
      }
    }
  },
  "message": "文件上传成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

**错误响应**

```json
{
  "success": false,
  "error": {
    "code": "E501",
    "message": "文件大小超过限制",
    "details": {
      "maxSize": 104857600,
      "actualSize": 1048576000
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.2 多文件上传

上传多个文件到指定目录。

**请求**

```http
POST /v1/files/upload/batch
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| files | File[] | 是 | 要上传的文件数组 |
| path | string | 否 | 上传路径，默认为根目录 |
| overwrite | boolean | 否 | 是否覆盖同名文件，默认为false |

**请求示例**

```bash
curl -X POST https://api.yyc3.com/v1/files/upload/batch \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.jpg" \
  -F "files=@/path/to/file3.docx" \
  -F "path=/documents"
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file-abc123",
        "name": "file1.pdf",
        "path": "/documents/file1.pdf",
        "size": 1048576,
        "mimeType": "application/pdf",
        "url": "https://cdn.yyc3.com/files/file-abc123.pdf"
      },
      {
        "id": "file-def456",
        "name": "file2.jpg",
        "path": "/documents/file2.jpg",
        "size": 524288,
        "mimeType": "image/jpeg",
        "url": "https://cdn.yyc3.com/files/file-def456.jpg"
      },
      {
        "id": "file-ghi789",
        "name": "file3.docx",
        "path": "/documents/file3.docx",
        "size": 2097152,
        "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "url": "https://cdn.yyc3.com/files/file-ghi789.docx"
      }
    ],
    "summary": {
      "total": 3,
      "success": 3,
      "failed": 0,
      "totalSize": 3670016
    }
  },
  "message": "批量上传成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.3 分片上传

大文件分片上传，支持断点续传。

**请求**

```http
POST /v1/files/upload/chunk
Content-Type: multipart/form-data
Authorization: Bearer <access_token>
```

**请求参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| chunk | File | 是 | 文件分片 |
| uploadId | string | 是 | 上传任务ID |
| chunkIndex | number | 是 | 分片索引（从0开始） |
| totalChunks | number | 是 | 总分片数 |
| fileName | string | 是 | 文件名 |
| fileSize | number | 是 | 文件总大小 |
| path | string | 否 | 上传路径 |
| checksum | string | 否 | 分片校验和 |

**请求示例**

```bash
curl -X POST https://api.yyc3.com/v1/files/upload/chunk \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "chunk=@/path/to/chunk.part1" \
  -F "uploadId=upload-abc123" \
  -F "chunkIndex=0" \
  -F "totalChunks=10" \
  -F "fileName=large-file.zip" \
  -F "fileSize=1048576000"
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "uploadId": "upload-abc123",
    "chunkIndex": 0,
    "uploadedChunks": 1,
    "totalChunks": 10,
    "progress": 10,
    "status": "uploading"
  },
  "message": "分片上传成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 1.4 完成分片上传

合并所有分片完成文件上传。

**请求**

```http
POST /v1/files/upload/chunk/complete
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "uploadId": "upload-abc123",
  "fileName": "large-file.zip",
  "path": "/downloads"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-xyz789",
      "name": "large-file.zip",
      "path": "/downloads/large-file.zip",
      "size": 1048576000,
      "mimeType": "application/zip",
      "url": "https://cdn.yyc3.com/files/file-xyz789.zip",
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "文件上传完成",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 2. 文件下载

#### 2.1 下载文件

下载指定文件。

**请求**

```http
GET /v1/files/download/{fileId}
Authorization: Bearer <access_token>
```

**路径参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| fileId | string | 是 | 文件ID |

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| disposition | string | 否 | 下载方式：inline（预览）或 attachment（下载），默认为attachment |

**请求示例**

```bash
curl -X GET "https://api.yyc3.com/v1/files/download/file-abc123?disposition=attachment" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -O -J
```

**响应**

文件内容以二进制流形式返回。

#### 2.2 获取下载链接

生成临时下载链接。

**请求**

```http
POST /v1/files/{fileId}/download-link
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "expiresIn": 3600,
  "maxDownloads": 1,
  "password": "optional-password"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://cdn.yyc3.com/files/file-abc123?token=xyz789&expires=1234567890",
    "expiresAt": "2026-02-03T13:00:00.000Z",
    "maxDownloads": 1,
    "downloadsUsed": 0
  },
  "message": "下载链接生成成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 2.3 断点续传

支持断点续传下载。

**请求**

```http
GET /v1/files/download/{fileId}
Authorization: Bearer <access_token>
Range: bytes=0-1023
```

**响应**

```http
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-1023/1048576
Content-Length: 1024
Content-Type: application/pdf
```

### 3. 文件管理

#### 3.1 获取文件信息

获取文件的详细信息。

**请求**

```http
GET /v1/files/{fileId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-abc123",
      "name": "document.pdf",
      "path": "/documents/document.pdf",
      "size": 1048576,
      "mimeType": "application/pdf",
      "extension": "pdf",
      "url": "https://cdn.yyc3.com/files/file-abc123.pdf",
      "thumbnailUrl": "https://cdn.yyc3.com/thumbnails/file-abc123.jpg",
      "previewUrl": "https://cdn.yyc3.com/preview/file-abc123.html",
      "checksum": "sha256:abc123...",
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z",
      "accessedAt": "2026-02-03T13:00:00.000Z",
      "metadata": {
        "author": "John Doe",
        "category": "report"
      },
      "tags": ["report", "2026"],
      "version": 1,
      "versions": [
        {
          "version": 1,
          "size": 1048576,
          "createdAt": "2026-02-03T12:00:00.000Z"
        }
      ],
      "permissions": {
        "read": true,
        "write": true,
        "delete": true,
        "share": true
      },
      "owner": {
        "id": "user-123",
        "name": "John Doe"
      },
      "storage": {
        "bucket": "yyc3-files",
        "region": "us-east-1",
        "provider": "s3"
      }
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 3.2 列出文件

列出指定目录下的文件。

**请求**

```http
GET /v1/files
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| path | string | 否 | 目录路径，默认为根目录 |
| recursive | boolean | 否 | 是否递归列出子目录，默认为false |
| type | string | 否 | 文件类型筛选：file、folder、all，默认为all |
| sortBy | string | 否 | 排序字段：name、size、createdAt、updatedAt，默认为name |
| sortOrder | string | 否 | 排序方向：asc、desc，默认为asc |
| page | number | 否 | 页码，默认为1 |
| limit | number | 否 | 每页数量，默认为20 |

**请求示例**

```bash
curl -X GET "https://api.yyc3.com/v1/files?path=/documents&recursive=false&type=file&sortBy=name&sortOrder=asc&page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "file-abc123",
        "name": "document.pdf",
        "path": "/documents/document.pdf",
        "type": "file",
        "size": 1048576,
        "mimeType": "application/pdf",
        "extension": "pdf",
        "url": "https://cdn.yyc3.com/files/file-abc123.pdf",
        "thumbnailUrl": "https://cdn.yyc3.com/thumbnails/file-abc123.jpg",
        "createdAt": "2026-02-03T12:00:00.000Z",
        "updatedAt": "2026-02-03T12:00:00.000Z"
      },
      {
        "id": "folder-def456",
        "name": "reports",
        "path": "/documents/reports",
        "type": "folder",
        "size": 0,
        "itemCount": 5,
        "createdAt": "2026-02-03T11:00:00.000Z",
        "updatedAt": "2026-02-03T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 3.3 重命名文件

重命名文件或文件夹。

**请求**

```http
PATCH /v1/files/{fileId}/rename
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "new-document.pdf"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-abc123",
      "name": "new-document.pdf",
      "path": "/documents/new-document.pdf",
      "updatedAt": "2026-02-03T12:30:00.000Z"
    }
  },
  "message": "文件重命名成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

#### 3.4 移动文件

移动文件到新位置。

**请求**

```http
PATCH /v1/files/{fileId}/move
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "targetPath": "/archive/documents"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-abc123",
      "name": "document.pdf",
      "path": "/archive/documents/document.pdf",
      "updatedAt": "2026-02-03T12:30:00.000Z"
    }
  },
  "message": "文件移动成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

#### 3.5 复制文件

复制文件到新位置。

**请求**

```http
POST /v1/files/{fileId}/copy
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "targetPath": "/backup/documents",
  "name": "document-copy.pdf"
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-xyz789",
      "name": "document-copy.pdf",
      "path": "/backup/documents/document-copy.pdf",
      "size": 1048576,
      "mimeType": "application/pdf",
      "url": "https://cdn.yyc3.com/files/file-xyz789.pdf",
      "createdAt": "2026-02-03T12:30:00.000Z"
    }
  },
  "message": "文件复制成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

#### 3.6 删除文件

删除文件或文件夹。

**请求**

```http
DELETE /v1/files/{fileId}
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| permanent | boolean | 否 | 是否永久删除，默认为false（移到回收站） |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "fileId": "file-abc123",
    "deleted": true,
    "permanent": false,
    "deletedAt": "2026-02-03T12:30:00.000Z",
    "expiresAt": "2026-03-03T12:30:00.000Z"
  },
  "message": "文件删除成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 4. 文件夹管理

#### 4.1 创建文件夹

创建新文件夹。

**请求**

```http
POST /v1/folders
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "reports",
  "path": "/documents",
  "description": "报告文件夹"
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "folder": {
      "id": "folder-abc123",
      "name": "reports",
      "path": "/documents/reports",
      "description": "报告文件夹",
      "itemCount": 0,
      "size": 0,
      "createdAt": "2026-02-03T12:00:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "文件夹创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 4.2 删除文件夹

删除文件夹及其内容。

**请求**

```http
DELETE /v1/folders/{folderId}
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| recursive | boolean | 否 | 是否递归删除子文件夹，默认为true |
| permanent | boolean | 否 | 是否永久删除，默认为false |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "folderId": "folder-abc123",
    "deleted": true,
    "itemCount": 5,
    "totalSize": 5242880
  },
  "message": "文件夹删除成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 5. 文件预览

#### 5.1 获取预览URL

生成文件预览URL。

**请求**

```http
GET /v1/files/{fileId}/preview
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| format | string | 否 | 预览格式：html、pdf、image，默认为html |

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "previewUrl": "https://cdn.yyc3.com/preview/file-abc123.html",
    "format": "html",
    "expiresAt": "2026-02-03T13:00:00.000Z"
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 5.2 获取缩略图

获取文件缩略图。

**请求**

```http
GET /v1/files/{fileId}/thumbnail
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| width | number | 否 | 缩略图宽度，默认为200 |
| height | number | 否 | 缩略图高度，默认为200 |

**响应**

图片内容以二进制流形式返回。

### 6. 文件转换

#### 6.1 转换文件格式

转换文件到指定格式。

**请求**

```http
POST /v1/files/{fileId}/convert
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "targetFormat": "pdf",
  "options": {
    "quality": "high",
    "compression": true
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "taskId": "convert-abc123",
    "status": "processing",
    "sourceFile": {
      "id": "file-abc123",
      "name": "document.docx",
      "format": "docx"
    },
    "targetFormat": "pdf",
    "estimatedTime": 30
  },
  "message": "文件转换任务已创建",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 6.2 查询转换状态

查询文件转换任务状态。

**请求**

```http
GET /v1/files/convert/{taskId}
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "task": {
      "id": "convert-abc123",
      "status": "completed",
      "progress": 100,
      "sourceFile": {
        "id": "file-abc123",
        "name": "document.docx"
      },
      "targetFile": {
        "id": "file-def456",
        "name": "document.pdf",
        "url": "https://cdn.yyc3.com/files/file-def456.pdf"
      },
      "createdAt": "2026-02-03T12:00:00.000Z",
      "completedAt": "2026-02-03T12:00:30.000Z"
    }
  },
  "timestamp": "2026-02-03T12:00:30.000Z"
}
```

### 7. 文件搜索

#### 7.1 搜索文件

根据关键词搜索文件。

**请求**

```http
GET /v1/files/search
Authorization: Bearer <access_token>
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| path | string | 否 | 搜索路径，默认为根目录 |
| type | string | 否 | 文件类型筛选 |
| mimeType | string | 否 | MIME类型筛选 |
| tags | string | 否 | 标签筛选（逗号分隔） |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |
| minSize | number | 否 | 最小文件大小 |
| maxSize | number | 否 | 最大文件大小 |
| page | number | 否 | 页码，默认为1 |
| limit | number | 否 | 每页数量，默认为20 |

**请求示例**

```bash
curl -X GET "https://api.yyc3.com/v1/files/search?q=report&type=file&tags=report,2026&page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "file-abc123",
        "name": "annual-report.pdf",
        "path": "/documents/reports/annual-report.pdf",
        "type": "file",
        "size": 1048576,
        "mimeType": "application/pdf",
        "highlight": {
          "name": "<mark>annual</mark>-<mark>report</mark>.pdf"
        },
        "score": 0.95,
        "createdAt": "2026-02-03T12:00:00.000Z"
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

### 8. 文件权限管理

#### 8.1 设置文件权限

设置文件的访问权限。

**请求**

```http
POST /v1/files/{fileId}/permissions
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "permissions": {
    "read": true,
    "write": false,
    "delete": false,
    "share": false
  },
  "users": [
    {
      "userId": "user-456",
      "permissions": {
        "read": true,
        "write": true,
        "delete": false,
        "share": false
      }
    }
  ],
  "roles": [
    {
      "roleId": "role-789",
      "permissions": {
        "read": true,
        "write": false,
        "delete": false,
        "share": false
      }
    }
  ]
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-abc123",
      "permissions": {
        "read": true,
        "write": false,
        "delete": false,
        "share": false
      }
    }
  },
  "message": "文件权限设置成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 8.2 共享文件

生成文件共享链接。

**请求**

```http
POST /v1/files/{fileId}/share
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "expiresIn": 86400,
  "maxDownloads": 10,
  "password": "share123",
  "permissions": {
    "read": true,
    "download": true
  }
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "shareId": "share-abc123",
    "shareUrl": "https://yyc3.com/share/share-abc123",
    "expiresAt": "2026-02-04T12:00:00.000Z",
    "maxDownloads": 10,
    "downloadsUsed": 0,
    "password": true
  },
  "message": "文件共享链接生成成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

### 9. 文件版本控制

#### 9.1 获取文件版本列表

获取文件的所有版本。

**请求**

```http
GET /v1/files/{fileId}/versions
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "versions": [
      {
        "version": 3,
        "size": 1048576,
        "checksum": "sha256:xyz789...",
        "createdAt": "2026-02-03T12:00:00.000Z",
        "createdBy": {
          "id": "user-123",
          "name": "John Doe"
        },
        "comment": "更新了报告内容"
      },
      {
        "version": 2,
        "size": 1048576,
        "checksum": "sha256:def456...",
        "createdAt": "2026-02-02T12:00:00.000Z",
        "createdBy": {
          "id": "user-123",
          "name": "John Doe"
        },
        "comment": "添加了图表"
      },
      {
        "version": 1,
        "size": 1048576,
        "checksum": "sha256:abc123...",
        "createdAt": "2026-02-01T12:00:00.000Z",
        "createdBy": {
          "id": "user-123",
          "name": "John Doe"
        },
        "comment": "初始版本"
      }
    ],
    "currentVersion": 3,
    "totalVersions": 3
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 9.2 恢复文件版本

恢复文件到指定版本。

**请求**

```http
POST /v1/files/{fileId}/versions/{version}/restore
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-abc123",
      "name": "document.pdf",
      "version": 2,
      "size": 1048576,
      "checksum": "sha256:def456...",
      "updatedAt": "2026-02-03T12:30:00.000Z"
    }
  },
  "message": "文件版本恢复成功",
  "timestamp": "2026-02-03T12:30:00.000Z"
}
```

### 10. 存储桶管理

#### 10.1 创建存储桶

创建新的存储桶。

**请求**

```http
POST /v1/buckets
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**

```json
{
  "name": "my-bucket",
  "region": "us-east-1",
  "provider": "s3",
  "accessControl": "private",
  "versioning": true,
  "lifecycleRules": [
    {
      "prefix": "temp/",
      "days": 30,
      "action": "delete"
    }
  ]
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "data": {
    "bucket": {
      "id": "bucket-abc123",
      "name": "my-bucket",
      "region": "us-east-1",
      "provider": "s3",
      "accessControl": "private",
      "versioning": true,
      "createdAt": "2026-02-03T12:00:00.000Z"
    }
  },
  "message": "存储桶创建成功",
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

#### 10.2 列出存储桶

列出所有存储桶。

**请求**

```http
GET /v1/buckets
Authorization: Bearer <access_token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "data": {
    "buckets": [
      {
        "id": "bucket-abc123",
        "name": "my-bucket",
        "region": "us-east-1",
        "provider": "s3",
        "accessControl": "private",
        "fileCount": 100,
        "totalSize": 1048576000,
        "createdAt": "2026-02-03T12:00:00.000Z"
      }
    ]
  },
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

## 错误代码

| 错误代码 | 描述 | HTTP状态码 |
|----------|------|------------|
| E501 | 文件大小超过限制 | 400 |
| E502 | 文件类型不支持 | 400 |
| E503 | 文件不存在 | 404 |
| E504 | 文件已存在 | 409 |
| E505 | 存储空间不足 | 507 |
| E506 | 权限不足 | 403 |
| E507 | 文件被锁定 | 423 |
| E508 | 上传任务不存在 | 404 |
| E509 | 转换任务失败 | 500 |

## 使用示例

### JavaScript/TypeScript

```typescript
import { FileService } from '@yyc3/sdk';

const fileService = new FileService({
  apiKey: 'your-api-key',
  baseURL: 'https://api.yyc3.com'
});

// 上传文件
const file = await fileService.upload({
  file: document.getElementById('fileInput').files[0],
  path: '/documents',
  metadata: {
    author: 'John Doe',
    category: 'report'
  }
});

console.log('文件上传成功:', file);

// 下载文件
const blob = await fileService.download(file.id);
const url = URL.createObjectURL(blob);
window.open(url);

// 搜索文件
const results = await fileService.search({
  query: 'report',
  type: 'file',
  tags: ['report', '2026']
});

console.log('搜索结果:', results.items);
```

### Python

```python
from yyc3 import FileService

file_service = FileService(
    api_key='your-api-key',
    base_url='https://api.yyc3.com'
)

# 上传文件
with open('document.pdf', 'rb') as f:
    file = file_service.upload(
        file=f,
        path='/documents',
        metadata={
            'author': 'John Doe',
            'category': 'report'
        }
    )

print(f'文件上传成功: {file}')

# 下载文件
content = file_service.download(file.id)
with open('downloaded.pdf', 'wb') as f:
    f.write(content)

# 搜索文件
results = file_service.search(
    query='report',
    type='file',
    tags=['report', '2026']
)

print(f'搜索结果: {results.items}')
```

## 最佳实践

1. **文件上传**
   - 大文件使用分片上传
   - 设置合理的文件大小限制
   - 验证文件类型和内容

2. **文件存储**
   - 使用CDN加速文件访问
   - 实施文件生命周期管理
   - 定期清理临时文件

3. **权限管理**
   - 遵循最小权限原则
   - 定期审核文件权限
   - 使用共享链接时设置过期时间

4. **性能优化**
   - 使用缩略图和预览
   - 实施缓存策略
   - 压缩大文件

5. **安全考虑**
   - 扫描上传的文件
   - 加密敏感文件
   - 记录文件访问日志

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
