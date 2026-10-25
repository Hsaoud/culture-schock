// Simulation : propagation des cultures, voyages, rivaux IA, alerte et Nuance.
// (Dans le code, la Nuance s'appelle `cure` et sa diffusion finale `deploy`.)
// Indépendante du navigateur (testable sous Node). Unité de temps : le jour.
import {GEO} from './geo-data.js';
import {NATIONS, SCENARIOS, DIFFICULTY} from './data/nations.js';
import {buildTraits, AI_UPGRADES} from './data/traits.js';
import {FAMILIES, FAMILY_IDS, VARIANTS} from './data/events.js';

export const INDEX = Object.fromEntries(GEO.map((c, i) => [c.id, i]));
export const WORLD_POP = GEO.reduce((a, c) => a + c.pop, 0);
const NEIGH = GEO.map(c => c.nb.map(id => INDEX[id]));
const TRAFFIC = GEO.map(c => c.airport ? Math.pow(c.pop, 0.4) * (0.4 + c.wealth) / 7.6 : 0);
const PORTS = GEO.map(c => c.port && c.pop > 0 ? Math.pow(c.pop, 0.35) * (0.5 + c.wealth) / 6 : 0);
const FUND = GEO.map(c => c.wealth * c.wealth * Math.sqrt(c.pop));
const FUND_TOTAL = FUND.reduce((a, b) => a + b, 0);
const PEOPLE = GEO.map(c => c.pop * 1e6);

const BASE = {inf: 2, vis: 0, car: 0, air: 0, sea: 0, land: 0, hot: 0, cold: 0, rich: 0, poor: 0, clash: 1, home: 2,
  anti: 0, stealth: 0, bypass: 0, net: 0, customs: 0};
export const STEP = 0.25;          // pas de simulation (jours)
export const SPEEDS = [0, 1.4, 0.7, 0.35]; // secondes réelles par jour
const GAMMA = 0.6;                 // vitesse des affrontements culturels
const AIR_SPEED = 55, SEA_SPEED = 20, RAID_SPEED = 38; // unités carte / jour
const MAX_BUBBLES = 6;
const CAR_SPREAD = 0.3;
const SIEGE_BOOST = 1.35, SIEGE_DAYS = 30; // offensive du joueur : puissance locale renforcée          // les caricatures convainquent encore un peu

export const WORLD_EVENTS = [
  {id: 'cup', icon: '⚽', text: 'Coupe du monde : ciel saturé', mods: {air: 2.2}, days: 25},
  {id: 'strike', icon: '🛑', text: 'Grève mondiale des aiguilleurs', mods: {air: 0.25}, days: 14},
  {id: 'cruise', icon: '🛳️', text: 'Folie des croisières', mods: {sea: 2.2}, days: 25},
  {id: 'crisis', icon: '📉', text: 'Krach : budgets culture gelés', mods: {cure: 0.5}, days: 30},
  {id: 'forum', icon: '🎓', text: 'Forum mondial de la diversité', cure: 3},
  {id: 'volcano', icon: '🌋', text: 'Volcan : avions cloués au sol', mods: {air: 0}, days: 8},
  {id: 'meme', icon: '😂', text: 'Votre culture devient un mème', mods: {inf0: 1.35}, days: 20},
  {id: 'scandal', icon: '📰', text: 'Scandale : « Stop aux clichés ! »', alert: 8},
];

// --- Hasard reproductible -------------------------------------------------
export function rand(s) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296; }
function pickWeighted(s, weights) {
  let total = 0; for (const w of weights) total += w;
  if (total <= 0) return -1;
  let r = rand(s) * total;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; }
  return weights.length - 1;
}

// --- Création ---------------------------------------------------------------
export function createGame(nationId, seed = (Date.now() >>> 0)) {
  const sc = SCENARIOS[nationId], diff = DIFFICULTY[NATIONS[nationId].stars];
  const ids = [nationId, ...sc.rivals];
  const s = {
    v: 1, nation: nationId, stars: NATIONS[nationId].stars, seed: seed >>> 0, day: 0,
    cultures: ids.map((id, k) => ({
      id, player: k === 0, alive: true, home: INDEX[NATIONS[id].home], traits: [], ups: {}, pts: 0, buys: 0,
      nextRaid: k ? diff.firstRaid + 15 * k : Infinity, raids: 0,
    })),
    countries: GEO.map(c => ({nat: c.pop > 0 ? 1 : 0, inf: ids.map(() => 0), car: ids.map(() => 0), closed: 0, seen: 0})),
    points: sc.start ?? 5, alert: 0, detected: !!sc.detectedAtStart, cure: 0, cureMarks: 0, deploy: 0,
    vehicles: [], bubbles: [], nextId: 1, events: [], mods: [], nextWorld: 50, nextMutation: 40,
    probeUses: 0, offensiveReady: 0, milestones: {inf: 0, car: 0}, homeDanger: false,
    nextEvent: 38, eventDeck: [], pendingEvent: null,
    stats: {bubbles: 0, points: 0, blocked: 0, intercepted: 0, toppled: 0, peak: 0},
    outcome: null, acc: {plane: 0, ship: 0},
  };
  ids.forEach((id, k) => {
    const c = s.countries[s.cultures[k].home];
    c.nat = 0; c.inf[k] = 1; c.seen |= 1 << k;
  });
  for (const [cid, v] of Object.entries(sc.seeds || {})) {
    const c = s.countries[INDEX[cid]]; if (!c || c.nat <= 0) continue;
    const amt = Math.min(v, c.nat); c.nat -= amt; c.inf[0] += amt; c.seen |= 1;
  }
  // Les rivaux démarrent avec une longueur d'avance selon la difficulté.
  for (let k = 1; k < s.cultures.length; k++) for (const up of diff.aiStart) s.cultures[k].ups[up] = (s.cultures[k].ups[up] || 0) + 1;
  refreshStats(s);
  return s;
}

