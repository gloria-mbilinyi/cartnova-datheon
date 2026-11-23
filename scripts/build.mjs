import { cp, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { isAbsolute, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_PATHS } from './public-files.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = join(root, 'dist');
const temporary = await mkdtemp(join(root, '.cartnova-build-'));
for (const path of [destination, temporary]) {
  const fromRoot = relative(root, path);
  if (!fromRoot || fromRoot.startsWith('..') || isAbsolute(fromRoot)) throw new Error('Build target must remain inside this project.');
}
try {
  for (const path of PUBLIC_PATHS) await cp(join(root, path), join(temporary, path), { recursive: true });
  let commit = process.env.GITHUB_SHA;
  if (!commit) {
    try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd:root, encoding:'utf8', stdio:['ignore','pipe','ignore'] }).trim(); }
    catch { commit = 'unversioned-source'; }
  }
  await writeFile(join(temporary, 'build-info.json'), JSON.stringify({ commit, builtAt:new Date().toISOString() }, null, 2));
  await writeFile(join(temporary, '.nojekyll'), '');
  await rm(destination, { recursive: true, force: true });
  await rename(temporary, destination);
  console.log('Built public application files in dist/.');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
