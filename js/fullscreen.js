// Plein écran (API Fullscreen, préfixe WebKit pour Safari). Sur iPhone, où l'API n'existe pas
// pour une page, le bouton disparaît : le jeu ajouté à l'écran d'accueil s'ouvre sans barres.
import {t} from './i18n.js';

const doc = document, root = doc.documentElement;
export const fullscreenSupported = !!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled);
export const isFullscreen = () => !!(doc.fullscreenElement || doc.webkitFullscreenElement);

export function toggleFullscreen() {
  if (!fullscreenSupported) return;
  const p = isFullscreen() ? (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc)
    : root.requestFullscreen ? root.requestFullscreen({navigationUI: 'hide'}) : root.webkitRequestFullscreen();
  p?.catch?.(() => { /* refusé par le navigateur : la partie continue en fenêtre */ });
}

const ICON = {
  enter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',
  exit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>',
};
export const fullscreenIcon = ICON.enter;
// Bouton bascule ; son état suit le plein écran, qu'on en sorte par Échap, F11 ou le bouton.
export function fullscreenButton(cls = 'ibtn') {
  const on = isFullscreen(), label = t(on ? 'fs.exit' : 'fs.enter');
  return `<button class="${cls} fs-btn" data-fs title="${label} (F)" aria-label="${label}" aria-pressed="${on}">${ICON[on ? 'exit' : 'enter']}</button>`;
}
export function syncFullscreen() {
  const on = isFullscreen(), label = t(on ? 'fs.exit' : 'fs.enter');
  for (const b of doc.querySelectorAll('[data-fs]')) {
    b.innerHTML = ICON[on ? 'exit' : 'enter']; b.title = `${label} (F)`; b.setAttribute('aria-label', label); b.setAttribute('aria-pressed', on);
  }
}
export function initFullscreen() {
  if (!fullscreenSupported) doc.body.classList.add('no-fs');
  doc.addEventListener('click', e => { if (e.target.closest?.('[data-fs]')) toggleFullscreen(); });
  doc.addEventListener('fullscreenchange', syncFullscreen);
  doc.addEventListener('webkitfullscreenchange', syncFullscreen);
  // F : bascule partout (pas avec Ctrl / Cmd, réservés au navigateur).
  addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.repeat && !e.fromPad) toggleFullscreen();
  });
}
