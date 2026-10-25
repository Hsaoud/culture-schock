import {mkdir,writeFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {createGame} from '../engine.js';
const world=JSON.parse(readFileSync(new URL('../assets/world.json',import.meta.url)));
await mkdir('tmp/qa-events',{recursive:true});
for(const [nation,family,variant] of [['FR','food',2],['FR','viral',5],['CN','counter',0],['MX','summit',11]]){
 const state=createGame(world,nation,'normal',42);state.day=68;state.paused=true;state.event={id:family,variant};state.eventSerial=1;state.resources={folklore:120,buzz:120,pride:120,insight:32};
 await writeFile(`tmp/qa-events/${nation}-${family}.json`,JSON.stringify(state));
}
