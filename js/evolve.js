// Atelier d'évolution : trois branches en nid d'abeilles, fiche du trait sélectionné.
import * as S from './sim.js';
import {BRANCHES} from './data/traits.js';
import {IMG, spritePct} from './assets.js';
import {EMBLEMS} from './data/emblems.js';
import {sfx} from './audio.js';
import {t, flv, traitName, traitHint, branchName, fxLabel, fmtNum} from './i18n.js';
import {padKey} from './input.js';

const FX = {
  inf: ['📣', 'up'], vis: ['🐘', 'down'], car: ['🎭', 'purple'],
  air: ['✈️', 'up'], sea: ['🚢', 'up'], land: ['🚶', 'up'],
  hot: ['☀️', 'up'], cold: ['❄️', 'up'], rich: ['💰', 'up'], poor: ['🏚️', 'up'],
  clash: ['⚔️', 'up'], home: ['🏰', 'up'], anti: ['🧐', 'anti'], stealth: ['🕶️', 'up'],
  bypass: ['🚧', 'up'], net: ['📱', 'up'], customs: ['🛃', 'up'],
};
// Image peinte (assets/art/branches.png) si elle existe, sinon emblème vectoriel.
const emblem = (id, i) => IMG.branches?.naturalWidth
  ? `<i style="${spritePct('branches', [i * 512, 0, 512, 512])}"></i>` : EMBLEMS[id];

export class Evolve {
  constructor(root, onChange) {
    this.root = root; this.onChange = onChange; this.branch = 'spread'; this.sel = null;
    // Naviguer au clavier ou à la manette sur un hexagone suffit à le sélectionner.
    const pick = e => { const h = e.target.closest?.('[data-hex]'); if (h && h.dataset.hex !== this.sel) this.select(h.dataset.hex); };
    root.addEventListener('focusin', pick); root.addEventListener('navfocus', pick);
  }
  get open() { return !this.root.hidden; }

  show(s, branch) {
    this.s = s; if (branch) this.branch = branch;
    const cur = flv(s.nation).currency; this.cur = cur.icon;
    this.root.hidden = false;
    this.root.innerHTML = `
      <div class="evo-top">
        <button class="ibtn" data-close title="${t('evo.close')}" aria-label="${t('evo.close')}">✕${padKey('B')}</button>
        <div class="tabs" title="${t('evo.tabs')}">${padKey('LB·RB')}${BRANCHES.map((b, i) => `<button class="tab" data-tab="${b.id}" style="--tc:${b.color}" aria-label="${branchName(b.id)}">
          <span class="emblem">${emblem(b.id, i)}</span>
          <span class="tab-txt"><b>${branchName(b.id)}</b><small data-count></small></span><i class="badge" hidden></i></button>`).join('')}</div>
        <div class="evo-dna" title="${cur.name}"><span class="emoji">${cur.icon}</span><span data-dna>0</span></div>
      </div>
      <div class="evo-body"><div class="board"><svg></svg></div><div class="detail"></div></div>`;
    this.root.onclick = e => {
      const tg = e.target.closest('[data-tab],[data-close],[data-hex],[data-buy],[data-devolve]'); if (!tg) return;
      if (tg.dataset.close !== undefined) return this.hide();
      if (tg.dataset.tab) { sfx.click(); this.tab(tg.dataset.tab); return; }
      if (tg.dataset.hex) {
        // Clavier ou manette (clic sans pointeur) sur le trait déjà choisi : achat direct.
        if (e.detail === 0 && tg.dataset.hex === this.sel) return this.buy();
        sfx.click(); return this.select(tg.dataset.hex);
      }
      if (tg.dataset.buy !== undefined) return this.buy();
      if (tg.dataset.devolve !== undefined) return this.devolve();
    };
    this.render();
    this.onChange?.('open');
  }
  hide() { if (!this.open) return; this.root.hidden = true; this.root.innerHTML = ''; this.onChange?.('close'); }
  // Langue changée pendant l'atelier : même branche, même trait.
  relabel() { if (this.open) { const sel = this.sel; this.show(this.s); this.select(sel); } }

