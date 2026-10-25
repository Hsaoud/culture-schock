// Langues du jeu : une édition par nation jouable (anglais américain, français, italien,
// espagnol du Mexique, anglais britannique, chinois simplifié, russe).
// La préférence est propre à l'appareil et séparée des sauvegardes : changer de langue ne relance
// ni la partie ni le tutoriel. Le moteur garde ses identifiants ; seuls les textes affichés changent.
// Le français (js/data/ + locales/fr.js) est la source : toute clé absente d'une édition y retombe.
import {GEO} from './geo-data.js';
import {NATIONS} from './data/nations.js';
import {FLAVOR, COMMON_NEWS, RIVAL_NEWS} from './data/flavor.js';
import {TRAIT_NAMES, HINTS, BRANCHES} from './data/traits.js';
import {FAMILIES} from './data/events.js';
import {WORLD_EVENTS} from './sim.js';
import {EVENT_MOTIFS} from './data/motifs.js';
import {MOTIF_COPY} from './locales/motifs.js';
import FR from './locales/fr.js';
import EN, {US} from './locales/en.js';
import ES from './locales/es.js';
import IT from './locales/it.js';
import ZH from './locales/zh.js';
import RU from './locales/ru.js';

// Ordre des nations : chaque langue est présentée par le champion de son pays.
export const LANGUAGES = [
  {id: 'en-US', nation: 'US', name: 'English', region: 'United States'},
  {id: 'fr', nation: 'FR', name: 'Français', region: 'France'},
  {id: 'it', nation: 'IT', name: 'Italiano', region: 'Italia'},
  {id: 'es-MX', nation: 'MX', name: 'Español', region: 'México'},
  {id: 'en-GB', nation: 'GB', name: 'English', region: 'United Kingdom'},
  {id: 'zh-CN', nation: 'CN', name: '简体中文', region: '中国'},
  {id: 'ru', nation: 'RU', name: 'Русский', region: 'Россия'},
];
const KEY = 'cliches-inc:lang';

// --- Éditions ---------------------------------------------------------------------
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
function merge(base, over) {
  if (!isObj(base) || !isObj(over)) return over ?? base;
  const out = {...base};
  for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(base[k]) ? merge(base[k], v) : v;
  return out;
}
// Orthographe américaine appliquée à l'édition britannique (puis corrections propres aux États-Unis).
const AMERICAN = {colour: 'color', colours: 'colors', flavour: 'flavor', flavours: 'flavors', honour: 'honor', humour: 'humor',
  favourite: 'favorite', neighbour: 'neighbor', neighbours: 'neighbors', centre: 'center', centres: 'centers', theatre: 'theater',
  litre: 'liter', litres: 'liters', metre: 'meter', metres: 'meters', defence: 'defense', defences: 'defenses', offence: 'offense',
  travelling: 'traveling', travellers: 'travelers', traveller: 'traveler', cancelled: 'canceled', organise: 'organize',
  organised: 'organized', synchronised: 'synchronized', mobilise: 'mobilize', recognise: 'recognize', apologise: 'apologize',
  criticise: 'criticize', specialised: 'specialized', personalised: 'personalized', armoured: 'armored', jewellery: 'jewelry',
  programme: 'program', catalogue: 'catalog', chilli: 'chili', chillies: 'chilies', grey: 'gray', storey: 'story', moustache: 'mustache'};
const AMERICAN_RE = new RegExp(`\\b(${Object.keys(AMERICAN).join('|')})\\b`, 'gi');
function americanize(v) {
  if (typeof v === 'string') return v.replace(AMERICAN_RE, w => {
    const r = AMERICAN[w.toLowerCase()];
    return w === w.toUpperCase() ? r.toUpperCase() : w[0] === w[0].toUpperCase() ? r[0].toUpperCase() + r.slice(1) : r;
  });
  if (Array.isArray(v)) return v.map(americanize);
  if (isObj(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, americanize(x)]));
  return v;
}
// Récits illustrés (js/locales/motifs.js) : « Titre¦Phrase. », dans l'ordre des planches.
const motifRows = i => Object.fromEntries(Object.entries(MOTIF_COPY).map(([id, langs]) => [id, langs[i].map(r => r.split('¦'))]));

