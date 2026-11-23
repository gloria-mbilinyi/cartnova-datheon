import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { request } from 'node:http';
import { createPreviewServer } from '../scripts/server.mjs';

let server;
let port;
before(async () => {
  server = createPreviewServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});
after(async () => { await new Promise(resolve => server.close(resolve)); });

function get(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path, method }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('serves the application and referenced public assets with their media types', async () => {
  const page = await get('/');
  assert.equal(page.status, 200);
  assert.match(page.body, /<title>CartNova — Discover more\. Shop smarter\.<\/title>/);
  assert.match(page.headers['content-type'], /text\/html/);
  for (const [path, type] of [['/css/styles.css', 'text/css'], ['/js/app.js', 'text/javascript'], ['/assets/icons/favicon.svg', 'image/svg+xml']]) {
    const response = await get(path);
    assert.equal(response.status, 200);
    assert.ok(response.headers['content-type'].startsWith(type));
  }
});

test('HEAD returns asset headers without a response body', async () => {
  const response = await get('/index.html', 'HEAD');
  assert.equal(response.status, 200);
  assert.ok(Number(response.headers['content-length']) > 0);
  assert.equal(response.body, '');
});

test('does not expose source tooling, repository metadata, or private files', async () => {
  for (const path of ['/README.md', '/package.json', '/scripts/server.mjs', '/.git/config', '/.env', '/tests/server.test.js', '/css/../../README.md', '/css/%2e%2e/%2e%2e/package.json', '/assets/%5c..%5cpackage.json']) {
    assert.equal((await get(path)).status, 404, path);
  }
});

test('handles missing assets, malformed URLs, and unsupported methods', async () => {
  assert.equal((await get('/assets/missing.svg')).status, 404);
  assert.equal((await get('/css/')).status, 404);
  assert.equal((await get('/%E0%A4%A')).status, 400);
  const response = await get('/', 'POST');
  assert.equal(response.status, 405);
  assert.equal(response.headers.allow, 'GET, HEAD');
});