// --- Statistiques ------------------------------------------------------------
export function traitDefs(s) { return s._defs || (s._defs = buildTraits(s.nation)); }

export function refreshStats(s) {
  const defs = traitDefs(s);
  s.cultures.forEach((cu, k) => {
    const st = {...BASE};
    for (const [key, v] of Object.entries(SCENARIOS[cu.id].base || {})) st[key] += cu.player ? v : v * 0.5;
    if (cu.player) for (const id of cu.traits) for (const [key, v] of Object.entries(defs[id].fx)) st[key] += v;
    else for (const [up, n] of Object.entries(cu.ups)) for (const [key, v] of Object.entries(AI_UPGRADES[up])) st[key] += v * n;
    st.visEff = Math.max(0, st.vis) * (SCENARIOS[cu.id].visMul || 1);
    st.asm = Math.max(0, st.car) * 0.012 * (SCENARIOS[cu.id].carMul || 1);
    cu.s = st;
  });
}

export function playerStats(s) { return s.cultures[0].s; }

function mod(s, key) { let m = 1; for (const e of s.mods) if (e.mods[key] !== undefined) m *= e.mods[key]; return m; }

export function growthRate(s, k, ci) {
  const st = s.cultures[k].s, g = GEO[ci];
  const clim = Math.max(0.2, 1 + (g.climate === 'hot' ? st.hot : g.climate === 'cold' ? st.cold : 0));
  const rich = Math.max(0.2, 1 + (g.wealth >= 1 ? st.rich : g.wealth <= 0.45 ? st.poor : 0));
  let b = 0.035 * Math.max(0.3, st.inf) * clim * rich;
  if (k === 0) { b *= mod(s, 'inf0'); if (s.deploy) b *= 0.15; } else b *= aiDrive(s, k);
  return b;
}

// Puissance culturelle : contagion × choc × capitale × élan (part mondiale).
// Élan des rivaux : forts au départ, ils s'essoufflent en grossissant (pas d'emballement).
function aiDrive(s, k) { return DIFFICULTY[s.stars].aiSpread * Math.max(0.3, 1.1 - 1.2 * (s.cultures[k].share || 0)); }

export function power(s, k, ci) {
  const cu = s.cultures[k], st = cu.s;
  let p = (1 + Math.max(0, st.inf)) * st.clash * (ci === cu.home ? st.home : 1) * (1 + 0.3 * (cu.share || 0));
  if (k === 0) p *= mod(s, 'pow0');
  if (k === 0 && s.siege && s.siege.ci === ci && s.siege.until > s.day) p *= SIEGE_BOOST;
  return p;
}

// --- Bilans ------------------------------------------------------------------
export function worldShares(s) {
  const n = s.cultures.length, inf = new Array(n).fill(0), car = new Array(n).fill(0);
  let nat = 0;
  s.countries.forEach((c, i) => {
    const p = GEO[i].pop; nat += c.nat * p;
    for (let k = 0; k < n; k++) { inf[k] += c.inf[k] * p; car[k] += c.car[k] * p; }
  });
  return {nat: nat / WORLD_POP, inf: inf.map(v => v / WORLD_POP), car: car.map(v => v / WORLD_POP)};
}
export function homeShare(s, k) { const c = s.countries[s.cultures[k].home]; return c.inf[k] + c.car[k]; }
export function dominant(c) {
  let best = -1, bv = c.nat;
  for (let k = 0; k < c.inf.length; k++) { const v = c.inf[k] + c.car[k]; if (v > bv) { bv = v; best = k; } }
  return best;
}
// Part d'un pays dans la recherche de la Nuance : vos influencés freinent, vos caricatures bloquent,
// les rivaux financent volontiers.
export function participation(s, ci) {
  const c = s.countries[ci]; let rivals = 0;
  for (let k = 1; k < c.inf.length; k++) rivals += c.inf[k] + c.car[k];
  return Math.max(0, Math.min(1.25, 1 - 0.6 * c.inf[0] - c.car[0] + 0.4 * rivals));
}
export function cureRate(s) {
  if (!s.detected || s.deploy) return 0;
  let fund = 0;
  for (let i = 0; i < GEO.length; i++) if (FUND[i]) fund += FUND[i] * participation(s, i);
  const diff = DIFFICULTY[s.stars];
  return 1.4 * diff.cure * (0.2 + 0.8 * fund / FUND_TOTAL) * (0.3 + 0.7 * s.alert / 100) * Math.max(0.2, 1 - playerStats(s).anti) * mod(s, 'cure');
}
export function isLab(s, ci) { return s.detected && GEO[ci].wealth >= 0.7 && GEO[ci].pop >= 3 && participation(s, ci) > 0.5; }

