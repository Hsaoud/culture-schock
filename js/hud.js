// Interface en jeu : bandeau supérieur, barres mondiales, fiches, actualités, dialogues.
import * as S from './sim.js';
import {GEO} from './geo-data.js';
import {NATIONS} from './data/nations.js';
import {spriteCSS, spritePct, portraitRect, relicRect, cardRect} from './assets.js';
import {t, nat, flv, fxLabel, countryName, fmtPop, fmtNum} from './i18n.js';
import {padKey} from './input.js';

const $ = (sel, root = document) => root.querySelector(sel);
const pct = v => v >= 0.995 && v < 1 ? '99' : v > 0 && v < 0.005 ? '<1' : String(Math.round(v * 100));
const dec1 = v => fmtNum(v, {minimumFractionDigits: 1, maximumFractionDigits: 1});

function avatar(id, size, cls = '') {
  const r = size / 2 - 3, c = 2 * Math.PI * r;
  return `<div class="avatar ${cls}" style="width:${size}px;height:${size}px">
    <div class="face" style="${spritePct('champions', portraitRect(id))}"></div>
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle class="bg" cx="${size / 2}" cy="${size / 2}" r="${r}"/>
    <circle class="hp" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${NATIONS[id].color}" stroke-dasharray="${c}" stroke-dashoffset="0"/></svg></div>`;
}
function setRing(el, v) {
  const c = el.querySelector('.hp'); if (!c) return;
  c.style.strokeDashoffset = String(Number(c.getAttribute('stroke-dasharray')) * (1 - Math.max(0, Math.min(1, v))));
}

export class Hud {
  constructor(root, actions) {
    this.root = root; this.actions = actions; this.newsQueue = []; this.newsBusy = 0;
  }

