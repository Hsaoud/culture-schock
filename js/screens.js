// Écrans hors partie : langue, titre, choix de la nation, pause, aide, fin, chute d'une culture.
import {NATIONS, ORDER, SCENARIOS} from './data/nations.js';
import {spriteCSS, spritePct, relicRect, cardCover, eventCover, SHEETS} from './assets.js';
import {fullscreenButton, fullscreenIcon} from './fullscreen.js';
import {isUnlocked, progress} from './store.js';
import {sfx, audioPrefs, setAudio} from './audio.js';
import {t, tIn, nat, flv, endText, lower, quote, LANGUAGES, languageInfo, getLanguage} from './i18n.js';
import {padKey} from './input.js';

const screen = () => document.getElementById('screen');
const stars = n => '★'.repeat(n) + '☆'.repeat(4 - n);

function sparkles(host) {
  const cv = document.createElement('canvas'); cv.className = 'sparkles'; host.appendChild(cv);
  const g = cv.getContext('2d'), parts = [];
  let alive = true;
  const resize = () => { cv.width = innerWidth; cv.height = innerHeight; };
  resize(); addEventListener('resize', resize);
  for (let i = 0; i < 60; i++) parts.push({x: Math.random(), y: Math.random(), v: 0.02 + Math.random() * 0.05, r: 0.6 + Math.random() * 2.2, p: Math.random() * 6});
  const loop = time => {
    if (!alive || !cv.isConnected) { removeEventListener('resize', resize); return; }
    g.clearRect(0, 0, cv.width, cv.height);
    for (const p of parts) {
      p.y -= p.v / 60; if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      const a = 0.35 + 0.35 * Math.sin(time / 600 + p.p);
      g.fillStyle = `rgba(255,${190 + 40 * Math.sin(p.p)},110,${a})`;
      g.beginPath(); g.arc(p.x * cv.width + Math.sin(time / 1500 + p.p) * 20, p.y * cv.height, p.r, 0, Math.PI * 2); g.fill();
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return () => { alive = false; };
}

// Raccourcis propres à un écran : écoutés sur document, donc avant la navigation générale
// (window) ; retirés d'eux-mêmes quand l'écran disparaît.
function screenKeys(root, handler) {
  const key = e => { if (!root.isConnected) return document.removeEventListener('keydown', key); handler(e); };
  document.addEventListener('keydown', key);
}
// Focus initial (clavier, manette) ; sans effet visible à la souris ou au toucher.
function focusFirst(root, sel) { requestAnimationFrame(() => root.querySelector(sel)?.focus({preventScroll: true})); }

function audioButtons() {
  const p = audioPrefs();
  return `<button class="ibtn emoji ${p.sound ? 'on' : ''}" data-audio="sound" title="${t('audio.sound')}" aria-label="${t('audio.sound')}" aria-pressed="${p.sound}">🔊</button>
    <button class="ibtn emoji ${p.music ? 'on' : ''}" data-audio="music" title="${t('audio.music')}" aria-label="${t('audio.music')}" aria-pressed="${p.music}">🎵</button>`;
}
function bindAudio(root) {
  root.querySelectorAll('[data-audio]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.audio, on = !audioPrefs()[k]; setAudio(k, on); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); sfx.click();
  }));
}
// Bouton « Langue » des menus : emblème du pays de la langue courante.
function languageButton() {
  const l = languageInfo();
  return `<button class="btn ghost lang-btn" data-go="lang" title="${l.name} · ${l.region}">🌐 ${t('lang.button')} · <i class="lrelic" style="${spritePct('relics', relicRect(l.nation))}"></i>${l.name}</button>`;
}

