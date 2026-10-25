import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Training,LESSONS} from '../game/tutorial.js';
import {createGame,action,collect,buyResearch,tick,resolveEvent,restoreGame} from '../engine.js';
const world=JSON.parse(readFileSync(new URL('../assets/world.json',import.meta.url)));

for(const nation of ['FR','GB','US','IT','CN','RU','MX'])test(`Tutoriel ${nation} : toutes les commandes réelles, campagne intacte`,()=>{
  const campaign=createGame(world,nation,'normal',72);campaign.day=123;campaign.resources.buzz=87;
  const before=JSON.stringify(campaign),tour=new Training(campaign,world),s=tour.state;
  assert.equal(tour.signal('action','tourist'),false);
  tour.signal('next');s.selected=nation==='FR'?'IT':'FR';assert.ok(tour.signal('select'));
  assert.equal(tour.allows('action','chain'),false);
  assert.ok(action(s,'tourist').ok);assert.ok(tour.signal('action','tourist'));
  assert.equal(s.bubbles.length,4);collect(s,s.bubbles[0].id);assert.equal(tour.signal('collect'),false);
  for(const b of [...s.bubbles])collect(s,b.id);assert.ok(tour.signal('collect'));
  for(const type of ['debate','chain']){assert.ok(action(s,type).ok);assert.ok(tour.signal('action',type));}
  assert.ok(tour.signal('research-open'));assert.equal(tour.allows('research-buy','defense-0'),false);
  assert.ok(buyResearch(s,'transmission',0).ok);assert.ok(tour.signal('research-buy'));
  let steps=0;while(tour.running&&steps++<50){tick(s,world);tour.signal('tick');}
  assert.equal(tour.lesson.id,'intercept');assert.equal(s.planes.length,1);
  for(const type of ['intercept','repair','calm']){assert.ok(action(s,type).ok);assert.ok(tour.signal('action',type));}
  assert.equal(s.event.id,'counter');assert.ok(resolveEvent(s,0));assert.ok(tour.signal('event'));
  s.paused=true;assert.ok(tour.signal('pause'));s.paused=false;assert.ok(tour.signal('pause'));
  s.speed=2;assert.ok(tour.signal('speed'));assert.ok(tour.signal('zoom'));assert.equal(tour.lesson.id,'finish');
  assert.equal(tour.index,LESSONS.length-1);assert.equal(JSON.stringify(campaign),before);assert.equal(JSON.stringify(tour.original),before);
  assert.ok(restoreGame(JSON.stringify(tour.original),world));
});

test('Quitter un entraînement restitue aussi les recherches et événements en attente',()=>{
  const campaign=createGame(world,'CN');buyResearch(campaign,'transmission',0);campaign.event={id:'viral'};campaign.eventSerial=1;
  const before=JSON.stringify(campaign),tour=new Training(campaign,world);
  tour.state.resources.pride=0;tour.state.countries.FR.influence=100;tour.state.event={id:'counter'};
  assert.equal(JSON.stringify(tour.original),before);assert.ok(restoreGame(JSON.stringify(tour.original),world));
});
