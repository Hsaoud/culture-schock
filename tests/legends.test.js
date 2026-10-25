import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createGame,income,tick,restoreGame} from '../engine.js';
import {NATIONS} from '../data.js';
import {Controller} from '../game/input.js';
const world=JSON.parse(readFileSync(new URL('../assets/world.json',import.meta.url)));
test('Sept emblèmes demandés, bonus chinois, mexicain et russe effectifs',()=>{
 assert.deepEqual(Object.keys(NATIONS),['FR','GB','US','IT','CN','RU','MX']);
 for(const [id,name] of Object.entries({US:'Burger',IT:'Pizza',CN:'Panda',MX:'Sombrero'}))assert.ok(NATIONS[id].emblem.includes(name));
 const base=createGame(world,'GB'),cn=createGame(world,'CN'),mx=createGame(world,'MX'),ru=createGame(world,'RU');
 assert.equal(income(cn).insight,income(base).insight*1.25);assert.equal(income(mx).buzz,income(base).buzz*1.15);assert.equal(income(mx).folklore,income(base).folklore*1.15);
 ru.planes=[{id:1,from:'JP',eta:1,total:20,damage:20,label:'Thé froid'}];tick(ru,world);assert.equal(ru.integrity,83);
 for(const id of ['CN','RU','MX'])assert.equal(restoreGame(JSON.stringify(createGame(world,id)),world).nation,id);
});
test('Manette : fronts de boutons, répétition directionnelle, reconnexion et axes',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'navigator');let pads=[],events=[];
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>pads}});
 try{
  const names=['connected','navigate','confirm','back','research','collect','pause','cycle','pan','zoom'];const c=new Controller(Object.fromEntries(names.map(name=>[name,(...args)=>events.push([name,...args])])));
  const pad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:16},()=>({pressed:false}))};pads=[pad];c.poll(1000,.016);assert.deepEqual(events.shift(),['connected',true]);
  pad.buttons[0].pressed=true;c.poll(1020,.016);c.poll(1040,.016);assert.equal(events.filter(e=>e[0]==='confirm').length,1);
  pad.buttons[0].pressed=false;c.poll(1060,.016);pad.buttons[0].pressed=true;c.poll(1080,.016);assert.equal(events.filter(e=>e[0]==='confirm').length,2);
  pad.axes=[.8,0,.4,-.5];pad.buttons[7].pressed=true;c.poll(1300,.016);assert.ok(events.some(e=>e[0]==='navigate'&&e[1]==='right'));assert.ok(events.some(e=>e[0]==='pan'&&e[1]>0&&e[2]<0));assert.ok(events.some(e=>e[0]==='zoom'&&e[1]>1));
  pads=[];c.poll(1320,.016);assert.deepEqual(events.at(-1),['connected',false]);pads=[pad];c.poll(1340,.016);assert.ok(events.some(e=>e[0]==='connected'&&e[1]===true));
 }finally{if(original)Object.defineProperty(globalThis,'navigator',original);else delete globalThis.navigator;}
});
