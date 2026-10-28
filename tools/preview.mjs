import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 3000);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',
};

function resolveFile(urlPath) {
  let pathname = decodeURIComponent(urlPath.split('?')[0]);
  if (pathname.includes('..')) return null;
  pathname = pathname.replace(/^\/+/, '');
  if (!pathname || pathname.endsWith('/')) pathname += 'index.html';
  const candidates = [
    path.join(root, pathname),
    path.join(root, `${pathname}.html`),
    path.join(root, pathname, 'index.html'),
  ];
  return candidates.find((file) => {
    const relative = path.relative(root, file);
    return relative && !relative.startsWith('..') && fs.existsSync(file) && fs.statSync(file).isFile();
  }) || null;
}

const server = http.createServer((req, res) => {
  const file = resolveFile(req.url || '/');
  if (!file) {
    const missing = path.join(root, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(missing));
    return;
  }
  const ext = path.extname(file);
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`AO Exchange preview at http://127.0.0.1:${port}\n`);
});