// --- Langue ----------------------------------------------------------------------------
// Chaque nation propose sa langue. Premier lancement : choix obligatoire (onBack absent).
export function showLanguage({onPick, onBack, suggested}) {
  const el = screen(), current = onBack ? getLanguage() : suggested;
  let sel = Math.max(0, LANGUAGES.findIndex(l => l.id === current));
  el.innerHTML = `<div class="langs">
    <header>${onBack ? `<button class="ibtn" data-back>←${padKey('B')}</button>` : '<div style="width:44px"></div>'}<h2></h2><div style="width:44px"></div></header>
    <p class="sub"></p>
    <div class="lgrid">${LANGUAGES.map((l, i) => `<button class="lcard" data-i="${i}" lang="${l.id}" style="--c:${NATIONS[l.nation].color}">
      <span class="lart framed">${cardCover(l.nation)}</span>
      <span class="ltxt"><b>${l.name}</b><small>${l.region}</small></span>
      <i class="lrelic" style="${spritePct('relics', relicRect(l.nation))}"></i>
      ${l.id === (onBack ? getLanguage() : suggested) ? `<em class="ltag">${tIn(l.id, onBack ? 'lang.current' : 'lang.suggested')}</em>` : ''}</button>`).join('')}</div>
    <div class="row"><button class="btn big" data-go></button></div></div>`;
  const cards = [...el.querySelectorAll('.lcard')];
  // Le titre et le bouton s'affichent dans la langue survolée : on lit ce qu'on choisit.
  const render = () => {
    const id = LANGUAGES[sel].id;
    cards.forEach((c, i) => { c.classList.toggle('sel', i === sel); c.setAttribute('aria-pressed', i === sel); });
    el.querySelector('h2').textContent = tIn(id, 'lang.title');
    el.querySelector('.sub').textContent = tIn(id, 'lang.sub');
    el.querySelector('[data-go]').innerHTML = `${tIn(id, 'lang.confirm')}${padKey('A')}`;
    el.querySelector('.langs').lang = id;
    const back = el.querySelector('[data-back]');
    if (back) back.setAttribute('aria-label', tIn(id, 'select.back'));
  };
  const choose = () => { sfx.click(); onPick(LANGUAGES[sel].id); };
  cards.forEach((c, i) => {
    c.onclick = e => { if (sel === i && e.detail !== 1) return choose(); sel = i; sfx.click(); render(); };
    c.ondblclick = choose;
    const pick = () => { if (sel !== i) { sel = i; sfx.hover(); render(); } };
    c.onfocus = pick; c.addEventListener('navfocus', pick);
  });
  el.querySelector('[data-go]').onclick = choose;
  el.querySelector('[data-back]')?.addEventListener('click', () => { sfx.click(); onBack(); });
  screenKeys(el.querySelector('.langs'), e => {
    if (e.key === 'Escape' && onBack) { e.preventDefault(); onBack(); }
  });
  render();
  requestAnimationFrame(() => cards[sel].focus({preventScroll: true}));
}

export function showTitle({onPlay, onContinue, onHelp, onLanguage, canContinue}) {
  const el = screen();
  el.innerHTML = `<div class="title">
    <div class="art-fill" style="background-image:url('${SHEETS.sanctuary.src}')"></div>
    <div class="art" style="background-image:url('${SHEETS.sanctuary.src}')"></div>
    <div class="center">
      <div class="tag">${t('title.tag')}</div>
      <div class="logo">CULTURE<b>SHOCK</b></div>
      <div class="sub">${t('title.sub')}</div>
      <div class="menu-col">
        ${canContinue ? `<button class="btn big cyan" data-go="continue">▶ ${t('title.continue')}</button>` : ''}
        <button class="btn big" data-go="play">${t('title.play')}</button>
        <button class="btn ghost" data-go="help">❔ ${t('title.help')}</button>
        ${languageButton()}
      </div>
      <div class="inputs">⌨️ 🎮 👆 · ${t('title.inputs')}</div>
    </div>
    <div class="corner">${fullscreenButton()}${audioButtons()}</div>
    <div class="credit">${t('title.credit')}</div>
  </div>`;
  sparkles(el.querySelector('.title'));
  bindAudio(el);
  el.querySelector('[data-go="play"]').onclick = () => { sfx.click(); onPlay(); };
  el.querySelector('[data-go="help"]').onclick = () => { sfx.click(); onHelp(); };
  el.querySelector('[data-go="lang"]').onclick = () => { sfx.click(); onLanguage(); };
  el.querySelector('[data-go="continue"]')?.addEventListener('click', () => { sfx.click(); onContinue(); });
  focusFirst(el, '.menu-col .btn');
}

