import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
test('public release excludes tooling, dependencies, fixtures and private repository data', async()=>{
  execFileSync(process.execPath,['scripts/build.mjs'],{cwd:root,stdio:'pipe'});
  assert.deepEqual((await readdir(new URL('../dist/',import.meta.url))).sort(), ['.nojekyll','assets','build-info.json','css','index.html','js']);
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('./js/app.js'));
  const metadata=JSON.parse(await readFile(new URL('../dist/build-info.json',import.meta.url),'utf8'));
  assert.ok(metadata.commit);
  assert.ok(!html.includes('fixtures'));
});