// Le contenu français vient des données du jeu.
const FRENCH = {
  ...FR,
  nations: Object.fromEntries(Object.entries(NATIONS).map(([id, n]) => [id, {name: n.name, leader: n.leader, emblem: n.emblem,
    passive: [n.passive.name, n.passive.text], cliches: n.clichés.map(c => c[1]), quotes: n.quotes}])),
  flavor: Object.fromEntries(Object.entries(FLAVOR).map(([id, f]) => [id, {currency: [f.currency.name, f.currency.one],
    verb: f.verb, channel: f.channel, operation: f.operation, win: f.win, lose: f.lose, traits: f.traits, news: f.news}])),
  commonNews: COMMON_NEWS, rivalNews: RIVAL_NEWS,
  traits: TRAIT_NAMES, hints: HINTS,
  branches: Object.fromEntries(BRANCHES.map(b => [b.id, b.name])),
  families: Object.fromEntries(Object.entries(FAMILIES).map(([id, f]) => [id, {label: f.label, lead: f.lead, options: f.options.map(o => o.label)}])),
  world: Object.fromEntries(WORLD_EVENTS.map(e => [e.id, e.text])),
  motifs: Object.fromEntries(Object.entries(EVENT_MOTIFS).map(([id, rows]) => [id, rows.map(r => [r[0], r[1]])])),
};
// Source complète (outils de vérification des éditions).
export const SOURCE = FRENCH;
const BRITISH = merge({motifs: motifRows(0)}, EN);
const PACKS = {
  fr: FRENCH,
  'en-GB': BRITISH,
  'en-US': merge(americanize(BRITISH), US || {}),
  'es-MX': ES,
  it: merge({motifs: motifRows(2)}, IT),
  'zh-CN': merge({motifs: motifRows(1)}, ZH),
  ru: merge({motifs: motifRows(3)}, RU),
};

// --- Préférence -------------------------------------------------------------------------
let lang = 'fr', pack = FRENCH;
const listeners = new Set();
let cache = {};

export const validLanguage = id => LANGUAGES.some(l => l.id === id);
export const getLanguage = () => lang;
export const languageInfo = (id = lang) => LANGUAGES.find(l => l.id === id);
export function storedLanguage() {
  try { const v = localStorage.getItem(KEY); return validLanguage(v) ? v : null; } catch { return null; }
}
// Langue proposée d'après le navigateur ; le joueur la confirme à la première ouverture.
export function suggestLanguage(list = globalThis.navigator?.languages || []) {
  for (const raw of list) {
    const l = String(raw).toLowerCase(), base = l.split('-')[0], region = l.split('-')[1];
    if (base === 'fr' || base === 'it' || base === 'ru') return base;
    if (base === 'es') return 'es-MX';
    if (base === 'zh') return 'zh-CN';
    if (base === 'en') return ['gb', 'uk', 'ie', 'au', 'nz', 'za', 'in'].includes(region) ? 'en-GB' : 'en-US';
  }
  return 'en-US';
}
// persist=false : la langue s'applique pour la session seulement (aperçus, tests).
export function setLanguage(id, persist = true) {
  if (!validLanguage(id)) return false;
  const changed = id !== lang;
  lang = id; pack = PACKS[id]; cache = {};
  if (persist) try { localStorage.setItem(KEY, id); } catch { /* la session reste jouable sans stockage */ }
  if (globalThis.document) {
    document.documentElement.lang = id;
    document.title = t('meta.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
    document.getElementById('map')?.setAttribute('aria-label', t('meta.map'));
  }
  if (changed) for (const fn of listeners) fn(id);
  return true;
}
export function onLanguageChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// --- Textes ----------------------------------------------------------------------------------
export const fill = (s, vars) => vars ? s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m) : s;
export function t(key, vars) { return fill(pack.ui?.[key] ?? FRENCH.ui[key] ?? key, vars); }
// Texte dans une autre langue que la langue courante (aperçu du sélecteur de langue).
export function tIn(id, key, vars) { return fill(PACKS[id]?.ui?.[key] ?? FRENCH.ui[key] ?? key, vars); }
const get = (path, from) => path.reduce((o, k) => o?.[k], from);
// Valeur d'une édition, sinon la source française.
const pick = (...path) => get(path, pack) ?? get(path, FRENCH);
export const lower = s => s.toLocaleLowerCase(lang);
// Ponctuation propre à chaque langue : guillemets et exclamation.
export function quote(s) { return lang === 'fr' ? `« ${s} »` : lang === 'it' || lang === 'ru' ? `«${s}»` : lang === 'zh-CN' ? `“${s}”` : `“${s}”`; }
export function exclaim(s) { return lang === 'fr' ? s + ' !' : lang === 'zh-CN' ? s + '！' : s + '!'; }
export const upper = s => s.toLocaleUpperCase(lang);

