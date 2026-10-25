// Sons et musique synthétisés (Web Audio) : aucun fichier audio.
let ctx = null, master = null, sfxBus = null, musicBus = null, musicTimer = null;
const prefs = {sound: true, music: true};
try { Object.assign(prefs, JSON.parse(localStorage.getItem('cliches-inc:audio') || '{}')); } catch {}

export function audioPrefs() { return prefs; }
export function setAudio(key, on) {
  prefs[key] = on;
  try { localStorage.setItem('cliches-inc:audio', JSON.stringify(prefs)); } catch {}
  if (!ctx) return;
  sfxBus.gain.value = prefs.sound ? 0.9 : 0;
  musicBus.gain.value = prefs.music ? 0.32 : 0;
}

export function unlockAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.connect(master);
  musicBus = ctx.createGain(); musicBus.connect(master);
  setAudio('sound', prefs.sound); setAudio('music', prefs.music);
}

function tone(freq, dur, {type = 'sine', vol = 0.3, at = 0, slide = 0, bus = sfxBus, attack = 0.005} = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, {vol = 0.2, at = 0, from = 400, to = 3000, q = 1} = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + at, len = Math.ceil(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = buf; f.type = 'bandpass'; f.Q.value = q;
  f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(sfxBus); src.start(t);
}

const last = {};
function throttle(name, ms) { const now = performance.now(); if (last[name] && now - last[name] < ms) return true; last[name] = now; return false; }

export const sfx = {
  click() { tone(660, 0.06, {type: 'triangle', vol: 0.15}); },
  hover() { if (!throttle('hover', 60)) tone(990, 0.03, {type: 'sine', vol: 0.05}); },
  pop(n = 1) { tone(520 + n * 90, 0.12, {type: 'triangle', vol: 0.3, slide: 2}); tone(1040 + n * 120, 0.15, {type: 'sine', vol: 0.15, at: 0.05}); },
  cure() { tone(300, 0.2, {type: 'sine', vol: 0.25, slide: 0.5}); tone(900, 0.1, {type: 'square', vol: 0.05, at: 0.02}); },
  buy() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, {type: 'triangle', vol: 0.22, at: i * 0.06})); },
  devolve() { [784, 523, 392].forEach((f, i) => tone(f, 0.16, {type: 'triangle', vol: 0.18, at: i * 0.06})); },
  deny() { tone(180, 0.18, {type: 'square', vol: 0.12}); tone(140, 0.2, {type: 'square', vol: 0.1, at: 0.08}); },
  arrive() { if (!throttle('arrive', 250)) noise(0.35, {vol: 0.06, from: 300, to: 1800}); },
  newCountry() { if (!throttle('new', 300)) { tone(880, 0.1, {type: 'sine', vol: 0.12}); tone(1320, 0.14, {type: 'sine', vol: 0.1, at: 0.07}); } },
  alarm() { for (let i = 0; i < 3; i++) { tone(740, 0.16, {type: 'sawtooth', vol: 0.09, at: i * 0.34}); tone(560, 0.16, {type: 'sawtooth', vol: 0.09, at: i * 0.34 + 0.17}); } },
  impact() { tone(90, 0.5, {type: 'sine', vol: 0.5, slide: 0.4}); noise(0.4, {vol: 0.15, from: 2000, to: 200}); },
  block() { tone(220, 0.08, {type: 'square', vol: 0.12}); noise(0.15, {vol: 0.1, from: 4000, to: 800}); },
  launch() { noise(0.9, {vol: 0.18, from: 200, to: 4000}); tone(220, 0.8, {type: 'sawtooth', vol: 0.06, slide: 3}); },
  fanfare() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.4, {type: 'triangle', vol: 0.22, at: i * 0.11})); tone(262, 1.2, {type: 'sine', vol: 0.3, at: 0.1}); },
  doom() { [196, 185, 165, 131].forEach((f, i) => tone(f, 0.7, {type: 'sawtooth', vol: 0.1, at: i * 0.32})); tone(65, 2, {type: 'sine', vol: 0.4}); },
  news() { tone(1175, 0.07, {type: 'square', vol: 0.05}); tone(1568, 0.09, {type: 'square', vol: 0.05, at: 0.08}); },
  whoosh() { noise(0.5, {vol: 0.1, from: 600, to: 3000}); },
};

