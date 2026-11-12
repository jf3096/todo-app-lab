const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const files = new Set(['index.html', 'styles.css', 'app.js']);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (!files.has(file)) {
    response.writeHead(404).end('Not found');
    return;
  }
  fs.readFile(path.join(root, file), (error, content) => {
    if (error) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': `${types[path.extname(file)]}; charset=utf-8` });
    response.end(content);
  });
}).listen(4173, '127.0.0.1', () => console.log('Todo preview: http://127.0.0.1:4173/'));
