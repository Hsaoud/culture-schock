// Point d'entrée : écrans, boucle de jeu, entrées et mise en scène des événements.
import * as S from './sim.js';
import {GEO} from './geo-data.js';
import {NATIONS} from './data/nations.js';
import {loadArt, eventCover} from './assets.js';
import {Ticker} from './ticker.js';
import {MapView} from './map.js';
import {Hud} from './hud.js';
import {Evolve} from './evolve.js';
import {Tutorial} from './tutorial.js';
import * as Screens from './screens.js';
import {sfx, unlockAudio, startMusic, stopMusic} from './audio.js';
import {saveGame, loadGame, hasSave, clearSave, recordWin, progress} from './store.js';
import {t, nat, flv, countryName, traitName, worldText, eventCard, lower, exclaim, fmtPct, languageInfo,
  setLanguage, storedLanguage, suggestLanguage, onLanguageChange} from './i18n.js';
import {Gamepad, moveFocus, sendKey, trackInputMode, padKey} from './input.js';
import {initFullscreen, syncFullscreen} from './fullscreen.js';

const $ = id => document.getElementById(id);
const app = {mode: 'boot', s: null, speed: 1, lastSpeed: 1, hold: 0, uiT: 0, saveT: 0, ending: false};
const FAMOUS = new Set(['MG', 'GL', 'IS', 'NZ', 'KP', 'AU', 'JP']);
const color = k => NATIONS[app.s.cultures[k].id].color;

// --- Démarrage ---------------------------------------------------------------
async function boot() {
  trackInputMode();
  initFullscreen();
  hideHostBadge();
  await loadArt(p => { $('load').style.width = p * 100 + '%'; });
  app.map = new MapView($('map'));
  app.hud = new Hud($('hud'), hudActions);
  app.ticker = new Ticker($('ticker'));
  app.evo = new Evolve($('evolve'), onEvolve);
  app.pad = new Gamepad(padActions);
  app.map.onBubble = clickBubble;
  app.map.onRaid = clickRaid;
  app.map.onSelect = (ci, px, py) => { if (app.mode !== 'game') return; app.hud.rivalPop(null); if (ci >= 0) sfx.click(); app.hud.card(app.s, ci, px, py); };
  addEventListener('resize', layout);
  addEventListener('keydown', onKey);
  addEventListener('keydown', onNavKey);
  addEventListener('pointerdown', unlockAudio, {once: false});
  document.addEventListener('visibilitychange', () => { if (document.hidden && app.mode === 'game') setSpeed(0); });
  addEventListener('beforeunload', () => { if (app.mode === 'game' && !app.ending) saveGame(app.s); });
  onLanguageChange(relabel);
  onLanguageChange(syncFullscreen);
  // Première ouverture : choix de la langue, suggérée d'après le navigateur.
  if (storedLanguage()) title(); else chooseLanguage(null);
  requestAnimationFrame(loop);
}

// back absent : premier lancement, le choix est obligatoire.
function chooseLanguage(back) {
  Screens.showLanguage({
    suggested: suggestLanguage(),
    onPick: id => { setLanguage(id); (back || title)(); },
    onBack: back,
  });
}

// La langue change sans relancer la partie : interface reconstruite, état conservé.
function relabel() {
  const s = app.s;
  if (!s || !app.hud.el) return;
  app.hud.closePopups();
  app.hud.build(s); app.hud.update(s, app.speed);
  app.ticker.setup(s);
  app.evo.relabel();
  if (app.eventShown) showEvent(s);
  app.tut?.refresh();
  layout();
}

function title() {
  app.mode = 'title'; app.s = null; $('hud').hidden = true;
  setTheme(null);
  closeTransient();
  stopMusic();
  Screens.showTitle({
    canContinue: hasSave(),
    onPlay: () => { unlockAudio(); select(); },
    onContinue: () => { unlockAudio(); const s = loadGame(); if (s) { S.refreshStats(s); startGame(s.nation, s); } else select(); },
    onHelp: () => Screens.showHelp(title),
    onLanguage: () => chooseLanguage(title),
  });
}
function select() {
  app.mode = 'select';
  Screens.showSelect({onPick: id => startGame(id), onBack: title});
}