function emit(s, e) { s.events.push(e); if (s.events.length > 200) s.events.splice(0, s.events.length - 200); }

// --- Boucle -----------------------------------------------------------------
// Pas variable (≤ STEP) : en jeu, la simulation avance un peu à chaque image, ce qui rend
// les véhicules et la propagation fluides ; les tests avancent par jours entiers (4 pas).
export function advance(s, days) {
  while (days > 1e-9 && !s.outcome) { const h = Math.min(STEP, days); tick(s, h); days -= h; }
}

function tick(s, h) {
  const prevDay = Math.floor(s.day);
  for (let i = 0; i < GEO.length; i++) updateCountry(s, i, h);
  travel(s, h);
  moveVehicles(s, h);
  alertAndCure(s, h);
  for (let k = 1; k < s.cultures.length; k++) if (s.cultures[k].alive) aiTick(s, k, h);
  spawnBubbles(s, h);
  s.day += h;
  if (Math.floor(s.day) !== prevDay) daily(s);
}

function updateCountry(s, ci, h) {
  const g = GEO[ci]; if (g.pop <= 0) return;
  const c = s.countries[ci], n = s.cultures.length, cu = s.cultures;
  // 1. Conversion des natifs (logistique, avec une traîne accélérée en fin).
  if (c.nat > 0) {
    let tot = 0; const gr = [];
    for (let k = 0; k < n; k++) {
      const sp = c.inf[k] + CAR_SPREAD * c.car[k];
      gr[k] = cu[k].alive && sp > 0 ? growthRate(s, k, ci) * sp * (c.nat + 0.04) * h : 0;
      tot += gr[k];
    }
    const scale = tot > c.nat ? c.nat / tot : 1;
    for (let k = 0; k < n; k++) { c.inf[k] += gr[k] * scale; c.nat -= gr[k] * scale; }
  }
  // 2. Choc des cultures : la plus puissante grignote la plus faible.
  for (let k = 0; k < n; k++) for (let j = k + 1; j < n; j++) {
    const xk = c.inf[k] + c.car[k], xj = c.inf[j] + c.car[j];
    if (xk <= 0 || xj <= 0 || !cu[k].alive || !cu[j].alive) continue;
    const pk = power(s, k, ci), pj = power(s, j, ci);
    const rate = GAMMA * Math.tanh(3 * (pk - pj) / (pk + pj));
    let f = rate * (xk * xj + 0.03 * Math.min(xk, xj)) * h;
    if (f > 0) take(c, j, k, Math.min(f, xj)); else if (f < 0) take(c, k, j, Math.min(-f, xk));
  }
  // 3. Caricature : les influencés deviennent des clichés vivants (insensibles à la Nuance).
  for (let k = 0; k < n; k++) {
    const a = cu[k].s.asm;
    if (a > 0 && c.inf[k] > 0 && cu[k].alive) {
      const d = Math.min(c.inf[k], a * h * (c.inf[k] + (c.nat < 0.002 ? 0.05 : 0)));
      c.inf[k] -= d; c.car[k] += d;
    }
  }
  // 4. Nuance diffusée : vos influencés se mettent à nuancer.
  if (s.deploy && c.inf[0] > 0) {
    const r = Math.min(0.25, 0.012 * s.deploy);
    const d = Math.min(c.inf[0], r * h * (c.inf[0] + 0.02));
    c.inf[0] -= d; c.nat += d;
  }
  // 5. Arrondis : moins d'une personne = personne.
  const thr = 0.5 / PEOPLE[ci];
  let sum = c.nat;
  for (let k = 0; k < n; k++) {
    if (c.inf[k] < thr) { c.nat += c.inf[k]; c.inf[k] = 0; }
    if (c.car[k] < thr) { c.nat += c.car[k]; c.car[k] = 0; }
  }
  if (c.nat < thr) c.nat = 0;
  sum = c.nat; for (let k = 0; k < n; k++) sum += c.inf[k] + c.car[k];
  if (sum > 0 && Math.abs(sum - 1) > 1e-9) { c.nat /= sum; for (let k = 0; k < n; k++) { c.inf[k] /= sum; c.car[k] /= sum; } }
}

