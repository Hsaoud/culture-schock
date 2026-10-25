// Progression (nations débloquées) et sauvegarde de la partie en cours.
import {ORDER} from './data/nations.js';

const KEY = 'cliches-inc:progress', SAVE = 'cliches-inc:save';
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

export function progress() {
  const p = read(KEY, {});
  return {wins: p.wins || {}, unlocked: p.unlocked || ['US']};
}
export function isUnlocked(id) {
  if (new URLSearchParams(location.search).has('all')) return true;
  return progress().unlocked.includes(id);
}
// Une victoire débloque la nation suivante dans l'ordre de difficulté.
export function recordWin(id) {
  const p = progress();
  p.wins[id] = (p.wins[id] || 0) + 1;
  const next = ORDER[ORDER.indexOf(id) + 1];
  let unlocked = null;
  if (next && !p.unlocked.includes(next)) { p.unlocked.push(next); unlocked = next; }
  write(KEY, p);
  return unlocked;
}

const SKIP = new Set(['events', '_defs', '_sh', '_carry']);
export function saveGame(s) {
  if (!s || s.outcome) { clearSave(); return; }
  write(SAVE, JSON.parse(JSON.stringify(s, (k, v) => SKIP.has(k) ? undefined : v === Infinity ? 'Infinity' : v)));
}
export function loadGame() {
  const s = read(SAVE, null);
  if (!s || s.v !== 1) return null;
  s.events = [];
  s.nextEvent ??= s.day + 20; s.eventDeck ??= []; s.pendingEvent ??= null; // sauvegardes antérieures aux événements
  for (const cu of s.cultures) if (cu.nextRaid === 'Infinity') cu.nextRaid = Infinity;
  return s;
}
export function hasSave() { return !!read(SAVE, null); }
export function clearSave() { try { localStorage.removeItem(SAVE); } catch {} }
