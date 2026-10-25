import {build} from 'esbuild';
export async function bundleGame(){await build({entryPoints:['game/main.js'],bundle:true,outfile:'game.bundle.js',format:'iife',target:['es2020'],minify:true,legalComments:'eof',loader:{'.json':'json'}});}
if(process.argv[1]?.endsWith('build-game.mjs'))await bundleGame();