// Transfère `amt` de la culture `from` vers les influencés de `to` (influencés d'abord, puis caricatures).
function take(c, from, to, amt) {
  const a = Math.min(amt, c.inf[from]); c.inf[from] -= a; c.inf[to] += a;
  const b = Math.min(amt - a, c.car[from]); c.car[from] -= b; c.inf[to] += b;
}

// Arrivée d'une culture dans un pays (prélève d'abord chez les natifs).
function seed(s, ci, k, frac) {
  const c = s.countries[ci]; if (GEO[ci].pop <= 0) return;
  let left = frac;
  const a = Math.min(left, c.nat); c.nat -= a; c.inf[k] += a; left -= a;
  if (left > 0) {
    let others = 0; for (let j = 0; j < c.inf.length; j++) if (j !== k) others += c.inf[j];
    if (others > 0) { const r = Math.min(1, left / others); for (let j = 0; j < c.inf.length; j++) if (j !== k) { const d = c.inf[j] * r; c.inf[j] -= d; c.inf[k] += d; } }
  }
  if (c.seen & (1 << k)) return false;
  c.seen |= 1 << k;
  if (k === 0) { emit(s, {t: 'new', ci}); if (GEO[ci].pop >= 0.5) addBubble(s, 'new', ci, GEO[ci].pop >= 100 ? 2 : 1); }
  return true;
}
const arrivalFrac = ci => Math.min(0.02, (400 + 2e-5 * PEOPLE[ci]) / PEOPLE[ci]);

// Fermetures : avions et bateaux bloqués ; frontières terrestres poreuses (15 %).
function isOpen(s, ci, kind, k) {
  const need = kind === 'air' ? 1 : kind === 'sea' ? 2 : 3;
  if (s.countries[ci].closed < need) return true;
  return rand(s) < Math.max(kind === 'land' ? 0.15 : 0, s.cultures[k].s.bypass);
}

function travel(s, h) {
  const n = s.cultures.length;
  const air = mod(s, 'air'), sea = mod(s, 'sea');
  for (let k = 0; k < n; k++) {
    const cu = s.cultures[k]; if (!cu.alive) continue;
    const st = cu.s;
    const boost = k ? aiDrive(s, k) : 1;
    const airRate = (0.035 + 0.08 * st.air) * air * boost, seaRate = (0.025 + 0.07 * st.sea) * sea * boost, landRate = (0.03 + 0.05 * st.land) * boost;
    for (let ci = 0; ci < GEO.length; ci++) {
      const share = s.countries[ci].inf[k] + CAR_SPREAD * s.countries[ci].car[k]; if (share <= 0) continue;
      const closed = s.countries[ci].closed;
      if (TRAFFIC[ci] && (closed < 1 || rand(s) < st.bypass) && rand(s) < airRate * share * TRAFFIC[ci] * h) launch(s, 'air', ci, k);
      if (PORTS[ci] && (closed < 2 || rand(s) < st.bypass) && rand(s) < seaRate * share * PORTS[ci] * h) launch(s, 'sea', ci, k);
      for (const nb of NEIGH[ci]) {
        if (GEO[nb].pop <= 0 || rand(s) >= landRate * share * h) continue;
        if (!isOpen(s, nb, 'land', k)) { if (k === 0) s.stats.blocked++; continue; }
        if (seed(s, nb, k, arrivalFrac(nb) * 0.5)) emit(s, {t: 'land', k, from: ci, to: nb});
      }
    }
    // Internet trouve ceux qui n'ont pas encore entendu parler de vous, même derrière une frontière fermée.
    if (st.net > 0 && rand(s) < 0.4 * st.net * h) {
      const ci = pickWeighted(s, GEO.map((g, i) => g.pop > 0 && !s.countries[i].inf[k] ? s.countries[i].nat * Math.pow(g.pop, 0.3) + 0.01 : 0));
      if (ci >= 0) { seed(s, ci, k, arrivalFrac(ci)); emit(s, {t: 'net', k, ci}); }
    }
  }
  // Trafic neutre pour l'ambiance.
  s.acc.plane += h * 3.2 * air; s.acc.ship += h * 1.4 * sea;
  while (s.acc.plane >= 1) { s.acc.plane--; launch(s, 'air', pickWeighted(s, TRAFFIC.map((t, i) => s.countries[i].closed < 1 ? t : 0)), -1); }
  while (s.acc.ship >= 1) { s.acc.ship--; launch(s, 'sea', pickWeighted(s, PORTS.map((t, i) => s.countries[i].closed < 2 ? t : 0)), -1); }
}

