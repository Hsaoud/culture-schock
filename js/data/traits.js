// Arbre d'évolution : trois branches en grille hexagonale.
// fx : modifications de statistiques ; req : au moins un prérequis acheté.
import {NATIONS} from './nations.js';
import {traitName} from './flavor.js';

export const BRANCHES = [
  {id: 'spread', icon: '✈️', name: 'Propagation', color: '#4fd1ff'},
  {id: 'cliche', icon: '🎭', name: 'Clichés', color: '#ff7a59'},
  {id: 'guard', icon: '🛡️', name: 'Défenses', color: '#7dffb0'},
];

const SPREAD = [
  {id: 'air1', icon: '🧳', name: 'Touristes', pos: [0, 0], cost: 10, fx: {air: 1}},
  {id: 'land1', icon: '🎒', name: 'Expatriés', pos: [0, 1], cost: 8, fx: {land: 1}},
  {id: 'sea1', icon: '📦', name: 'Export', pos: [0, 2], cost: 10, fx: {sea: 1}},
  {id: 'air2', icon: '✈️', name: 'Charters', pos: [1, 0], cost: 17, req: ['air1'], fx: {air: 1, inf: 0.5}},
  {id: 'land2', icon: '🏘️', name: 'Diaspora', pos: [1, 1], cost: 18, req: ['land1'], fx: {land: 1, bypass: 0.35}},
  {id: 'sea2', icon: '🚢', name: 'Porte-conteneurs', pos: [1, 2], cost: 17, req: ['sea1'], fx: {sea: 1, inf: 0.5}},
  {id: 'hot', icon: '🏖️', name: 'Vacances au soleil', pos: [2, 0], cost: 13, req: ['air1', 'air2'], fx: {hot: 0.6}},
  {id: 'tv', icon: '📺', name: 'Séries TV', pos: [2, 1], cost: 14, req: ['air2', 'land2', 'sea2', 'land1'], fx: {inf: 1, rich: 0.3}},
  {id: 'cold', icon: '⛷️', name: 'Sports d’hiver', pos: [2, 2], cost: 13, req: ['sea1', 'sea2'], fx: {cold: 0.6}},
  {id: 'resto', icon: '🍽️', name: 'Restaurants', pos: [3, 0], cost: 20, req: ['hot', 'tv'], fx: {inf: 1.5, poor: 0.3}},
  {id: 'net', icon: '📱', name: 'Réseaux sociaux', pos: [3, 1], cost: 22, req: ['tv'], fx: {net: 1, inf: 0.5, vis: 0.5}},
  {id: 'fest', icon: '🎪', name: 'Festivals', pos: [3, 2], cost: 17, req: ['cold', 'tv'], fx: {inf: 1, cold: 0.3, hot: 0.3}},
  {id: 'world', icon: '🌍', name: 'Mondialisation', pos: [4, 1], cost: 34, req: ['net', 'resto', 'fest'], fx: {air: 0.6, sea: 0.6, land: 0.6, inf: 1.5, bypass: 0.3}},
];

// Les six clichés nationaux + trois clichés universels.
const CLICHE_SLOTS = [
  {pos: [0, 1], cost: 6, fx: {inf: 1, vis: 0.4}},
  {pos: [1, 0], cost: 8, req: [0], fx: {inf: 1, vis: 0.7}},
  {pos: [1, 2], cost: 11, req: [0], fx: {inf: 1.2, vis: 1, car: 0.5}},
  {pos: [2, 0], cost: 15, req: [1], fx: {inf: 1, vis: 1.5, car: 1}},
  {pos: [3, 2], cost: 20, req: [2, 'accent'], fx: {vis: 2, car: 2.5}},
  {pos: [3, 1], cost: 25, req: [3, 4, 'accent'], fx: {inf: 0.5, vis: 3, car: 4}},
];
const CLICHE_EXTRA = [
  {id: 'accent', icon: '🗣️', name: 'L’accent à couper au couteau', pos: [2, 1], cost: 13, req: ['c1', 'c2'], fx: {inf: 1.5, vis: 1.2}},
  {id: 'pride', icon: '😤', name: 'Fierté mal placée', pos: [3, 0], cost: 20, req: ['c3'], fx: {vis: 2, car: 2}},
  {id: 'mono', icon: '🗿', name: 'Monoculture', pos: [4, 1], cost: 36, req: ['c5'], fx: {vis: 4, car: 5}},
];

