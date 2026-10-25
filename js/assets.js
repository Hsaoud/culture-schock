// Illustrations partagées avec le projet d'origine, découpées à la volée.
import {NATIONS} from './data/nations.js';
import {EVENT_ART_LAYOUT} from './data/event-art-layout.js';

// Relatif à la page (index.html ou jouer.html) : fonctionne en modules comme dans le paquet autonome.
const BASE = new URL('assets/art/', document.baseURI).href;
export const SHEETS = {
  champions: {src: BASE + 'champions-final.png', w: 1536, h: 1024},
  relics: {src: BASE + 'relics-final.png', w: 1536, h: 1024},
  sanctuary: {src: BASE + 'sanctuary.png', w: 1672, h: 941},
  // Facultatif : illustrations peintes des branches (voir README, « Illustrations des onglets »).
  branches: {src: BASE + 'branches.png', w: 1536, h: 512, optional: true},
};
export const IMG = {};

export function loadArt(onProgress) {
  const entries = Object.entries(SHEETS);
  let done = 0;
  return Promise.all(entries.map(([key, sheet]) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => { IMG[key] = img; onProgress?.(++done / entries.length); resolve(); };
    img.onerror = () => { if (!sheet.optional) IMG[key] = img; onProgress?.(++done / entries.length); resolve(); };
    img.src = sheet.src;
  })));
}

// Rectangles source [x, y, w, h].
export const portraitRect = id => { const [x, y, s] = NATIONS[id].portrait; return [x, y, s, s]; };
export const cardRect = id => { const c = NATIONS[id].cell; return [(c % 4) * 384, Math.floor(c / 4) * 512, 384, 512]; };
export const relicRect = id => { const c = NATIONS[id].cell; return [(c % 4) * 384, Math.floor(c / 4) * 512 + 64, 384, 384]; };

// Style CSS affichant une découpe d'une planche dans une boîte boxW × boxH (sans canvas, donc
// compatible avec une ouverture en file://).
export function spriteCSS(sheetKey, [x, y, w, h], boxW, boxH = boxW) {
  const sheet = SHEETS[sheetKey], sx = boxW / w, sy = boxH / h;
  return `background-image:url('${sheet.src}');background-size:${sheet.w * sx}px ${sheet.h * sy}px;background-position:${-x * sx}px ${-y * sy}px;background-repeat:no-repeat`;
}
// Variante en pourcentages : s'adapte à la taille de l'élément.
export function spritePct(sheetKey, [x, y, w, h]) {
  const sheet = SHEETS[sheetKey];
  const px = sheet.w === w ? 0 : x / (sheet.w - w) * 100, py = sheet.h === h ? 0 : y / (sheet.h - h) * 100;
  return `background-image:url('${sheet.src}');background-size:${sheet.w / w * 100}% ${sheet.h / h * 100}%;background-position:${px}% ${py}%;background-repeat:no-repeat`;
}

// Découpe affichée « en couverture » dans un cadre .framed : elle le remplit sans jamais être
// déformée (le surplus est rogné), quel que soit le format de l'écran, du téléphone à l'ultra-large.
export const cover = (style, aspect) => `<i class="cover" style="${style};--a:${aspect}"></i>`;
export const cardCover = id => cover(spritePct('champions', cardRect(id)), 384 / 512);
export function eventCover(nationId, family, index) {
  const lay = EVENT_ART_LAYOUT[`${nationId.toLowerCase()}-${family}`];
  const col = index % 4, row = Math.floor(index / 4) % 3;
  const aspect = lay ? (lay.columns[col + 1] - lay.columns[col]) / (lay.rows[row + 1] - lay.rows[row]) : 1;
  return cover(eventArt(nationId, family, index), aspect.toFixed(4));
}

// Illustrations d'événements : planches 4 × 3 par nation et famille.
export function eventArt(nationId, family, index) {
  const key = `${nationId.toLowerCase()}-${family}`, lay = EVENT_ART_LAYOUT[key];
  if (!lay) return null;
  const col = index % 4, row = Math.floor(index / 4) % 3;
  const x = lay.columns[col], y = lay.rows[row], w = lay.columns[col + 1] - x, h = lay.rows[row + 1] - y;
  const src = BASE + 'events/' + key + '.webp';
  const px = lay.width === w ? 0 : x / (lay.width - w) * 100, py = lay.height === h ? 0 : y / (lay.height - h) * 100;
  return `background-image:url('${src}');background-size:${lay.width / w * 100}% ${lay.height / h * 100}%;background-position:${px}% ${py}%;background-repeat:no-repeat`;
}

// Icônes de reliques prêtes pour le canvas (cercle détouré, mis en cache).
const relicCache = {};
export function relicIcon(id, size = 64, gray = false) {
  const key = id + size + (gray ? 'g' : '');
  if (relicCache[key]) return relicCache[key];
  const img = IMG.relics; if (!img?.naturalWidth) return null;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), [x, y, w, h] = relicRect(id);
  g.save(); g.beginPath(); g.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); g.clip();
  g.fillStyle = '#0b1820'; g.fillRect(0, 0, size, size);
  if (gray) g.filter = 'grayscale(1) brightness(0.5)';
  g.drawImage(img, x + w * 0.08, y + h * 0.08, w * 0.84, h * 0.84, 0, 0, size, size);
  g.restore();
  return (relicCache[key] = c);
}
const faceCache = {};
export function faceIcon(id, size = 96) {
  const key = id + size;
  if (faceCache[key]) return faceCache[key];
  const img = IMG.champions; if (!img?.naturalWidth) return null;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'), [x, y, w, h] = portraitRect(id);
  g.save(); g.beginPath(); g.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); g.clip();
  g.drawImage(img, x, y, w, h, 0, 0, size, size);
  g.restore();
  return (faceCache[key] = c);
}
