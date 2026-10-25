import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {Script} from 'node:vm';
import {NATIONS,EVENTS} from '../data.js';
const path='dist/Culture-Shock.html',html=await readFile(path,'utf8');
const match=html.match(/<script>([\s\S]*)<\/script>/);assert.ok(match,'Le script autonome doit être intégré.');
new Script(match[1],{filename:path});
assert.ok(!/<script[^>]+src=/i.test(html),'Le HTML autonome ne doit pas charger un bundle externe.');
assert.ok(!/<link[^>]+rel=["']stylesheet/i.test(html),'Le CSS autonome doit être intégré.');
assert.ok(!html.includes('./assets/art/'),'Toutes les illustrations doivent être intégrées.');
const embedded=match[1].match(/^const __eventArt=(\{[^\n]+\});/);assert.ok(embedded,'La table des planches doit être intégrée.');
const images=JSON.parse(embedded[1]);
const expected=Object.keys(NATIONS).flatMap(n=>EVENTS.map(e=>`events/${n.toLowerCase()}-${e.id}.webp`));
assert.deepEqual(Object.keys(images).sort(),expected.sort());
for(const key of expected){
 assert.ok(images[key].startsWith('data:image/webp;base64,'));
 const bytes=Buffer.from(images[key].split(',')[1],'base64');
 assert.ok(bytes.equals(await readFile(`dist/assets/art/${key}`)),`La planche intégrée ${key} doit correspondre au fichier distribué.`);
}
console.log(JSON.stringify({standalone:path,bytes:(await stat(path)).size,embeddedEventAtlases:expected.length,illustratedStories:expected.length*12,syntax:'valid',externalGameAssets:0}));