export function showSelect({onPick, onBack}) {
  const el = screen();
  const firstLocked = ORDER.findIndex(id => !isUnlocked(id));
  let sel = Math.max(0, (firstLocked < 0 ? ORDER.length : firstLocked) - 1);
  const wins = progress().wins;
  el.innerHTML = `<div class="select">
    <header><button class="ibtn" data-back title="${t('select.back')}" aria-label="${t('select.back')}">←${padKey('B')}</button><h2>${t('select.title')}</h2><div style="width:44px"></div></header>
    <div class="cards">${ORDER.map((id, i) => {
      const n = nat(id), lock = !isUnlocked(id);
      return `<button class="ncard ${lock ? 'locked' : ''}" data-i="${i}" style="--c:${n.color}" aria-label="${n.name}">
        <div class="art framed">${cardCover(id)}</div><div class="shade"></div>
        ${n.tutorial ? `<div class="tuto">${t('select.tutorial')}</div>` : ''}
        <div class="nm">${n.name}</div><div class="stars">${stars(n.stars)}${wins[id] ? ' 🏆' : ''}</div>
        ${lock ? '<div class="lock emoji">🔒</div>' : ''}</button>`;
    }).join('')}</div>
    <div class="pick"></div></div>`;
  const pick = el.querySelector('.pick'), cards = [...el.querySelectorAll('.ncard')];
  const render = (scroll = true) => {
    const id = ORDER[sel], n = nat(id), f = flv(id), sc = SCENARIOS[id], lock = !isUnlocked(id);
    cards.forEach((c, i) => { c.classList.toggle('sel', i === sel); c.setAttribute('aria-pressed', i === sel); });
    // Téléphone : la rangée défile, la carte choisie reste au centre.
    if (scroll) cards[sel].scrollIntoView({inline: 'center', block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    pick.style.setProperty('--c', n.color);
    const prev = ORDER[ORDER.indexOf(id) - 1];
    pick.innerHTML = `<i class="relic" style="${spriteCSS('relics', relicRect(id), 92)}"></i>
      <div class="info">
        <div class="leader">${n.leader}</div>
        <div class="row"><span class="chip"><span class="emoji">${n.passive.icon}</span><b>${n.passive.name}</b>&nbsp;${n.passive.text}</span>
          <span class="chip" title="${t('select.resource')}"><span class="emoji">${f.currency.icon}</span>${f.currency.name}</span></div>
        <div class="row"><span class="chip" title="${t('select.rivals')}">${t('select.vs')}</span>${sc.rivals.map(r => `<span class="vs" title="${nat(r).name}"><i style="--c:${NATIONS[r].color};${spriteCSS('relics', relicRect(r), 34)}"></i></span>`).join('')}
          <span class="chip" style="color:var(--gold)">${stars(n.stars)}</span></div>
        ${lock && prev ? `<div class="row"><span class="chip">🔒 ${t('select.unlock', {nation: nat(prev).name})}</span></div>` : ''}
      </div>
      <button class="btn big" data-go ${lock ? 'disabled' : ''}>${lock ? '🔒' : t('select.play')}${padKey('A')}</button>`;
    pick.querySelector('[data-go]').onclick = () => { sfx.click(); onPick(id); };
  };
  cards.forEach((c, i) => {
    // Au clavier / à la manette, valider la carte choisie lance la partie.
    c.onclick = e => { if (e.detail === 0 && sel === i && isUnlocked(ORDER[i])) return onPick(ORDER[i]); sel = i; sfx.click(); render(e.detail === 0); };
    c.onmouseenter = () => sfx.hover();
    c.ondblclick = () => { if (isUnlocked(ORDER[sel])) onPick(ORDER[sel]); };
  });
  el.querySelector('[data-back]').onclick = () => { sfx.click(); onBack(); };
  const step = d => { sel = (sel + d + ORDER.length) % ORDER.length; render(); sfx.hover(); cards[sel].focus({preventScroll: true}); };
  screenKeys(el.querySelector('.select'), e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'Enter' && document.activeElement?.closest?.('.ncard') && isUnlocked(ORDER[sel])) { e.preventDefault(); onPick(ORDER[sel]); }
    else if (e.key === 'Escape') { e.preventDefault(); onBack(); }
  });
  render(false);
  requestAnimationFrame(() => { cards[sel].scrollIntoView({inline: 'center', block: 'nearest'}); cards[sel].focus({preventScroll: true}); });
}

