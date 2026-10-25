import {NATIONS, DIFFICULTIES, EVENTS, NEWS, EVENT_VARIANT_COUNT, researchNodes, nationIdentity, actionCopy, eventFor} from './data.js';
export const VERSION=2;
const clamp=(x,min=0,max=100)=>Math.max(min,Math.min(max,x));
export function createGame(world,nation='FR',difficulty='normal',seed=Date.now()) {
  const s={version:VERSION,nation,difficulty,seed:seed>>>0,day:0,speed:1,paused:false,status:'playing',resources:{folklore:48,buzz:36,pride:30,insight:12},integrity:100,cringe:4,purity:100,purityUntil:0,research:[],researchTask:null,countries:{},selected:nation,planes:[],bubbles:[],log:[],event:null,eventSerial:0,eventDecks:{},cooldowns:{tourist:0,debate:0,chain:0,calm:0},nextId:1,stats:{collected:0,intercepted:0,research:0},news:NEWS[0]};
  for(const c of world) s.countries[c.id]={influence:c.id===nation?100:0,chain:false,converted:c.id===nation};
  log(s,`${nationIdentity(nation).operation} : ${NATIONS[nation].motto}`,'start');
  return s;
}
export function random(s) {s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0;return s.seed/4294967296;}
export function log(s,text,type='info'){s.log.unshift({day:s.day,text,type});s.log=s.log.slice(0,100);s.news=text;}
export function levels(s){return {sym:s.research.filter(x=>x.startsWith('symptoms')).length,trans:s.research.filter(x=>x.startsWith('transmission')).length,def:s.research.filter(x=>x.startsWith('defense')).length};}
export function metrics(s){const all=Object.values(s.countries);return {total:all.length,converted:all.filter(c=>c.influence>=100).length,infected:all.filter(c=>c.influence>0).length,global:all.reduce((a,c)=>a+c.influence,0)/all.length};}
export function income(s){const m=metrics(s),l=levels(s),d=DIFFICULTIES[s.difficulty];return {folklore:(.38+m.converted*.032)*(s.nation==='FR'?1.25:s.nation==='MX'?1.15:1)*d.income,buzz:(.24+m.infected*.008)*(s.nation==='US'?1.25:s.nation==='MX'?1.15:1)*d.income,pride:(.25+m.converted*.006)*(s.purity/100)*(l.def>=2?1.35:1)*(s.nation==='IT'?1.25:1)*d.income,insight:(.10+m.converted*.003+l.trans*.012)*(s.nation==='CN'?1.25:1)*d.income};}
export function researchSpeed(s){return 1+Math.sqrt(s.resources.insight)/8;}
export function researchETA(s){return s.researchTask?Math.ceil((s.researchTask.total-s.researchTask.progress)/researchSpeed(s)):0;}
export function canPay(s,cost){return Object.entries(cost).every(([key,value])=>s.resources[key]>=value);}
function pay(s,cost){for(const [key,value] of Object.entries(cost))s.resources[key]-=value;}
export function buyResearch(s,branch,index){
  if(s.status!=='playing'||s.event)return {ok:false,message:'Terminez l’événement en cours.'};
  if(!['symptoms','transmission','defense'].includes(branch)||!Number.isInteger(index)||index<0||index>5)return {ok:false,message:'Recherche inconnue.'};
  const node=researchNodes(s.nation,branch)[index], resource={symptoms:'folklore',transmission:'buzz',defense:'pride'}[branch];
  if(s.research.includes(node.id))return {ok:false,message:'Recherche déjà débloquée.'};
  if(s.researchTask)return {ok:false,message:'Le laboratoire travaille déjà sur une recherche.'};
  if(node.prerequisite&&!s.research.includes(node.prerequisite))return {ok:false,message:'Débloquez le niveau précédent.'};
  if(!canPay(s,{[resource]:node.cost}))return {ok:false,message:'Ressources insuffisantes.'};
  pay(s,{[resource]:node.cost});s.researchTask={id:node.id,branch,tier:index,progress:0,total:node.duration};
  log(s,`Recherche lancée : ${node.title}.`,'research');return {ok:true,message:`Recherche lancée · environ ${researchETA(s)} s de simulation.`};
}
export const ACTIONS={tourist:{name:'Envoyer un touriste',cost:{buzz:12},cooldown:12},debate:{name:'Débat culinaire',cost:{folklore:14,buzz:8},cooldown:18},chain:{name:'Ouvrir une enseigne',cost:{folklore:26,buzz:18},cooldown:24},repair:{name:'Restaurer l’Emblème',cost:{pride:22},cooldown:0},intercept:{name:'Intercepter',cost:{pride:12},cooldown:0},calm:{name:'Appel au calme',cost:{buzz:18},cooldown:35}};
export function action(s,type,target=s.selected){
  const a=ACTIONS[type];if(!a||s.status!=='playing'||s.event)return {ok:false,message:'Action indisponible.'};
  if((s.cooldowns[type]||0)>s.day)return {ok:false,message:'Compétence en recharge.'};
  if(!canPay(s,a.cost))return {ok:false,message:'Ressources insuffisantes.'};
  const c=s.countries[target];
  if(['tourist','debate','chain'].includes(type)&&(!c||target===s.nation||c.influence>=100))return {ok:false,message:'Choisissez un territoire à convertir.'};
  if(type==='chain'&&c.chain)return {ok:false,message:'Une enseigne est déjà installée.'};
  if(type==='repair'&&s.integrity>=100)return {ok:false,message:'Votre Emblème est intact.'};
  if(type==='intercept'&&!s.planes.length)return {ok:false,message:'Aucun sabotage en approche.'};
  pay(s,a.cost);s.cooldowns[type]=s.day+a.cooldown;
  if(type==='tourist'){c.influence=clamp(c.influence+12);s.cringe=clamp(s.cringe+1);}
  if(type==='debate'){c.influence=clamp(c.influence+24);s.cringe=clamp(s.cringe+4);}
  if(type==='chain'){c.chain=true;c.influence=clamp(c.influence+8);s.cringe=clamp(s.cringe+3);}
  if(type==='repair'){s.integrity=clamp(s.integrity+28);}
  if(type==='intercept'){const i=s.planes.reduce((best,p,i,a)=>p.eta<a[best].eta?i:best,0);s.planes.splice(i,1);s.stats.intercepted++;}
  if(type==='calm')s.cringe=clamp(s.cringe-12);
  const message=actionCopy(s.nation,type).success;log(s,message,['repair','intercept','calm'].includes(type)?'defense':'action');return {ok:true,message};
}
export function collect(s,id){if(s.status!=='playing'||s.event)return false;const i=s.bubbles.findIndex(b=>b.id===id);if(i<0)return false;const b=s.bubbles.splice(i,1)[0];s.resources[b.resource]+=b.value;s.stats.collected++;return b;}
export function resolveEvent(s,index){
  if(!s.event)return false;const event=eventFor(s.nation,s.event.id,s.event.variant??0),choice=event?.choices[index];
  if(!choice||!canPay(s,choice.cost))return false;pay(s,choice.cost);
  for(const [k,v] of Object.entries(choice.gain))s.resources[k]+=v;
  s.cringe=clamp(s.cringe+(choice.cringe||0));s.integrity=clamp(s.integrity+(choice.integrity||0));
  if(choice.purity){s.purity=clamp(s.purity-choice.purity*(levels(s).def>=3?.75:1),40,100);s.purityUntil=s.day+40;}
  log(s,`${event.title} : ${choice.label}.`,'event');s.event=null;if(s.integrity<=0)finish(s,'lost');return true;
}
function finish(s,status){s.status=status;s.paused=true;log(s,status==='won'?nationIdentity(s.nation).victory:nationIdentity(s.nation).defeat,'end');}
function distance(a,b){const dx=Math.min(Math.abs(a.lon-b.lon),360-Math.abs(a.lon-b.lon));return dx*dx*Math.cos((a.lat+b.lat)*Math.PI/360)**2+(a.lat-b.lat)**2;}
// Shuffled bags use the simulation PRNG and are saved with the campaign. Every
// variant appears once per cycle; the boundary cannot repeat the last story.
export function nextEvent(s,id){
  if(!EVENTS.some(e=>e.id===id))return null;
  s.eventDecks??={};
  let deck=s.eventDecks[id];
  if(!deck?.remaining.length){
    const last=deck?.last;
    const remaining=Array.from({length:EVENT_VARIANT_COUNT},(_,i)=>i);
    for(let i=remaining.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[remaining[i],remaining[j]]=[remaining[j],remaining[i]];}
    if(remaining.at(-1)===last)[remaining[0],remaining[remaining.length-1]]=[remaining.at(-1),remaining[0]];
    deck=s.eventDecks[id]={remaining,last:last??null};
  }
  const variant=deck.remaining.pop();deck.last=variant;
  return {id,variant};
}
export function tick(s,world){
  if(s.paused||s.event||s.status!=='playing')return;
  s.day++;const l=levels(s),m=metrics(s),d=DIFFICULTIES[s.difficulty];
  for(const [key,value] of Object.entries(income(s)))s.resources[key]=Math.min(9999,s.resources[key]+value);
  if(s.researchTask){
    s.researchTask.progress=Math.min(s.researchTask.total,s.researchTask.progress+researchSpeed(s));
    if(s.researchTask.progress>=s.researchTask.total){
      const task=s.researchTask,node=researchNodes(s.nation,task.branch)[task.tier];
      s.research.push(task.id);s.stats.research++;
      if(task.branch==='symptoms')s.cringe=clamp(s.cringe+5+task.tier*1.2);
      if(task.branch==='transmission')s.cringe=clamp(s.cringe+2);
      s.researchTask=null;log(s,`Recherche terminée : ${node.title}. Effets activés.`,'research');
    }
  }
  if(s.day>=s.purityUntil)s.purity=clamp(s.purity+.4);
  const rate=(.11+l.sym*.095+l.trans*.055+(l.trans>=2?.06:0)+(l.trans>=4?.12:0)+(l.trans>=6?.18:0)+(l.def>=6?.1:0))*d.growth;
  for(const [id,c] of Object.entries(s.countries)){
    if(c.influence>0&&c.influence<100){
      const resistance=.75+((id.charCodeAt(0)+id.charCodeAt(1))%8)/15;
      c.influence=clamp(c.influence+(rate+(c.chain?.30:0))/resistance);
    }
    if(c.influence>=100&&!c.converted){c.converted=true;s.resources.folklore+=7;s.resources.pride+=3;const country=world.find(c=>c.id===id);log(s,`${country?.name||id} ${nationIdentity(s.nation).conversion}. +7 Folklore, +3 Chauvinisme.`,'conversion');}
  }
  const interval=l.trans>=6?4:l.trans>=1?6:8;
  if(s.day%interval===0){
    let count=1+Math.floor(m.infected/16)+(l.trans>=3?2:0)+(l.trans>=5?3:0);
    let untouched=world.filter(c=>s.countries[c.id].influence===0);
    const carriers=world.filter(c=>s.countries[c.id].influence>=15);
    for(let i=0;i<count&&untouched.length&&carriers.length;i++){
      const source=carriers[Math.floor(random(s)*carriers.length)];
      const isFlight=l.trans>=3||s.day%24===0;
      const target=isFlight?untouched[Math.floor(random(s)*untouched.length)]:untouched.reduce((a,b)=>distance(source,a)<distance(source,b)?a:b);
      s.countries[target.id].influence=2+l.trans;untouched=untouched.filter(c=>c.id!==target.id);
    }
  }
  s.cringe=clamp(s.cringe+(.006+l.sym*.013+m.global*.0007)*(l.def>=3?.75:1));
  if(l.def>=5)s.integrity=clamp(s.integrity+.12);
  if(s.day%9===0){const choices=world.filter(c=>s.countries[c.id].influence>0);const at=choices[Math.floor(random(s)*choices.length)],r=['folklore','folklore','buzz','pride','insight'][Math.floor(random(s)*5)];s.bubbles.push({id:s.nextId++,country:at.id,resource:r,value:r==='folklore'?7:r==='insight'?4:5,expires:s.day+22});}
  s.bubbles=s.bubbles.filter(b=>b.expires>s.day);
  if(s.cringe>=23&&s.day%Math.max(14,Math.round(48-s.cringe*.25))===0){
    const enemies=world.filter(c=>s.countries[c.id].influence<100);
    if(enemies.length){const from=enemies[Math.floor(random(s)*enemies.length)],attack=NATIONS[s.nation].sabotage[Math.floor(random(s)*3)];s.planes.push({id:s.nextId++,from:from.id,eta:20,total:20,label:attack,damage:(9+s.cringe*.09)*d.damage});log(s,`O.N.U.C. : ${attack}. Sabotage en approche !`,'danger');}
  }
  for(const p of s.planes)p.eta--;
  for(const p of s.planes.filter(p=>p.eta<=0)){const shield=(1-(l.def>=1?.15:0)-(l.def>=4?.20:0)-(l.def>=6?.20:0))*(s.nation==='GB'?.8:s.nation==='RU'?.85:1);const hit=Math.round(p.damage*shield);s.integrity=clamp(s.integrity-hit);log(s,`${p.label} : l’Emblème perd ${hit} points d’intégrité.`,'danger');}
  s.planes=s.planes.filter(p=>p.eta>0);
  if(s.day%37===0){const bulletin=nationIdentity(s.nation).news;s.news=bulletin[Math.floor(random(s)*bulletin.length)];}
  if(s.integrity<=0){finish(s,'lost');return;}
  if(Object.values(s.countries).every(c=>c.influence>=100)){finish(s,'won');return;}
  if(s.day%68===0){let index=Math.floor(random(s)*EVENTS.length);if(index===0&&(s.countries[s.nation==='IT'?'FR':'IT']?.influence>=100||l.sym+l.trans===0))index=1;s.event=nextEvent(s,EVENTS[index].id);s.eventSerial++;}
}
export function restoreGame(raw,world){
  try{const s=JSON.parse(raw);if(s.version===1&&s.resources){s.version=VERSION;s.resources.insight=12;s.researchTask=null;}if(s.version!==VERSION||!Object.hasOwn(NATIONS,s.nation)||!Object.hasOwn(DIFFICULTIES,s.difficulty)||!['playing','won','lost'].includes(s.status))return null;
    const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
    if(!finite(s.day,0,1e8)||!finite(s.seed,0,4294967295)||!finite(s.integrity,0,100)||!finite(s.cringe,0,100)||!finite(s.purity,0,100)||!finite(s.purityUntil,0,1e8)||!finite(s.nextId,1,1e9)||!finite(s.eventSerial,0,1e8))return null;
    if(!s.resources||!['folklore','buzz','pride','insight'].every(k=>finite(s.resources[k],0,100000)))return null;
    if(!s.countries||Object.keys(s.countries).length!==world.length||!world.every(c=>s.countries[c.id]&&finite(s.countries[c.id].influence,0,100)&&typeof s.countries[c.id].chain==='boolean'&&typeof s.countries[c.id].converted==='boolean'))return null;
    if(!s.countries[s.selected]||!Array.isArray(s.research)||s.research.length>18)return null;
    const valid=new Set(['symptoms','transmission','defense'].flatMap(b=>researchNodes(s.nation,b).map(n=>n.id)));
    if(s.research.some(r=>!valid.has(r))||new Set(s.research).size!==s.research.length)return null;
    for(const b of ['symptoms','transmission','defense'])for(let i=1;i<6;i++)if(s.research.includes(`${b}-${i}`)&&!s.research.includes(`${b}-${i-1}`))return null;
    if(s.researchTask!==null){
      const t=s.researchTask;if(!t||!['symptoms','transmission','defense'].includes(t.branch)||!Number.isInteger(t.tier)||t.tier<0||t.tier>5)return null;
      const n=researchNodes(s.nation,t.branch)[t.tier];if(t.id!==n.id||t.total!==n.duration||!finite(t.progress,0,t.total)||s.research.includes(t.id)||(n.prerequisite&&!s.research.includes(n.prerequisite)))return null;
    }
    if(!Array.isArray(s.planes)||s.planes.length>100||s.planes.some(p=>!s.countries[p.from]||!finite(p.eta,0,20)||p.total!==20||!finite(p.damage,0,100)||typeof p.label!=='string'||!finite(p.id,1,1e9)))return null;
    if(!Array.isArray(s.bubbles)||s.bubbles.length>100||s.bubbles.some(b=>!s.countries[b.country]||!['folklore','buzz','pride','insight'].includes(b.resource)||!finite(b.value,0,100)||!finite(b.expires,0,1e8)||!finite(b.id,1,1e9)))return null;
    if(!s.cooldowns||Object.values(s.cooldowns).some(v=>!finite(v,0,1e8))||!s.stats||!['collected','intercepted','research'].every(k=>finite(s.stats[k],0,1e8)))return null;
    if(!Array.isArray(s.log)||s.log.length>100||s.log.some(l=>typeof l.text!=='string'||!finite(l.day,0,1e8)))return null;
    if(s.event&&!EVENTS.some(e=>e.id===s.event.id))return null;
    const variant=v=>Number.isInteger(v)&&v>=0&&v<EVENT_VARIANT_COUNT;
    if(s.event){if(s.event.variant===undefined)s.event.variant=0;else if(!variant(s.event.variant))return null;}
    if(s.eventDecks===undefined)s.eventDecks={};
    if(!s.eventDecks||typeof s.eventDecks!=='object'||Array.isArray(s.eventDecks)||Object.keys(s.eventDecks).some(id=>!EVENTS.some(e=>e.id===id)))return null;
    for(const deck of Object.values(s.eventDecks))if(!deck||!Array.isArray(deck.remaining)||deck.remaining.length>=EVENT_VARIANT_COUNT||!deck.remaining.every(variant)||new Set(deck.remaining).size!==deck.remaining.length||!variant(deck.last)||deck.remaining.includes(deck.last))return null;
    // An event already open in an older save counts as seen in its first cycle.
    if(s.event&&!s.eventDecks[s.event.id])s.eventDecks[s.event.id]={remaining:Array.from({length:EVENT_VARIANT_COUNT},(_,i)=>i).filter(i=>i!==s.event.variant),last:s.event.variant};
    s.speed=[1,2,4].includes(s.speed)?s.speed:1;s.paused=true;return s;
  }catch{return null;}
}
