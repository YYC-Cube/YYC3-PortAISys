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
