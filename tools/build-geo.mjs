// Prépare les données de jeu à partir de assets/world.json :
// population, richesse, climat, ports, voisins terrestres, points de densité.
// Usage : node tools/build-geo.mjs
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const world = JSON.parse(readFileSync(resolve(here, '../assets/world.json'), 'utf8'));

// Population en millions (ordre de grandeur 2024, valeurs de jeu).
const POP = `ID 279,MY 34,CL 19.6,BO 12.4,PE 34,AR 46,CY 1.3,IN 1430,CN 1410,IL 9.8,PS 5.4,LB 5.5,ET 127,SS 11,SO 18,KE 55,MW 21,TZ 67,SY 23,FR 68,SR .62,GY .81,KR 51.7,KP 26,MA 37.5,EH .6,CR 5.2,NI 7,CG 6,CD 102,BT .78,UA 37,BY 9.2,NA 2.6,ZA 62,MF .03,SX .04,OM 4.6,UZ 36,KZ 20,TJ 10,LT 2.8,BR 216,UY 3.4,MN 3.4,RU 144,CZ 10.9,DE 84,EE 1.37,LV 1.88,NO 5.5,SE 10.5,FI 5.6,VN 99,KH 17,LU .66,AE 9.5,BE 11.8,GE 3.7,MK 1.8,AL 2.8,AZ 10.1,TR 85,ES 48,LA 7.6,KG 7,AM 2.8,DK 5.9,LY 6.9,TN 12.4,RO 19,HU 9.6,SK 5.4,PL 37,IE 5.2,GB 68,GR 10.4,ZM 20.5,SL 8.8,GN 14,LR 5.4,CF 5.7,SD 48,DJ 1.1,ER 3.7,AT 9.1,IQ 45,IT 59,CH 8.8,IR 89,NL 17.9,LI .04,CI 28,RS 6.6,ML 23,SN 18,NG 224,BJ 13.7,AO 37,HR 3.9,SI 2.1,QA 2.7,SA 36,BW 2.6,ZW 16.7,PK 240,BG 6.4,TH 70,SM .03,HT 11.7,DO 11.3,TD 18,KW 4.3,SV 6.3,GT 18,TL 1.4,BN .45,MC .04,DZ 45.6,MZ 33.9,SZ 1.2,BI 13,RW 14,MM 54,BD 173,AD .08,AF 42,ME .62,BA 3.2,UG 48.6,CU 11,HN 10.6,EC 18,CO 52,PY 6.9,PT 10.4,MD 2.5,TM 6.5,JO 11.3,NP 30.9,LS 2.3,CM 28.6,GA 2.4,NE 27,BF 23,TG 9,GH 34,GW 2.1,GI .03,US 335,CA 39,MX 128,BZ .41,PA 4.5,VE 28.8,PG 10.3,EG 112,YE 34.4,MR 4.9,GQ 1.7,GM 2.8,HK 7.5,VA .001,AU 26.6,GL .056,FJ .93,NZ 5.2,NC .27,MG 30,PH 117,LK 22,CW .19,AW .11,BS .41,TC .046,JP 124,PM .006,IS .39,PN 0,PF .28,TF 0,SC .1,KI .13,MH .04,TT 1.5,GD .13,VC .1,BB .28,LC .18,DM .07,UM 0,MS .005,AG .094,KN .047,VI .1,BL .01,PR 3.2,AI .016,VG .031,JM 2.8,KY .07,BM .064,HM 0,SH .005,MU 1.26,KM .85,ST .23,CV .6,MT .54,JE .1,GG .065,IM .084,AX .03,FO .054,IO 0,SG 5.9,NF .002,CK .017,TO .1,WF .011,WS .22,SB .74,TV .011,MV .52,NR .012,FM .115,GS 0,FK .004,VU .33,NU .002,AS .044,PW .018,GU .17,MP .05,BH 1.5,MO .7`;
const pop = Object.fromEntries(POP.split(',').map(s => { const [k, v] = s.trim().split(' '); return [k, Number(v)]; }));