function startGame(id, saved = null) {
  clearSave();
  app.tut?.destroy(); app.tut = null;
  const s = saved || S.createGame(id);
  app.s = s; app.ending = false; app.mode = 'game';
  s._sh = S.worldShares(s);
  Screens.clearScreen();
  $('hud').hidden = false;
  app.hud.build(s);
  setTheme(id);
  layout();
  closeTransient();
  const home = s.cultures[0].home, n = nat(id);
  app.map.selected = -1; app.map.highlight = null; app.map.invalidate();
  app.map.cam = {x: 540, y: 262, z: 1};
  app.map.focusCountry(home, saved ? 2 : 2.6, 1.8);
  setSpeed(0); app.lastSpeed = 1;
  if (!saved) {
    app.hud.news('', flv(id).operation, {relic: id, color: n.color, big: true});
    if (n.tutorial && !progress().wins[id]) app.tut = new Tutorial(app.hud, tutRect);
    else app.hud.say(id, n.quotes[0]);
  }
  app.hold = saved ? 0.4 : 2.2; // laisse la caméra se poser
  startMusic('calm', id);
  cursor.x = innerWidth / 2; cursor.y = innerHeight / 2;
}

// Habillage aux couleurs de la nation : motifs, accents, bandeau d'info, bulles.
function setTheme(id) {
  document.body.classList.remove(...[...document.body.classList].filter(c => c.startsWith('nation-')));
  if (id) document.body.classList.add('nation-' + id);
  document.body.style.setProperty('--accent', id ? NATIONS[id].color : '');
  $('ticker').hidden = !id; $('event').hidden = true; app.eventShown = false;
  if (id) { app.ticker.setup(app.s); app.map.currency = flv(id).currency.icon; }
}

function layout() {
  if (!app.map) return;
  const top = document.querySelector('#hud .top'), bottom = document.querySelector('#hud .bottom');
  if ((app.mode === 'game' || app.mode === 'pause') && top && bottom) {
    const tp = top.getBoundingClientRect().bottom + 4, b = innerHeight - bottom.getBoundingClientRect().top + 4;
    document.documentElement.style.setProperty('--hud-top', tp + 'px');
    document.documentElement.style.setProperty('--hud-bottom', b + 'px');
    app.map.setInsets(tp, b);
  } else app.map.resize();
  // Rotation d'un téléphone : le nid d'abeilles se recalcule à la nouvelle taille.
  if (app.evo?.open) app.evo.render();
}

// --- Boucle -------------------------------------------------------------------
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  app.pad.poll(now, dt);
  const s = app.s;
  if (app.mode === 'game' && s) {
    if (app.hold > 0) { app.hold -= dt; if (app.hold <= 0 && !app.tut) setSpeed(app.lastSpeed || 1); }
    if (s.pendingEvent && !app.eventShown && !app.evo.open && !app.tut?.pausing && !app.ending && app.hold <= 0) showEvent(s);
    const paused = app.speed === 0 || app.evo.open || app.tut?.pausing || app.ending || !!s.pendingEvent;
    if (!paused) { S.advance(s, dt / S.SPEEDS[app.speed]); S.tickReal(s, dt); }
    drainEvents(s);
    app.uiT -= dt;
    if (app.uiT <= 0) {
      app.uiT = 0.2;
      s._sh = S.worldShares(s);
      app.hud.update(s, app.speed);
      app.hud.fillCard(s); app.hud.fillPop(s);
      app.evo.refresh();
    }
    app.tut?.update(s, dt, {evolveOpen: app.evo.open, speed: app.speed, spawnBubble});
    app.saveT += dt;
    if (app.saveT > 20 && !app.ending) { app.saveT = 0; saveGame(s); }
  }
  if (app.s && (app.mode === 'game' || app.mode === 'pause')) app.ticker.update(dt);
  // Carte entièrement couverte (menus, atelier, affaire) : inutile de la redessiner.
  if (!overlay()) { app.map.render(app.mode === 'game' ? s : null, dt); adaptQuality(dt); }
  updateCursor(dt);
  requestAnimationFrame(loop);
}

