import * as fs from 'fs';
import * as path from 'node:path';

export function printTree(directory: string, prefix = '') {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  entries.forEach((entry: fs.Dirent, index: number) => {
    const isLast = index === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    console.log(`${prefix}${connector}${entry.name}`);

    if (entry.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      printTree(path.join(directory, entry.name), newPrefix);
    }
  });
}
