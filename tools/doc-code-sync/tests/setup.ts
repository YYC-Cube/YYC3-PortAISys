/**
 * @file tools/doc-code-sync/tests/setup.ts
 * @description Setup 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  const testDirs = fs.readdirSync(__dirname)
    .filter(item => item.startsWith('temp-test-'))
    .map(item => path.join(__dirname, item));

  testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