// Qualité adaptative : si les images ralentissent durablement (écran très grand, appareil modeste),
// la carte est rendue un peu moins finement ; une seule tentative de retour en pleine définition.
const perf = {avg: 16, slow: 0, fast: 0, retried: false};
function adaptQuality(dt) {
  if (dt > 0.1 || document.hidden) return; // onglet en arrière-plan ou pause du navigateur
  const m = app.map, ms = dt * 1000;
  perf.avg += (ms - perf.avg) * 0.05;
  if (perf.avg > 26 && m.quality > 0.55) {
    if ((perf.slow += dt) > 2) { m.setQuality(m.quality - 0.15); layout(); perf.slow = 0; perf.avg = 16; perf.fast = 0; }
  } else perf.slow = 0;
  if (perf.avg < 18 && m.quality < 1 && !perf.retried) {
    if ((perf.fast += dt) > 20) { perf.retried = true; m.setQuality(m.quality + 0.15); layout(); perf.fast = 0; }
  } else perf.fast = 0;
}

// Badge « Powered by Netlify » ajouté par l'hébergeur : il cache le coin bas droit du jeu (bouton
// principal, bandeau). Masqué s'il est présent ou inséré plus tard, en n'observant que les enfants
// directs de <body> (là où il est ajouté), comme pour 1001-maze ; la règle CSS de index.html suffit
// d'ordinaire, ceci la double si la page est servie sans elle.
function hideHostBadge() {
  const hide = () => document.querySelectorAll('#nl-badge-frame, iframe[title="Powered by Netlify"]').forEach(f => f.style.setProperty('display', 'none', 'important'));
  new MutationObserver(hide).observe(document.body, {childList: true});
  hide();
}

function setSpeed(v) {
  if (app.mode !== 'game') return;
  if (v > 0) app.lastSpeed = v;
  app.speed = v;
  app.hud.update(app.s, v);
}

