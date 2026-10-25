// Contact sheet for visual QA only; final game assets are left untouched.
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import {NATIONS,EVENTS} from '../data.js';
import {EVENT_ART_LAYOUT} from '../event-art-layout.js';
const sharp=createRequire(import.meta.url)(process.argv[2]||'sharp');
const panels=[];let index=0;
for(const [nation,info] of Object.entries(NATIONS))for(const {id} of EVENTS){
 const left=index%4*400,top=Math.floor(index/4)*326;
 const family={food:'TRADITIONS',viral:'PHÉNOMÈNES VIRAUX',counter:'VISITEURS',summit:'SOMMETS'}[id];
 const header=Buffer.from(`<svg width="400" height="26"><rect width="400" height="26" fill="#08151f"/><text x="12" y="18" font-family="sans-serif" font-size="13" fill="#e9c680">${info.name} · ${family} · 12 récits</text></svg>`);
 panels.push({input:header,left,top});
 const key=`${nation.toLowerCase()}-${id}`,layout=EVENT_ART_LAYOUT[key];
 const {data,info:raw}=await sharp(`assets/art/events/${key}.webp`).raw().toBuffer({resolveWithObject:true});
 for(let row=0;row<3;row++)for(let column=0;column<4;column++){
  const x=layout.columns[column]+1,y=layout.rows[row]+1,width=layout.columns[column+1]-x-1,height=layout.rows[row+1]-y-1;
  const thumbnail=await sharp(data,{raw}).extract({left:x,top:y,width,height}).resize(98,98,{fit:'contain',background:'#08151f'}).png().toBuffer();
  panels.push({input:thumbnail,left:left+column*100+1,top:top+27+row*100});
 }
 index++;
}
await mkdir('screenshots',{recursive:true});
await sharp({create:{width:1600,height:7*326,channels:3,background:'#08151f'}}).composite(panels).jpeg({quality:91}).toFile('screenshots/events-contact-sheet.jpg');
console.log('screenshots/events-contact-sheet.jpg');
