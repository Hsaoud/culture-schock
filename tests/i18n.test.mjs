// Tests des éditions : npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../js/i18n.js';
import {ORDER} from '../js/data/nations.js';
import {FAMILY_IDS, VARIANTS} from '../js/data/events.js';
import {buildTraits} from '../js/data/traits.js';
import {GEO} from '../js/geo-data.js';
import {WORLD_EVENTS} from '../js/sim.js';

const vars = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
const NEWS_VARS = new Set(['pays', 'cliche', 'cur', 'leader', 'home', 'rival', 'rcliche']);
const each = fn => { for (const {id} of L.LANGUAGES) { L.setLanguage(id, false); fn(id); } L.setLanguage('fr', false); };

test('sept langues, une par nation jouable', () => {
  assert.equal(L.LANGUAGES.length, ORDER.length);
  assert.deepEqual(new Set(L.LANGUAGES.map(l => l.nation)), new Set(ORDER));
});

test('chaque texte d’interface existe dans chaque langue, avec les mêmes variables', () => {
  each(id => {
    let same = 0;
    for (const [key, src] of Object.entries(L.SOURCE.ui)) {
      const v = L.t(key);
      assert.ok(v && v !== key, `${id} ${key}`);
      assert.equal(vars(v), vars(src), `${id} ${key}`);
      if (v === src) same++;
    }
    // Quelques mots identiques (« Action », « OK », le nom du jeu), pas une édition restée en français.
    if (id !== 'fr') assert.ok(same < 12, `${id} : ${same} textes identiques au français`);
  });
});

test('nations, ressources, recherches et brèves sont complètes dans chaque langue', () => {
  each(id => {
    for (const n of ORDER) {
      const nat = L.nat(n), f = L.flv(n);
      for (const s of [nat.name, nat.leader, nat.emblem, nat.passive.name, nat.passive.text, ...nat.quotes, ...nat.cliches.map(c => c[1]),
        f.currency.name, f.currency.one, f.verb, f.channel, f.operation, f.win, f.lose]) assert.ok(typeof s === 'string' && s.trim(), `${id} ${n}`);
      for (const tr of Object.keys(buildTraits(n))) { assert.ok(L.traitName(n, tr), `${id} ${n} ${tr}`); assert.equal(typeof L.traitHint(tr), 'string'); }
      for (const tpl of [...f.news, ...L.commonNews(), ...L.rivalNews()]) for (const v of vars(tpl).split(',').filter(Boolean)) assert.ok(NEWS_VARS.has(v), `${id} ${n} « ${tpl} »`);
    }
    for (const e of WORLD_EVENTS) assert.ok(L.worldText(e.id), `${id} ${e.id}`);
    for (const r of ['mono', 'cure', 'home', 'stale']) assert.ok(L.endText(r).every(Boolean), `${id} ${r}`);
    for (let i = 0; i < L.SOURCE.tutorial.length; i++) assert.doesNotMatch(L.tutorialText(i, {icon: '🍔', one: 'x', name: 'x', verb: 'x', trait: 'x'}), /\{\w+\}/, `${id} tuto ${i}`);
  });
});

test('les 336 affaires illustrées ont un titre, une phrase et deux choix dans chaque langue', () => {
  each(id => {
    const titles = new Set();
    for (const n of ORDER) for (const fam of FAMILY_IDS) for (let v = 0; v < VARIANTS; v++) {
      const c = L.eventCard(n, fam, v);
      assert.ok(c.title && c.line && !/\{\w+\}|undefined/.test(c.line), `${id} ${n} ${fam} ${v}`);
      assert.equal(c.options.length, 2);
      assert.ok(c.options.every(o => o.label && o.fx), `${id} ${fam}`);
      titles.add(n + c.title);
    }
    assert.equal(titles.size, ORDER.length * VARIANTS, `${id} : titres distincts par nation`);
  });
});

test('les territoires sont nommés dans la langue choisie', () => {
  each(id => {
    const names = GEO.map((g, i) => L.countryName(i));
    assert.ok(names.every(Boolean), id);
    if (id === 'zh-CN') assert.equal(L.countryName(GEO.findIndex(g => g.id === 'FR')), '法国');
    if (id === 'ru') assert.equal(L.countryName(GEO.findIndex(g => g.id === 'DE')), 'Германия');
  });
  assert.equal(L.countryName(GEO.findIndex(g => g.id === 'FR')), 'France');
});

test('la langue du navigateur est suggérée, l’anglais par défaut', () => {
  assert.equal(L.suggestLanguage(['fr-CA']), 'fr');
  assert.equal(L.suggestLanguage(['en-GB']), 'en-GB');
  assert.equal(L.suggestLanguage(['en-US']), 'en-US');
  assert.equal(L.suggestLanguage(['en']), 'en-US');
  assert.equal(L.suggestLanguage(['es-ES']), 'es-MX');
  assert.equal(L.suggestLanguage(['zh-TW', 'en']), 'zh-CN');
  assert.equal(L.suggestLanguage(['de-DE', 'it-IT']), 'it');
  assert.equal(L.suggestLanguage(['ru-RU']), 'ru');
  assert.equal(L.suggestLanguage(['de-DE']), 'en-US');
});

test('changer de langue sans stockage ne casse rien et prévient l’interface', () => {
  let seen = null;
  const off = L.onLanguageChange(id => { seen = id; });
  assert.equal(L.setLanguage('ru'), true);
  assert.equal(seen, 'ru');
  assert.equal(L.getLanguage(), 'ru');
  assert.equal(L.setLanguage('xx'), false);
  off(); L.setLanguage('fr', false);
});

test('orthographe américaine pour l’édition des États-Unis', () => {
  L.setLanguage('en-GB', false);
  const gb = L.eventCard('MX', 'food', 11).title;
  L.setLanguage('en-US', false);
  assert.doesNotMatch(JSON.stringify([L.flv('MX'), L.t('hud.cure'), L.eventCard('MX', 'food', 10)]), /\b(colour|flavour|honour|centre|litre|defence|chilli|synchronised)\b/i);
  assert.ok(gb);
  L.setLanguage('fr', false);
});

test('formats régionaux : population et pourcentages', () => {
  L.setLanguage('fr', false); assert.match(L.fmtPop(1400), /^1,4\s?Md/);
  L.setLanguage('zh-CN', false); assert.equal(L.fmtPop(1400), '14亿');
  L.setLanguage('en-US', false); assert.equal(L.fmtPop(1400), '1.4B'); assert.equal(L.fmtPct(25), '25%');
  L.setLanguage('fr', false);
});