// --- Événements de la simulation ------------------------------------------------
function drainEvents(s) {
  if (!s.events.length) return;
  const evs = s.events.splice(0);
  const me = nat(s.nation);
  for (const e of evs) {
    switch (e.t) {
      case 'arrive':
        app.map.ripple(e.ci, color(e.k), e.k === 0);
        if (e.k === 0) sfx.arrive();
        break;
      case 'land': if (e.k === 0) app.map.ripple(e.to, color(0)); break;
      case 'net': if (e.k === 0) { app.map.ripple(e.ci, color(0), true); app.map.floatText(GEO[e.ci].x, GEO[e.ci].y, '📱', '#fff', 16); } break;
      case 'new': {
        const g = GEO[e.ci], name = countryName(e.ci);
        app.map.flash(e.ci, color(0)); sfx.newCountry();
        // Nom flottant seulement pour les pays notables, sans surcharger la carte.
        if (g.pop >= 10 && performance.now() - (app.lastName || 0) > 700) { app.lastName = performance.now(); app.map.floatText(g.x, g.y - 6, name, '#fff', 12); }
        if (g.pop >= 100) app.hud.news('', t('news.adopt', {country: name}), {relic: s.nation, color: me.color});
        if (g.pop >= 15) app.ticker.push(cur(), t('tk.adopt', {country: name}), true);
        break;
      }
      case 'blocked': if (Math.random() < 0.5) app.map.cross(e.ci); break;
      case 'detected':
        app.hud.news('🎓', t('news.detected'), {big: true, color: '#3aa0ff'});
        app.ticker.push('🎓', t('tk.detected', {nation: me.name}), true);
        if (!app.tut) app.hud.say(s.nation, me.quotes[2]);
        sfx.alarm(); app.pad.rumble(0.3, 0.5, 200);
        break;
      case 'close': {
        const g = GEO[e.ci];
        app.map.flash(e.ci, '#ff4646');
        const closure = t('news.close' + e.level, {country: countryName(e.ci)}), ico = ['✈️', '⚓', '🚧'][e.level - 1];
        if (g.pop >= 40 || FAMOUS.has(g.id)) app.hud.news(ico + '🚫', closure, {color: '#ff4646'});
        if (g.pop >= 5 || FAMOUS.has(g.id)) app.ticker.push(ico, t('tk.close', {closure}), true);
        break;
      }
      case 'cure': app.hud.news('🧐', t('news.cure', {pct: e.pct}), {color: '#3aa0ff'}); app.ticker.push('🧐', t('tk.cure', {pct: e.pct}), true); sfx.news(); break;
      case 'deploy':
        app.hud.news('🧐', t('news.deploy'), {big: true, color: '#ff4646'});
        flash('#ff2a2a'); sfx.doom(); startMusic('tense', s.nation); app.pad.rumble(0.7, 0.9, 400);
        app.ticker.push('🧐', t('tk.deploy'), true);
        app.hud.say(s.nation, me.quotes[2]);
        break;
      case 'raid': {
        const atk = nat(s.cultures[e.k].id), to = countryName(e.to);
        if (e.k === 0) { sfx.launch(); app.hud.news('⚔️', t('news.raidSent', {country: to}), {color: me.color, relic: s.nation}); break; }
        const onHome = e.to === s.cultures[0].home;
        app.hud.news(onHome ? '⚠️' : '⚔️', t('news.raid', {nation: atk.name, country: to}), {relic: atk.id, color: atk.color, big: onHome});
        app.ticker.push('⚔️', t('tk.raid', {leader: atk.leader, country: to}), true);
        if (onHome) { sfx.alarm(); app.map.shake(6); app.pad.rumble(0.4, 0.6, 250); }
        break;
      }
      case 'raidHit': {
        const home = e.ci === s.cultures[0].home;
        app.map.ripple(e.ci, color(e.k), true); app.map.ripple(e.ci, color(e.k), true);
        app.map.shake(home ? 12 : 5); sfx.impact();
        if (home || e.k === 0) app.pad.rumble(home ? 0.8 : 0.3, home ? 1 : 0.5, home ? 350 : 150);
        break;
      }
      case 'intercept': app.hud.news('🛃', t('news.intercept'), {color: '#5dff9b'}); app.ticker.push('🛃', t('tk.intercept', {nation: nat(s.cultures[e.k].id).name}), true); break;
      case 'fall': {
        if (e.k === 0) break;
        const fallen = s.cultures[e.k], fn = nat(fallen.id);
        app.map.shockwave(fallen.home, fn.color);
        flash(fn.color); sfx.fanfare(); app.pad.rumble(0.6, 0.8, 500);
        Screens.fallCard(fallen.id, e.by === 0 ? t('fall.byYou', {nation: fn.name}) : t('fall.other', {nation: fn.name}));
        app.ticker.push('💥', t('tk.fall', {leader: fn.leader, emblem: fn.emblem}), true);
        if (e.by === 0) setTimeout(() => app.hud.say(s.nation, me.quotes[3]), 2600);
        break;
      }
      case 'danger':
        if (e.on) { app.hud.news('🏰', t('news.danger'), {big: true, color: '#ff4646'}); app.ticker.push('🏰', t('tk.danger', {nation: me.name}), true); sfx.alarm(); app.pad.rumble(0.5, 0.7, 300); if (!app.tut) app.hud.say(s.nation, me.quotes[2]); }
        else app.hud.news('🏰', t('news.safe'), {color: '#5dff9b'});
        break;
      case 'world': { const text = worldText(e.ev.id); app.hud.news(e.ev.icon, text, {color: '#ffcf5a'}); app.ticker.push(e.ev.icon, text, true); sfx.news(); break; }
      case 'mutation': {
        const tr = S.traitDefs(s)[e.id];
        app.hud.news('🎉', t('news.mutation', {trait: `${tr.icon} ${traitName(s.nation, e.id)}`}), {color: me.color}); sfx.buy();
        break;
      }
      case 'milestone': floatAtDna(`+${e.pts}`); sfx.pop(1); break;
      case 'probe': app.hud.news('🔥', t('news.probe'), {color: '#5dff9b'}); app.ticker.push('🔥', t('tk.probe'), true); break;
      case 'event': sfx.news(); break;
      case 'end': endGame(s); break;
    }
  }
}

const cur = () => flv(app.s.nation).currency.icon;

