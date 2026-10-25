// Tutoriel guidé (États-Unis) : une consigne courte à la fois, déclenchée par l'état du jeu.
import * as S from './sim.js';
import {GEO} from './geo-data.js';
import {flv, lower, tutorialText} from './i18n.js';

// Consigne n° i dans la langue courante, avec la ressource et les noms américains.
const say = i => () => {
  const f = flv('US');
  return tutorialText(i, {icon: f.currency.icon, one: f.currency.one, name: lower(f.currency.name), verb: f.verb, trait: f.traits.air1});
};

// wait : condition de fin de l'étape ; pause : fige la simulation pendant l'étape ;
// target : élément à entourer (sélecteur CSS, ou fonction renvoyant un rectangle écran).
const STEPS = [
  {text: say(0), pause: true, wait: (s, t) => t.elapsed > 4.5},
  {text: say(1), pause: true, spawn: true, target: 'bubble', wait: (s, t) => s.stats.bubbles > 0},
  {text: say(2), pause: true, target: '#h-evolve', wait: (s, t) => t.evolveOpen},
  {text: say(3), pause: true, target: '[data-hex="air1"]', wait: s => s.cultures[0].traits.includes('air1')},
  {text: say(4), pause: true, target: '[data-close]', wait: (s, t) => !t.evolveOpen},
  {text: say(5), target: '[data-speed="2"]', wait: (s, t) => t.speed > 0},
  {text: say(6), wait: (s, t) => t.elapsed > 6},
  {when: s => s.countries.some((c, i) => i !== s.cultures[0].home && c.inf[0] > 0.001 && c.inf[1] > 0.001),
    text: say(7), target: '.rival', wait: (s, t) => t.elapsed > 6},
  {when: s => s.detected, text: say(8), target: '#h-cure', wait: (s, t) => t.elapsed > 6},
  {when: s => s.bubbles.some(b => b.kind === 'cure'), text: say(9), target: 'cure', wait: (s, t) => t.elapsed > 6},
  {when: s => S.power(s, 0, s.cultures[1].home) > S.power(s, 1, s.cultures[1].home) && s.cultures[1].alive,
    text: say(10), target: '.rival', wait: (s, t) => t.elapsed > 8 || !s.cultures[1].alive},
  {when: s => (s._sh?.inf[0] ?? 0) > 0.55 || s.cure > 55,
    text: say(11), target: '#h-evolve', wait: (s, t) => t.elapsed > 7 || s.cultures[0].s.car > 0},
  {when: s => (s._sh?.inf[0] ?? 0) + (s._sh?.car[0] ?? 0) > 0.85 && !s.cultures[0].traits.includes('net'),
    text: say(12), target: '#h-evolve', wait: (s, t) => t.elapsed > 7},
];

export class Tutorial {
  constructor(hud, getRect) {
    this.hud = hud; this.getRect = getRect; this.i = 0; this.t = {elapsed: 0, evolveOpen: false}; this.active = null; this.done = false;
    this.ring = document.createElement('div'); this.ring.className = 'coach-ring'; this.ring.hidden = true;
    this.hand = document.createElement('div'); this.hand.className = 'coach-hand emoji'; this.hand.textContent = '👆'; this.hand.hidden = true;
    document.body.append(this.ring, this.hand);
  }
  get pausing() { return this.active?.pause; }
  // Changement de langue : la consigne en cours est réaffichée, la progression ne bouge pas.
  refresh() { if (this.active && !this.done) this.hud.say('US', this.active.text(), 0); }
  destroy() { this.ring.remove(); this.hand.remove(); this.done = true; }

  update(s, dt, ctx) {
    if (this.done) return;
    this.t.evolveOpen = ctx.evolveOpen; this.t.speed = ctx.speed;
    if (!this.active) {
      const step = STEPS[this.i];
      if (!step) { this.destroy(); return; }
      if (step.when && !step.when(s)) return;
      this.active = step; this.t.elapsed = 0;
      this.hud.say('US', step.text(), 0);
      if (step.spawn) ctx.spawnBubble();
    }
    this.t.elapsed += dt;
    this.place(s);
    if (this.active.wait(s, this.t)) {
      this.active = null; this.i++;
      this.hud.hush(); this.ring.hidden = true; this.hand.hidden = true;
    }
  }

  place(s) {
    const tg = this.active.target;
    let r = null;
    if (tg === 'bubble' || tg === 'cure') r = this.getRect(tg);
    else if (tg) { const el = document.querySelector(tg); if (el && el.offsetParent !== null) r = el.getBoundingClientRect(); }
    if (!r) { this.ring.hidden = true; this.hand.hidden = true; return; }
    const pad = 8;
    Object.assign(this.ring.style, {left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px'});
    // Pendant l'atelier, le voile sombre masquerait les hexagones : anneau seul.
    this.ring.style.boxShadow = this.t.evolveOpen || !this.active.pause ? '0 0 0 4px var(--cyan)' : '';
    Object.assign(this.hand.style, {left: r.left + r.width / 2 - 10 + 'px', top: r.top + r.height + 2 + 'px'});
    this.ring.hidden = false; this.hand.hidden = false;
  }
}
