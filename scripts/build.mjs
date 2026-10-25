import {mkdir,copyFile,readFile,writeFile,cp} from 'node:fs/promises';
import {EVENT_MOTIFS} from '../event-content.js';
import {bundleGame} from './build-game.mjs';
await bundleGame();
await mkdir('dist/game',{recursive:true});
await mkdir('dist/assets/art',{recursive:true});
for(const file of ['index.html','classic.html','game.bundle.js','style.css','theme.css','app.js','engine.js','data.js','nation-content.js','extra-nations.js','event-content.js','event-art-layout.js','world-news.js','visuals.js'])await copyFile(file,`dist/${file}`);
await copyFile('game/game.css','dist/game/game.css');
await copyFile('assets/world.json','dist/assets/world.json');
await mkdir('dist/assets/art/events',{recursive:true});
const assets=['champions-final.png','relics-final.png','sanctuary.png',...Object.keys(EVENT_MOTIFS).flatMap(n=>['food','viral','counter','summit'].map(f=>`events/${n.toLowerCase()}-${f}.webp`))];
for(const name of assets)await copyFile(`assets/art/${name}`,`dist/assets/art/${name}`);
let html=await readFile('index.html','utf8'),css=await readFile('game/game.css','utf8'),js=await readFile('game.bundle.js','utf8');
// Resolve the dynamic atlas paths before inlining all image URLs.
const eventAssets=Object.fromEntries(assets.filter(n=>n.startsWith('events/')).map(n=>[n,`./assets/art/${n}`]));
const eventUris={};
for(const name of assets){const uri=`data:image/${name.endsWith('.webp')?'webp':'png'};base64,`+(await readFile(`assets/art/${name}`)).toString('base64');css=css.replaceAll(`../assets/art/${name}`,uri);js=js.replaceAll(`./assets/art/${name}`,uri);if(eventAssets[name])eventUris[name]=uri;}
// esbuild retains the template path from eventIllustration. Replace only the
// exact path expression; values are deduplicated in one embedded atlas table.
const dynamicPath=/`\.\/assets\/art\/events\/\$\{([\w$]+)\.toLowerCase\(\)\}-\$\{([\w$]+)\}\.webp`/g;
let embedded=0;
js=js.replace(dynamicPath,(_,nation,family)=>{embedded++;return `__eventArt["events/"+${nation}.toLowerCase()+"-"+${family}+".webp"]`;});
if(embedded!==1)throw Error(`Expected one event atlas path, found ${embedded}`);
js=`const __eventArt=${JSON.stringify(eventUris)};\n`+js;
html=html.replace('<link rel="stylesheet" href="./game/game.css">',()=>`<style>${css}</style>`).replace('<script defer src="./game.bundle.js"></script>',()=>`<script>${js.replaceAll('</script','<\\/script')}</script>`);
// Inline defer scripts execute immediately; place the bundle after the game root.
const script=html.match(/<script>[\s\S]*?<\/script>/)[0];html=html.replace(script,'').replace('</body>',()=>`${script}</body>`);
await writeFile('dist/Culture-Shock.html',html);
console.log('Build terminé : dist/index.html et dist/Culture-Shock.html autonome (Three.js, carte et images intégrés).');