  build(s) {
    const me = s.cultures[0], n = nat(me.id), f = flv(me.id);
    this.cur = f.currency.icon;
    // padKey : bouton de manette rappelé en surimpression quand une manette est utilisée.
    this.root.innerHTML = `
      <div class="top">
        <button class="me" data-act="home" style="--c:${n.color}" title="${t('hud.capital')} (H)" aria-label="${t('hud.capital')}">${avatar(me.id, 58)}
          <div class="who"><b>${n.name}</b><span>${n.leader}</span></div>${padKey('⧉')}</button>
        <div class="clock">${padKey('LB·RB')}<div class="day">${t('hud.day')}<b id="h-day">1</b></div>
          <div class="speeds">
            <button class="ibtn" data-speed="0" title="${t('hud.pause')}" aria-label="${t('hud.pause')}">❚❚</button>
            ${[1, 2, 3].map(v => `<button class="ibtn" data-speed="${v}" title="${t('hud.speed', {n: v})} (${v})" aria-label="${t('hud.speed', {n: v})}">${'▶'.repeat(v)}</button>`).join('')}
          </div></div>
        <div class="rivals">${s.cultures.slice(1).map((cu, i) => `
          <button class="rival" data-rival="${i + 1}" style="--c:${NATIONS[cu.id].color}" title="${nat(cu.id).name}" aria-label="${nat(cu.id).name}">
            ${avatar(cu.id, 50)}<span class="share" style="color:${NATIONS[cu.id].color}">0%</span><span class="sword emoji">⚔️</span></button>`).join('')}
        </div>
        <button class="ibtn" data-act="menu" title="${t('hud.menu')}" aria-label="${t('hud.menu')}">☰${padKey('☰')}</button>
      </div>
      <div class="zoomctl">${padKey('LT·RT')}
        <button class="ibtn" data-act="zin" title="${t('hud.zoomIn')}" aria-label="${t('hud.zoomIn')}">＋</button>
        <button class="ibtn" data-act="zout" title="${t('hud.zoomOut')}" aria-label="${t('hud.zoomOut')}">－</button>
        <button class="ibtn emoji" data-act="zreset" title="${t('hud.world')}" aria-label="${t('hud.world')}">🌍</button>
      </div>
      <div class="bottom">
        <div class="stats" title="${t('hud.stats')}">
          <div class="stat inf" title="${fxLabel('inf')}"><span class="emoji">📣</span><div class="sbar"><i id="h-inf"></i></div></div>
          <div class="stat vis" title="${fxLabel('vis')}"><span class="emoji">🐘</span><div class="sbar"><i id="h-vis"></i></div></div>
          <div class="stat car" title="${fxLabel('car')}"><span class="emoji">🎭</span><div class="sbar"><i id="h-car"></i></div></div>
        </div>
        <div class="world">
          <div class="wrow" title="${t('hud.worldPop')}"><span class="emoji">🌍</span><div class="wbar" id="h-world"></div><span class="pct" id="h-mine" style="color:${n.color}">0%</span></div>
          <div class="wrow cure hidden" id="h-cure" title="${t('hud.cure')}"><span class="emoji" id="h-cure-ico">🙈</span><div class="cbar"><i id="h-cure-bar"></i></div><span class="pct" id="h-cure-pct">—</span></div>
        </div>
        <div class="evo">
          <div class="dna" id="h-dna-box" title="${f.currency.name}"><span class="emoji">${f.currency.icon}</span><span id="h-dna">0</span></div>
          <button class="btn ${[...f.verb].length > 11 ? 'long' : ''}" id="h-evolve" data-act="evolve" title="${t('hud.evolve')}">${f.verb}${padKey('X')}</button>
        </div>
      </div>`;
    this.el = {
      day: $('#h-day', this.root), inf: $('#h-inf', this.root), vis: $('#h-vis', this.root), car: $('#h-car', this.root),
      world: $('#h-world', this.root), mine: $('#h-mine', this.root), cure: $('#h-cure', this.root), cureBar: $('#h-cure-bar', this.root),
      curePct: $('#h-cure-pct', this.root), cureIco: $('#h-cure-ico', this.root), dna: $('#h-dna', this.root), dnaBox: $('#h-dna-box', this.root),
      evolve: $('#h-evolve', this.root), me: $('.me .avatar', this.root),
      rivals: [...this.root.querySelectorAll('.rival')], speeds: [...this.root.querySelectorAll('[data-speed]')],
    };
    // Segments de la barre mondiale : vous (influencés, caricatures), rivaux, natifs.
    this.el.world.innerHTML = s.cultures.map((cu, k) => `<i style="background:${NATIONS[cu.id].color};width:0"></i><i class="car" style="background:${NATIONS[cu.id].color};filter:brightness(.7);width:0"></i>`).join('');
    this.root.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.speed) return this.actions.speed(Number(b.dataset.speed));
      if (b.dataset.rival) return this.actions.rival(Number(b.dataset.rival), b);
      this.actions[b.dataset.act]?.(b);
    };
    this.lastDna = s.points;
    this.update(s, 1);
  }

  update(s, speed) {
    const st = S.playerStats(s), sh = s._sh || S.worldShares(s), el = this.el;
    el.day.textContent = Math.floor(s.day) + 1;
    el.speeds.forEach(b => b.classList.toggle('on', Number(b.dataset.speed) === speed));
    el.inf.style.width = Math.min(100, st.inf / 16 * 100) + '%';
    el.vis.style.width = Math.min(100, st.visEff / 14 * 100) + '%';
    el.car.style.width = Math.min(100, st.car / 15 * 100) + '%';
    const segs = el.world.children;
    s.cultures.forEach((cu, k) => { segs[2 * k].style.width = sh.inf[k] * 100 + '%'; segs[2 * k + 1].style.width = sh.car[k] * 100 + '%'; });
    el.mine.textContent = pct(sh.inf[0] + sh.car[0]) + '%';
    // La Nuance (cherchée par les universités, puis diffusée)
    const cureState = s.deploy ? 'deploy' : s.detected ? 'on' : 'hidden';
    el.cure.className = 'wrow cure ' + cureState;
    if (s.deploy) { el.cureIco.textContent = '🧐'; el.cureBar.style.width = Math.min(100, s.deploy / 90 * 100) + '%'; el.curePct.textContent = '!!'; }
    else if (s.detected) { el.cureIco.textContent = '🧐'; el.cureBar.style.width = s.cure + '%'; el.curePct.textContent = Math.floor(s.cure) + '%'; }
    else { el.cureIco.textContent = '🙈'; el.cureBar.style.width = '0'; el.curePct.textContent = '👁️ ' + Math.round(s.alert) ; }
    // Idées reçues
    if (s.points !== this.lastDna) { el.dnaBox.classList.remove('bump'); void el.dnaBox.offsetWidth; el.dnaBox.classList.add('bump'); this.lastDna = s.points; }
    el.dna.textContent = s.points;
    const defs = S.traitDefs(s);
    el.evolve.classList.toggle('ready', Object.keys(defs).some(id => !defs[id].action && S.canBuy(s, id)));
    // Vous et vos rivaux
    setRing(el.me, S.homeShare(s, 0));
    el.me.classList.toggle('danger', s.homeDanger);
    this.root.classList.toggle('danger', s.homeDanger);
    el.rivals.forEach(b => {
      const k = Number(b.dataset.rival), cu = s.cultures[k];
      b.classList.toggle('dead', !cu.alive);
      setRing(b.querySelector('.avatar'), cu.alive ? S.homeShare(s, k) : 0);
      b.querySelector('.share').textContent = cu.alive ? pct(sh.inf[k] + sh.car[k]) + '%' : '✖';
      // Badge : ⚔️ vert si vous pouvez faire tomber sa capitale, 🛡️ sinon.
      const sw = b.querySelector('.sword'), win = cu.alive && S.power(s, 0, cu.home) > S.power(s, k, cu.home);
      sw.hidden = !cu.alive;
      sw.classList.toggle('win', win);
      if (sw.textContent !== (win ? '⚔️' : '🛡️')) sw.textContent = win ? '⚔️' : '🛡️';
    });
  }

  // --- Actualités ------------------------------------------------------------
  news(icon, text, {color, relic, big = false} = {}) {
    if (this.newsQueue.length > 3 && !big) return;
    this.newsQueue.push({icon, text, color, relic, big});
    this.pumpNews();
  }
  pumpNews() {
    if (this.newsBusy || !this.newsQueue.length) return;
    const n = this.newsQueue.shift(), box = $('#news');
    const el = document.createElement('div');
    el.className = 'headline' + (n.big ? ' big' : '');
    if (n.color) el.style.setProperty('--hl', n.color);
    el.innerHTML = (n.relic ? `<i class="relic" style="${spriteCSS('relics', relicRect(n.relic), 32)}"></i>` : '') + (n.icon ? `<span class="emoji">${n.icon}</span>` : '') + `<span>${n.text}</span>`;
    box.appendChild(el);
    this.newsBusy = 1;
    const stay = n.big ? 3600 : 2600;
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); this.newsBusy = 0; this.pumpNews(); }, this.newsQueue.length ? stay * 0.7 : stay);
  }

  // --- Dialogue d'un champion --------------------------------------------------
  say(id, text, ms = 4200) {
    const d = $('#dialog'), n = NATIONS[id];
    clearTimeout(this.sayTimer);
    d.hidden = false; d.classList.remove('out'); d.style.setProperty('--c', n.color);
    d.innerHTML = `<div class="portrait" style="${spritePct('champions', cardRect(id))}"></div><div class="bubble">${text}</div>`;
    d.style.animation = 'none'; void d.offsetWidth; d.style.animation = '';
    if (ms) this.sayTimer = setTimeout(() => this.hush(), ms);
  }
  hush() { const d = $('#dialog'); if (d.hidden) return; d.classList.add('out'); clearTimeout(this.sayTimer); this.sayTimer = setTimeout(() => { d.hidden = true; }, 300); }

  // --- Fiche pays -------------------------------------------------------------------
  card(s, ci, px, py) {
    const card = $('#card');
    if (ci < 0) { card.hidden = true; this.cardCi = -1; return; }
    this.cardCi = ci; this.cardPos = [px, py];
    card.hidden = false;
    this.fillCard(s);
    // Téléphone : fiche ancrée au-dessus du HUD bas, pour ne pas masquer le pays touché.
    const sheet = innerWidth <= 600;
    card.classList.toggle('sheet', sheet);
    if (sheet) { card.style.left = ''; card.style.top = ''; return; }
    const w = 250, h = card.offsetHeight;
    card.style.left = Math.max(8, Math.min(innerWidth - w - 8, px + 18)) + 'px';
    card.style.top = Math.max(80, Math.min(innerHeight - h - 150, py - h / 2)) + 'px';
  }
  fillCard(s) {
    const ci = this.cardCi; if (ci == null || ci < 0) return;
    const g = GEO[ci], c = s.countries[ci], card = $('#card');
    // La fiche est redessinée en continu : on garde le bouton focalisé (clavier, manette).
    const focused = card.contains(document.activeElement) ? (document.activeElement.hasAttribute('data-off') ? '[data-off]' : '[data-close-card]') : null;
    const bar = s.cultures.map((cu, k) => `<i style="background:${NATIONS[cu.id].color};width:${c.inf[k] * 100}%"></i><i class="car" style="background:${NATIONS[cu.id].color};filter:brightness(.7);width:${c.car[k] * 100}%"></i>`).join('');
    const chip = (title, body, cls = '', style = '') => `<span class="chip ${cls}" title="${title}" aria-label="${title}"${style ? ` style="${style}"` : ''}>${body}</span>`;
    const clim = g.climate === 'hot' ? ['☀️', 'card.hot'] : g.climate === 'cold' ? ['❄️', 'card.cold'] : ['🌤️', 'card.mild'];
    const icons = [];
    icons.push(chip(t(clim[1]), `<span class="emoji">${clim[0]}</span>`));
    icons.push(chip(t('card.wealth'), `<span class="emoji">${'💰'.repeat(g.wealth >= 1 ? 3 : g.wealth >= 0.7 ? 2 : 1)}</span>`));
    if (c.closed >= 1) icons.push(chip(t('card.airports'), '<span class="emoji">✈️</span>🚫', 'bad'));
    if (c.closed >= 2) icons.push(chip(t('card.ports'), '<span class="emoji">⚓</span>🚫', 'bad'));
    if (c.closed >= 3) icons.push(chip(t('card.borders'), '<span class="emoji">🚧</span>', 'bad'));
    if (S.isLab(s, ci)) icons.push(chip(t('card.university'), '<span class="emoji">🎓</span>'));
    const homeOf = s.cultures.findIndex(cu => cu.home === ci);
    if (homeOf >= 0) icons.push(chip(t('card.capital'), `<span class="emoji">🏰</span>${Math.round(S.homeShare(s, homeOf) * 100)}%`, '', `box-shadow:inset 0 0 0 2px ${NATIONS[s.cultures[homeOf].id].color}`));
    let extra = '';
    if (homeOf > 0 && s.cultures[homeOf].alive) extra = this.duel(s, homeOf);
    const mine = c.inf[0] + c.car[0];
    const html = `<button class="x" data-close-card title="${t('card.close')}" aria-label="${t('card.close')}">✕</button>
      <div class="card-h"><b>${countryName(ci)}</b><span>👥 ${fmtPop(g.pop)}</span></div>
      <div class="card-bar">${bar}</div>
      <div class="card-h"><span style="color:${NATIONS[s.nation].color};font-family:var(--display);font-size:16px">${pct(mine)}%</span><span>${c.car[0] > 0.005 ? '🎭 ' + pct(c.car[0]) + '%' : ''}</span></div>
      <div class="card-icons">${icons.join('')}</div>${extra}`;
    // Inchangée : on ne touche pas au DOM (un toucher commencé sur un bouton doit aboutir).
    if (html === this.cardHtml && card.firstChild) return;
    this.cardHtml = html; card.innerHTML = html;
    card.querySelector('[data-off]')?.addEventListener('click', () => this.actions.offensive(homeOf));
    card.querySelector('[data-close-card]').addEventListener('click', () => this.closePopups());
    if (focused) (card.querySelector(focused) || card.querySelector('[data-close-card]')).focus();
  }
  duel(s, k) {
    const home = s.cultures[k].home, me = S.power(s, 0, home), them = S.power(s, k, home), max = Math.max(me, them) * 1.1;
    const ready = S.canOffensive(s, k), cd = Math.max(0, Math.ceil(s.offensiveReady - s.day));
    const why = s.vehicles.some(v => v.kind === 'raid' && v.k === 0) ? '✈️' : cd ? `⏳ ${t('unit.days', {n: cd})}` : s.points < S.OFFENSIVE_COST ? `${this.cur} ${S.OFFENSIVE_COST}` : '';
    return `<div class="duel">
      <div class="row" title="${t('duel.attack')}"><span class="emoji">⚔️</span><div class="sbar"><i style="width:${me / max * 100}%;background:${NATIONS[s.nation].color}"></i></div><span>${dec1(me)}</span></div>
      <div class="row" title="${t('duel.defense')}"><span class="emoji">🛡️</span><div class="sbar"><i style="width:${them / max * 100}%;background:${NATIONS[s.cultures[k].id].color}"></i></div><span>${dec1(them)}</span></div></div>
      <button class="btn ${me > them ? '' : 'red'}" data-off ${ready ? '' : 'disabled'}>⚔️ ${t('duel.offensive')} ${ready ? '· ' + this.cur + ' ' + S.OFFENSIVE_COST : why}</button>`;
  }

  // --- Fiche rival (clic sur un portrait) ----------------------------------------------
  rivalPop(s, k, anchor) {
    const pop = $('#pop');
    if (k == null || (this.popK === k && !pop.hidden)) { pop.hidden = true; this.popK = null; return; }
    this.popK = k; pop.hidden = false;
    this.fillPop(s);
    const r = anchor.getBoundingClientRect();
    pop.style.left = Math.max(8, Math.min(innerWidth - 258, r.left + r.width / 2 - 125)) + 'px';
    pop.style.top = r.bottom + 10 + 'px';
  }
  fillPop(s) {
    const k = this.popK; if (k == null) return;
    const cu = s.cultures[k], n = nat(cu.id), pop = $('#pop'), sh = s._sh || S.worldShares(s);
    const focused = pop.contains(document.activeElement) ? (document.activeElement.hasAttribute('data-off') ? '[data-off]' : '[data-locate]') : null;
    pop.style.setProperty('--c', n.color);
    const html = `<div class="pop-h">${avatar(cu.id, 64)}<div><b>${n.name}</b><span>${n.leader}</span></div></div>
      <div class="card-icons" style="margin-top:10px">
        <span class="chip" title="${t('pop.world')}"><span class="emoji">🌍</span>${pct(sh.inf[k] + sh.car[k])}%</span>
        <span class="chip" title="${t('card.capital')}"><span class="emoji">🏰</span>${cu.alive ? Math.round(S.homeShare(s, k) * 100) + '%' : '✖'}</span>
        <span class="chip" title="${fxLabel('inf')}"><span class="emoji">📣</span>${dec1(cu.s.inf)}</span>
      </div>${cu.alive ? this.duel(s, k) : ''}
      <button class="btn ghost" data-locate style="margin-top:8px">📍 ${t('pop.capital')}</button>`;
    if (html === this.popHtml && pop.firstChild) return;
    this.popHtml = html; pop.innerHTML = html;
    setRing(pop.querySelector('.avatar'), cu.alive ? S.homeShare(s, k) : 0);
    pop.querySelector('[data-off]')?.addEventListener('click', () => this.actions.offensive(k));
    pop.querySelector('[data-locate]').addEventListener('click', () => this.actions.locate(cu.home));
    if (focused) (pop.querySelector(focused) || pop.querySelector('[data-locate]')).focus();
  }
  closePopups() { $('#pop').hidden = true; this.popK = null; $('#card').hidden = true; this.cardCi = -1; this.cardHtml = this.popHtml = null; }
}
