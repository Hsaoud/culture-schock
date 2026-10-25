// Bandeau d'actualités façon chaîne d'info : direct du jeu en priorité, sinon brèves
// satiriques composées à partir des clichés de la nation, des pays touchés et des rivaux.
import {GEO} from './geo-data.js';
import {t, nat, flv, commonNews, rivalNews, countryName, lower} from './i18n.js';

const SPEED = 70; // px/s, constant quelle que soit la vitesse du jeu
const pick = a => a[Math.floor(Math.random() * a.length)];

export class Ticker {
  constructor(root) {
    this.root = root; this.live = []; this.offset = 0; this.hold = false; this.recent = [];
    root.innerHTML = `<div class="tk-label"></div><div class="tk-track"><div class="tk-belt"></div></div>`;
    this.label = root.querySelector('.tk-label'); this.track = root.querySelector('.tk-track'); this.belt = root.querySelector('.tk-belt');
    root.addEventListener('pointerenter', () => { this.hold = true; });
    root.addEventListener('pointerleave', () => { this.hold = false; });
    addEventListener('resize', () => { this.trackW = 0; });
    this.widths = []; this.trackW = 0;
  }
  setup(s) {
    const f = flv(s.nation);
    this.s = s; this.live = []; this.offset = 0; this.belt.innerHTML = ''; this.recent = []; this.widths = []; this.trackW = 0;
    this.label.innerHTML = `<span class="emoji">📺</span><b>${f.channel}</b>`;
  }
  // Nouvelle du direct : passe avant les brèves.
  push(icon, text, hot = false) {
    if (this.live.length > 6) this.live.shift();
    this.live.push({icon, text, hot});
  }

  update(dt) {
    if (!this.s) return;
    if (!this.hold) this.offset += SPEED * dt;
    // Largeurs mesurées à l'ajout seulement : aucune lecture de mise en page à chaque image.
    // Retire les nouvelles sorties à gauche, en compensant le décalage.
    while (this.widths[0] > 0 && this.widths[0] < this.offset) { this.offset -= this.widths.shift(); this.belt.firstElementChild.remove(); }
    // Remplit jusqu'à dépasser la largeur visible.
    if (!this.trackW) this.trackW = this.track.clientWidth;
    let guard = 0, total = 0;
    for (const w of this.widths) total += w;
    while (total - this.offset < this.trackW + 300 && guard++ < 6) total = this.append(this.next());
    this.belt.style.transform = `translate3d(${-this.offset}px,0,0)`;
  }
  // Ajoute une nouvelle et remesure le bandeau (les polices d'émoji peuvent arriver après coup).
  append({icon, text, hot}) {
    const el = document.createElement('span');
    el.className = 'tk-item' + (hot ? ' hot' : '');
    el.innerHTML = `${hot ? `<i>${t('tk.live')}</i>` : ''}<span class="emoji">${icon}</span>${text}`;
    this.belt.appendChild(el);
    this.widths = [...this.belt.children].map(c => c.offsetWidth);
    return this.widths.reduce((a, b) => a + b, 0);
  }

  next() {
    if (this.live.length) return this.live.shift();
    const s = this.s, f = flv(s.nation), n = nat(s.nation);
    let text = '', tries = 0;
    do {
      const r = Math.random(), rivals = s.cultures.slice(1).filter(c => c.alive);
      const tpl = r < 0.45 ? pick(f.news) : r < 0.8 || !rivals.length ? pick(commonNews()) : pick(rivalNews());
      const rival = rivals.length ? pick(rivals) : null;
      text = tpl
        .replaceAll('{pays}', this.country(s))
        .replaceAll('{cliche}', this.cliche(s))
        .replaceAll('{cur}', lower(f.currency.name))
        .replaceAll('{leader}', n.leader)
        .replaceAll('{home}', n.name)
        .replaceAll('{rival}', rival ? nat(rival.id).name : t('tk.restOfWorld'))
        .replaceAll('{rcliche}', rival ? pick(nat(rival.id).cliches)[1] : t('tk.nuance'));
    } while (this.recent.includes(text) && ++tries < 5);
    this.recent.push(text); if (this.recent.length > 20) this.recent.shift();
    return {icon: f.currency.icon, text};
  }
  // Un pays où votre culture est présente (sinon un grand pays au hasard).
  country(s) {
    const mine = [];
    s.countries.forEach((c, i) => { if (GEO[i].pop >= 1 && i !== s.cultures[0].home && c.inf[0] + c.car[0] > 0.05) mine.push(i); });
    if (mine.length) return countryName(pick(mine));
    return countryName(pick(GEO.map((g, i) => i).filter(i => GEO[i].pop >= 20)));
  }
  // Un cliché acheté de préférence, sinon un cliché national.
  cliche(s) {
    const n = nat(s.nation), owned = s.cultures[0].traits.filter(id => /^c\d$/.test(id)).map(id => n.cliches[Number(id[1])][1]);
    return owned.length && Math.random() < 0.7 ? pick(owned) : pick(n.cliches)[1];
  }
}