// --- Événements illustrés -----------------------------------------------------------
const sign = v => v > 0 ? '+' : '−';
const FX_CHIPS = {
  pts: (v, s) => [`${flv(s.nation).currency.icon} ${sign(v)}${Math.abs(v)}`, v > 0],
  alert: v => [`🐘 ${sign(v)}${Math.abs(v)}`, v < 0],
  cure: v => [`🧐 ${sign(v)}${fmtPct(Math.abs(v))}`, v < 0],
  grow: ([m, d]) => [`📣 +${fmtPct(Math.round((m - 1) * 100))} · ${t('unit.days', {n: d})}`, true],
  pow: ([m, d]) => [`⚔️ ${m > 1 ? '+' : '−'}${fmtPct(Math.round(Math.abs(m - 1) * 100))} · ${t('unit.days', {n: d})}`, m > 1],
  seed: v => [`✈️ ${t('unit.countries', {n: v})}`, true],
};
function showEvent(s) {
  const ev = s.pendingEvent, c = eventCard(s.nation, ev.family, ev.variant), el = $('event');
  app.eventShown = true; closeTransient();
  el.hidden = false;
  el.innerHTML = `<div class="event-card" role="dialog" aria-label="${c.title}">
    <div class="pic framed">${eventCover(s.nation, ev.family, ev.variant)}</div>
    <div class="body"><span class="fam"><span class="emoji">${c.icon}</span>${c.label}</span>
      <h2>${c.title}</h2><p>${c.line}</p>
      <div class="choices">${c.options.map((o, i) => `<button class="choice" data-i="${i}" ${S.canChoose(s, o) ? '' : 'disabled'}>
        <span class="emoji">${o.icon}</span><span><b>${o.label}</b><span class="fxs">${Object.entries(o.fx).map(([k, v]) => {
          const [txt, good] = FX_CHIPS[k](v, s); return `<span class="chip ${good ? 'good' : 'bad'}">${txt}</span>`;
        }).join('')}</span></span><kbd class="key choice-key" aria-hidden="true">${i + 1}</kbd>${padKey('A')}</button>`).join('')}</div></div></div>`;
  el.querySelectorAll('.choice').forEach(b => b.onclick = () => chooseEvent(Number(b.dataset.i)));
  requestAnimationFrame(() => el.querySelector('.choice:not(:disabled)')?.focus({preventScroll: true}));
  sfx.whoosh();
}
function chooseEvent(i) {
  const s = app.s, ev = s.pendingEvent; if (!ev) return;
  const c = eventCard(s.nation, ev.family, ev.variant), opt = c.options[i];
  if (!S.resolveEvent(s, i)) { sfx.deny(); return; }
  sfx.buy();
  $('event').hidden = true; app.eventShown = false;
  app.ticker.push(opt.icon, t('tk.choice', {title: c.title, nation: nat(s.nation).name, choice: lower(opt.label)}), true);
  if (opt.fx.pts) floatAtDna(`${sign(opt.fx.pts)}${Math.abs(opt.fx.pts)}`);
  app.hud.update(s, app.speed);
}

function floatAtDna(text) {
  const r = $('h-dna-box')?.getBoundingClientRect(); if (!r) return;
  app.map.floatScreen(r.left + r.width / 2, r.top - 4, text, '#ffcf5a', 22);
}
function flash(c) { const f = $('flash'); f.style.background = c; f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }

// --- Actions du joueur -------------------------------------------------------------
function clickBubble(b) {
  const s = app.s; if (!s || app.ending) return;
  const got = S.collect(s, b.id); if (!got) return;
  if (got.kind === 'cure') { app.map.burst(got.x, got.y, '#3aa0ff'); app.map.floatText(got.x, got.y - 10, '🧐 −1%', '#8fd3ff', 16); sfx.cure(); }
  else { app.map.burst(got.x, got.y, '#ffb02e'); app.map.floatText(got.x, got.y - 10, `+${got.value} ${cur()}`, '#ffd76a', 18); sfx.pop(got.value); }
  app.pad.rumble(0.05, 0.25, 60);
  app.hud.update(s, app.speed);
}
// Bulle du tutoriel : à l'écart de l'emblème de la capitale, déjà gonflée (le temps est figé).
function spawnBubble() {
  const s = app.s, ci = s.cultures[0].home, g = GEO[ci];
  s.bubbles.push({id: s.nextId++, kind: 'dna', ci, value: 6, x: g.x + 22, y: g.y + 4, life: 9999, age: 1});
}
let customsHint = 0;
function clickRaid(v) {
  const s = app.s;
  if (S.intercept(s, v.id)) {
    const c = app.map.curve(v), [x, y] = app.map.at(c, Math.min(1, v.t / v.dur));
    app.map.burst(x, y, color(v.k), 22); app.map.floatText(x, y - 10, '🛃', '#5dff9b', 20); sfx.block();
  } else {
    sfx.deny();
    if (performance.now() - customsHint > 6000) { customsHint = performance.now(); app.hud.news('🛃', t('news.customsHint', {trait: traitName(s.nation, 'customs')}), {color: '#ffcf5a'}); }
  }
}
function tutRect(kind) {
  const h = app.map.bubbleHits.find(x => kind === 'cure' ? x.b.kind === 'cure' : x.b.kind !== 'cure');
  return h ? {left: h.x - h.r, top: h.y - h.r, width: h.r * 2, height: h.r * 2} : null;
}