const GUARD = [
  {id: 'anti1', icon: '🙄', name: 'Mauvaise foi', pos: [0, 0], cost: 14, fx: {anti: 0.15}},
  {id: 'low1', icon: '🕶️', name: 'Profil bas', pos: [0, 1], cost: 11, fx: {vis: -1, stealth: 4}},
  {id: 'home1', icon: '🏰', name: 'Fierté nationale', pos: [0, 2], cost: 11, fx: {home: 0.6}},
  {id: 'anti2', icon: '💼', name: 'Lobbying', pos: [1, 0], cost: 22, req: ['anti1'], fx: {anti: 0.15}},
  {id: 'low2', icon: '🦎', name: 'Camouflage', pos: [1, 1], cost: 20, req: ['low1'], fx: {vis: -1.5, stealth: 4}},
  {id: 'home2', icon: '🏛️', name: 'Patrimoine', pos: [1, 2], cost: 20, req: ['home1'], fx: {home: 0.8}},
  {id: 'probe', icon: '🔥', name: 'Polémique', pos: [2, 0], cost: 17, req: ['anti2'], action: true, fx: {}},
  {id: 'clash1', icon: '⚔️', name: 'Choc culturel', pos: [2, 1], cost: 14, req: ['low1', 'home1', 'anti1'], fx: {clash: 0.25}},
  {id: 'customs', icon: '🛃', name: 'Douanes', pos: [2, 2], cost: 8, req: ['home1', 'home2'], fx: {customs: 1}},
  {id: 'clash2', icon: '🗡️', name: 'Guerre des clichés', pos: [3, 1], cost: 25, req: ['clash1'], fx: {clash: 0.3}},
  {id: 'home3', icon: '🗽', name: 'Forteresse', pos: [3, 2], cost: 22, req: ['home2', 'customs'], fx: {home: 1}},
];

// Noms génériques (français), remplacés par les noms propres à chaque nation quand ils existent.
export const TRAIT_NAMES = Object.fromEntries([...SPREAD, ...CLICHE_EXTRA, ...GUARD].map(t => [t.id, t.name]));

// Une ligne d'aide, très courte, par trait générique.
export const HINTS = {
  air1: 'Les avions emportent votre culture', air2: 'Plus de vols, plus loin', land1: 'Passe les frontières terrestres',
  land2: 'Se faufile malgré les fermetures', sea1: 'Les bateaux emportent votre culture', sea2: 'Plus de ports touchés',
  hot: 'Plus fort dans les pays chauds', cold: 'Plus fort dans les pays froids', tv: 'Séduit les pays riches',
  resto: 'Séduit les pays modestes', net: 'Contamine au hasard, même les pays fermés', fest: 'Partout, été comme hiver',
  world: 'Tous les vecteurs renforcés', accent: 'Contagieux… et voyant', pride: 'Transforme en caricatures',
  mono: 'Le cliché ultime', anti1: 'La Nuance progresse moins vite', anti2: 'La Nuance progresse encore moins vite',
  probe: 'Nuance −6 % (prix croissant)', low1: 'Moins lourd', low2: 'Beaucoup moins lourd',
  home1: 'Capitale plus solide', home2: 'Capitale très solide', home3: 'Capitale imprenable… presque',
  clash1: 'Plus fort face aux rivaux', clash2: 'Écrase les cultures rivales', customs: 'Cliquez les convois rivaux pour les bloquer',
};

export function buildTraits(nationId) {
  const n = NATIONS[nationId];
  const cliches = CLICHE_SLOTS.map((slot, i) => ({
    id: 'c' + i, icon: n.clichés[i][0], name: n.clichés[i][1], pos: slot.pos, cost: slot.cost, fx: slot.fx,
    req: slot.req ? slot.req.map(r => typeof r === 'number' ? 'c' + r : r) : undefined, devolve: true,
  }));
  const all = [
    ...SPREAD.map(t => ({...t, name: traitName(nationId, t.id, t.name), branch: 'spread'})),
    ...[...cliches, ...CLICHE_EXTRA.map(t => ({...t, devolve: true}))].map(t => ({...t, branch: 'cliche'})),
    ...GUARD.map(t => ({...t, name: traitName(nationId, t.id, t.name), branch: 'guard'})),
  ];
  return Object.fromEntries(all.map(t => [t.id, t]));
}

// Améliorations de l'IA : génériques, prix croissants.
export const AI_UPGRADES = {
  air: {air: 0.8}, sea: {sea: 0.8}, land: {land: 0.8}, inf: {inf: 1}, clash: {clash: 0.2}, home: {home: 0.4}, car: {car: 1.5, vis: 1},
};
