// Petit serveur local (modules ES, rechargement direct).
// Usage : npm start (ou node tools/serve.mjs)   puis http://127.0.0.1:5180/
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname, sep, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 5180);
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'};

http.createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = resolve(root, '.' + path);
    if (!file.startsWith(root + sep) || /(^|[\\/])\.|node_modules/.test(path) || !types[extname(file)]) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type': types[extname(file)], 'Cache-Control': 'no-cache'}).end(body);
  } catch { res.writeHead(404).end('Introuvable'); }
}).listen(port, '127.0.0.1', () => console.log(`Culture Shock — Clichés Inc. : http://127.0.0.1:${port}/`));