function launch(s, kind, from, k) {
  if (from < 0) return;
  const weights = (kind === 'air' ? TRAFFIC : PORTS).map((t, i) => i === from ? 0 : t);
  const to = pickWeighted(s, weights); if (to < 0) return;
  if (k >= 0 && !isOpen(s, to, kind, k)) { if (k === 0) { s.stats.blocked++; emit(s, {t: 'blocked', ci: to}); } return; }
  if (k < 0 && s.countries[to].closed >= (kind === 'air' ? 1 : 2)) return;
  if (s.vehicles.length > 90 && k < 0) return;
  const a = GEO[from], b = GEO[to], dist = Math.hypot(a.x - b.x, a.y - b.y);
  s.vehicles.push({id: s.nextId++, kind, from, to, k, t: 0, dur: Math.max(1.2, dist / (kind === 'air' ? AIR_SPEED : SEA_SPEED))});
}

export function launchRaid(s, k, to) {
  const from = s.cultures[k].home, a = GEO[from], b = GEO[to];
  const v = {id: s.nextId++, kind: 'raid', from, to, k, t: 0, dur: Math.max(3, Math.hypot(a.x - b.x, a.y - b.y) / RAID_SPEED)};
  s.vehicles.push(v); s.cultures[k].raids++;
  emit(s, {t: 'raid', k, from, to, vid: v.id});
  return v;
}

function moveVehicles(s, h) {
  for (const v of s.vehicles) v.t += h;
  const done = s.vehicles.filter(v => v.t >= v.dur);
  if (!done.length) return;
  s.vehicles = s.vehicles.filter(v => v.t < v.dur);
  for (const v of done) {
    if (v.k < 0 || !s.cultures[v.k].alive) continue;
    if (v.kind === 'raid') {
      seed(s, v.to, v.k, v.k === 0 ? 0.06 : 0.04);
      if (v.k === 0) s.siege = {ci: v.to, until: s.day + SIEGE_DAYS};
      emit(s, {t: 'raidHit', k: v.k, ci: v.to});
      continue;
    }
    if (!isOpen(s, v.to, v.kind, v.k)) { if (v.k === 0) { s.stats.blocked++; emit(s, {t: 'blocked', ci: v.to}); } continue; }
    seed(s, v.to, v.k, arrivalFrac(v.to));
    emit(s, {t: 'arrive', k: v.k, ci: v.to, kind: v.kind});
  }
}

function alertAndCure(s, h) {
  const st = playerStats(s), home = s.cultures[0].home, diff = DIFFICULTY[s.stars];
  let noise = 0;
  for (let i = 0; i < GEO.length; i++) {
    if (i === home) continue;
    const c = s.countries[i];
    if (c.inf[0] || c.car[0]) noise += GEO[i].pop * (c.inf[0] * (0.12 + st.visEff) + c.car[0] * (2 + 1.5 * st.visEff));
  }
  noise /= WORLD_POP;
  const target = 100 * (1 - Math.exp(-noise * 2.2 * diff.alert));
  s.alert += (target - s.alert) * Math.min(1, 0.06 * h);
  if (!s.detected && s.alert >= 6 + st.stealth) { s.detected = true; emit(s, {t: 'detected'}); }
  if (s.detected && !s.deploy) {
    s.cure = Math.min(100, s.cure + cureRate(s) * h);
    const mark = Math.floor(s.cure / 25);
    if (mark > s.cureMarks && mark < 4) { s.cureMarks = mark; emit(s, {t: 'cure', pct: mark * 25}); }
    if (s.cure >= 100) { s.deploy = h; emit(s, {t: 'deploy'}); }
  } else if (s.deploy) s.deploy += h;
}

// --- Rivaux IA -------------------------------------------------------------
function aiTick(s, k, h) {
  const cu = s.cultures[k], diff = DIFFICULTY[s.stars], sh = worldSharesCached(s);
  const share = sh.inf[k] + sh.car[k];
  cu.pts += h * diff.ai * (0.12 + 1.0 * share);
  const cost = 6 + 3 * cu.buys;
  if (cu.pts >= cost) {
    const up = aiChoose(s, k, share);
    if (up) { cu.ups[up] = (cu.ups[up] || 0) + 1; cu.buys++; cu.pts -= cost; refreshStats(s); }
  }
  cu.nextRaid -= h;
  if (cu.nextRaid <= 0) {
    cu.nextRaid = diff.raidEvery * (0.7 + 0.6 * rand(s));
    const target = aiTarget(s, k);
    if (target >= 0) launchRaid(s, k, target);
  }
}

function aiCaps(s) {
  return {1: {inf: 3.5, clash: 0, home: 0}, 2: {inf: 5.5, clash: 1, home: 0}, 3: {inf: 6.5, clash: 1, home: 1}, 4: {inf: 7.5, clash: 2, home: 1}}[s.stars];
}