  tab(id) { this.branch = id; this.sel = null; this.render(true); }
  cycle(d) { const i = BRANCHES.findIndex(b => b.id === this.branch); sfx.click(); this.tab(BRANCHES[(i + d + BRANCHES.length) % BRANCHES.length].id); }
  select(id) {
    if (!id || !S.traitDefs(this.s)[id]) return;
    this.sel = id;
    this.root.querySelectorAll('.hex').forEach(h => h.classList.toggle('sel', h.dataset.hex === id));
    this.renderDetail();
  }

  traits() { return Object.values(S.traitDefs(this.s)).filter(tr => tr.branch === this.branch); }
  state(tr) {
    const owned = this.s.cultures[0].traits;
    if (!tr.action && owned.includes(tr.id)) return 'owned';
    if (tr.action ? !owned.includes('anti2') : tr.req && !tr.req.some(r => owned.includes(r))) return 'locked';
    return 'avail';
  }

  // focus : remettre le focus sur le trait choisi (navigation clavier / manette).
  render(focus = false) {
    const s = this.s, root = this.root, board = root.querySelector('.board');
    focus ||= root.contains(document.activeElement) && document.activeElement !== document.body;
    root.querySelector('[data-dna]').textContent = s.points;
    const defs = S.traitDefs(s);
    root.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('on', tab.dataset.tab === this.branch);
      const n = Object.values(defs).filter(tr => tr.branch === tab.dataset.tab && !tr.action && S.canBuy(s, tr.id)).length;
      const badge = tab.querySelector('.badge'); badge.hidden = !n; badge.textContent = n;
      const all = Object.values(defs).filter(tr => tr.branch === tab.dataset.tab && !tr.action);
      tab.querySelector('[data-count]').textContent = `${all.filter(tr => s.cultures[0].traits.includes(tr.id)).length} / ${all.length}`;
    });
    const br = BRANCHES.find(b => b.id === this.branch);
    board.style.setProperty('--tc', br.color); root.querySelector('.detail').style.setProperty('--tc', br.color);
    const list = this.traits();
    if (!this.sel || !list.some(tr => tr.id === this.sel)) this.sel = (list.find(tr => this.state(tr) === 'avail' && S.canBuy(s, tr.id)) || list.find(tr => this.state(tr) === 'avail') || list[0]).id;
    const W = board.clientWidth || 800, H = board.clientHeight || 480;
    const hs = Math.max(40, Math.min(W / 6.4, H / 4.4, 132)), dx = hs * 1.22, dy = hs * 1.32;
    const pos = tr => [W / 2 + (tr.pos[0] - 2) * dx, H / 2 + (tr.pos[1] - 1) * dy + (tr.pos[0] % 2 ? dy * 0.5 : 0) - dy * 0.25];
    const P = Object.fromEntries(list.map(tr => [tr.id, pos(tr)]));
    const owned = s.cultures[0].traits;
    let links = '';
    for (const tr of list) for (const r of tr.req || []) if (P[r]) {
      const on = owned.includes(r) && owned.includes(tr.id);
      links += `<line class="link ${on ? 'on' : ''}" x1="${P[r][0]}" y1="${P[r][1]}" x2="${P[tr.id][0]}" y2="${P[tr.id][1]}"/>`;
    }
    board.querySelector('svg').innerHTML = links;
    board.querySelectorAll('.hex').forEach(h => h.remove());
    board.style.setProperty('--hs', hs + 'px');
    for (const tr of list) {
      const st = this.state(tr), el = document.createElement('button'), name = traitName(s.nation, tr.id);
      el.className = `hex ${st}${st === 'avail' && S.canBuy(s, tr.id) ? ' afford' : ''}${tr.id === this.sel ? ' sel' : ''}`;
      el.dataset.hex = tr.id; el.title = name; el.setAttribute('aria-label', name);
      el.style.left = P[tr.id][0] + 'px'; el.style.top = P[tr.id][1] + 'px';
      el.innerHTML = `<span class="emoji">${tr.icon}</span><span class="cost">${st === 'owned' ? '✔' : S.traitCost(s, tr.id)}</span>`;
      board.appendChild(el);
    }
    this.renderDetail();
    if (focus) board.querySelector(`[data-hex="${this.sel}"]`)?.focus({preventScroll: true});
  }

  renderDetail() {
    const s = this.s, tr = S.traitDefs(s)[this.sel], st = this.state(tr), d = this.root.querySelector('.detail');
    const num = v => fmtNum(Math.abs(v), {maximumFractionDigits: 2});
    const chips = Object.entries(tr.fx).filter(([k]) => FX[k]).map(([k, v]) => {
      const [icon, kind] = FX[k], label = fxLabel(k);
      const cls = kind === 'down' ? (v > 0 ? 'down' : 'up') : kind === 'purple' ? 'purple' : 'up';
      let val = k === 'anti' || k === 'bypass' ? `−${Math.round(v * 100)}%` : k === 'customs' || k === 'net' ? '' : (v > 0 ? '+' : '−') + num(v);
      if (k === 'bypass') val = '+' + Math.round(v * 100) + '%';
      if (k === 'stealth') return '';
      return `<span class="chip ${cls}" title="${label}" aria-label="${label} ${val}"><span class="emoji">${icon}</span>${val}</span>`;
    }).join('') + (tr.action ? `<span class="chip up" title="${fxLabel('anti')}"><span class="emoji">🧐</span>−6%</span>` : '');
    const cost = S.traitCost(s, tr.id);
    let acts = '';
    if (st === 'owned') acts = `<button class="btn ghost" disabled>✔ ${t('evo.owned')}</button>` + (tr.devolve ? `<button class="btn red" data-devolve ${S.canDevolve(s, tr.id) ? '' : 'disabled'}>↩ ${t('evo.remove')} · ${this.cur} ${S.DEVOLVE_COST}${padKey('Y')}</button>` : '');
    else if (st === 'locked') acts = `<button class="btn" disabled>🔒 ${t('evo.locked')}</button>`;
    else acts = `<button class="btn" data-buy ${S.canBuy(s, tr.id) ? '' : 'disabled'}>${tr.action ? t('evo.launch') : t('evo.buy')} · ${this.cur} ${cost}${padKey('A')}</button>`;
    const ps = S.playerStats(s), prev = tr.fx;
    const bar = (key, max, cls, icon) => {
      const now = Math.max(0, key === 'vis' ? ps.visEff : ps[key]), after = st === 'avail' ? Math.max(0, now + (prev[key] || 0)) : now;
      return `<div class="stat ${cls}" title="${fxLabel(key)}"><span class="emoji">${icon}</span><div class="sbar" style="position:relative"><i style="width:${Math.min(100, Math.max(now, after) / max * 100)}%;opacity:.35;position:absolute"></i><i style="width:${Math.min(100, Math.min(now, after) / max * 100)}%;position:relative"></i></div></div>`;
    };
    d.innerHTML = `<div class="big emoji">${tr.icon}</div>
      <div><h3>${traitName(s.nation, tr.id)}</h3><div class="hint">${traitHint(tr.id)}</div></div>
      <div class="fx">${chips}</div>
      <div class="acts">${acts}<div class="mystats">${bar('inf', 16, 'inf', '📣')}${bar('vis', 14, 'vis', '🐘')}${bar('car', 15, 'car', '🎭')}</div></div>`;
  }

  buy() {
    const tr = S.traitDefs(this.s)[this.sel];
    if (!S.buyTrait(this.s, this.sel)) { sfx.deny(); return; }
    sfx.buy(); this.onChange?.('buy', tr);
    this.render();
  }
  devolve() {
    if (!S.devolve(this.s, this.sel)) { sfx.deny(); return; }
    sfx.devolve(); this.onChange?.('devolve');
    this.render();
  }
  refresh() { if (this.open) { this.root.querySelector('[data-dna]').textContent = this.s.points; } }
}
