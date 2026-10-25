// One flat silhouette per meaning, shared by HUD, costs, research and map.
export const RESOURCE_LABELS={folklore:'Folklore',buzz:'Buzz',pride:'Chauvinisme',insight:'Matière grise'};
export const ACTION_LABELS={tourist:'Envoyer',debate:'Convaincre',chain:'Implanter',repair:'Restaurer',intercept:'Intercepter',calm:'Apaiser'};
const shapes={
  folklore:'<path d="M35 5c3 16-12 18-5 29 1-8 7-11 11-15 0 11 13 17 10 28-2 9-10 13-19 13S13 54 13 43c0-13 15-19 22-38Z"/><path class="icon-cut" d="M32 39c-1 7-9 9-7 15 4 5 12 3 13-3 1-4-3-8-6-12Z"/>',
  buzz:'<path d="M33 4 9 36h18l-5 24 33-37H36l8-19Z"/>',
  pride:'<path d="m7 18 14 12L32 9l11 21 14-12-6 32H13Z"/><path d="M14 57h36" fill="none"/><path class="icon-cut" d="m32 31 5 7-5 7-5-7Z"/>',
  insight:'<path d="M21 43C6 30 15 9 32 9s26 21 11 34l-2 5H23Z"/><path d="M24 54h16m-13 6h10M32 2v2M6 16l5 3m42 0 5-3M5 34h5m44 0h5" fill="none"/><path class="icon-cut" d="m24 27 8 7 8-7-5 16h-6Z"/>',
  tourist:'<path d="m17 5 23 5-4 23 16 11 4 12H9V42l9-11Z"/><path class="icon-cut" d="m20 18 15 3-1 5-15-3Z"/><path d="M9 61h47" fill="none"/>',
  debate:'<path d="M9 23h15L51 9v42L24 38H9Zm8 15h13l-1 18H19Z"/><path d="m57 24 4-2m-4 13 4 2" fill="none"/>',
  chain:'<path d="M9 32h46v25H9Z"/><path class="icon-cut" d="M27 39h12v21H27Z"/><path d="m7 13-4 16h58l-4-16Zm24 0V3h16v9" fill="none"/>',
  repair:'<path d="M32 56 8 32C-7 11 20-2 32 17 44-2 71 11 56 32Z"/><path class="icon-cut" d="M28 24h8v8h8v8h-8v8h-8v-8h-8v-8h8Z"/>',
  intercept:'<path d="M32 5 55 14v19c0 13-13 22-23 28C22 55 9 46 9 33V14Z"/><path class="icon-cut" d="m34 17-14 19h11l-4 14 19-22H34l6-11Z"/>',
  calm:'<path d="m7 45 16-6L15 13l23 18 8-13 11 1-5 7c1 12-7 22-21 24L15 57Z"/><path d="m48 48 9 7m-5-4 7-6m-4 9 5-2" fill="none"/>',
  lantern:'<path d="M21 11h22M25 4h14M20 17h24l9 10v16L43 52H21L11 43V27Z"/><path class="icon-cut" d="M29 20h6v29h-6Z"/><path d="M23 58h18m-9-6v10" fill="none"/>',
  clock:'<circle cx="32" cy="32" r="24" fill="none"/><path d="M32 16v17l11 6" fill="none"/>'
};
export function icon(name){return `<svg class="glyph glyph-${name}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${shapes[name]||shapes.folklore}</g></svg>`;}
export function resourceAmount(name,value){return `<span class="resource-amount" aria-label="${value} ${RESOURCE_LABELS[name]}" title="${RESOURCE_LABELS[name]}"><span>${value}</span>${icon(name)}</span>`;}
export function resourceWords(escapedText){return escapedText.replace(/Folklore|Buzz|Chauvinisme|Matière grise/gi,label=>{const key=Object.keys(RESOURCE_LABELS).find(key=>RESOURCE_LABELS[key].toLowerCase()===label.toLowerCase());return `<span class="resource-symbol" role="img" aria-label="${RESOURCE_LABELS[key]}" title="${RESOURCE_LABELS[key]}">${icon(key)}</span>`;});}
export function resourceTextureSVG(name){return icon(name).replace('viewBox=', 'width="128" height="128" viewBox=').replace('<g fill=',`<circle cx="32" cy="32" r="31" fill="#0a2029" stroke="${{folklore:'#f4bb68',buzz:'#ee8fc1',pride:'#a7e2aa',insight:'#68e7e4'}[name]}" stroke-width="2"/><style>.icon-cut{fill:#0a2029;stroke:none}</style><g transform="translate(8 8) scale(.75)" fill=`).replaceAll('currentColor',{folklore:'#f4bb68',buzz:'#ee8fc1',pride:'#a7e2aa',insight:'#68e7e4'}[name]);}
