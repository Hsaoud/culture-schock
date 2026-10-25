// Carte du monde en canvas : caméra, rendu de l'état, effets et sélection.
import {GEO} from './geo-data.js';
import * as S from './sim.js';
import {NATIONS} from './data/nations.js';
import {relicIcon} from './assets.js';

const W = 1080, H = 504;
const PATHS = GEO.map(g => new Path2D(g.path));
const LAND = new Path2D(); for (const p of PATHS) LAND.addPath(p);
const BBOX = GEO.map(g => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const n = g.path.match(/-?\d+(\.\d+)?/g).map(Number);
  for (let i = 0; i < n.length; i += 2) { x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]); }
  return [x0, y0, x1, y1];
});
const HIT_ORDER = GEO.map((_, i) => i).sort((a, b) => GEO[a].area - GEO[b].area);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Cache du fond : carte entière pré-rendue (px par unité, marge en unités). La finesse monte
// sur les écrans denses (4K, Retina) pour garder des côtes nettes, dans la limite de ~10 Mpx.
const WORLD_RES = 2.5, WORLD_RES_MAX = 4, PAD = 24;
const LAYER_EVERY = 0.12; // rafraîchissement de la couche des pays (s)

const hex = (c, a) => { const n = parseInt(c.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export class MapView {
  constructor(canvas) {
    // Carte opaque : le compositeur n'a rien à mélanger derrière.
    this.cv = canvas; this.g = canvas.getContext('2d', {alpha: false});
    this.hit = document.createElement('canvas').getContext('2d');
    this.cam = {x: W / 2, y: H / 2 + 10, z: 1};
    this.insets = {top: 80, bottom: 150};
    this.fx = []; this.time = 0; this.shakeAmt = 0;
    this.hover = -1; this.selected = -1; this.highlight = null;
    this.bubbleHits = []; this.raidHits = [];
    // Calques : fond océan (écran), terres (cache monde ou rendu net à l'arrêt), pays (rafraîchi ~8 fois/s).
    this.bg = document.createElement('canvas');
    this.crisp = document.createElement('canvas'); this.crispKey = '';
    this.layer = document.createElement('canvas'); this.layerCam = null; this.layerAge = 0; this.layerStamp = ''; this.layerGen = 0;
    // Image fixe : fond + terres + pays fusionnés, copiée d'un bloc tant que la caméra ne bouge pas.
    this.base = document.createElement('canvas'); this.baseKey = '';
    this.world = null; this.worldRes = WORLD_RES; this.lastCamKey = ''; this.idle = 0;
    // Échelle de rendu : 1 = pleine définition ; réduite seulement si les images ralentissent.
    this.quality = 1;
    this.patterns = {}; this.sprites = {};
    this.onSelect = null; this.onBubble = null; this.onRaid = null; this.onHover = null;
    this.resize();
    this.bindInput();
  }

  // --- Caméra --------------------------------------------------------------
  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1) * this.quality;
    this.dpr = dpr; this.w = innerWidth; this.h = innerHeight;
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
    this.cv.style.width = this.w + 'px'; this.cv.style.height = this.h + 'px';
    for (const c of [this.bg, this.crisp, this.layer, this.base]) { c.width = this.cv.width; c.height = this.cv.height; }
    this.fit = Math.min(this.w / (W * 0.98), (this.h - this.insets.top - this.insets.bottom) / (H * 0.92));
    // Échelle des pictogrammes : plus petits quand la carte est minuscule (téléphone en portrait).
    this.ui = Math.max(0.55, Math.min(1, this.fit / 1.1));
    const res = Math.max(WORLD_RES, Math.min(WORLD_RES_MAX, this.fit * dpr * 1.05));
    if (Math.abs(res - this.worldRes) / this.worldRes > 0.15) { this.worldRes = res; this.world = null; }
    if (Math.max(1, Math.round(dpr)) !== this.patternScale) this.patterns = {};
    this.crispKey = ''; this.layerCam = null; this.baseKey = '';
    this.clampCam();
    this.drawOcean();
  }
  invalidate() { this.layerCam = null; }
  setQuality(q) { q = Math.max(0.55, Math.min(1, q)); if (q !== this.quality) { this.quality = q; this.patterns = {}; this.resize(); } }
  setInsets(top, bottom) { this.insets = {top, bottom}; this.resize(); }
  get scale() { return this.fit * this.cam.z; }
  get center() { return [this.w / 2, this.insets.top + (this.h - this.insets.top - this.insets.bottom) / 2]; }
  toScreen(x, y) { const [cx, cy] = this.center, s = this.scale; return [(x - this.cam.x) * s + cx, (y - this.cam.y) * s + cy]; }
  toWorld(px, py) { const [cx, cy] = this.center, s = this.scale; return [(px - cx) / s + this.cam.x, (py - cy) / s + this.cam.y]; }
  clampCam() {
    const s = this.scale, [cx, cy] = this.center;
    const halfW = cx / s, halfH = (this.h - this.insets.bottom - cy) / s;
    const mx = Math.max(0, W / 2 - halfW + 40 / s), my = Math.max(0, H / 2 - halfH + 30 / s);
    this.cam.x = Math.max(W / 2 - mx, Math.min(W / 2 + mx, this.cam.x));
    this.cam.y = Math.max(H / 2 - my, Math.min(H / 2 + my, this.cam.y));
    this.cam.z = Math.max(1, Math.min(9, this.cam.z));
  }
  zoomAt(px, py, factor) {
    const [wx, wy] = this.toWorld(px, py);
    this.cam.z = Math.max(1, Math.min(9, this.cam.z * factor));
    const [nx, ny] = this.toWorld(px, py);
    this.cam.x += wx - nx; this.cam.y += wy - ny; this.camAnim = null;
    this.clampCam();
  }
  flyTo(x, y, z, dur = 1.2) { this.camAnim = {from: {...this.cam}, to: {x, y, z}, t: 0, dur}; }
  focusCountry(ci, z = 3, dur = 1.2) { const g = GEO[ci]; this.flyTo(g.x, g.y, z, dur); }
  resetView(dur = 1) { this.flyTo(W / 2, H / 2 + 10, 1, dur); }

  // --- Entrées ---------------------------------------------------------------
  bindInput() {
    const pts = new Map(); let drag = null, pinch = null;
    const cv = this.cv;
    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 1) drag = {x: e.clientX, y: e.clientY, cx: this.cam.x, cy: this.cam.y, moved: false};
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = {d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: this.cam.z}; drag = null; }
    });
    cv.addEventListener('pointermove', e => {
      if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pinch && pts.size === 2) {
        const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        this.zoomAt(mx, my, (pinch.z * d / pinch.d) / this.cam.z);
        return;
      }
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
        if (drag.moved) { this.cam.x = drag.cx - dx / this.scale; this.cam.y = drag.cy - dy / this.scale; this.camAnim = null; this.clampCam(); }
      } else if (e.pointerType === 'mouse') {
        const ci = this.pick(e.clientX, e.clientY);
        const over = this.pickBubble(e.clientX, e.clientY) || this.pickRaid(e.clientX, e.clientY);
        cv.style.cursor = over ? 'pointer' : ci >= 0 ? 'pointer' : 'grab';
        if (ci !== this.hover) { this.hover = ci; this.onHover?.(ci); }
      }
    });
    const up = e => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (drag && !drag.moved && pts.size === 0) this.click(e.clientX, e.clientY);
      if (pts.size === 0) drag = null;
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', e => { pts.delete(e.pointerId); drag = null; pinch = null; });
    cv.addEventListener('pointerleave', () => { if (this.hover >= 0) { this.hover = -1; this.onHover?.(-1); } });
    cv.addEventListener('wheel', e => { e.preventDefault(); this.zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015)); }, {passive: false});
    cv.addEventListener('dblclick', e => this.zoomAt(e.clientX, e.clientY, 1.8));
  }
  click(px, py) {
    const b = this.pickBubble(px, py); if (b) return this.onBubble?.(b);
    const r = this.pickRaid(px, py); if (r) return this.onRaid?.(r);
    const ci = this.pick(px, py);
    this.selected = ci; this.onSelect?.(ci, px, py);
  }
  pickBubble(px, py) {
    for (const h of this.bubbleHits) if (Math.hypot(px - h.x, py - h.y) < h.r + 8) return h.b;
    return null;
  }
  pickRaid(px, py) {
    for (const h of this.raidHits) if (Math.hypot(px - h.x, py - h.y) < h.r + 6) return h.v;
    return null;
  }
  pick(px, py) {
    const [wx, wy] = this.toWorld(px, py);
    for (const i of HIT_ORDER) {
      const b = BBOX[i];
      if (wx < b[0] - 0.5 || wx > b[2] + 0.5 || wy < b[1] - 0.5 || wy > b[3] + 0.5) continue;
      if (GEO[i].pop > 0 && this.hit.isPointInPath(PATHS[i], wx, wy)) return i;
    }
    // Micro-îles : tolérance autour du point d'ancrage.
    let best = -1, bd = 12 / this.scale;
    GEO.forEach((g, i) => { if (g.pop > 0 && g.area < 6) { const d = Math.hypot(g.x - wx, g.y - wy); if (d < bd) { bd = d; best = i; } } });
    return best;
  }

  // --- Effets ----------------------------------------------------------------
  ripple(ci, color, big = false) { const g = GEO[ci]; this.fx.push({type: 'ripple', x: g.x, y: g.y, color, t: 0, dur: big ? 1.6 : 1, r: big ? 26 : 12}); }
  shockwave(ci, color) { const g = GEO[ci]; this.fx.push({type: 'ripple', x: g.x, y: g.y, color, t: 0, dur: 2.4, r: 140, width: 6}); this.shake(14); }
  flash(ci, color) { this.fx.push({type: 'flash', ci, color, t: 0, dur: 1.1}); }
  cross(ci) { const g = GEO[ci]; this.fx.push({type: 'cross', x: g.x, y: g.y, t: 0, dur: 0.9}); }
  floatText(wx, wy, text, color = '#ffd76a', size = 18) { this.fx.push({type: 'text', x: wx, y: wy, text, color, size, t: 0, dur: 1.4}); }
  floatScreen(px, py, text, color = '#ffd76a', size = 20) { const [x, y] = this.toWorld(px, py); this.floatText(x, y, text, color, size); }
  burst(wx, wy, color, n = 14) {
    if (REDUCED) n = 4;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 90;
      this.fx.push({type: 'spark', x: wx, y: wy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, color, t: 0, dur: 0.5 + Math.random() * 0.5});
    }
  }
  shake(a) { if (!REDUCED) this.shakeAmt = Math.max(this.shakeAmt, a); }

  // --- Rendu ------------------------------------------------------------------
  pattern(color) {
    if (this.patterns[color]) return this.patterns[color];
    const q = this.patternScale = Math.max(1, Math.round(this.dpr));
    const c = document.createElement('canvas'); c.width = c.height = 10 * q;
    const g = c.getContext('2d'); g.scale(q, q);
    g.fillStyle = hex(color, 0.78); g.fillRect(0, 0, 10, 10);
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(-2, 12); g.lineTo(12, -2); g.moveTo(-2, 2); g.lineTo(2, -2); g.moveTo(8, 12); g.lineTo(12, 8); g.stroke();
    return (this.patterns[color] = this.g.createPattern(c, 'repeat'));
  }

  // --- Calques ---------------------------------------------------------------
  drawOcean() {
    const g = this.bg.getContext('2d');
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const bg = g.createRadialGradient(this.w / 2, this.h * 0.45, 50, this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.75);
    bg.addColorStop(0, '#0d3441'); bg.addColorStop(0.6, '#071d26'); bg.addColorStop(1, '#030b10');
    g.fillStyle = bg; g.fillRect(0, 0, this.w, this.h);
  }
  // Graticule, halo côtier, terres et frontières, pour une échelle donnée (px par unité).
  drawLand(g, s) {
    g.strokeStyle = 'rgba(110,210,230,0.06)'; g.lineWidth = 1 / s;
    g.beginPath();
    for (let x = 0; x <= W; x += 45) { g.moveTo(x, 0); g.lineTo(x, H + 40); }
    for (let lat = 75; lat >= -60; lat -= 15) { const y = (84 - lat) * 3.6; g.moveTo(0, y); g.lineTo(W, y); }
    g.stroke();
    g.lineJoin = 'round';
    g.strokeStyle = 'rgba(80,220,230,0.10)'; g.lineWidth = 5 / s; g.stroke(LAND);
    g.strokeStyle = 'rgba(80,220,230,0.16)'; g.lineWidth = 2 / s; g.stroke(LAND);
    g.fillStyle = '#1a3a47'; g.fill(LAND);
    g.strokeStyle = '#0b1d25'; g.lineWidth = Math.max(0.35, 0.9 / s); g.stroke(LAND);
  }
  // Le monde entier rendu une fois : pendant les déplacements, on ne fait que le transformer.
  ensureWorld() {
    if (this.world) return;
    const c = document.createElement('canvas'), r = this.worldRes;
    c.width = Math.round((W + 2 * PAD) * r); c.height = Math.round((H + 2 * PAD + 40) * r);
    const g = c.getContext('2d');
    g.setTransform(r, 0, 0, r, PAD * r, PAD * r);
    this.drawLand(g, r);
    this.world = c;
  }
  // Terres pour la caméra courante : version nette si elle est prête, sinon cache monde transformé.
  drawLandTo(g, useCrisp, sx = 0, sy = 0) {
    const dpr = this.dpr, sc = this.scale, [cx, cy] = this.center;
    if (useCrisp) { g.setTransform(1, 0, 0, 1, sx * dpr, sy * dpr); g.drawImage(this.crisp, 0, 0); return; }
    const k = sc / this.worldRes;
    g.setTransform(dpr * k, 0, 0, dpr * k, dpr * (cx - (this.cam.x + PAD) * sc + sx), dpr * (cy - (this.cam.y + PAD) * sc + sy));
    g.drawImage(this.world, 0, 0);
  }
  // Version nette à l'échelle courante, rendue seulement quand la caméra est immobile et zoomée.
  renderCrisp(key) {
    const g = this.crisp.getContext('2d'), s = this.scale, dpr = this.dpr, [cx, cy] = this.center;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.crisp.width, this.crisp.height);
    g.setTransform(dpr * s, 0, 0, dpr * s, dpr * (cx - this.cam.x * s), dpr * (cy - this.cam.y * s));
    this.drawLand(g, s);
    this.crispKey = key;
  }
  // Transformation écran : d'une caméra figée (cam, scale) vers la caméra courante.
  blitFrom(img, cam, scale, sx, sy) {
    const g = this.g, dpr = this.dpr, sc = this.scale, [cx, cy] = this.center, k = sc / scale;
    g.setTransform(k, 0, 0, k, dpr * (cx - cx * k + (cam.x - this.cam.x) * sc + sx), dpr * (cy - cy * k + (cam.y - this.cam.y) * sc + sy));
    g.drawImage(img, 0, 0);
  }

  render(s, dt) {
    this.time += dt;
    if (!this.cv.width || !this.cv.height) { if (innerWidth && innerHeight) this.resize(); return; }
    if (this.camAnim) {
      const a = this.camAnim; a.t += dt;
      const k = ease(Math.min(1, a.t / a.dur));
      this.cam.x = a.from.x + (a.to.x - a.from.x) * k; this.cam.y = a.from.y + (a.to.y - a.from.y) * k; this.cam.z = a.from.z + (a.to.z - a.from.z) * k;
      this.clampCam();
      if (a.t >= a.dur) this.camAnim = null;
    }
    const key = `${this.cam.x.toFixed(3)},${this.cam.y.toFixed(3)},${this.cam.z.toFixed(4)},${this.w},${this.h},${this.insets.top},${this.insets.bottom}`;
    const moving = key !== this.lastCamKey;
    this.lastCamKey = key; this.idle = moving ? 0 : this.idle + dt;
    const g = this.g, dpr = this.dpr, sc = this.scale, [cx, cy] = this.center;
    let sx = 0, sy = 0;
    if (this.shakeAmt > 0.1) { sx = (Math.random() - 0.5) * this.shakeAmt; sy = (Math.random() - 0.5) * this.shakeAmt; this.shakeAmt *= Math.pow(0.02, dt); }
    // Terres : rendu net à l'arrêt quand on zoome au-delà du cache (en pixels de l'écran), sinon cache monde transformé.
    this.ensureWorld();
    const sharp = sc * dpr > this.worldRes * 1.15;
    if (sharp && this.idle > 0.15 && this.crispKey !== key) this.renderCrisp(key);
    const crisp = sharp && this.crispKey === key;
    // Pays : couche mise en cache, redessinée à l'arrêt quand la partie a avancé.
    if (s) {
      this.layerAge += dt;
      const stamp = `${s.day}|${s.stats.events || 0}|${s.cultures.filter(c => c.alive).length}`;
      if (!this.layerCam || (!moving && (this.layerCam.key !== key || (this.layerAge > LAYER_EVERY && stamp !== this.layerStamp)))) this.renderLayer(s, key, stamp);
    }
    if (s && !moving && !sx && !sy && (crisp || !sharp) && this.layerCam?.key === key) {
      // Caméra immobile : une seule copie plein écran (fond, terres et pays déjà fusionnés).
      const bk = `${this.layerGen}|${key}|${crisp}`;
      if (this.baseKey !== bk) {
        const b = this.base.getContext('2d', {alpha: false});
        b.setTransform(1, 0, 0, 1, 0, 0); b.drawImage(this.bg, 0, 0);
        this.drawLandTo(b, crisp);
        b.setTransform(1, 0, 0, 1, 0, 0); b.drawImage(this.layer, 0, 0);
        this.baseKey = bk;
      }
      g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(this.base, 0, 0);
    } else {
      g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(this.bg, 0, 0);
      this.drawLandTo(g, crisp, sx, sy);
      if (s && this.layerCam) this.blitFrom(this.layer, this.layerCam, this.layerCam.scale, sx, sy);
    }
    g.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * (cx - this.cam.x * sc + sx), dpr * (cy - this.cam.y * sc + sy));
    if (s) this.drawDynamic(s, g, sc);
    this.drawFx(g, sc, dt);
    // Espace écran : bulles et convois.
    g.setTransform(dpr, 0, 0, dpr, sx * dpr, sy * dpr);
    if (s) { this.drawRaids(s, g); this.drawBubbles(s, g); }
  }

  // Teintes, caricatures (hachures), points de densité et frontières fermées.
  renderLayer(s, key, stamp) {
    const g = this.layer.getContext('2d'), dpr = this.dpr, sc = this.scale, [cx, cy] = this.center;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, this.layer.width, this.layer.height);
    g.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * (cx - this.cam.x * sc), dpr * (cy - this.cam.y * sc));
    const colors = s.cultures.map(c => NATIONS[c.id].color), n = colors.length;
    const [x0, y0] = this.toWorld(0, 0), [x1, y1] = this.toWorld(this.w, this.h);
    const visible = i => { const b = BBOX[i]; return !(b[2] < x0 || b[0] > x1 || b[3] < y0 || b[1] > y1); };
    for (let i = 0; i < GEO.length; i++) {
      const c = s.countries[i]; if (GEO[i].pop <= 0 || !visible(i)) continue;
      let dk = -1, dv = 0, ck = -1, cv = 0;
      for (let k = 0; k < n; k++) {
        const v = c.inf[k] + c.car[k]; if (v > dv) { dv = v; dk = k; }
        if (c.car[k] > cv) { cv = c.car[k]; ck = k; }
      }
      if (dk >= 0) { g.fillStyle = hex(colors[dk], 0.1 + 0.32 * dv); g.fill(PATHS[i]); }
      if (ck >= 0 && cv > 0.01) {
        const p = this.pattern(colors[ck]);
        p.setTransform(new DOMMatrix().scale(1 / (sc * this.patternScale)));
        g.globalAlpha = Math.min(1, 0.15 + cv); g.fillStyle = p; g.fill(PATHS[i]); g.globalAlpha = 1;
      }
    }
    const r = Math.max(0.42, 1.25 / sc), d = r * 2;
    const batches = colors.map(() => []);
    for (let i = 0; i < GEO.length; i++) {
      const c = s.countries[i], dots = GEO[i].dots; if (!dots.length || !visible(i)) continue;
      let any = 0; for (let k = 0; k < n; k++) any += c.inf[k];
      if (any <= 0) continue;
      for (let j = 0; j < dots.length; j += 3) {
        let t = dots[j + 2] / 1000;
        // Les petits foyers restent visibles : au moins quelques points si la culture est présente.
        for (let k = 0; k < n; k++) {
          const v = c.inf[k] > 0 ? Math.max(c.inf[k], 3 / dots.length) : 0;
          if (t < v) { batches[k].push(dots[j], dots[j + 1]); break; }
          t -= v;
        }
      }
    }
    batches.forEach((arr, k) => {
      if (!arr.length) return;
      g.fillStyle = colors[k]; g.beginPath();
      for (let j = 0; j < arr.length; j += 2) g.rect(arr[j] - r, arr[j + 1] - r, d, d);
      g.fill();
    });
    g.setLineDash([3 / sc, 2.5 / sc]);
    for (let i = 0; i < GEO.length; i++) {
      const c = s.countries[i], cl = c.closed;
      if (!cl || c.inf[0] + c.car[0] > 0.97 || !visible(i)) continue; // inutile d'alarmer sur un pays acquis
      g.strokeStyle = cl >= 3 ? 'rgba(255,70,70,0.95)' : cl === 2 ? 'rgba(255,110,90,0.75)' : 'rgba(255,150,110,0.55)';
      g.lineWidth = (cl >= 3 ? 1.8 : 1.1) / sc; g.stroke(PATHS[i]);
    }
    g.setLineDash([]);
    this.layerCam = {x: this.cam.x, y: this.cam.y, scale: sc, key};
    this.layerAge = 0; this.layerStamp = stamp; this.layerGen++;
  }

  // Sprites pré-rendus : évitent textes émoji et flous recalculés à chaque image.
  sprite(name, draw, size = 64) {
    if (this.sprites[name]) return this.sprites[name];
    const c = document.createElement('canvas'); c.width = c.height = size;
    draw(c.getContext('2d'), size);
    return (this.sprites[name] = c);
  }
  emojiSprite(ch, bg) {
    return this.sprite('e' + ch + (bg || ''), (g, n) => {
      if (bg) { g.fillStyle = bg; g.beginPath(); g.arc(n / 2, n / 2, n / 2, 0, Math.PI * 2); g.fill(); }
      g.font = `${n * 0.62}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, n / 2, n / 2 + n * 0.04);
    });
  }
  bubbleSprite(kind, icon) {
    return this.sprite('b' + kind + icon, (g, n) => {
      const r = n * 0.3, c = n / 2;
      const [c1, c2] = kind === 'cure' ? ['#bfe8ff', '#1f7cff'] : kind === 'new' ? ['#ffe3a0', '#ff4b2b'] : ['#fff2b3', '#ff9a1f'];
      const grad = g.createRadialGradient(c - r * 0.35, c - r * 0.35, 2, c, c, r);
      grad.addColorStop(0, c1); grad.addColorStop(1, c2);
      g.shadowColor = c2; g.shadowBlur = n * 0.12;
      g.fillStyle = grad; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.fill();
      g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = n * 0.035; g.stroke();
      g.font = `${r * 1.05}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(kind === 'cure' ? '🎓' : icon, c, c + 1);
    }, 128);
  }

  // Éléments animés à chaque image : survol, repères, universités, véhicules, capitales.
  drawDynamic(s, g, sc) {
    const cultures = s.cultures, colors = cultures.map(c => NATIONS[c.id].color);
    if (this.highlight) {
      g.strokeStyle = `rgba(255,255,255,${0.55 + 0.4 * Math.sin(this.time * 6)})`; g.lineWidth = 2.2 / sc;
      for (const i of this.highlight) g.stroke(PATHS[i]);
    }
    for (const [i, a] of [[this.hover, 0.5], [this.selected, 0.95]]) {
      if (i < 0) continue;
      g.fillStyle = `rgba(255,255,255,${a * 0.08})`; g.fill(PATHS[i]);
      g.strokeStyle = `rgba(255,240,200,${a})`; g.lineWidth = 1.6 / sc; g.stroke(PATHS[i]);
    }
    // Fin de partie : repère les natifs et rivaux restants.
    const sh = s._sh;
    if (sh && sh.inf[0] + sh.car[0] > 0.8) {
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 4);
      g.strokeStyle = `rgba(255,255,255,${0.35 + 0.5 * pulse})`; g.lineWidth = 1.4 / sc;
      g.beginPath();
      s.countries.forEach((c, i) => {
        const rival = c.inf.some((v, k) => k && v > 0) || c.car.some((v, k) => k && v > 0);
        if (GEO[i].pop <= 0 || (c.nat <= 0 && !rival)) return;
        const rr = (9 + 4 * pulse) / sc;
        g.moveTo(GEO[i].x + rr, GEO[i].y); g.arc(GEO[i].x, GEO[i].y, rr, 0, Math.PI * 2);
      });
      g.stroke();
    }
    // Universités qui produisent la Nuance.
    if (s.detected && !s.deploy) {
      const spr = this.emojiSprite('🎓', 'rgba(60,170,255,0.4)'), size = 17 * this.ui / sc;
      for (let i = 0; i < GEO.length; i++) {
        if (!S.isLab(s, i)) continue;
        g.globalAlpha = 0.6 + 0.4 * Math.sin(this.time * 3 + i);
        g.drawImage(spr, GEO[i].x + 6 / sc - size / 2, GEO[i].y - 6 / sc - size / 2, size, size);
      }
      g.globalAlpha = 1;
    }
    for (const v of s.vehicles) if (v.kind !== 'raid') this.drawVehicle(g, sc, v, colors);
    cultures.forEach((cu, k) => this.drawHome(s, g, sc, k, colors[k]));
    if (s.siege && s.siege.until > s.day) {
      const gg = GEO[s.siege.ci], spr = this.emojiSprite('⚔️'), size = 24 / sc;
      g.drawImage(spr, gg.x - size / 2, gg.y - 30 / sc + Math.sin(this.time * 5) * 2 / sc - size / 2, size, size);
    }
  }

  drawHome(s, g, sc, k, color) {
    const cu = s.cultures[k], gg = GEO[cu.home], R = 15 * this.ui / sc;
    const x = gg.x, y = gg.y;
    g.save();
    g.fillStyle = 'rgba(0,0,0,0.55)'; g.beginPath(); g.arc(x, y + 2 / sc, R + 4 / sc, 0, Math.PI * 2); g.fill();
    const icon = relicIcon(cu.id, 96, !cu.alive);
    if (icon) g.drawImage(icon, x - R, y - R, R * 2, R * 2);
    // Anneau de vie de la capitale.
    const hp = cu.alive ? S.homeShare(s, k) : 0;
    g.lineWidth = 3.2 / sc; g.strokeStyle = 'rgba(0,0,0,0.6)';
    g.beginPath(); g.arc(x, y, R + 2.5 / sc, 0, Math.PI * 2); g.stroke();
    const danger = hp < 0.8 && cu.alive;
    g.strokeStyle = danger ? (Math.sin(this.time * 10) > 0 ? '#ff3b3b' : color) : color;
    g.beginPath(); g.arc(x, y, R + 2.5 / sc, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hp); g.stroke();
    if (!cu.alive) {
      g.strokeStyle = '#ff4040'; g.lineWidth = 3 / sc;
      g.beginPath(); g.moveTo(x - R * 0.7, y - R * 0.7); g.lineTo(x + R * 0.7, y + R * 0.7); g.moveTo(x + R * 0.7, y - R * 0.7); g.lineTo(x - R * 0.7, y + R * 0.7); g.stroke();
    }
    g.restore();
  }

  curve(v) {
    const a = GEO[v.from], b = GEO[v.to];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dist = Math.hypot(b.x - a.x, b.y - a.y);
    const lift = v.kind === 'sea' ? 0.08 : 0.22;
    return {ax: a.x, ay: a.y, bx: b.x, by: b.y, qx: mx, qy: my - dist * lift};
  }
  at(c, t) {
    const u = 1 - t;
    return [u * u * c.ax + 2 * u * t * c.qx + t * t * c.bx, u * u * c.ay + 2 * u * t * c.qy + t * t * c.by,
      2 * u * (c.qx - c.ax) + 2 * t * (c.bx - c.qx), 2 * u * (c.qy - c.ay) + 2 * t * (c.by - c.qy)];
  }
  drawVehicle(g, sc, v, colors) {
    const c = this.curve(v), t = Math.min(1, v.t / v.dur), [x, y, dx, dy] = this.at(c, t);
    const col = v.k >= 0 ? colors[v.k] : null;
    if (col) {
      g.strokeStyle = hex(col, 0.35); g.lineWidth = 1 / sc; g.setLineDash([2 / sc, 3 / sc]);
      g.beginPath(); g.moveTo(c.ax, c.ay); g.quadraticCurveTo(c.qx, c.qy, c.bx, c.by); g.stroke(); g.setLineDash([]);
    }
    g.save(); g.translate(x, y); g.rotate(Math.atan2(dy, dx)); g.scale(this.ui / sc, this.ui / sc);
    g.fillStyle = col || 'rgba(190,220,230,0.32)';
    g.strokeStyle = col ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0)'; g.lineWidth = 1;
    if (v.kind === 'air') {
      const s = col ? 1.25 : 0.9;
      g.beginPath(); g.moveTo(7 * s, 0); g.lineTo(-4 * s, -5 * s); g.lineTo(-2 * s, 0); g.lineTo(-4 * s, 5 * s); g.closePath(); g.fill(); if (col) g.stroke();
    } else {
      const s = col ? 1.2 : 0.9;
      g.beginPath(); g.moveTo(6 * s, 0); g.lineTo(2 * s, -3 * s); g.lineTo(-6 * s, -3 * s); g.lineTo(-6 * s, 3 * s); g.lineTo(2 * s, 3 * s); g.closePath(); g.fill(); if (col) g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(-12 * s, -1, 4 * s, 2);
    }
    g.restore();
  }

  drawRaids(s, g) {
    this.raidHits = [];
    const customs = S.playerStats(s).customs > 0;
    for (const v of s.vehicles) {
      if (v.kind !== 'raid') continue;
      const col = NATIONS[s.cultures[v.k].id].color, c = this.curve(v), t = Math.min(1, v.t / v.dur);
      const P = (tt) => { const [x, y] = this.at(c, tt); return this.toScreen(x, y); };
      // Trajectoire restante avec flèche.
      g.strokeStyle = hex(col, 0.8); g.lineWidth = 2.5; g.setLineDash([8, 6]); g.lineDashOffset = -this.time * 30;
      g.beginPath(); let [px, py] = P(t); g.moveTo(px, py);
      for (let u = t; u <= 1.0001; u += 0.04) { const [qx, qy] = P(Math.min(1, u)); g.lineTo(qx, qy); }
      g.stroke(); g.setLineDash([]);
      const [ex, ey] = P(1), [fx, fy] = P(0.97), ang = Math.atan2(ey - fy, ex - fx);
      g.fillStyle = col; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - 14 * Math.cos(ang - 0.45), ey - 14 * Math.sin(ang - 0.45)); g.lineTo(ex - 14 * Math.cos(ang + 0.45), ey - 14 * Math.sin(ang + 0.45)); g.fill();
      // Le convoi.
      const R = 17 * Math.max(0.8, this.ui), pulse = 1 + 0.12 * Math.sin(this.time * 8);
      g.fillStyle = v.k === 0 ? 'rgba(255,215,90,0.3)' : 'rgba(255,40,40,0.28)';
      g.beginPath(); g.arc(px, py, R * 1.6 * pulse, 0, Math.PI * 2); g.fill();
      const icon = relicIcon(s.cultures[v.k].id, 96);
      if (icon) g.drawImage(icon, px - R, py - R, R * 2, R * 2);
      g.lineWidth = 3; g.strokeStyle = col; g.beginPath(); g.arc(px, py, R + 1.5, 0, Math.PI * 2); g.stroke();
      if (v.k > 0) {
        g.font = '15px "Segoe UI Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(customs ? '🛃' : '⚔️', px + R, py - R);
        this.raidHits.push({x: px, y: py, r: R * 1.4, v});
      }
    }
  }

  drawBubbles(s, g) {
    this.bubbleHits = [];
    for (const b of s.bubbles) {
      const [x0, y0] = this.toScreen(b.x, b.y);
      const appear = Math.min(1, b.age * 4), fade = b.life - b.age < 2 ? (Math.sin(b.age * 18) > 0 ? 1 : 0.35) : 1;
      const R = (b.kind === 'cure' ? 15 : 17) * (0.6 + 0.4 * appear) * (b.kind === 'new' ? 1.1 : 1) * Math.max(0.8, this.ui);
      const y = y0 - 18 - Math.sin(this.time * 3 + b.id) * 4;
      g.globalAlpha = fade;
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y + R); g.stroke();
      const spr = this.bubbleSprite(b.kind, this.currency || '💭'), half = R / 0.3 / 2;
      g.drawImage(spr, x0 - half, y - half, half * 2, half * 2);
      if (b.value > 1 && b.kind !== 'cure') {
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '900 12px "Segoe UI Black","Arial Black",sans-serif'; g.fillStyle = '#fff'; g.strokeStyle = '#4a1600'; g.lineWidth = 3;
        g.strokeText('×' + b.value, x0 + R * 0.75, y + R * 0.7); g.fillText('×' + b.value, x0 + R * 0.75, y + R * 0.7);
      }
      g.globalAlpha = 1;
      this.bubbleHits.push({x: x0, y, r: R, b});
    }
  }

  drawFx(g, sc, dt) {
    for (const f of this.fx) f.t += dt;
    this.fx = this.fx.filter(f => f.t < f.dur);
    for (const f of this.fx) {
      const k = f.t / f.dur;
      if (f.type === 'ripple') {
        g.strokeStyle = hex(f.color, (1 - k) * 0.9); g.lineWidth = (f.width || 2) / sc;
        g.beginPath(); g.arc(f.x, f.y, (4 + f.r * ease(k)) / sc, 0, Math.PI * 2); g.stroke();
      } else if (f.type === 'flash') {
        g.fillStyle = hex(f.color, (1 - k) * 0.6); g.fill(PATHS[f.ci]);
      } else if (f.type === 'cross') {
        const r = 6 / sc;
        g.strokeStyle = `rgba(255,60,60,${1 - k})`; g.lineWidth = 2.5 / sc;
        g.beginPath(); g.moveTo(f.x - r, f.y - r); g.lineTo(f.x + r, f.y + r); g.moveTo(f.x + r, f.y - r); g.lineTo(f.x - r, f.y + r); g.stroke();
      } else if (f.type === 'spark') {
        const x = f.x + f.vx * f.t / sc, y = f.y + (f.vy * f.t + 120 * f.t * f.t) / sc;
        g.fillStyle = hex(f.color, 1 - k); g.beginPath(); g.arc(x, y, (2.5 * (1 - k) + 0.5) / sc, 0, Math.PI * 2); g.fill();
      } else if (f.type === 'text') {
        g.font = `900 ${f.size / sc}px "Segoe UI Black","Arial Black",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
        const y = f.y - 40 * ease(k) / sc;
        g.globalAlpha = 1 - Math.max(0, k - 0.6) / 0.4;
        g.lineWidth = 4 / sc; g.strokeStyle = 'rgba(0,0,0,0.75)'; g.strokeText(f.text, f.x, y);
        g.fillStyle = f.color; g.fillText(f.text, f.x, y); g.globalAlpha = 1;
      }
    }
  }
}
