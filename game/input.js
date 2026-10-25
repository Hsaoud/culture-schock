export function focusDirection(direction,scope=document){
 const nodes=[...scope.querySelectorAll('button:not(:disabled),input,select,a[href]')].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');
 if(!nodes.length)return;const current=document.activeElement;if(!nodes.includes(current)){nodes[0].focus();return;}
 const r=current.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
 const choices=nodes.filter(n=>n!==current).map(node=>{const b=node.getBoundingClientRect(),dx=b.left+b.width/2-x,dy=b.top+b.height/2-y;const along=direction==='left'?-dx:direction==='right'?dx:direction==='up'?-dy:dy,cross=['left','right'].includes(direction)?Math.abs(dy):Math.abs(dx);return{node,along,score:along+cross*2.5};}).filter(c=>c.along>5).sort((a,b)=>a.score-b.score);
 if(choices.length){choices[0].node.focus();choices[0].node.scrollIntoView({block:'nearest',inline:'nearest'});}else{const i=nodes.indexOf(current);nodes[(i+(['left','up'].includes(direction)?nodes.length-1:1))%nodes.length].focus();}
}
export class Controller {
 constructor(callbacks){this.c=callbacks;this.previous=[];this.lastMove=0;this.pad=null;this.hadPad=false;}
 poll(now,dt){const pad=[...(navigator.getGamepads?.()||[])].find(p=>p?.connected);this.pad=pad;if(!pad){if(this.hadPad){this.c.connected(false);this.hadPad=false;}this.previous=[];return;}
 if(!this.hadPad){this.hadPad=true;this.c.connected(true);}
 const pressed=i=>pad.buttons[i]?.pressed,edge=i=>pressed(i)&&!this.previous[i];
 const x=pad.axes[0]||0,y=pad.axes[1]||0;const dir=pressed(14)||x<-.55?'left':pressed(15)||x>.55?'right':pressed(12)||y<-.55?'up':pressed(13)||y>.55?'down':null;
 if(dir&&now-this.lastMove>190){this.c.navigate(dir);this.lastMove=now;}
 if(edge(0))this.c.confirm();if(edge(1))this.c.back();if(edge(2))this.c.research();if(edge(3))this.c.collect();if(edge(9))this.c.pause();if(edge(4))this.c.cycle(-1);if(edge(5))this.c.cycle(1);
 if(Math.abs(pad.axes[2]||0)>.15||Math.abs(pad.axes[3]||0)>.15)this.c.pan((pad.axes[2]||0)*dt*300,(pad.axes[3]||0)*dt*300);
 if(pressed(6)||pressed(7))this.c.zoom(Math.exp((pressed(7)?1:-1)*dt));this.previous=pad.buttons.map(b=>b.pressed);
 }
 rumble(){try{this.pad?.vibrationActuator?.playEffect('dual-rumble',{duration:100,strongMagnitude:.15,weakMagnitude:.35})?.catch(()=>{});}catch{}}
}
