import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {NATIONS,EVENTS,EVENT_VARIANT_COUNT,eventFor,NEWS,nationIdentity} from '../data.js';
import {createGame,nextEvent,resolveEvent,restoreGame,tick} from '../engine.js';
import {newsPool,NATIONAL_NEWS,WORLD_NEWS} from '../world-news.js';
import {EVENT_ART_LAYOUT} from '../event-art-layout.js';
const world=JSON.parse(readFileSync(new URL('../assets/world.json',import.meta.url)));

test('336 récits : titres, textes, trois décisions et cadrages uniques',()=>{
  const titles=new Set(),texts=new Set(),illustrations=new Set();
  for(const nation of Object.keys(NATIONS))for(const base of EVENTS)for(let variant=0;variant<EVENT_VARIANT_COUNT;variant++){
    const event=eventFor(nation,base.id,variant);
    titles.add(event.title);texts.add(event.text);
    const art=event.illustration;illustrations.add(`${art.src}:${art.column}:${art.row}`);
    assert.equal(event.choices.length,3);assert.ok(art.alt);
    assert.ok(art.column>=0&&art.column<4&&art.row>=0&&art.row<3);
    event.choices.forEach((choice,i)=>{assert.ok(choice.label);assert.deepEqual(choice.cost,base.choices[i].cost);assert.deepEqual(choice.gain,base.choices[i].gain);});
  }
  assert.equal(titles.size,336);assert.equal(texts.size,336);assert.equal(illustrations.size,336);
});

test('Les 28 planches WebP et leurs sources PNG de 12 cases sont disponibles',()=>{
  const hashes=new Set();
  for(const nation of Object.keys(NATIONS))for(const base of EVENTS){
    const path=new URL('../'+eventFor(nation,base.id).illustration.src,import.meta.url);
    assert.ok(existsSync(path),`Illustration manquante : ${path}`);
    const webp=readFileSync(path);assert.equal(webp.subarray(0,4).toString(),'RIFF');assert.equal(webp.subarray(8,12).toString(),'WEBP');
    hashes.add(createHash('sha256').update(webp).digest('hex'));
    const png=readFileSync(new URL(path.href.replace(/\.webp$/,'.png')));assert.equal(png.subarray(1,4).toString(),'PNG');
    const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
    assert.ok(width>=1200&&height>=900,`${path} : résolution insuffisante`);
    assert.ok(Math.abs(width/height-4/3)<.03,`${path} : proportion inattendue`);
    const layout=EVENT_ART_LAYOUT[`${nation.toLowerCase()}-${base.id}`];assert.ok(layout,'Le cadrage réel doit être enregistré.');
    assert.equal(layout.width,width);assert.equal(layout.height,height);
    for(const [cuts,extent,cells] of [[layout.columns,width,4],[layout.rows,height,3]]){
      assert.equal(cuts.length,cells+1);assert.equal(cuts[0],0);assert.equal(cuts.at(-1),extent);
      for(let i=1;i<cuts.length;i++)assert.ok(cuts[i]>cuts[i-1]);
    }
  }
  assert.equal(hashes.size,28,'Chaque nation et famille possède sa propre planche.');
});

test('Tirage déterministe : les 12 variantes passent avant répétition, même à la frontière',()=>{
  for(const nation of Object.keys(NATIONS))for(const {id} of EVENTS){
    const a=createGame(world,nation,'normal',786),b=createGame(world,nation,'normal',786);
    let last;
    for(let cycle=0;cycle<3;cycle++){
      const variants=[];
      for(let i=0;i<12;i++){
        const event=nextEvent(a,id);assert.deepEqual(event,nextEvent(b,id));
        assert.notEqual(event.variant,last);last=event.variant;variants.push(last);
      }
      assert.equal(new Set(variants).size,12);
    }
  }
});

test('La sauvegarde reprend la même illustration et le même tirage restant',()=>{
  const s=createGame(world,'MX','normal',122);
  for(let i=0;i<5;i++)s.event=nextEvent(s,'summit');
  const restored=restoreGame(JSON.stringify(s),world);assert.ok(restored);
  assert.deepEqual(eventFor(s.nation,s.event.id,s.event.variant),eventFor(restored.nation,restored.event.id,restored.event.variant));
  for(let i=0;i<25;i++)assert.deepEqual(nextEvent(s,'summit'),nextEvent(restored,'summit'));
});

test('Les anciens événements migrent vers le récit original ; les variantes corrompues sont rejetées',()=>{
  const s=createGame(world);s.event={id:'food'};delete s.eventDecks;
  const legacy=restoreGame(JSON.stringify(s),world);assert.equal(legacy.event.variant,0);
  for(let i=0;i<11;i++)assert.notEqual(nextEvent(legacy,'food').variant,0,'Le récit déjà affiché dans une ancienne sauvegarde compte comme vu.');
  for(const variant of [-1,12,1.2,'1',null])assert.equal(restoreGame(JSON.stringify({...s,event:{id:'food',variant}}),world),null);
  for(const deck of [{remaining:[1,1],last:0},{remaining:[1],last:1},{remaining:[99],last:0},{remaining:[],last:null}])assert.equal(restoreGame(JSON.stringify({...s,eventDecks:{food:deck}}),world),null);
});

test('Chaque décision résout le récit sélectionné et applique ses effets réels',()=>{
  for(const nation of Object.keys(NATIONS))for(const base of EVENTS)for(let variant=0;variant<12;variant++)for(let choice=0;choice<3;choice++){
    const s=createGame(world,nation);s.resources={folklore:100,buzz:100,pride:100,insight:100};s.integrity=70;s.cringe=30;s.event={id:base.id,variant};
    const event=eventFor(nation,base.id,variant),option=event.choices[choice];
    assert.ok(resolveEvent(s,choice));assert.equal(s.event,null);
    assert.ok(s.log[0].text.includes(event.title));assert.ok(s.log[0].text.includes(option.label));
    for(const resource of Object.keys(s.resources))assert.equal(s.resources[resource],100-(option.cost[resource]||0)+(option.gain[resource]||0));
    assert.equal(s.integrity,70+(option.integrity||0));assert.equal(s.cringe,30+(option.cringe||0));
  }
});

test('Le déclenchement naturel attache une variante au récit',()=>{
  const s=createGame(world,'FR','normal',17);for(let i=0;i<68;i++)tick(s,world);
  assert.ok(s.event);assert.ok(Number.isInteger(s.event.variant));assert.ok(s.eventDecks[s.event.id]);
});

test('Le fil TV dispose de 122 nouvelles brèves et des nouvelles propres à chaque nation',()=>{
  assert.equal(WORLD_NEWS.length,24);
  assert.equal(Object.values(NATIONAL_NEWS).flat().length,98);
  const unique=new Set([...WORLD_NEWS,...Object.values(NATIONAL_NEWS).flat()]);assert.equal(unique.size,122);
  for(const nation of Object.keys(NATIONS)){
    const pool=newsPool(nation,NEWS,nationIdentity(nation).news);
    assert.ok(pool.length>=130);assert.equal(new Set(pool).size,pool.length);
    assert.ok(NATIONAL_NEWS[nation].every(text=>pool.includes(text)));
    assert.ok(Object.values(NATIONAL_NEWS).flat().every(text=>pool.includes(text)),'Le fil international montre aussi les clichés des autres nations.');
  }
});