function aiChoose(s, k, share) {
  const cu = s.cultures[k], st = cu.s, caps = aiCaps(s), up = id => cu.ups[id] || 0;
  const late = s.day > 260 || share > 0.3, early = s.day < 110;
  // Menace sur la capitale : priorité à la défense.
  let threatened = false;
  for (let j = 0; j < s.cultures.length; j++) if (j !== k && s.cultures[j].alive && power(s, j, cu.home) > power(s, k, cu.home) * 0.85) threatened = true;
  const opts = {
    air: up('air') < 3 ? (early ? 3 : 1) : 0,
    sea: up('sea') < 3 ? (early ? 2 : 1) : 0,
    land: up('land') < 2 ? 2 : 0,
    inf: up('inf') < caps.inf - 2 ? 3 : 0,
    clash: up('clash') < caps.clash ? (early ? 0.5 : 2) : 0,
    home: up('home') < caps.home ? (threatened ? 8 : 0.6) : 0,
    car: late && up('car') < 2 ? 1 : 0,
  };
  const keys = Object.keys(opts), i = pickWeighted(s, keys.map(x => opts[x]));
  return i < 0 ? null : keys[i];
}

function aiTarget(s, k) {
  const cu = s.cultures[k];
  const cands = [], w = [];
  for (let j = 0; j < s.cultures.length; j++) {
    if (j === k || !s.cultures[j].alive) continue;
    const home = s.cultures[j].home;
    const ratio = power(s, k, home) / power(s, j, home);
    cands.push(home); w.push((j === 0 ? 2 : 0.7) * (ratio > 0.8 ? 3 : 1));
  }
  // Le pays où le joueur est le plus implanté (hors capitale).
  let best = -1, bv = 0;
  s.countries.forEach((c, i) => { if (i !== s.cultures[0].home && i !== cu.home) { const v = (c.inf[0] + c.car[0]) * Math.sqrt(GEO[i].pop); if (v > bv) { bv = v; best = i; } } });
  if (best >= 0 && s.cultures[0].alive) { cands.push(best); w.push(2); }
  const i = pickWeighted(s, w);
  return i < 0 ? -1 : cands[i];
}

let _shCache = null, _shDay = -1, _shState = null;
function worldSharesCached(s) {
  if (_shState !== s || _shDay !== s.day) { _shCache = worldShares(s); _shDay = s.day; _shState = s; }
  return _shCache;
}

// --- Bulles ------------------------------------------------------------------
function addBubble(s, kind, ci, value) {
  if (s.bubbles.length >= MAX_BUBBLES + (kind === 'new' ? 3 : 0)) return;
  const g = GEO[ci], d = g.dots;
  let x = g.x, y = g.y;
  if (d.length >= 3) { const j = Math.floor(rand(s) * d.length / 3) * 3; x = d[j]; y = d[j + 1]; }
  s.bubbles.push({id: s.nextId++, kind, ci, value, x, y, life: kind === 'cure' ? 7 : 9, age: 0});
}

function spawnBubbles(s, h) {
  const sh = worldSharesCached(s);
  const homePop = GEO[s.cultures[0].home].pop / WORLD_POP;
  const abroad = Math.max(0, sh.inf[0] + sh.car[0] - homePop);
  const rate = 0.12 + 0.35 * Math.sqrt(abroad);
  if (rand(s) < rate * h) {
    const ci = pickWeighted(s, s.countries.map((c, i) => c.inf[0] * Math.sqrt(GEO[i].pop)));
    if (ci >= 0) addBubble(s, 'dna', ci, 1 + (rand(s) < 0.3) + (SCENARIOS[s.nation].bubbleBonus || 0));
  }
  if (s.detected && !s.deploy && rand(s) < 0.08 * h) {
    const ci = pickWeighted(s, s.countries.map((c, i) => isLab(s, i) ? FUND[i] : 0));
    if (ci >= 0) addBubble(s, 'cure', ci, 1);
  }
}

// Durée de vie des bulles en temps réel (secondes), indépendante de la vitesse.
export function tickReal(s, dt) {
  for (const b of s.bubbles) b.age += dt;
  s.bubbles = s.bubbles.filter(b => b.age < b.life);
}

