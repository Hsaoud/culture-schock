// Tests du moteur : npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../js/sim.js';
import {ORDER} from '../js/data/nations.js';
import {GEO} from '../js/geo-data.js';

function run(s, days, each) { for (let d = 0; d < days && !s.outcome; d++) { S.advance(s, 1); S.tickReal(s, 1); each?.(s); } return s; }

test('chaque nation démarre avec sa capitale à 100 % et des rivaux distincts', () => {
  for (const id of ORDER) {
    const s = S.createGame(id, 42);
    assert.equal(S.homeShare(s, 0), 1);
    const homes = s.cultures.map(c => c.home);
    assert.equal(new Set(homes).size, homes.length);
  }
});

test('les parts de chaque pays restent cohérentes (somme = 1, pas de NaN)', () => {
  const s = run(S.createGame('FR', 7), 200);
  s.countries.forEach((c, i) => {
    if (GEO[i].pop <= 0) return;
    const sum = c.nat + c.inf.reduce((a, b) => a + b, 0) + c.car.reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-6, `${GEO[i].id} somme ${sum}`);
    assert.ok([c.nat, ...c.inf, ...c.car].every(v => Number.isFinite(v) && v >= 0), GEO[i].id);
  });
});

test('ne rien faire mène à la défaite, même en tutoriel', () => {
  for (const id of ['US', 'FR', 'RU']) {
    const s = run(S.createGame(id, 3), 1200);
    assert.equal(s.outcome?.win, false, id);
  }
});

test('acheter un trait coûte de l’ADN et modifie les statistiques', () => {
  const s = S.createGame('IT', 1);
  s.points = 50;
  const before = S.playerStats(s).air;
  assert.ok(S.buyTrait(s, 'air1'));
  assert.equal(s.points, 50 - S.traitCost(s, 'air1'));
  assert.ok(S.playerStats(s).air > before);
  assert.equal(S.buyTrait(s, 'air1'), false, 'pas de double achat');
  assert.equal(S.canBuy(s, 'world'), false, 'prérequis manquants');
});

test('une culture dont la capitale passe sous 50 % s’effondre', () => {
  const s = S.createGame('FR', 5), k = 1, home = s.cultures[k].home, c = s.countries[home];
  c.inf[k] = 0.1; c.inf[0] = 0.9; // la défense de la capitale ne compense pas un tel écart en un jour
  run(s, 2);
  assert.equal(s.cultures[k].alive, false);
  assert.ok(s.countries.every(x => x.inf[k] === 0 && x.car[k] === 0));
});

test('victoire quand toute l’humanité est caricaturée', () => {
  const s = S.createGame('US', 9);
  s.cultures.slice(1).forEach(cu => { cu.alive = false; });
  for (const c of s.countries) { c.nat = 0; c.inf.fill(0); c.car.fill(0); c.car[0] = 1; }
  s.countries.forEach((c, i) => { if (GEO[i].pop <= 0) { c.car[0] = 0; } });
  run(s, 2);
  assert.equal(s.outcome?.win, true);
});

test('les bulles se récoltent et rapportent de l’ADN', () => {
  const s = run(S.createGame('US', 11), 120);
  const b = s.bubbles.find(x => x.kind !== 'cure');
  if (!b) return;
  const pts = s.points;
  S.collect(s, b.id);
  assert.ok(s.points > pts);
});

test('les affaires illustrées arrivent, ne se répètent pas et appliquent leurs effets', () => {
  const s = S.createGame('FR', 21), seen = new Set();
  for (let d = 0; d < 900 && seen.size < 12; d++) {
    S.advance(s, 1);
    if (s.pendingEvent) {
      const key = s.pendingEvent.family + s.pendingEvent.variant;
      assert.ok(!seen.has(key), 'pas de répétition avant épuisement du paquet');
      seen.add(key);
      const pts = s.points, buffs = s.mods.length;
      assert.ok(S.resolveEvent(s, 0));
      assert.ok(s.points >= pts || s.mods.length > buffs);
      assert.equal(s.pendingEvent, null);
    }
  }
  assert.ok(seen.size >= 5, `${seen.size} affaires seulement`);
});
