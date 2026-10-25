// Banc d'équilibrage sans navigateur : fait jouer des profils de joueurs.
// Usage : node tools/balance.mjs [nation…] [--runs=4]   (TRACE=1 pour la courbe)
import * as S from '../js/sim.js';
import {ORDER} from '../js/data/nations.js';
import {GEO} from '../js/geo-data.js';

const args = process.argv.slice(2);
const runs = Number(args.find(a => a.startsWith('--runs='))?.split('=')[1] || 4);
const nations = args.filter(a => !a.startsWith('--')).length ? args.filter(a => !a.startsWith('--')) : ORDER;

const SPREAD = ['c0', 'land1', 'air1', 'c1', 'sea1', 'tv', 'air2', 'accent', 'low1', 'home1', 'sea2', 'land2', 'clash1', 'resto', 'hot', 'cold', 'fest', 'net', 'anti1', 'customs', 'clash2', 'home2', 'anti2', 'world', 'low2', 'home3'];
const KILL = ['c2', 'c3', 'c4', 'c5', 'pride', 'mono'];

const PROFILES = {
  // Collecte : probabilité par jour d'attraper une bulle visible. Une bulle vit ~9 jours à vitesse 1.
  casual: {collect: 0.1, buyEvery: 6, offense: false, probe: false, killAt: 0.7, react: false},
  good: {collect: 0.45, buyEvery: 1, offense: true, probe: true, killAt: 0.85, react: true},
};

function bot(s, p) {
  for (const b of [...s.bubbles]) if (Math.random() < p.collect) S.collect(s, b.id);
  if (S.playerStats(s).customs) for (const v of s.vehicles) if (v.kind === 'raid' && v.k > 0 && Math.random() < p.collect) S.intercept(s, v.id);
  if (Math.floor(s.day) % p.buyEvery) return;
  const sh = S.worldShares(s), mine = sh.inf[0] + sh.car[0];
  const kill = mine > p.killAt || s.cure > 70;
  const home = s.cultures[0].home;
  const threatened = p.react && s.cultures.some((cu, k) => k && cu.alive && S.power(s, k, home) > S.power(s, 0, home) * 0.9);
  let list = threatened ? ['home1', 'home2', 'clash1', 'home3', ...SPREAD] : kill ? [...KILL, ...SPREAD] : SPREAD;
  if (p.react && mine > 0.45) list = ['net', ...list];
  if (p.probe && s.cure > 40 && !kill) list = ['anti1', 'anti2', ...list];
  if (p.probe && s.cure > 55 && S.canBuy(s, 'probe')) list = ['probe', ...list];
  for (const id of list) {
    if (S.canBuy(s, id)) { S.buyTrait(s, id); break; }
    const t = S.traitDefs(s)[id];
    if (t && !s.cultures[0].traits.includes(id) && (!t.req || t.req.some(r => s.cultures[0].traits.includes(r)))) break; // économise
  }
  if (p.offense) s.cultures.forEach((cu, k) => {
    if (k && cu.alive && S.power(s, 0, cu.home) > S.power(s, k, cu.home) * 1.05) S.offensive(s, k);
  });
}

function play(nation, strategy, seed) {
  const s = S.createGame(nation, seed);
  const trace = [];
  while (!s.outcome && s.day < 1200) {
    S.advance(s, 1);
    S.tickReal(s, 1);
    if (s.pendingEvent) S.resolveEvent(s, Math.random() < 0.5 ? 0 : 1) || S.resolveEvent(s, 0);
    if (PROFILES[strategy]) bot(s, PROFILES[strategy]);
    if (process.env.DUMP && Math.floor(s.day) === Number(process.env.DUMP) && strategy === 'good' && seed === 1000) {
      console.log('--- reste au jour', s.day, 'cure', s.cure.toFixed(1), 'traits', s.cultures[0].traits.join(','));
      s.countries.forEach((c, i) => { if (GEO[i].pop > 0 && c.car[0] < 0.999) console.log('  ', GEO[i].id, 'pop', GEO[i].pop, 'nat', c.nat.toFixed(4), 'inf', c.inf.map(v => v.toFixed(4)).join('/'), 'car', c.car.map(v => v.toFixed(3)).join('/'), 'closed', c.closed); });
    }
    if (Math.floor(s.day) % 40 === 0) {
      const sh = S.worldShares(s);
      trace.push(`${Math.floor(s.day)}:p${s.stats.points}:${Math.round((sh.inf[0] + sh.car[0]) * 100)}%/${Math.round(sh.car[0] * 100)}c|cure${Math.round(s.cure)}|al${Math.round(s.alert)}|r${s.cultures.slice(1).map((c, k) => c.alive ? Math.round((sh.inf[k + 1] + sh.car[k + 1]) * 100) : 'x').join(',')}`);
    }
  }
  const sh = S.worldShares(s);
  return {outcome: s.outcome ? (s.outcome.win ? 'WIN' : 'LOSE:' + s.outcome.reason) : 'TIMEOUT', day: Math.floor(s.day), mine: Math.round((sh.inf[0] + sh.car[0]) * 100), pts: s.stats.points, toppled: s.stats.toppled, trace};
}

for (const n of nations) {
  for (const strat of ['idle', 'casual', 'good']) {
    const res = [];
    for (let r = 0; r < runs; r++) res.push(play(n, strat, 1000 + r * 77));
    const wins = res.filter(r => r.outcome === 'WIN').length;
    console.log(`${n} ${strat.padEnd(6)} wins ${wins}/${runs} | ` + res.map(r => `${r.outcome}@${r.day} ${r.mine}% top${r.toppled} pts${r.pts}`).join(' ; '));
    if (process.env.TRACE) console.log('   ' + res[0].trace.join('  '));
  }
}