// --- Quotidien ---------------------------------------------------------------
function daily(s) {
  const sh = worldShares(s), diff = DIFFICULTY[s.stars];
  // Fermetures des frontières selon l'alerte mondiale.
  s.countries.forEach((c, i) => {
    const g = GEO[i]; if (g.pop <= 0 || c.closed >= 3) return;
    if (c.inf[0] + c.car[0] > 0.5 || i === s.cultures[0].home) return;
    const lvl = s.alert >= g.paranoia + 26 ? 3 : s.alert >= g.paranoia + 12 ? 2 : s.alert >= g.paranoia ? 1 : 0;
    if (lvl > c.closed) { c.closed = lvl; emit(s, {t: 'close', ci: i, level: lvl}); }
  });
  // Paliers de points automatiques.
  const infPct = Math.floor((sh.inf[0] + sh.car[0]) * 20), carPct = Math.floor(sh.car[0] * 20);
  if (infPct > s.milestones.inf) { const n = infPct - s.milestones.inf; s.milestones.inf = infPct; gain(s, n); emit(s, {t: 'milestone', kind: 'inf', pct: infPct * 5, pts: n}); }
  if (carPct > s.milestones.car) { const n = carPct - s.milestones.car; s.milestones.car = carPct; gain(s, n); emit(s, {t: 'milestone', kind: 'car', pct: carPct * 5, pts: n}); }
  s.stats.peak = Math.max(s.stats.peak, sh.inf[0] + sh.car[0]);
  // Fierté locale : un petit revenu régulier.
  if (Math.floor(s.day) % 10 === 0) gain(s, 1);
  s.cultures.forEach((cu, k) => { cu.share = sh.inf[k] + sh.car[k]; });
  // Pression mondiale : quand presque toute la planète vous ressemble, les derniers isolés craquent.
  const mine = sh.inf[0] + sh.car[0];
  if (mine > 0.8) s.countries.forEach((c, i) => {
    if (GEO[i].pop > 0 && c.nat > 0 && !c.inf[0] && rand(s) < 0.04 * Math.pow(mine, 6)) { seed(s, i, 0, arrivalFrac(i)); emit(s, {t: 'net', k: 0, ci: i}); }
  });
  // Événement national illustré : la partie attend le choix du joueur (voir resolveEvent).
  if (!s.pendingEvent && !s.deploy && s.day >= s.nextEvent) {
    if (!s.eventDeck.length) {
      s.eventDeck = FAMILY_IDS.flatMap(f => Array.from({length: VARIANTS}, (_, v) => f + ':' + v));
      for (let i = s.eventDeck.length - 1; i > 0; i--) { const j = Math.floor(rand(s) * (i + 1)); [s.eventDeck[i], s.eventDeck[j]] = [s.eventDeck[j], s.eventDeck[i]]; }
    }
    const [family, v] = s.eventDeck.pop().split(':');
    s.pendingEvent = {family, variant: Number(v)};
    s.nextEvent = s.day + 42 + rand(s) * 26;
    emit(s, {t: 'event'});
  }
  // Événements mondiaux.
  s.mods = s.mods.filter(m => m.until > s.day);
  if (s.day >= s.nextWorld) {
    s.nextWorld = s.day + 38 + rand(s) * 40;
    const ev = WORLD_EVENTS[Math.floor(rand(s) * WORLD_EVENTS.length)];
    if (ev.mods) s.mods.push({id: ev.id, mods: ev.mods, until: s.day + ev.days});
    if (ev.cure && s.detected && !s.deploy) s.cure = Math.min(99, s.cure + ev.cure);
    if (ev.alert) s.alert = Math.min(100, s.alert + ev.alert);
    emit(s, {t: 'world', ev});
  }
  // Clichés imprévus (Fiesta).
  if (SCENARIOS[s.nation].mutations && s.day >= s.nextMutation) {
    s.nextMutation = s.day + 35 + rand(s) * 25;
    const opts = Object.values(traitDefs(s)).filter(t => t.branch === 'cliche' && canBuy(s, t.id, true));
    if (opts.length) { const t = opts[Math.floor(rand(s) * opts.length)]; s.cultures[0].traits.push(t.id); refreshStats(s); emit(s, {t: 'mutation', id: t.id}); }
  }
  // Effondrements : une capitale à moins de 50 % fait tomber sa culture.
  s.cultures.forEach((cu, k) => {
    if (!cu.alive || homeShare(s, k) >= 0.5) return;
    const hc = s.countries[cu.home]; let by = -1, bv = 0;
    for (let j = 0; j < s.cultures.length; j++) if (j !== k && hc.inf[j] + hc.car[j] > bv) { bv = hc.inf[j] + hc.car[j]; by = j; }
    collapse(s, k, by);
  });
  if (s.outcome) return;
  // Danger sur votre capitale.
  const danger = homeShare(s, 0) < 0.85 || s.cultures.some((cu, k) => k && cu.alive && power(s, k, s.cultures[0].home) > power(s, 0, s.cultures[0].home) && s.countries[s.cultures[0].home].inf[k] > 0);
  if (danger !== s.homeDanger) { s.homeDanger = danger; emit(s, {t: 'danger', on: danger}); }
  // Victoire : toute l'humanité caricaturée.
  let left = 0;
  s.countries.forEach((c, i) => { left += GEO[i].pop * (1 - c.car[0]); });
  if (left * 1e6 < 1) return end(s, true, 'mono');
  if (s.deploy > 90 || (s.deploy && sh.inf[0] + sh.car[0] <= 0)) return end(s, false, 'cure');
}

function collapse(s, k, by) {
  const cu = s.cultures[k]; cu.alive = false;
  for (const c of s.countries) { c.nat += c.inf[k] + c.car[k]; c.inf[k] = 0; c.car[k] = 0; }
  s.vehicles = s.vehicles.filter(v => v.k !== k);
  emit(s, {t: 'fall', k, by});
  if (k === 0) return end(s, false, 'home', by);
  if (by === 0) { s.stats.toppled++; gain(s, 10); }
}

function end(s, win, reason, by) {
  s.outcome = {win, reason, by, day: Math.floor(s.day)};
  emit(s, {t: 'end', win, reason});
}

