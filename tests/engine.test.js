import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGame,tick,metrics,income,buyResearch,action,collect,resolveEvent,restoreGame,researchSpeed,researchETA} from '../engine.js';
import {NATIONS,EVENTS,researchNodes} from '../data.js';
const world=JSON.parse(readFileSync(new URL('../assets/world.json',import.meta.url),'utf8'));
const fresh=(n='FR',d='normal')=>createGame(world,n,d,12345);

test('Carte complète, identifiants uniques et quatre nations sélectionnables',()=>{
  assert.equal(world.length,236);assert.equal(new Set(world.map(c=>c.id)).size,236);
  for(const n of Object.keys(NATIONS)){const s=fresh(n);assert.equal(s.countries[n].influence,100);assert.equal(metrics(s).converted,1);assert.ok(world.find(c=>c.id===n).path);}
});
test('La pause et les événements figent la simulation et les ressources',()=>{
  const s=fresh();s.paused=true;const original=JSON.stringify(s);tick(s,world);assert.equal(JSON.stringify(s),original);
  s.paused=false;s.event={id:'food'};const withEvent=JSON.stringify(s);tick(s,world);assert.equal(JSON.stringify(s),withEvent);
});
test('Propagation géographique et ressources effectives',()=>{
  const s=fresh();for(let i=0;i<60;i++)tick(s,world);assert.ok(metrics(s).infected>2);assert.ok(s.resources.buzz>36);assert.equal(s.day,60);
});
test('Les bonus nationaux et la pureté modifient effectivement les revenus',()=>{
  const f=fresh('FR'),u=fresh('US'),i=fresh('IT'),g=fresh('GB');
  assert.equal(income(f).folklore,income(g).folklore*1.25);assert.equal(income(u).buzz,income(g).buzz*1.25);assert.equal(income(i).pride,income(g).pride*1.25);
  const prior=income(f).pride;f.purity=50;assert.equal(income(f).pride,prior/2);
});
test('Recherches : coûts, prérequis, achat unique et rejet des identifiants invalides',()=>{
  const s=fresh();assert.equal(buyResearch(s,'symptoms',1).ok,false);assert.equal(buyResearch(s,'nonsense',0).ok,false);
  assert.equal(buyResearch(s,'symptoms',0).ok,true);assert.equal(s.resources.folklore,30);assert.equal(s.research.length,0);assert.equal(s.cringe,4);assert.equal(s.researchTask.id,'symptoms-0');
  assert.equal(buyResearch(s,'transmission',0).ok,false);
  for(let i=0;i<35&&s.researchTask;i++)tick(s,world);
  assert.equal(s.research.length,1);assert.equal(s.researchTask,null);assert.ok(s.cringe>=9);
  assert.equal(buyResearch(s,'symptoms',0).ok,false);s.resources.folklore=0;assert.equal(buyResearch(s,'symptoms',1).ok,false);
});
test('La recherche progresse avec le temps, les effets attendent sa fin',()=>{
  const s=fresh();buyResearch(s,'symptoms',0);tick(s,world);
  assert.equal(s.research.length,0);assert.ok(s.researchTask.progress>0);assert.ok(s.researchTask.progress<s.researchTask.total);
  assert.equal(s.stats.research,0);assert.ok(researchETA(s)>0);
  const progress=s.researchTask.progress;s.paused=true;tick(s,world);assert.equal(s.researchTask.progress,progress);
  s.paused=false;s.event={id:'food'};tick(s,world);assert.equal(s.researchTask.progress,progress);
});
test('La Matière grise accélère sans être dépensée et augmente la vitesse en cours de projet',()=>{
  const slow=fresh(),fast=fresh();slow.resources.insight=0;fast.resources.insight=64;
  assert.equal(researchSpeed(slow),1);assert.equal(researchSpeed(fast),2);
  buyResearch(slow,'symptoms',0);buyResearch(fast,'symptoms',0);
  assert.equal(fast.resources.insight,64);assert.ok(researchETA(fast)<researchETA(slow));
  for(let i=0;i<10;i++){tick(slow,world);tick(fast,world);}
  assert.ok(fast.researchTask.progress>slow.researchTask.progress*1.8);assert.ok(fast.resources.insight>64);
  const before=slow.researchTask.progress;slow.resources.insight+=256;tick(slow,world);assert.ok(slow.researchTask.progress-before>3);
});
test('La sauvegarde conserve le laboratoire et migre les anciennes campagnes',()=>{
  const s=fresh();buyResearch(s,'transmission',0);for(let i=0;i<8;i++)tick(s,world);
  const restored=restoreGame(JSON.stringify(s),world);assert.deepEqual(restored.researchTask,s.researchTask);assert.equal(restored.resources.insight,s.resources.insight);
  const legacy=fresh();legacy.version=1;delete legacy.resources.insight;delete legacy.researchTask;
  const migrated=restoreGame(JSON.stringify(legacy),world);assert.equal(migrated.version,2);assert.equal(migrated.resources.insight,12);assert.equal(migrated.researchTask,null);
  s.researchTask.total=1;assert.equal(restoreGame(JSON.stringify(s),world),null);
});
test('Actions actives : dépenses, recharge, foyers distants et enseigne permanente',()=>{
  const s=fresh();assert.equal(action(s,'tourist','JP').ok,true);assert.equal(s.countries.JP.influence,12);assert.equal(s.resources.buzz,24);assert.equal(action(s,'tourist','JP').ok,false);
  s.resources.folklore=100;s.resources.buzz=100;assert.equal(action(s,'chain','JP').ok,true);assert.equal(s.countries.JP.chain,true);
  s.day=30;assert.equal(action(s,'chain','JP').ok,false);assert.equal(action(s,'tourist','FR').ok,false);
});
test('Les bulles ne peuvent être collectées qu’une fois et expirent',()=>{
  const s=fresh();for(let i=0;i<9;i++)tick(s,world);const b=s.bubbles[0],before=s.resources[b.resource];assert.ok(collect(s,b.id));assert.equal(s.resources[b.resource],before+b.value);assert.equal(collect(s,b.id),false);
  for(let i=0;i<27;i++)tick(s,world);assert.ok(s.bubbles.every(b=>b.expires>s.day));
});
test('Un sabotage inflige des dégâts, les recherches et le Royaume-Uni les atténuent',()=>{
  const f=fresh(),g=fresh('GB');for(const s of [f,g])s.planes=[{id:1,from:'JP',eta:1,total:20,label:'Test',damage:20}];
  tick(f,world);tick(g,world);assert.equal(f.integrity,80);assert.equal(g.integrity,84);
  f.research=['defense-0'];f.planes=[{id:2,from:'JP',eta:1,total:20,label:'Test',damage:20}];tick(f,world);assert.equal(f.integrity,63);
});
test('L’interception cible le sabotage le plus proche et la restauration est plafonnée',()=>{
  const s=fresh();s.resources.pride=100;s.planes=[{id:1,eta:10},{id:2,eta:3}];assert.equal(action(s,'intercept').ok,true);assert.equal(s.planes[0].id,1);assert.equal(s.stats.intercepted,1);assert.equal(s.resources.pride,88);
  s.integrity=90;assert.equal(action(s,'repair').ok,true);assert.equal(s.integrity,100);assert.equal(action(s,'repair').ok,false);
});
test('Événements : choix gratuits disponibles, coûts vérifiés et contre-clichés temporaires',()=>{
  const s=fresh();s.event={id:'counter'};s.resources.pride=0;assert.equal(resolveEvent(s,0),false);assert.equal(resolveEvent(s,1),true);assert.equal(s.event,null);assert.equal(s.purity,80);
  for(let i=0;i<60;i++)tick(s,world);assert.ok(s.purity>80);
  for(const e of EVENTS)assert.ok(e.choices.some(c=>Object.keys(c.cost).length===0));
});
test('Victoire et défaite terminales, avec priorité à la destruction de l’Emblème',()=>{
  const s=fresh();for(const c of Object.values(s.countries))c.influence=100;tick(s,world);assert.equal(s.status,'won');const day=s.day;tick(s,world);assert.equal(s.day,day);
  const d=fresh();d.integrity=1;d.planes=[{id:1,eta:1,total:20,damage:30,label:'Test',from:'JP'}];tick(d,world);assert.equal(d.status,'lost');
  const both=fresh();for(const c of Object.values(both.countries))c.influence=100;both.integrity=0;tick(both,world);assert.equal(both.status,'lost');
});
test('Sauvegarde aller-retour, pause à la reprise et rejet des données corrompues',()=>{
  const s=fresh();for(let i=0;i<45;i++)tick(s,world);const restored=restoreGame(JSON.stringify(s),world);assert.ok(restored);assert.equal(restored.paused,true);assert.deepEqual(restored.countries,s.countries);assert.equal(restored.day,45);
  assert.equal(restoreGame('{}',world),null);assert.equal(restoreGame('invalid JSON',world),null);
  for(const mutate of [s=>{s.resources.buzz=-1;},s=>{s.research=['symptoms-5'];},s=>{s.event={id:'bogus'};},s=>{s.countries.JP.influence=101;},s=>{s.planes=[{from:'XX'}];}]){const bad=fresh();mutate(bad);assert.equal(restoreGame(JSON.stringify(bad),world),null);}
});