const hudActions = {
  speed: v => { sfx.click(); setSpeed(v); },
  home: () => { sfx.click(); app.map.focusCountry(app.s.cultures[0].home, 3); },
  menu: () => pauseMenu(),
  evolve: () => openEvolve(),
  zin: () => app.map.zoomAt(innerWidth / 2, innerHeight / 2, 1.5),
  zout: () => app.map.zoomAt(innerWidth / 2, innerHeight / 2, 1 / 1.5),
  zreset: () => app.map.resetView(),
  rival: (k, el) => { sfx.click(); app.hud.card(app.s, -1); app.hud.rivalPop(app.s, k, el); },
  offensive: k => {
    if (!S.offensive(app.s, k)) { sfx.deny(); return; }
    app.hud.closePopups();
    app.map.focusCountry(app.s.cultures[k].home, 2.2, 1.2);
  },
  locate: ci => { app.hud.closePopups(); app.map.focusCountry(ci, 3); app.map.selected = ci; },
};

function openEvolve(branch) {
  if (app.mode !== 'game' || app.ending) return;
  sfx.whoosh(); app.hud.closePopups(); app.evo.show(app.s, branch);
  requestAnimationFrame(() => $('evolve').querySelector('.hex.sel')?.focus({preventScroll: true}));
}
function onEvolve(kind, tr) {
  document.body.classList.toggle('evolving', app.evo.open);
  if (kind === 'open' && !app.tut) app.hud.hush();
  if (kind === 'buy' && tr) {
    app.hud.update(app.s, app.speed);
    app.pad.rumble(0.1, 0.3, 90);
    if (tr.branch === 'cliche' && !app.tut) app.hud.say(app.s.nation, exclaim(`${tr.icon} ${traitName(app.s.nation, tr.id)}`), 2200);
  }
}

function pauseMenu() {
  if (app.mode !== 'game' || app.ending) return;
  closeTransient();
  const before = app.speed || app.lastSpeed;
  setSpeed(0); app.mode = 'pause'; saveGame(app.s);
  const resume = () => { Screens.clearScreen(); app.mode = 'game'; setSpeed(before); };
  const back = () => { app.mode = 'game'; pauseMenu(); };
  Screens.showPause({
    onResume: resume,
    onRestart: () => { clearSave(); startGame(app.s.nation); },
    onQuit: () => { saveGame(app.s); title(); },
    onHelp: () => Screens.showHelp(back, app.s.nation),
    onLanguage: () => chooseLanguage(back),
  });
}

function closeTransient() {
  app.evo?.hide(); app.hud?.closePopups(); app.hud?.hush();
}

function endGame(s) {
  if (app.ending) return;
  app.ending = true;
  const out = s.outcome;
  clearSave(); closeTransient();
  app.tut?.destroy(); app.tut = null;
  let unlocked = null;
  if (out.win) { unlocked = recordWin(s.nation); sfx.fanfare(); flash(NATIONS[s.nation].color); app.map.resetView(2); app.pad.rumble(0.5, 1, 600); }
  else { sfx.doom(); flash('#000'); app.pad.rumble(1, 1, 700); }
  stopMusic();
  setTimeout(() => {
    app.mode = 'end'; $('hud').hidden = true; $('ticker').hidden = true;
    Screens.showEnd(s, out, unlocked, {
      onRetry: () => startGame(s.nation),
      onMenu: title,
      onNext: id => startGame(id),
    });
  }, out.win ? 2600 : 2000);
}

