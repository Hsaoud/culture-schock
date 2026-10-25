// Vérifie une édition par rapport à la source française : clés manquantes ou en trop,
// variables {…} différentes, listes de mauvaise longueur.
// Usage : node tools/check-locale.mjs es|en|it|zh|ru   (sans argument : toutes)
import {SOURCE} from '../js/i18n.js';

const FILES = {en: 'en.js', es: 'es.js', it: 'it.js', zh: 'zh.js', ru: 'ru.js'};
const vars = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
// Récits : fournis par le projet d'origine pour l'anglais, l'italien, le chinois et le russe.
const OWN_MOTIFS = new Set(['es']);

function compare(src, tr, path, out, opts) {
  if (Array.isArray(src)) {
    if (!Array.isArray(tr)) return out.push(`${path} : liste attendue`);
    if (tr.length !== src.length) out.push(`${path} : ${tr.length} éléments au lieu de ${src.length}`);
    src.forEach((v, i) => compare(v, tr[i], `${path}[${i}]`, out, opts));
  } else if (src && typeof src === 'object') {
    if (!tr || typeof tr !== 'object') return out.push(`${path} : objet attendu`);
    for (const k of Object.keys(src)) if (k in tr) compare(src[k], tr[k], path ? `${path}.${k}` : k, out, opts); else out.push(`${path ? path + '.' : ''}${k} : manquant`);
    for (const k of Object.keys(tr)) if (!(k in src)) out.push(`${path ? path + '.' : ''}${k} : clé inconnue`);
  } else if (typeof src === 'string') {
    if (typeof tr !== 'string' || !tr.trim()) return out.push(`${path} : texte attendu`);
    // Les phrases des récits n'insèrent aucune variable ; la ligne d'événement oui.
    if (vars(src) !== vars(tr)) out.push(`${path} : variables {${vars(tr)}} au lieu de {${vars(src)}}`);
  }
}

const which = process.argv[2] ? [process.argv[2]] : Object.keys(FILES);
let failed = 0;
for (const id of which) {
  const mod = await import(new URL('../js/locales/' + FILES[id], import.meta.url));
  const tr = mod.default, out = [];
  const src = {...SOURCE}; if (!OWN_MOTIFS.has(id)) delete src.motifs;
  compare(src, tr, '', out);
  if (id === 'en' && mod.US) {
    // Les corrections américaines ne portent que sur des clés existantes.
    const walk = (o, ref, p) => { for (const [k, v] of Object.entries(o)) { if (!(k in (ref || {}))) out.push(`US.${p}${k} : clé inconnue`); else if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, ref[k], p + k + '.'); else if (typeof v === 'string' && vars(v) !== vars(ref[k])) out.push(`US.${p}${k} : variables différentes`); } };
    walk(mod.US, tr, '');
  }
  console.log(`${id} : ${out.length ? out.length + ' problème(s)' : 'complet'}`);
  for (const line of out.slice(0, 80)) console.log('  ' + line);
  failed += out.length;
}
process.exitCode = failed ? 1 : 0;