const RICH = 'US CA GB IE FR DE NL BE LU CH AT IT ES PT DK NO SE FI IS JP KR AU NZ SG HK MO IL AE QA KW SA BH OM CZ SK SI EE LV LT PL HR HU GR CY MT UY CL PA BN GL PR MC LI AD SM VA GI JE GG IM AX FO BM KY AW CW SX MF BL VG VI GU MP NC PF PM FK TC AI BS BB AG KN'.split(' ');
const POOR = 'AF BF BI CF TD CD ER ET GM GN GW KP LR MG MW ML MZ NE RW SL SO SS SD SY TG UG YE HT'.split(' ');
const LOWMID = 'IN PK BD NG KE TZ EG VN PH MM KH LA NP BT LK UZ KG TJ MN UA MA TN DZ GH CI SN CM CG AO ZM ZW BJ MR DJ KM ST CV LS SZ PG SB VU KI FM TL HN NI BO SV PS LB IR EH'.split(' ');
const LANDLOCKED = 'AF AD AM AT AZ BY BT BO BW BF BI CF TD CZ SZ ET HU KZ KG LA LS LI LU MW ML MD MN NP NE MK PY RW SM RS SK SS CH TJ TM UG UZ VA ZM ZW'.split(' ');
// Les « Madagascar » : ferment leurs frontières au moindre soupçon.
const PARANOID = {MG: 6, GL: 5, IS: 9, NZ: 10, KP: 4, FK: 6, TV: 8, NR: 8, PN: 4};

const rings = path => path.split('Z').filter(Boolean).map(seg => seg.slice(1).split('L').map(p => p.split(',').map(Number)));
const ringArea = r => { let a = 0; for (let i = 0; i < r.length; i++) { const [x1, y1] = r[i], [x2, y2] = r[(i + 1) % r.length]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; };
function inside(rs, x, y) {
  let c = false;
  for (const r of rs) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
let seed = 1234567;
const rand = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;

const visible = world.filter(c => c.path);
const hidden = world.filter(c => !c.path);
const out = visible.map(c => ({id: c.id, name: c.name, x: c.x, y: c.y, lat: c.lat, path: c.path, pop: pop[c.id] ?? 0.01}));
const byId = Object.fromEntries(out.map(c => [c.id, c]));

// Les micro-territoires sans contour rejoignent le pays visible le plus proche.
for (const h of hidden) {
  let best = null, bd = Infinity;
  for (const c of out) { const d = (c.x - h.x) ** 2 + (c.y - h.y) ** 2; if (d < bd && c.pop > 0) { bd = d; best = c; } }
  best.pop = +(best.pop + (pop[h.id] ?? 0)).toFixed(4);
}

for (const c of out) {
  const rs = rings(c.path);
  c.rings = rs;
  c.area = rs.reduce((a, r) => a + ringArea(r), 0);
  c.wealth = RICH.includes(c.id) ? 1 : POOR.includes(c.id) ? 0.2 : LOWMID.includes(c.id) ? 0.45 : 0.7;
  c.climate = Math.abs(c.lat) >= 50 ? 'cold' : Math.abs(c.lat) <= 23.5 ? 'hot' : 'temp';
  c.port = !LANDLOCKED.includes(c.id);
  c.airport = c.pop >= 0.2 || (c.wealth >= 1 && c.pop > 0.02);
  // Seuil d'alerte (0-100) au-delà duquel le pays commence à fermer ses accès.
  c.paranoia = PARANOID[c.id] ?? Math.round(28 + 40 * (1 - c.wealth) * 0.6 + rand() * 30 - (c.pop < 1 ? 8 : 0));
}

// Voisins terrestres : un sommet de A proche d'un segment de B (ε en unités carte).
const EPS = 0.9, CELL = 4;
const grid = new Map();
const key = (gx, gy) => gx * 10000 + gy;
out.forEach((c, ci) => {
  for (const r of c.rings) for (let i = 0; i < r.length; i++) {
    const a = r[i], b = r[(i + 1) % r.length];
    const x0 = Math.floor((Math.min(a[0], b[0]) - EPS) / CELL), x1 = Math.floor((Math.max(a[0], b[0]) + EPS) / CELL);
    const y0 = Math.floor((Math.min(a[1], b[1]) - EPS) / CELL), y1 = Math.floor((Math.max(a[1], b[1]) + EPS) / CELL);
    for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) {
      const k = key(gx, gy); if (!grid.has(k)) grid.set(k, []); grid.get(k).push([ci, a, b]);
    }
  }
});
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
const contacts = new Map();
out.forEach((c, ci) => {
  for (const r of c.rings) for (const p of r) {
    const cell = grid.get(key(Math.floor(p[0] / CELL), Math.floor(p[1] / CELL))) || [];
    const seen = new Set();
    for (const [cj, a, b] of cell) {
      if (cj === ci || seen.has(cj)) continue;
      if (segDist(p, a, b) < EPS) { seen.add(cj); const k = Math.min(ci, cj) + ':' + Math.max(ci, cj); contacts.set(k, (contacts.get(k) || 0) + 1); }
    }
  }
});
for (const c of out) c.nb = [];
for (const [k, n] of contacts) {
  if (n < 3) continue;
  const [a, b] = k.split(':').map(Number);
  out[a].nb.push(out[b].id); out[b].nb.push(out[a].id);
}
// Enclaves dont le pays hôte n'a pas de trou dans son contour.
for (const [a, b] of [['LS', 'ZA']]) { byId[a].nb.push(b); byId[b].nb.push(a); }

// Points de densité (grille légèrement perturbée) : chacun porte un rang aléatoire
// qui décide de sa couleur selon les parts culturelles du pays.
const SP = 3.4;
let total = 0;
for (const c of out) {
  const pts = [];
  if (c.pop > 0) {
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const r of c.rings) for (const [x, y] of r) { minx = Math.min(minx, x); miny = Math.min(miny, y); maxx = Math.max(maxx, x); maxy = Math.max(maxy, y); }
    for (let gx = Math.floor(minx / SP) * SP; gx <= maxx; gx += SP) for (let gy = Math.floor(miny / SP) * SP; gy <= maxy; gy += SP) {
      const x = gx + (rand() - 0.5) * SP * 0.8, y = gy + (rand() - 0.5) * SP * 0.8;
      if (inside(c.rings, x, y)) pts.push([x, y]);
    }
    if (pts.length < 3) {
      const big = c.rings.reduce((m, r) => ringArea(r) > ringArea(m) ? r : m, c.rings[0]);
      const cx = big.reduce((a, p) => a + p[0], 0) / big.length, cy = big.reduce((a, p) => a + p[1], 0) / big.length;
      while (pts.length < 3) pts.push([cx + (rand() - 0.5) * 1.2, cy + (rand() - 0.5) * 1.2]);
    }
    // Plafond pour les géants, en gardant une répartition uniforme.
    while (pts.length > 420) pts.splice(Math.floor(rand() * pts.length), 1);
  }
  c.dots = pts.flatMap(([x, y]) => [+x.toFixed(1), +y.toFixed(1), Math.floor(rand() * 1000)]);
  total += pts.length;
}