const memo = (key, make) => cache[key] ?? (cache[key] = make());

// Nation telle qu'affichée : identité de NATIONS + textes de l'édition.
export function nat(id) {
  return memo('n' + id, () => {
    const n = NATIONS[id], p = (...k) => pick('nations', id, ...k);
    return {...n, name: p('name'), leader: p('leader'), emblem: p('emblem'),
      passive: {icon: n.passive.icon, name: p('passive', 0), text: p('passive', 1)},
      cliches: n.clichés.map(([icon], i) => [icon, p('cliches', i)]), quotes: n.quotes.map((_, i) => p('quotes', i))};
  });
}
// Identité satirique : ressource, bouton, chaîne, fins, recherches nommées, brèves.
export function flv(id) {
  return memo('f' + id, () => {
    const f = FLAVOR[id], p = (...k) => pick('flavor', id, ...k);
    return {currency: {icon: f.currency.icon, name: p('currency', 0), one: p('currency', 1)},
      verb: p('verb'), channel: p('channel'), operation: p('operation'), win: p('win'), lose: p('lose'),
      traits: Object.fromEntries(Object.keys(f.traits).map(k => [k, p('traits', k)])),
      news: f.news.map((_, i) => p('news', i))};
  });
}
export const commonNews = () => COMMON_NEWS.map((_, i) => pick('commonNews', i));
export const rivalNews = () => RIVAL_NEWS.map((_, i) => pick('rivalNews', i));

// Nom d'une recherche : cliché national, nom propre à la nation, sinon nom générique.
export function traitName(nationId, id) {
  if (/^c\d$/.test(id)) return nat(nationId).cliches[Number(id[1])][1];
  return flv(nationId).traits[id] ?? pick('traits', id) ?? id;
}
export const traitHint = id => /^c\d$/.test(id) ? pick('tiers', Number(id[1])) : pick('hints', id) ?? '';
export const branchName = id => pick('branches', id);
export const fxLabel = k => pick('fx', k);
export const worldText = id => pick('world', id);
export const endText = reason => [pick('ends', reason, 0), pick('ends', reason, 1)];
export const tutorialText = (i, vars) => fill(pick('tutorial', i), vars);
export function family(id) {
  return {label: pick('families', id, 'label'), lead: pick('families', id, 'lead'), options: FAMILIES[id].options.map((_, i) => pick('families', id, 'options', i))};
}
export function motif(nationId, variant) { return [pick('motifs', nationId, variant, 0), pick('motifs', nationId, variant, 1)]; }
// Affaire illustrée telle qu'affichée : titre, phrase, libellés des choix (effets inchangés).
export function eventCard(nationId, fam, variant) {
  const [title, incident] = motif(nationId, variant), f = FAMILIES[fam], tr = family(fam);
  return {title, line: t('event.line', {lead: tr.lead, incident}), family: fam, variant, icon: f.icon, label: tr.label,
    options: f.options.map((o, i) => ({...o, label: tr.options[i]}))};
}

// --- Pays et nombres ----------------------------------------------------------------------
// Noms des territoires : Intl dans la langue choisie, sinon le nom de la carte (français).
export function countryName(ci) {
  const names = memo('geo', () => {
    if (lang === 'fr') return GEO.map(g => g.name);
    let dn = null; try { dn = new Intl.DisplayNames([lang], {type: 'region'}); } catch { /* moteur sans Intl complet */ }
    return GEO.map(g => { try { const v = dn?.of(g.id); return v && v !== g.id ? v : g.name; } catch { return g.name; } });
  });
  return names[ci];
}
export const fmtPct = v => fmtNum(v / 100, {style: 'percent', maximumFractionDigits: 0});
export function fmtNum(v, opts) { return memo('nf' + JSON.stringify(opts || {}), () => new Intl.NumberFormat(lang, opts)).format(v); }
// Population (en millions) : « 1,4 Md », « 14亿 », « 1.4B »…
export function fmtPop(m) {
  const nf = memo('pop', () => new Intl.NumberFormat(lang, {notation: 'compact', maximumFractionDigits: 1}));
  return m * 1e6 < 1000 ? '<' + nf.format(1000) : nf.format(m * 1e6);
}

setLanguage(storedLanguage() || 'fr', false);
