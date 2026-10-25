import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NATIONS,EVENTS,nationIdentity,nationBranch,researchNodes,actionCopy,eventFor} from '../data.js';
import {createGame,action,resolveEvent} from '../engine.js';
import {nationalEmblem,nationalTailoring,nationalFace,nationalAccessories} from '../visuals.js';

const nations=Object.keys(NATIONS);
const world=JSON.parse(readFileSync(new URL('../assets/world.json',import.meta.url)));

test('Chaque nation possède 18 recherches distinctes et des effets mécaniques lisibles',()=>{
  const titles=[];
  for(const nation of nations){
    for(const branch of ['symptoms','transmission','defense']){
      const nodes=researchNodes(nation,branch);assert.equal(nodes.length,6);
      assert.ok(nationBranch(nation,branch).description);
      for(const node of nodes){assert.ok(node.title&&node.description&&node.icon&&node.effect);titles.push(node.title);}
      const baseline=researchNodes('FR',branch);
      assert.deepEqual(nodes.map(n=>[n.id,n.cost,n.duration,n.prerequisite,n.effect]),baseline.map(n=>[n.id,n.cost,n.duration,n.prerequisite,n.effect]));
    }
  }
  assert.equal(new Set(titles).size,nations.length*18);
});

test('Les actions des sept nations et leurs retours sont propres à chaque nation, sans modifier leur coût',()=>{
  const titles=[];
  for(const nation of nations){
    for(const type of ['tourist','debate','chain','repair','intercept','calm']){
      const copy=actionCopy(nation,type);assert.ok(copy.name&&copy.short&&copy.description&&copy.success&&copy.effect&&copy.icon);titles.push(copy.name);
    }
    const s=createGame(world,nation,'normal',1);const result=action(s,'tourist','JP');
    assert.equal(result.message,actionCopy(nation,'tourist').success);assert.equal(s.resources.buzz,24);assert.equal(s.countries.JP.influence,12);
    assert.equal(s.log[0].text,result.message);
  }
  assert.equal(new Set(titles).size,nations.length*6);
});

test('Les événements des sept nations personnalisés conservent des choix et coûts cohérents',()=>{
  const titles=[];
  for(const nation of nations)for(const base of EVENTS){
    const event=eventFor(nation,base.id);titles.push(event.title);assert.ok(event.text&&event.icon);
    assert.equal(event.choices.length,3);
    event.choices.forEach((c,i)=>{assert.ok(c.label);assert.deepEqual(c.cost,base.choices[i].cost);assert.deepEqual(c.gain,base.choices[i].gain);});
    const s=createGame(world,nation,'normal',2);s.event={id:base.id};const free=event.choices.findIndex(c=>!Object.keys(c.cost).length);
    assert.ok(resolveEvent(s,free));assert.ok(s.log[0].text.includes(event.title));assert.ok(s.log[0].text.includes(event.choices[free].label));
  }
  assert.equal(new Set(titles).size,nations.length*4);
});

test('Les sept identités visuelles sont distinctes et leurs variantes SVG sont disponibles',()=>{
  assert.equal(new Set(nations.map(n=>nationIdentity(n).accent)).size,nations.length);
  assert.equal(new Set(nations.map(n=>nationalEmblem(n))).size,nations.length);
  assert.equal(new Set(nations.map(n=>nationalTailoring(n,3))).size,nations.length);
  for(const nation of nations){assert.ok(nationalEmblem(nation).includes('<svg'));assert.equal(nationalTailoring(nation,0),'');assert.equal(nationalAccessories(nation,0),'');}
  const a=nationalFace('GB'),b=nationalFace('GB');assert.notEqual(a,b,'Les masques SVG ont des identifiants uniques pour plusieurs avatars simultanés.');
});
