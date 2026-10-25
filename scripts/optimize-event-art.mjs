// Format conversion only: preserve every pixel dimension and keep source PNGs.
// Optional local utility; the distributable WebP files are already checked in.
import {readdir,stat,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.argv[2]||'sharp');
const directory='assets/art/events';
let sourceBytes=0,webBytes=0,count=0;
const layouts={};
function seams(pixels,width,height,channels,axis,cells){
 const extent=axis==='x'?width:height,cross=axis==='x'?height:width;
 const result=[0];
 for(let i=1;i<cells;i++){
  const center=extent*i/cells,radius=extent/cells*.12;
  let best=Math.round(center),bestScore=-1;
  for(let at=Math.ceil(center-radius);at<=Math.floor(center+radius);at++){
   let score=0;
   for(let j=0;j<cross;j++){
    const p=axis==='x'?(j*width+at)*channels:(at*width+j)*channels;
    const q=p-(axis==='x'?channels:width*channels);
    for(let c=0;c<3;c++)score+=Math.abs(pixels[p+c]-pixels[q+c]);
   }
   if(score>bestScore){bestScore=score;best=at;}
  }
  result.push(best);
 }
 return [...result,extent];
}
for(const file of await readdir(directory)){
 if(!file.endsWith('.png'))continue;
 const source=`${directory}/${file}`,target=source.replace(/\.png$/,'.webp');
 const {data,info:raw}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
 layouts[file.replace('.png','')]={width:raw.width,height:raw.height,columns:seams(data,raw.width,raw.height,raw.channels,'x',4),rows:seams(data,raw.width,raw.height,raw.channels,'y',3)};
 const info=await sharp(source).webp({quality:88,effort:6}).toFile(target);
 sourceBytes+=(await stat(source)).size;webBytes+=info.size;count++;
}
await writeFile('event-art-layout.js','// Generated from actual PNG panel boundaries; source images remain untouched.\nexport const EVENT_ART_LAYOUT = '+JSON.stringify(layouts,null,2)+';\n');
console.log(JSON.stringify({atlases:count,sourceBytes,webBytes}));