function onKey(e) {
  if (e.defaultPrevented) return;
  if (app.mode === 'pause' && e.key === 'Escape') { if (document.querySelector('#screen .langs, #screen .help')) return; Screens.clearScreen(); app.mode = 'game'; setSpeed(app.lastSpeed); return; }
  if (app.mode !== 'game') return;
  if (e.key === 'Escape') {
    if (app.evo.open) return app.evo.hide();
    if (!$('pop').hidden || !$('card').hidden) return app.hud.closePopups();
    if (!$('event').hidden) return;
    return pauseMenu();
  }
  if (!$('event').hidden) { if (e.key === '1' || e.key === '2') chooseEvent(Number(e.key) - 1); return; }
  if (app.evo.open) {
    if (['1', '2', '3'].includes(e.key)) app.evo.show(app.s, ['spread', 'cliche', 'guard'][Number(e.key) - 1]);
    if (e.key.toLowerCase() === 'e') app.evo.hide();
    return;
  }
  if (e.code === 'Space') { e.preventDefault(); setSpeed(app.speed ? 0 : app.lastSpeed || 1); }
  else if (['1', '2', '3'].includes(e.key)) setSpeed(Number(e.key));
  else if (e.key.toLowerCase() === 'e') openEvolve();
  else if (e.key === '+' || e.key === '=') hudActions.zin();
  else if (e.key === '-') hudActions.zout();
  else if (e.key.toLowerCase() === 'h') hudActions.home();
}

// --- Navigation (flèches, croix de la manette) -----------------------------------------
// Couche active : écran, affaire, atelier ; sinon le HUD et ses fiches.
const overlay = () => $('screen').childElementCount ? $('screen') : !$('event').hidden ? $('event') : app.evo?.open ? $('evolve') : null;
const inHud = el => [$('hud'), $('card'), $('pop')].some(r => r.contains(el));
function onNavKey(e) {
  if (e.defaultPrevented || !e.key.startsWith('Arrow')) return;
  const dir = e.key.slice(5).toLowerCase(), layer = overlay();
  if (layer) { if (moveFocus(dir, [layer])) e.preventDefault(); return; }
  if (app.mode !== 'game') return;
  // Manette ou focus déjà dans le HUD : on parcourt les boutons depuis le curseur.
  if (e.fromPad || inHud(document.activeElement)) {
    if (moveFocus(dir, [$('card'), $('pop'), $('hud')], inHud(document.activeElement) ? null : [cursor.x, cursor.y])) e.preventDefault();
    return;
  }
  // Clavier : les flèches déplacent la carte.
  const step = 70 / app.map.scale, [dx, dy] = {left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1]}[dir];
  app.map.cam.x += dx * step; app.map.cam.y += dy * step; app.map.camAnim = null; app.map.clampCam();
  e.preventDefault();
}