// Integration strategy: invest in diffusion, keep a defensive reserve, collect the map,
// and intercept immediate threats. No resource injection or forced conversions.
function playCampaign(nation,difficulty){
  const s=fresh(nation,difficulty);
  for(let t=0;t<3000&&s.status==='playing';t++){
    if(s.event){const e=EVENTS.find(e=>e.id===s.event.id);let choice=e.id==='food'?1:e.id==='counter'?0:e.id==='summit'?0:1;if(!resolveEvent(s,choice))resolveEvent(s,e.choices.findIndex(c=>Object.keys(c.cost).length===0));}
    for(const b of [...s.bubbles])collect(s,b.id);
    if(s.planes.some(p=>p.eta<=4))action(s,'intercept');
    if(s.integrity<65)action(s,'repair');
    for(const branch of ['transmission','symptoms','defense']){
      const next=researchNodes(s.nation,branch).find(n=>!s.research.includes(n.id));
      if(next&&(branch!=='defense'||s.resources.pride>=next.cost+26))buyResearch(s,branch,next.tier);
    }
    tick(s,world);
  }
  return s;
}
for(const nation of Object.keys(NATIONS))test(`Campagne complète ${nation} : victoire possible sans tricher`,()=>{
  const s=playCampaign(nation,'normal');assert.equal(s.status,'won',`${nation}: jour ${s.day}, intégrité ${s.integrity}, ${metrics(s).converted} convertis`);assert.ok(s.day<1800);assert.ok(s.resources.pride>=0);
  console.log(`${nation}: victoire au jour ${s.day}, intégrité ${Math.round(s.integrity)}, ${s.stats.intercepted} sabotages interceptés.`);
});
test('La difficulté impérialiste reste gagnable',()=>{const s=playCampaign('FR','hard');assert.equal(s.status,'won');});
