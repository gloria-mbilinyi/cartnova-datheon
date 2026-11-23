import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_PATHS } from './public-files.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };

export function createPreviewServer() {
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end('Method not allowed');
      return;
    }
    let pathname;
    try { pathname = decodeURIComponent((request.url || '/').split('?')[0]); }
    catch { response.writeHead(400); response.end('Invalid URL'); return; }
    const segments = pathname.split('/').filter(Boolean);
    if (segments.some(segment => segment.startsWith('.') || segment.includes('\\') || segment.includes('\0'))) {
      response.writeHead(404); response.end('Not found'); return;
    }
    if (!segments.length) segments.push('index.html');
    if (!PUBLIC_PATHS.includes(segments[0])) {
      response.writeHead(404); response.end('Not found'); return;
    }
    try {
      const path = await realpath(join(root, ...segments));
      const fromRoot = relative(root, path);
      if (fromRoot.startsWith('..') || isAbsolute(fromRoot) || !(await stat(path)).isFile()) {
        response.writeHead(404); response.end('Not found'); return;
      }
      const body = await readFile(path);
      response.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Content-Length': body.length });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(404); response.end('Not found');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4373);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535.');
  createPreviewServer().listen(port, '127.0.0.1', () => console.log(`CartNova preview: http://127.0.0.1:${port}`));
}