// Musique générative, une couleur par nation : gamme, timbre, rythme, motif.
const MAJOR = [0, 2, 4, 5, 7, 9, 11], PENTA = [0, 2, 4, 7, 9], MINOR = [0, 2, 3, 5, 7, 8, 10];
const MUSIC = {
  FR: {root: 131, scale: MAJOR, wave: 'square', step: 380, vol: 0.022, waltz: true},          // musette à trois temps
  IT: {root: 147, scale: MAJOR, wave: 'triangle', step: 330, vol: 0.05, tremolo: 3},          // mandoline
  US: {root: 110, scale: PENTA, wave: 'sawtooth', step: 400, vol: 0.02, swing: true},         // blues de diner
  MX: {root: 165, scale: MAJOR, wave: 'triangle', step: 250, vol: 0.05, arpeggio: true},      // guitare de mariachi
  GB: {root: 220, scale: MAJOR, wave: 'sine', step: 620, vol: 0.06, motif: [4, 2, 0, -5, 0, 4, 2, -5]}, // carillon
  CN: {root: 196, scale: PENTA, wave: 'triangle', step: 420, vol: 0.05},                      // pentatonique pincée
  RU: {root: 98, scale: MINOR, wave: 'sawtooth', step: 480, vol: 0.022, tremolo: 4},          // balalaïka mineure
};
const DEFAULT_MUSIC = {root: 110, scale: [0, 3, 5, 7, 10], wave: 'triangle', step: 520, vol: 0.05};
export function startMusic(mood = 'calm', nation) {
  if (!ctx) return;
  stopMusic();
  const m = MUSIC[nation] || DEFAULT_MUSIC, tense = mood === 'tense';
  const scale = tense ? MINOR : m.scale, root = m.root;
  const note = deg => root * Math.pow(2, (scale[((deg % scale.length) + scale.length) % scale.length] + 12 * Math.floor(deg / scale.length)) / 12);
  const play = (f, dur, vol = m.vol, at = 0) => tone(f, dur, {type: m.wave, vol, bus: musicBus, attack: 0.01, at});
  let step = 0;
  const tick = () => {
    const bar = Math.floor(step / 8);
    if (step % 8 === 0) [0, 2, 4].forEach((d, i) => tone(note(d + (bar % 4 === 3 ? 3 : 0)) / 2, 4, {type: 'sine', vol: 0.05, attack: 1, bus: musicBus, at: i * 0.04}));
    if (m.motif) { if (step % 2 === 0) { const d = m.motif[(step / 2) % m.motif.length]; tone(root * Math.pow(2, d / 12) * 2, 1.4, {type: 'sine', vol: m.vol, bus: musicBus}); } }
    else if (m.waltz) { const beat = step % 3; if (beat === 0) play(note(0) / 2, 0.3, m.vol * 1.5); else play(note(2 + beat + (bar % 2) * 2), 0.18); }
    else if (m.arpeggio) { play(note([0, 2, 4, 7][step % 4] + (bar % 2) * 3), 0.2); }
    else if (Math.random() < (m.swing ? 0.6 : 0.55)) {
      const f = note(Math.floor(Math.random() * scale.length) + scale.length);
      if (m.tremolo) for (let r = 0; r < m.tremolo; r++) play(f, 0.07, m.vol, r * 0.07);
      else play(f, m.swing ? 0.5 : 0.8, m.vol, m.swing && step % 2 ? 0.08 : 0);
    }
    step++;
  };
  tick();
  musicTimer = setInterval(tick, tense ? m.step * 0.75 : m.step);
}
export function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; }