export function showPause({onResume, onRestart, onQuit, onHelp, onLanguage}) {
  const el = screen();
  el.innerHTML = `<div class="modal"><div class="panel"><h2>${t('pause.title')}</h2><div class="col">
    <button class="btn big cyan" data-a="resume">▶ ${t('pause.resume')}${padKey('☰')}</button>
    <button class="btn ghost" data-a="help">❔ ${t('pause.legend')}</button>
    ${languageButton()}
    <button class="btn ghost" data-a="restart">↻ ${t('pause.restart')}</button>
    <button class="btn ghost" data-a="quit">⌂ ${t('pause.quit')}</button>
    <div style="display:flex;gap:10px;justify-content:center">${fullscreenButton()}${audioButtons()}</div></div></div></div>`;
  bindAudio(el);
  const map = {resume: onResume, restart: onRestart, quit: onQuit, help: onHelp};
  el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { sfx.click(); map[b.dataset.a](); });
  el.querySelector('[data-go="lang"]').onclick = () => { sfx.click(); onLanguage(); };
  focusFirst(el, '[data-a="resume"]');
}

// Glyphes visibles de l'aide (contrairement aux rappels padKey, toujours affichés).
const g = k => `<kbd class="glyph pk-${k.replace(/\W/g, '') || 'menu'}">${k}</kbd>`;
const k = s => `<kbd class="key">${s}</kbd>`;
export function showHelp(onClose, nationId) {
  const cur = nationId ? flv(nationId).currency : {icon: '💭', name: t('help.defaultCurrency')};
  const verb = flv(nationId || 'US').verb;
  const rows = [
    ['ctl.collect', `${k(t('key.click'))}`, g('A'), t('key.tap')],
    ['ctl.cursor', t('key.mouse'), t('key.stickL'), '—'],
    ['ctl.nextBubble', '—', g('Y'), '—'],
    ['ctl.pan', `${t('key.drag')} · ${k('←↑→↓')}`, t('key.stickR'), t('key.drag')],
    ['ctl.zoom', `${t('key.wheel')} · ${k('+')} ${k('−')}`, `${g('LT')} ${g('RT')}`, t('key.pinch')],
    ['ctl.speed', `${k(t('key.space'))} ${k('1')} ${k('2')} ${k('3')}`, `${g('LB')} ${g('RB')}`, '❚❚ ▶'],
    ['ctl.evolve', k('E'), g('X'), verb],
    ['ctl.home', k('H'), g('⧉'), t('key.portrait')],
    ['ctl.menu', k(t('key.esc')), `${g('☰')} ${g('B')}`, '☰'],
    ['ctl.navigate', `${k('←↑→↓')} ${k(t('key.enter'))}`, `${t('key.dpad')} · ${g('A')}`, t('key.tap')],
    ['fs.enter', k('F'), '—', `<span class="fs-glyph">${fullscreenIcon}</span>`],
  ];
  const el = screen();
  el.innerHTML = `<div class="modal"><div class="panel help"><h2>${t('help.title')}</h2>
    <div class="legend">
      <div><span class="sw" style="background:#3d8bff22"><svg width="34" height="20"><g fill="#3d8bff">${Array.from({length: 14}, (_, i) => `<rect x="${(i * 7) % 32 + 1}" y="${Math.floor(i / 5) * 6 + 2}" width="3" height="3"/>`).join('')}</g></svg></span>${t('help.fans')}</div>
      <div><span class="sw" style="background:repeating-linear-gradient(-45deg,#3d8bffcc 0 5px,#1d4a8acc 5px 8px)"></span>${t('help.caricatures')}</div>
      <div><span class="sw" style="border:2px dashed #ff4646"></span>${t('help.closed')}</div>
      <div><span class="sw emoji">🎓</span>${t('help.university')}</div>
      <div><span class="sw emoji" style="background:radial-gradient(#fff2b3,#ff9a1f);border-radius:50%">${cur.icon}</span>${t('help.bubble', {currency: lower(cur.name)})}</div>
      <div><span class="sw emoji" style="background:radial-gradient(#bfe8ff,#1f7cff);border-radius:50%">🎓</span>${t('help.cureBubble')}</div>
      <div><span class="sw emoji">🏰</span>${t('help.capital')}</div>
      <div><span class="sw emoji">⚔️</span>${t('help.power')}</div>
      <div><span class="sw emoji">📣</span>${t('help.inf')}</div>
      <div><span class="sw emoji">🐘</span>${t('help.vis')}</div>
      <div><span class="sw emoji">🎭</span>${t('help.car')}</div>
      <div><span class="sw emoji">🏆</span>${t('help.win')}</div>
    </div>
    <h3>${t('help.controls')}</h3>
    <table class="controls"><thead><tr><th>${t('ctl.action')}</th><th>⌨️ ${t('ctl.keyboard')}</th><th>🎮 ${t('ctl.pad')}</th><th>👆 ${t('ctl.touch')}</th></tr></thead>
      <tbody>${rows.map(([key, ...cells]) => `<tr><th>${t(key)}</th>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
    <button class="btn big" data-close>${t('help.ok')}${padKey('A')}</button></div></div>`;
  el.querySelector('[data-close]').onclick = () => { sfx.click(); onClose(); };
  screenKeys(el.querySelector('.modal'), e => { if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); onClose(); } });
  focusFirst(el, '[data-close]');
}

export function showEnd(s, {win, reason, by}, unlocked, {onRetry, onMenu, onNext}) {
  const el = screen(), id = s.nation, n = nat(id), f = flv(id);
  let [title, sub] = endText(reason in {mono: 1, cure: 1, home: 1, stale: 1} ? reason : 'cure');
  if (win) title = f.win; else if (reason === 'cure') sub = f.lose;
  const line = win ? n.quotes[3] : n.quotes[2];
  el.innerHTML = `<div class="end ${win ? 'win' : 'lose'}" style="--c:${n.color}">
    <div class="hero framed">${win ? eventCover(id, 'summit', Math.floor(Math.random() * 12)) : cardCover(id)}</div>
    <div class="res">
      <h1>${win ? t('end.win') : t('end.lose')}<br>${title}</h1>
      <div class="quote">${quote(line)}</div>
      <div class="sub" style="color:var(--muted)">${sub}${by != null && by >= 0 && reason === 'home' ? ' · ' + nat(s.cultures[by].id).name : ''}</div>
      <div class="tiles">
        <div class="tile"><span class="emoji">📅</span><b>${Math.floor(s.day)}</b>${t('end.days')}</div>
        <div class="tile"><span class="emoji">🌍</span><b>${Math.round(s.stats.peak * 100)}%</b>${t('end.peak')}</div>
        <div class="tile"><span class="emoji">⚔️</span><b>${s.stats.toppled}</b>${t('end.rivals')}</div>
        <div class="tile"><span class="emoji">🧐</span><b>${Math.floor(s.cure)}%</b>${t('end.nuance')}</div>
        <div class="tile"><span class="emoji">${f.currency.icon}</span><b>${s.stats.points}</b>${lower(f.currency.name)}</div>
        <div class="tile"><span class="emoji">🎴</span><b>${s.stats.events || 0}</b>${t('end.events')}</div>
      </div>
      ${unlocked ? `<div class="unlock"><i style="${spriteCSS('relics', relicRect(unlocked), 48)}"></i>🔓 ${t('end.new', {nation: nat(unlocked).name})}</div>` : ''}
      <div class="row">
        ${unlocked ? `<button class="btn big" data-a="next">${t('end.playNext', {nation: nat(unlocked).name})}</button>` : ''}
        <button class="btn ${unlocked ? 'ghost' : 'big'}" data-a="retry">↻ ${t('end.retry')}</button>
        <button class="btn ghost" data-a="menu">⌂ ${t('end.menu')}</button>
      </div>
    </div></div>`;
  const map = {retry: onRetry, menu: onMenu, next: () => onNext(unlocked)};
  el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { sfx.click(); map[b.dataset.a](); });
  focusFirst(el, '.row .btn');
}

// Carton plein écran quand une culture tombe.
export function fallCard(id, text, ms = 2600) {
  const n = NATIONS[id], el = document.createElement('div');
  el.className = 'fall-card'; el.style.setProperty('--c', n.color); el.style.zIndex = 45; el.style.position = 'fixed';
  el.innerHTML = `<div class="inner"><div class="pic framed">${eventCover(id, 'counter', Math.floor(Math.random() * 12))}</div><h2>${text}</h2></div>`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, ms);
}
export function clearScreen() { screen().innerHTML = ''; }