function gain(s, pts) { s.points += pts; s.stats.points += pts; }

// --- Actions du joueur ------------------------------------------------------
export function canBuy(s, id, free = false) {
  const t = traitDefs(s)[id], cu = s.cultures[0];
  if (!t || s.outcome) return false;
  if (!t.action && cu.traits.includes(id)) return false;
  if (t.action && !cu.traits.includes('anti2')) return false;
  if (t.req && !t.req.some(r => cu.traits.includes(r))) return false;
  return free || s.points >= traitCost(s, id);
}
export function traitCost(s, id) {
  const t = traitDefs(s)[id];
  return t.action ? t.cost + 6 * s.probeUses : t.cost;
}
export function buyTrait(s, id) {
  if (!canBuy(s, id)) return false;
  const t = traitDefs(s)[id];
  s.points -= traitCost(s, id);
  if (t.action) { s.probeUses++; s.cure = Math.max(0, s.cure - 6); emit(s, {t: 'probe'}); return true; }
  s.cultures[0].traits.push(id); refreshStats(s);
  return true;
}
export const DEVOLVE_COST = 2;
export function canDevolve(s, id) {
  const t = traitDefs(s)[id], tr = s.cultures[0].traits;
  if (!t?.devolve || !tr.includes(id) || s.points < DEVOLVE_COST) return false;
  // Impossible si un trait acheté n'a plus d'autre prérequis.
  return !tr.some(o => { const r = traitDefs(s)[o].req; return r && r.includes(id) && !r.some(x => x !== id && tr.includes(x)); });
}
export function devolve(s, id) {
  if (!canDevolve(s, id)) return false;
  s.points -= DEVOLVE_COST;
  s.cultures[0].traits = s.cultures[0].traits.filter(x => x !== id); refreshStats(s);
  return true;
}
// Choix d'un événement : effets immédiats ou temporaires.
export function canChoose(s, opt) { return !(opt.fx.pts < 0 && s.points < -opt.fx.pts); }
export function resolveEvent(s, choice) {
  const ev = s.pendingEvent; if (!ev) return false;
  const opt = FAMILIES[ev.family].options[choice];
  if (!opt || !canChoose(s, opt)) return false;
  const fx = opt.fx;
  if (fx.pts) { if (fx.pts > 0) gain(s, fx.pts); else s.points += fx.pts; }
  if (fx.alert) s.alert = Math.max(0, Math.min(100, s.alert + fx.alert));
  if (fx.cure && s.detected && !s.deploy) s.cure = Math.max(0, Math.min(99, s.cure + fx.cure));
  if (fx.grow) s.mods.push({id: 'ev', mods: {inf0: fx.grow[0]}, until: s.day + fx.grow[1]});
  if (fx.pow) s.mods.push({id: 'ev', mods: {pow0: fx.pow[0]}, until: s.day + fx.pow[1]});
  for (let n = 0; n < (fx.seed || 0); n++) {
    const ci = pickWeighted(s, GEO.map((g, i) => g.pop > 0 && !s.countries[i].inf[0] && !s.countries[i].car[0] && s.countries[i].nat > 0.2 ? Math.pow(g.pop, 0.3) : 0));
    if (ci >= 0) seed(s, ci, 0, arrivalFrac(ci) * 3);
  }
  s.pendingEvent = null; s.stats.events = (s.stats.events || 0) + 1;
  emit(s, {t: 'eventDone', family: ev.family, choice});
  return true;
}

export function collect(s, bubbleId) {
  const b = s.bubbles.find(x => x.id === bubbleId); if (!b) return null;
  s.bubbles = s.bubbles.filter(x => x !== b);
  s.stats.bubbles++;
  if (b.kind === 'cure') { s.cure = Math.max(0, s.cure - 1); gain(s, 1); }
  else gain(s, b.value);
  return b;
}
export function interceptable(s, v) { return v.kind === 'raid' && v.k > 0 && playerStats(s).customs > 0; }
export function intercept(s, vid) {
  const v = s.vehicles.find(x => x.id === vid);
  if (!v || !interceptable(s, v)) return false;
  s.vehicles = s.vehicles.filter(x => x !== v); s.stats.intercepted++; gain(s, 1);
  emit(s, {t: 'intercept', k: v.k, ci: v.to});
  return true;
}
export const OFFENSIVE_COST = 10, OFFENSIVE_COOLDOWN = 25;
export function canOffensive(s, k) {
  return !s.outcome && k > 0 && s.cultures[k].alive && s.points >= OFFENSIVE_COST && s.day >= s.offensiveReady
    && !s.vehicles.some(v => v.kind === 'raid' && v.k === 0);
}
export function offensive(s, k) {
  if (!canOffensive(s, k)) return false;
  s.points -= OFFENSIVE_COST; s.offensiveReady = s.day + OFFENSIVE_COOLDOWN;
  launchRaid(s, 0, s.cultures[k].home);
  return true;
}
