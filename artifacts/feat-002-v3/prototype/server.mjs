import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const files = new Set(['index.html', 'styles.css', 'app.js']);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
export function listen(port = 0) {
  const server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!files.has(file)) return response.writeHead(404).end('Not found');
    try {
      const content = await readFile(path.join(root, file));
      response.writeHead(200, { 'Content-Type': `${types[path.extname(file)]}; charset=utf-8` });
      response.end(content);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}
