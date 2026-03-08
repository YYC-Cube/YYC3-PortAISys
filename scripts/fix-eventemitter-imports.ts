/**
 * @file fix-eventemitter-imports.ts
 * @description Fix Eventemitter Imports 模块
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-07
 * @updated 2026-03-07
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags typescript
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = await glob('core/**/*.ts', { absolute: true });

let fixedCount = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  
  if (content.includes("import { EventEmitter } from 'eventemitter3'")) {
    const newContent = content.replace(
      /import \{ EventEmitter \} from 'eventemitter3'/g,
      "import EventEmitter from 'eventemitter3'"
    );
    
    if (newContent !== content) {
      writeFileSync(file, newContent, 'utf-8');
      fixedCount++;
      console.log(`Fixed: ${file}`);
    }
  }
}

console.log(`\nTotal files fixed: ${fixedCount}`);
