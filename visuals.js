import {IDENTITIES} from './nation-content.js';

export function nationalEmblem(nation){
  const ink=IDENTITIES[nation].gold;
  if(['US','IT','CN','RU','MX'].includes(nation)){
    const i=['FR','GB','US','IT','CN','RU','MX'].indexOf(nation);
    return `<svg class="national-emblem" viewBox="0 0 100 100" role="img" aria-label="Emblème national ${nation}"><svg viewBox="${i%4*100} ${Math.floor(i/4)*100} 100 100" width="100" height="100"><image href="./assets/art/relics-final.png" width="400" height="200" preserveAspectRatio="none"/></svg></svg>`;
  }
  const art={
    FR:'<path d="M30 70Q18 62 29 47L65 15Q77 7 84 19Q88 27 77 38L42 71Q35 77 30 70Z" fill="#d6ae72" stroke="#f0d6a2" stroke-width="2"/><path d="m40 42 10 9m0-22 11 10m1-22 10 9" stroke="#97714f" stroke-width="4" stroke-linecap="round"/><path d="M21 76Q6 49 18 25m0 32-10-9m11-4-7-10m11 1-3-12M79 76q15-20 9-39m-1 20 9-8m-10-4 8-9" fill="none" stroke="currentColor" stroke-width="3"/>',
    GB:'<path d="M30 39Q16 61 39 73H64Q86 57 68 39Z" fill="#9b84ba" stroke="currentColor" stroke-width="3"/><path d="M29 45 12 33 8 41l18 20M72 44q26-7 19 11q-5 12-16 8" fill="none" stroke="currentColor" stroke-width="5"/><path d="M35 35h30m-15-7v7" stroke="currentColor" stroke-width="4"/><path d="M35 24 29 9l14 7 8-13 8 13 15-7-6 15Z" fill="currentColor"/><path d="M34 80h34" stroke="currentColor" stroke-width="3"/>',
    US:'<path d="M22 64h56l-9-18H39L26 54Z" fill="#526e87" stroke="currentColor" stroke-width="3"/><path d="M43 49h12v10H37Zm17 0h7l6 10H60Z" fill="#a9cad9"/><circle cx="33" cy="70" r="9" fill="#142434" stroke="currentColor" stroke-width="3"/><circle cx="68" cy="70" r="9" fill="#142434" stroke="currentColor" stroke-width="3"/><path d="M47 37Q25 37 13 17q17 0 28 7Q52 4 62 20q16-9 29-6Q84 34 62 38l-8 12Z" fill="#c6a172" stroke="currentColor" stroke-width="2"/><path d="M47 25q2-15 14-10l10 7-10 4-5 11Z" fill="#f0e9d5"/><circle cx="58" cy="20" r="2" fill="#23303e"/>',
    IT:'<path d="M22 78 79 21" stroke="#b98b61" stroke-width="9" stroke-linecap="round"/><path d="m28 53 27-27q4-4 9 1l10 10q4 5 0 9L47 73q-5 5-10 0L27 63q-4-5 1-10" fill="#dab080" stroke="currentColor" stroke-width="2"/><path d="m39 44 18 18m-8-28 18 18" stroke="#b68961" stroke-width="2"/><path d="M23 76Q7 50 20 23m0 35-11-9m12-4-8-11m12 0-3-12M77 77q17-19 11-42m-1 22 10-8m-10-3 7-12" fill="none" stroke="#8cb89a" stroke-width="3"/><circle cx="26" cy="82" r="8" fill="#c87e6e"/><path d="m21 73 5 3 5-4" fill="none" stroke="#8cb89a" stroke-width="3"/>'
  }[nation];
  return `<svg class="national-emblem" viewBox="0 0 100 100" style="color:${ink}" role="img" aria-label="Emblème national ${nation}"><circle cx="50" cy="49" r="45" fill="none" stroke="currentColor" stroke-opacity=".2"/><circle cx="50" cy="49" r="41" fill="none" stroke="currentColor" stroke-opacity=".15" stroke-dasharray="2 5"/>${art}</svg>`;
}

