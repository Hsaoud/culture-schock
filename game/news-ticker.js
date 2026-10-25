// Constant speed and offscreen recycling keep incoming campaign news from
// resetting the crawl. This clock never consumes the simulation random seed.
export class NewsTicker {
  constructor(element,pool){
    this.element=element;this.track=element.querySelector('.news-track');this.window=element.querySelector('.news-window');this.button=element.querySelector('.news-toggle');
    this.pool=[...pool];this.index=0;this.offset=0;this.pending=[];this.seen=new Set();this.paused=false;this.reduced=false;
    // A coprime stride interleaves topics instead of exhausting national news first.
    this.stride=17;while(this.pool.length&&gcd(this.stride,this.pool.length)!==1)this.stride++;
    for(let i=0;i<6;i++)this.append();
  }
  append(){const live=this.pending.shift(),text=live||this.pool[(this.index++*this.stride)%this.pool.length];const item=document.createElement('span');item.className='news-item';item.textContent=text||'Les correspondants préparent leur prochain bulletin.';if(live)item.dataset.live='true';this.track.append(item);}
  update(state,format=text=>text){
    const entries=[...state.log.slice(0,4).reverse(),{text:state.news,day:state.day}].filter(e=>e.text);
    for(const {text,day} of entries){if(this.seen.has(text))continue;this.seen.add(text);this.pending.push(`JOUR ${day} · ${format(text)}`);}
    this.pending=this.pending.slice(-8);
    if(this.seen.size>200)this.seen=new Set(entries.map(e=>e.text));
    // Promote incoming news into the nearest fully offscreen slot. No visible
    // headline changes its text, width or position while a dispatch arrives.
    const edge=this.window.getBoundingClientRect().right;
    for(const item of this.track.children){
      if(!this.pending.length)break;
      if(!item.dataset.live&&item.getBoundingClientRect().left>edge+8){item.textContent=this.pending.shift();item.dataset.live='true';}
    }
  }
  toggle(){this.paused=!this.paused;this.syncPause();}
  syncPause(){const stopped=this.paused||this.reduced;this.element.classList.toggle('ticker-paused',stopped);this.element.classList.toggle('ticker-reduced',this.reduced);this.button.textContent=stopped?'▶':'Ⅱ';this.button.setAttribute('aria-pressed',String(stopped));this.button.setAttribute('aria-label',this.reduced?'Animations réduites : fil consultable par défilement horizontal':this.paused?'Reprendre le fil d’actualité':'Mettre le fil d’actualité en pause');this.button.disabled=this.reduced;}
  frame(dt,reduced=false){
    if(this.reduced!==reduced){this.reduced=reduced;this.syncPause();}
    if(this.paused||this.reduced||this.window.matches(':hover,:focus-within'))return;
    this.window.scrollLeft=0;this.offset+=Math.min(dt,.1)*44;
    let first=this.track.firstElementChild;
    while(first&&this.offset>=first.getBoundingClientRect().width){const width=first.getBoundingClientRect().width;if(!width)break;this.offset-=width;first.remove();this.append();first=this.track.firstElementChild;}
    this.track.style.transform=`translate3d(${-this.offset}px,0,0)`;
  }
}
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
