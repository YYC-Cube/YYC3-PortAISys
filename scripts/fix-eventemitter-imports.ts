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