export function nationalTailoring(nation,stage){
  if(stage<2)return '';
  if(['CN','RU','MX'].includes(nation))return `<path d="M72 140 59 200h94l-17-60Z" fill="${IDENTITIES[nation].accent}" stroke="#182a30" stroke-width="3"/><path d="M85 155h40m-38 14h36m-32 14h28" stroke="${IDENTITIES[nation].gold}" stroke-width="4"/>`;
  const garments={
    FR:'<path d="M72 143 59 200h94l-16-57Z" fill="#ede7d8" stroke="#4e4659" stroke-width="3"/><path d="M72 155h67m-70 12h73m-76 12h79m-82 12h85" stroke="#637c9f" stroke-width="5"/><path d="m93 142 14 13 13-13-5 23-9-7-12 11" fill="#ba6e72"/>',
    GB:'<path d="m73 141-14 59h94l-17-59-28 27Z" fill="#51485c" stroke="#383646" stroke-width="3"/><path d="m91 140 17 28 14-28-6 54H98Z" fill="#c1a276"/><path d="m94 146 13 7 13-7v13l-13-6-13 6" fill="#a37c9e"/><path d="M119 175q20 18 25-4" fill="none" stroke="#dbc08a" stroke-width="2"/><circle cx="113" cy="175" r="2" fill="#564553"/><circle cx="113" cy="187" r="2" fill="#564553"/>',
    US:'<path d="M72 140 59 200h94l-17-60-27 17Z" fill="#3c5c7d" stroke="#3b3d4d" stroke-width="3"/><path d="m73 143-8 45m71-45 10 45" stroke="#e7e2d5" stroke-width="12"/><path d="M107 156v44" stroke="#b57c7e" stroke-width="4"/><path d="m82 158 3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z" fill="#e2c490"/><path d="M61 194h91" stroke="#c27d81" stroke-width="5"/>',
    IT:'<path d="M72 140 59 200h94l-17-60Z" fill="#568775" stroke="#3e514e" stroke-width="3"/><path d="M87 143v25l-11 32h62l-10-32v-25l-9 13H96Z" fill="#f0e6d2" stroke="#c4b69f" stroke-width="2"/><path d="m91 142 17 9 16-9-9 20-8-9-9 13" fill="#bd7369"/><path d="M94 177h27v13H94Z" fill="#dfcbb2"/><path d="m104 177 1-7m6 7 2-7" stroke="#6c9d79" stroke-width="2"/><circle cx="103" cy="182" r="3" fill="#c57d6c"/><circle cx="114" cy="182" r="3" fill="#c57d6c"/>'
  };
  return garments[nation]||'';
}

let faceSerial=0;
export function nationalFace(nation){
  if(!['GB','US'].includes(nation))return '';
  const id=`portrait-face-${++faceSerial}`;
  const art=nation==='GB'?'<path d="M56 49h102v102H56Z" fill="#7485a8"/><path d="m56 49 102 102m0-102L56 151" stroke="#e9e2d5" stroke-width="18"/><path d="m56 49 102 102m0-102L56 151" stroke="#b67681" stroke-width="7"/><path d="M107 49v102M56 100h102" stroke="#eee6d5" stroke-width="27"/><path d="M107 49v102M56 100h102" stroke="#b67681" stroke-width="16"/>':'<path d="M56 49h102v102H56Z" fill="#ece4d5"/><path d="M56 58h102M56 80h102M56 102h102M56 124h102M56 146h102" stroke="#bd7c83" stroke-width="11"/><path d="M56 49h53v49H56Z" fill="#6b82a4"/><path d="m82 62 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill="#eee3c8"/>';
  return `<defs><clipPath id="${id}"><circle cx="107" cy="100" r="50"/></clipPath></defs><g clip-path="url(#${id})">${art}</g>`;
}
export function nationalAccessories(nation,stage){
  if(stage<2)return '';
  return {GB:'<circle cx="125" cy="107" r="13" fill="none" stroke="#d9bc80" stroke-width="2.5"/><path d="M139 107q12 30-2 48" stroke="#d9bc80" fill="none" stroke-width="1.6"/>',US:'<path d="M96 124h24q-2 15-12 15t-12-15" fill="#f6eddc" stroke="#694653" stroke-width="2"/><path d="M99 130h18" stroke="#c5a7a0"/>',IT:'<ellipse cx="88" cy="107" rx="13" ry="10" fill="none" stroke="#806752" stroke-width="2.5"/><ellipse cx="125" cy="107" rx="13" ry="10" fill="none" stroke="#806752" stroke-width="2.5"/><path d="M101 106q5-5 11 0" stroke="#806752" fill="none" stroke-width="2"/>'}[nation]||'';
}
