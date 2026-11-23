import { access, readdir, readFile } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const excluded = new Set(['.git', 'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage']);
let count = 0;

async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await checkDirectory(path);
    else if (/\.(?:m?js)$/.test(entry.name)) {
      const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
      if (result.status !== 0) throw new Error(result.stderr || `Invalid JavaScript: ${path}`);
      count += 1;
    }
  }
}

await checkDirectory(root);
const html = await readFile(join(root, 'index.html'), 'utf8');
for (const [, reference] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(?:#|https?:|data:)/.test(reference)) continue;
  const path = resolve(root, reference.split(/[?#]/)[0]);
  if (relative(root, path).startsWith('..')) throw new Error(`Asset escapes project: ${reference}`);
  await access(path);
}
console.log(`Validated ${count} JavaScript files and HTML asset references.`);
