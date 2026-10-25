// Diagnostic : quels territoires résistent en fin de partie ?
import * as S from '../js/sim.js';
import {GEO} from '../js/geo-data.js';

const s = S.createGame(process.argv[2] || 'US', 1000);
const ORDER = ['c0', 'land1', 'air1', 'c1', 'sea1', 'tv', 'air2', 'accent', 'land2', 'net', 'sea2', 'resto', 'hot', 'cold', 'fest', 'world', 'clash1', 'home1', 'c2', 'c3', 'c4', 'c5', 'pride', 'mono'];
while (!s.outcome && s.day < Number(process.argv[3] || 500)) {
  S.advance(s, 1); S.tickReal(s, 0.6);
  for (const b of [...s.bubbles]) S.collect(s, b.id);
  for (const id of ORDER) if (S.canBuy(s, id)) { S.buyTrait(s, id); break; }
  s.cultures.forEach((cu, k) => { if (k && cu.alive && S.power(s, 0, cu.home) > S.power(s, k, cu.home) * 1.05) S.offensive(s, k); });
}
console.log('day', s.day, s.outcome, 'traits', s.cultures[0].traits.join(','));
s.countries.forEach((c, i) => {
  if (GEO[i].pop > 0 && c.car[0] < 0.999)
    console.log(GEO[i].id, GEO[i].name, 'pop', GEO[i].pop, 'nat', c.nat.toExponential(2), 'inf', c.inf.map(v => v.toExponential(2)).join('/'), 'car', c.car.map(v => v.toFixed(4)).join('/'), 'closed', c.closed, 'nb', GEO[i].nb.join(' '));
});
