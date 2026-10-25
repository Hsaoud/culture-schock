// Manette (Gamepad API, disposition standard Xbox / PlayStation) et navigation spatiale
// au clavier : les menus se parcourent aux flèches ou à la croix, comme sur console.

// Rappel du bouton de manette, affiché seulement quand une manette sert (body.pad).
export const padKey = k => `<kbd class="padkey pk-${k.replace(/\W/g, '') || 'menu'}" aria-hidden="true">${k}</kbd>`;

const VISIBLE = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
export function focusables(roots) {
  return roots.flatMap(r => r && !r.hidden ? [...r.querySelectorAll('button:not(:disabled),[tabindex="0"]')] : []).filter(VISIBLE);
}

// Déplace le focus vers l'élément le plus proche dans la direction voulue.
// origin : point de départ quand rien n'a le focus (ex. curseur de la manette).
export function moveFocus(dir, roots, origin) {
  const nodes = focusables(roots);
  if (!nodes.length) return false;
  const cur = nodes.includes(document.activeElement) ? document.activeElement : null;
  let x, y;
  if (cur) { const r = cur.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
  else if (origin) [x, y] = origin;
  else { focus(nodes.find(n => n.matches('.btn.big,.btn.cyan,[data-primary]')) || nodes[0]); return true; }
  const horiz = dir === 'left' || dir === 'right';
  const cands = nodes.filter(n => n !== cur).map(n => {
    const b = n.getBoundingClientRect(), dx = b.left + b.width / 2 - x, dy = b.top + b.height / 2 - y;
    const along = dir === 'left' ? -dx : dir === 'right' ? dx : dir === 'up' ? -dy : dy, cross = horiz ? Math.abs(dy) : Math.abs(dx);
    return {n, along, cross, score: along + cross * 2.5};
  }).filter(c => c.along > 4).sort((a, b) => a.score - b.score);
  // D'abord ce qui est franchement dans la direction (une carte légèrement décalée n'est pas « en dessous »).
  const best = cands.find(c => c.along >= c.cross * 0.5) || cands.find(c => c.along > 20) || cands[0];
  if (best) { focus(best.n); return true; }
  if (!cur) { focus(nodes[0]); return true; }
  return false;
}
// navfocus : signalé même quand la fenêtre n'a pas le focus système (focusin n'est alors pas émis).
function focus(n) { n.focus({preventScroll: true}); n.scrollIntoView?.({block: 'nearest', inline: 'nearest'}); n.dispatchEvent(new CustomEvent('navfocus', {bubbles: true})); }

// Indique le mode de saisie : body.nav (clavier/manette, anneau de focus), body.pad (glyphes manette).
export function trackInputMode() {
  const b = document.body;
  addEventListener('keydown', e => { if (!e.fromPad && e.key !== 'Shift') { b.classList.add('nav'); b.classList.remove('pad'); } }, true);
  addEventListener('pointerdown', () => b.classList.remove('nav', 'pad'), true);
  addEventListener('mousemove', e => { if (Math.abs(e.movementX) + Math.abs(e.movementY) > 6) b.classList.remove('pad'); }, true);
}

// Touche synthétique (la manette réutilise les raccourcis clavier des écrans).
export function sendKey(key) {
  const ev = new KeyboardEvent('keydown', {key, code: key === ' ' ? 'Space' : key, bubbles: true, cancelable: true});
  ev.fromPad = true;
  (document.activeElement || document.body).dispatchEvent(ev);
}

// Boutons de la disposition standard.
const B = {A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, VIEW: 8, START: 9, L3: 10, R3: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15};
const DEAD = 0.2;
const stick = v => Math.abs(v) < DEAD ? 0 : Math.sign(v) * ((Math.abs(v) - DEAD) / (1 - DEAD)) ** 1.6;

// cb : navigate(dir, repeat), confirm(), back(), menu(), evolve(), jump(), shoulder(d), view(), reset(),
// cursor(dx, dy, dt) (stick gauche, -1..1), pan(dx, dy, dt) (stick droit), zoom(f), connected(on), active().
// active() : vrai si le stick gauche pilote le curseur de carte (sinon il navigue dans les menus).
export class Gamepad {
  constructor(cb) { this.cb = cb; this.prev = []; this.repeatAt = 0; this.dir = null; this.had = false; this.pad = null; }
  poll(now, dt) {
    const pad = [...(navigator.getGamepads?.() || [])].find(p => p?.connected && p.buttons.length);
    this.pad = pad || null;
    if (!pad) { if (this.had) { this.had = false; this.prev = []; this.cb.connected(false); } return; }
    if (!this.had) { this.had = true; this.cb.connected(true); }
    const down = i => !!pad.buttons[i]?.pressed, edge = i => down(i) && !this.prev[i];
    const lx = stick(pad.axes[0] || 0), ly = stick(pad.axes[1] || 0), rx = stick(pad.axes[2] || 0), ry = stick(pad.axes[3] || 0);
    const any = pad.buttons.some(b => b.pressed) || lx || ly || rx || ry;
    if (any) { document.body.classList.add('pad', 'nav'); }
    const map = this.cb.active();
    // Croix (et stick gauche dans les menus) : navigation avec répétition.
    let dir = down(B.LEFT) ? 'left' : down(B.RIGHT) ? 'right' : down(B.UP) ? 'up' : down(B.DOWN) ? 'down' : null;
    if (!dir && !map) {
      const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
      if (Math.max(Math.abs(ax), Math.abs(ay)) > 0.6) dir = Math.abs(ax) > Math.abs(ay) ? (ax < 0 ? 'left' : 'right') : (ay < 0 ? 'up' : 'down');
    }
    if (dir !== this.dir) { this.dir = dir; if (dir) { this.cb.navigate(dir); this.repeatAt = now + 380; } }
    else if (dir && now >= this.repeatAt) { this.cb.navigate(dir); this.repeatAt = now + 120; }
    if (map && (lx || ly)) this.cb.cursor(lx, ly, dt);
    if (rx || ry) this.cb.pan(rx, ry, dt);
    if (edge(B.A)) this.cb.confirm();
    if (edge(B.B)) this.cb.back();
    if (edge(B.X)) this.cb.evolve();
    if (edge(B.Y)) this.cb.jump();
    if (edge(B.START)) this.cb.menu();
    if (edge(B.VIEW)) this.cb.view();
    if (edge(B.R3)) this.cb.reset();
    if (edge(B.LB)) this.cb.shoulder(-1);
    if (edge(B.RB)) this.cb.shoulder(1);
    const lt = pad.buttons[B.LT]?.value || 0, rt = pad.buttons[B.RT]?.value || 0;
    if (lt > 0.1 || rt > 0.1) this.cb.zoom(Math.exp((rt - lt) * dt * 1.6));
    this.prev = pad.buttons.map(b => b.pressed);
  }
  rumble(strong = 0.2, weak = 0.4, ms = 120) {
    try { this.pad?.vibrationActuator?.playEffect('dual-rumble', {duration: ms, strongMagnitude: strong, weakMagnitude: weak})?.catch(() => {}); } catch { /* vibrations non prises en charge */ }
  }
}
