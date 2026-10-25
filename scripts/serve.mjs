import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { bundleGame } from './build-game.mjs';
if(!process.argv.includes('--dist'))await bundleGame();
const root = resolve(process.argv.includes('--dist') ? 'dist' : '.');
const port = Number(process.env.CULTURE_SHOCK_PORT || 5173);
const types = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg' };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + sep) || /(?:^|[\\/])\./.test(pathname) || !types[extname(file)]) { res.writeHead(403).end(); return; }
    const body = await readFile(file); res.writeHead(200, {'Content-Type':types[extname(file)], 'Cache-Control':'no-cache'}); res.end(body);
  } catch { res.writeHead(404).end('Fichier introuvable'); }
}).listen(port, '127.0.0.1', () => console.log(`Culture Shock : http://127.0.0.1:${port}`));