// Position d'ancrage : centre de la plus grande île, ramené dans le polygone.
for (const c of out) {
  const big = c.rings.reduce((m, r) => ringArea(r) > ringArea(m) ? r : m, c.rings[0]);
  let cx = 0, cy = 0, a = 0;
  for (let i = 0; i < big.length; i++) { const [x1, y1] = big[i], [x2, y2] = big[(i + 1) % big.length]; const f = x1 * y2 - x2 * y1; a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f; }
  if (Math.abs(a) > 1e-6) { cx /= 3 * a; cy /= 3 * a; } else { cx = c.x; cy = c.y; }
  if (!inside([big], cx, cy) && c.dots.length) {
    let best = 0, bd = Infinity;
    for (let i = 0; i < c.dots.length; i += 3) { const d = (c.dots[i] - cx) ** 2 + (c.dots[i + 1] - cy) ** 2; if (d < bd) { bd = d; best = i; } }
    cx = c.dots[best]; cy = c.dots[best + 1];
  }
  c.x = +cx.toFixed(1); c.y = +cy.toFixed(1);
}

const NAMES_FR = {US:'États-Unis',CA:'Canada',MX:'Mexique',BR:'Brésil',AR:'Argentine',CL:'Chili',PE:'Pérou',CO:'Colombie',VE:'Venezuela',BO:'Bolivie',EC:'Équateur',PY:'Paraguay',UY:'Uruguay',GB:'Royaume-Uni',IE:'Irlande',FR:'France',DE:'Allemagne',IT:'Italie',ES:'Espagne',PT:'Portugal',BE:'Belgique',NL:'Pays-Bas',CH:'Suisse',AT:'Autriche',DK:'Danemark',NO:'Norvège',SE:'Suède',FI:'Finlande',IS:'Islande',PL:'Pologne',CZ:'Tchéquie',SK:'Slovaquie',HU:'Hongrie',RO:'Roumanie',BG:'Bulgarie',GR:'Grèce',TR:'Turquie',RU:'Russie',UA:'Ukraine',BY:'Biélorussie',LT:'Lituanie',LV:'Lettonie',EE:'Estonie',RS:'Serbie',HR:'Croatie',BA:'Bosnie',SI:'Slovénie',AL:'Albanie',MK:'Macédoine du Nord',ME:'Monténégro',MD:'Moldavie',GE:'Géorgie',AM:'Arménie',AZ:'Azerbaïdjan',KZ:'Kazakhstan',UZ:'Ouzbékistan',TM:'Turkménistan',KG:'Kirghizistan',TJ:'Tadjikistan',AF:'Afghanistan',PK:'Pakistan',IN:'Inde',NP:'Népal',BT:'Bhoutan',BD:'Bangladesh',LK:'Sri Lanka',CN:'Chine',MN:'Mongolie',KP:'Corée du Nord',KR:'Corée du Sud',JP:'Japon',TW:'Taïwan',VN:'Viêt Nam',LA:'Laos',KH:'Cambodge',TH:'Thaïlande',MM:'Birmanie',MY:'Malaisie',ID:'Indonésie',PH:'Philippines',PG:'Papouasie',AU:'Australie',NZ:'Nouvelle-Zélande',IR:'Iran',IQ:'Irak',SY:'Syrie',JO:'Jordanie',IL:'Israël',PS:'Palestine',LB:'Liban',SA:'Arabie saoudite',YE:'Yémen',OM:'Oman',AE:'Émirats',QA:'Qatar',KW:'Koweït',EG:'Égypte',LY:'Libye',TN:'Tunisie',DZ:'Algérie',MA:'Maroc',EH:'Sahara occidental',MR:'Mauritanie',ML:'Mali',NE:'Niger',TD:'Tchad',SD:'Soudan',SS:'Soudan du Sud',ET:'Éthiopie',ER:'Érythrée',DJ:'Djibouti',SO:'Somalie',KE:'Kenya',UG:'Ouganda',TZ:'Tanzanie',RW:'Rwanda',BI:'Burundi',CD:'RD Congo',CG:'Congo',GA:'Gabon',CM:'Cameroun',CF:'Centrafrique',NG:'Nigeria',BJ:'Bénin',TG:'Togo',GH:'Ghana',CI:'Côte d’Ivoire',BF:'Burkina Faso',LR:'Liberia',SL:'Sierra Leone',GN:'Guinée',GW:'Guinée-Bissau',SN:'Sénégal',GM:'Gambie',AO:'Angola',ZM:'Zambie',ZW:'Zimbabwe',MW:'Malawi',MZ:'Mozambique',NA:'Namibie',BW:'Botswana',ZA:'Afrique du Sud',LS:'Lesotho',SZ:'Eswatini',MG:'Madagascar',GL:'Groenland',CU:'Cuba',HT:'Haïti',DO:'Rép. dominicaine',JM:'Jamaïque',PR:'Porto Rico',BS:'Bahamas',GT:'Guatemala',BZ:'Belize',HN:'Honduras',SV:'Salvador',NI:'Nicaragua',CR:'Costa Rica',PA:'Panama',GY:'Guyana',SR:'Suriname',CY:'Chypre',LU:'Luxembourg',GQ:'Guinée équatoriale',TL:'Timor oriental',BN:'Brunei',FJ:'Fidji',NC:'Nouvelle-Calédonie',HK:'Hong Kong',TT:'Trinité-et-Tobago',MU:'Maurice',KM:'Comores',CV:'Cap-Vert',VU:'Vanuatu',SB:'Îles Salomon',WS:'Samoa',PF:'Polynésie',FK:'Malouines',TF:'Terres australes',GS:'Géorgie du Sud',HM:'Île Heard',UM:'Îles mineures',PN:'Pitcairn',IO:'Chagos'};

const data = out.map(c => ({
  id: c.id, name: NAMES_FR[c.id] || c.name, x: c.x, y: c.y, path: c.path,
  pop: +c.pop.toFixed(4), wealth: c.wealth, climate: c.climate, port: c.port, airport: c.airport,
  paranoia: c.paranoia, area: +c.area.toFixed(1), nb: c.nb, dots: c.dots,
}));
writeFileSync(resolve(here, '../js/geo-data.js'), '// Généré par tools/build-geo.mjs — ne pas modifier à la main.\nexport const GEO = ' + JSON.stringify(data) + ';\n');
console.log(`${data.length} territoires, ${total} points, population ${data.reduce((a, c) => a + c.pop, 0).toFixed(0)} M`);
for (const id of ['FR', 'US', 'GB', 'CN', 'RU', 'IT', 'MX', 'MG', 'AU', 'JP'])
  console.log(id, byId[id].nb.join(' '), '| dots', byId[id].dots.length / 3, '| pop', byId[id].pop, byId[id].climate, 'paranoia', byId[id].paranoia);
