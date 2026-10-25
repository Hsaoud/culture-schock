// Paquet autonome : jouer.html s'ouvre par double-clic (file://), sans serveur.
// Usage : node tools/build.mjs
import {build} from 'esbuild';
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await build({entryPoints: [resolve(here, 'js/main.js')], bundle: true, format: 'iife', minify: true, target: 'es2020', outfile: resolve(here, 'dist/game.js'), logLevel: 'warning'});
// Le manifeste (installation sur l'écran d'accueil) ne se charge pas en file:// : retiré du paquet.
const html = readFileSync(resolve(here, 'index.html'), 'utf8')
  .replace('<script type="module" src="js/main.js"></script>', '<script defer src="dist/game.js"></script>')
  .replace(/<link rel="manifest"[^>]*>\r?\n/, '');
writeFileSync(resolve(here, 'jouer.html'), html);
console.log('jouer.html + dist/game.js prêts');