// --- Manette : curseur de carte, raccourcis ------------------------------------------------
const cursor = {x: innerWidth / 2, y: innerHeight / 2, moved: 0};
const cursorEl = Object.assign(document.createElement('div'), {id: 'cursor', hidden: true, innerHTML: `<i></i>${padKey('A')}`});
document.body.appendChild(cursorEl);
const onMap = () => app.mode === 'game' && !app.ending && !overlay();
function updateCursor(dt) {
  const show = onMap() && document.body.classList.contains('pad') && !inHud(document.activeElement);
  cursorEl.hidden = !show;
  if (!show) return;
  // Aide à la visée : le curseur se colle à la bulle ou au convoi le plus proche quand on lâche le stick.
  cursor.moved -= dt;
  if (cursor.moved <= 0) {
    let best = null, bd = 46;
    for (const h of [...app.map.bubbleHits, ...app.map.raidHits]) { const d = Math.hypot(h.x - cursor.x, h.y - cursor.y); if (d < bd) { bd = d; best = h; } }
    if (best) { const k = Math.min(1, dt * 12); cursor.x += (best.x - cursor.x) * k; cursor.y += (best.y - cursor.y) * k; }
  }
  const target = app.map.pickBubble(cursor.x, cursor.y) || app.map.pickRaid(cursor.x, cursor.y);
  cursorEl.classList.toggle('lock', !!target);
  const ci = target ? -1 : app.map.pick(cursor.x, cursor.y);
  if (ci !== app.map.hover) app.map.hover = ci;
  cursorEl.style.transform = `translate3d(${cursor.x}px,${cursor.y}px,0)`;
}
function panMap(dx, dy) { const m = app.map; m.cam.x += dx / m.scale; m.cam.y += dy / m.scale; m.camAnim = null; m.clampCam(); }
// Saute à la bulle suivante (de la plus proche à la plus lointaine, en boucle).
function jumpBubble() {
  const hits = [...app.map.bubbleHits].sort((a, b) => Math.hypot(a.x - cursor.x, a.y - cursor.y) - Math.hypot(b.x - cursor.x, b.y - cursor.y));
  const next = hits.find(h => Math.hypot(h.x - cursor.x, h.y - cursor.y) > 14) || hits[0];
  if (!next) { sfx.deny(); return; }
  cursor.x = next.x; cursor.y = next.y; cursor.moved = 0.15; sfx.hover();
}
const padActions = {
  active: () => onMap() && !inHud(document.activeElement),
  navigate: dir => sendKey('Arrow' + dir[0].toUpperCase() + dir.slice(1)),
  confirm() {
    const a = document.activeElement, layer = overlay();
    if (a && a !== document.body && a.matches('button,[tabindex="0"]') && (layer ? layer.contains(a) : inHud(a))) return a.click();
    if (onMap()) app.map.click(cursor.x, cursor.y);
  },
  back() {
    if (onMap() && inHud(document.activeElement)) { document.activeElement.blur(); return; }
    sendKey('Escape');
  },
  menu() {
    if (app.mode === 'game' && !app.ending && $('event').hidden) { app.evo.hide(); pauseMenu(); }
    else if (app.mode === 'pause' && !document.querySelector('#screen .langs, #screen .help')) { Screens.clearScreen(); app.mode = 'game'; setSpeed(app.lastSpeed); }
    else sendKey('Escape');
  },
  evolve() { if (app.mode !== 'game' || !$('event').hidden) return; app.evo.open ? app.evo.hide() : openEvolve(); },
  jump() { if (app.evo.open) return app.evo.devolve(); if (onMap()) jumpBubble(); },
  shoulder(d) {
    if (app.evo.open) return app.evo.cycle(d);
    if (overlay()) return sendKey(d < 0 ? 'ArrowLeft' : 'ArrowRight');
    if (app.mode === 'game') { sfx.click(); setSpeed(Math.max(0, Math.min(3, app.speed + d))); }
  },
  view() { if (onMap()) hudActions.home(); },
  reset() { if (onMap()) hudActions.zreset(); },
  cursor(dx, dy, dt) {
    if (inHud(document.activeElement)) document.activeElement.blur();
    const sp = 820 * dt;
    cursor.x = Math.max(8, Math.min(innerWidth - 8, cursor.x + dx * sp));
    cursor.y = Math.max(8, Math.min(innerHeight - 8, cursor.y + dy * sp));
    cursor.moved = 0.25;
    // Bord de l'écran : la carte suit le curseur.
    const edge = 36, ex = cursor.x < edge ? -1 : cursor.x > innerWidth - edge ? 1 : 0, ey = cursor.y < edge ? -1 : cursor.y > innerHeight - edge ? 1 : 0;
    if (ex || ey) panMap(ex * 420 * dt, ey * 420 * dt);
  },
  pan(dx, dy, dt) { if (onMap()) panMap(dx * 640 * dt, dy * 640 * dt); },
  zoom(f) { if (onMap()) app.map.zoomAt(cursor.x, cursor.y, f); },
  connected(on) {
    if (on) { cursor.x = innerWidth / 2; cursor.y = innerHeight / 2; if (app.mode === 'game') app.hud.news('🎮', t('news.padOn'), {color: '#5dff9b'}); return; }
    document.body.classList.remove('pad');
    // Manette débranchée en pleine partie : on met en pause.
    if (app.mode === 'game' && !app.ending) { setSpeed(0); app.hud.news('🎮', t('news.padOff'), {color: '#ff4646'}); }
  },
};

// Accès de diagnostic : ?debug expose l'état dans la console.
if (new URLSearchParams(location.search).has('debug')) window.CS = {app, S, GEO, setLanguage, languageInfo};
boot();
