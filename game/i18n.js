import {UI_COPY} from './locales/ui.js';
import {contentCopy} from './locales/content.js';

export const LANGUAGE_KEY='culture-shock-language-v1';
export const LANGUAGES=[
  {id:'fr',name:'Français',region:'France'},
  {id:'en-GB',name:'English',region:'United Kingdom'},
  {id:'en-US',name:'English',region:'United States'},
  {id:'zh-CN',name:'简体中文',region:'中国'},
  {id:'it',name:'Italiano',region:'Italia'},
  {id:'ru',name:'Русский',region:'Россия'}
];
export function validLanguage(id){return LANGUAGES.some(language=>language.id===id);}
export function suggestedLanguage(languages=[]){
  for(const language of languages){
    if(validLanguage(language))return language;
    const base=String(language).toLowerCase().split('-')[0];
    if(base==='en')return language.toLowerCase()==='en-us'?'en-US':'en-GB';
    if(base==='zh')return 'zh-CN';
    if(['fr','it','ru'].includes(base))return base;
  }
  return 'fr';
}
export function readLanguage(storage){try{const value=storage?.getItem(LANGUAGE_KEY);return validLanguage(value)?value:null;}catch{return null;}}
let language='fr';
export const getLanguage=()=>language;
export function setLanguage(id,storage){
  if(!validLanguage(id))return false;
  language=id;
  try{storage?.setItem(LANGUAGE_KEY,id);}catch{/* The session remains playable without storage. */}
  return true;
}
const normalise=value=>String(value).replace(/\s+/g,' ').trim();
const rows=[...UI_COPY,...contentCopy()];
const catalog=new Map();
for(const row of rows){
  catalog.set(normalise(row[0]),row.slice(1).map(normalise));
  // Uppercase headings share the same translation as their sentence case label.
  if(row[0].toUpperCase()!==row[0])catalog.set(normalise(row[0].toUpperCase()),row.slice(1).map(value=>normalise(value).toLocaleUpperCase()));
}
const escapeRegex=text=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const phrases=[...catalog.keys()].filter(key=>key.length>1).sort((a,b)=>b.length-a.length);
let phrasePattern=new RegExp(phrases.map(escapeRegex).join('|'),'gu');
export function registerRegionNames(countries){
  for(const country of countries){
    const names=['en-GB','zh-CN','it','ru'].map(id=>{
      try{return new Intl.DisplayNames([id],{type:'region'}).of(country.id)||country.name;}catch{return country.name;}
    });
    catalog.set(country.name,names);
  }
  phrasePattern=new RegExp([...catalog.keys()].filter(key=>key.length>1).sort((a,b)=>b.length-a.length).map(escapeRegex).join('|'),'gu');
}
const americanWords={colour:'color',honour:'honor',centre:'center',travelling:'traveling',travellers:'travelers',neighbours:'neighbors',defence:'defense',armoured:'armored',chilli:'chili',mobilise:'mobilize',neutralises:'neutralizes',favourite:'favorite',litre:'liter',litres:'liters',storey:'story',storeys:'stories',personalised:'personalized',criticise:'criticize',colonise:'colonize'};
const americanPattern=new RegExp(`\\b(${Object.keys(americanWords).join('|')})\\b`,'gi');
function variant(values){
  const text=values[language==='zh-CN'?1:language==='it'?2:language==='ru'?3:0];
  return language==='en-US'?text.replace(americanPattern,match=>{
    const replacement=americanWords[match.toLowerCase()];
    return match===match.toUpperCase()?replacement.toUpperCase():match[0]===match[0].toUpperCase()?replacement[0].toUpperCase()+replacement.slice(1):replacement;
  }):text;
}
export function translate(text){
  if(language==='fr'||typeof text!=='string'||!text.trim())return text;
  const source=normalise(text),exact=catalog.get(source);
  let result=exact?variant(exact):source.replace(phrasePattern,match=>variant(catalog.get(match)));
  result=result.replace(/(\d) j\b/g,`$1 ${language==='zh-CN'?'天':language==='it'?'g':language==='ru'?'дн.':'d'}`);
  // Research and action effects contain authored French decimal constants.
  if((language.startsWith('en')||language==='zh-CN')&&/croissance|indignation|régénération/i.test(source))result=result.replace(/(\d),(?=\d)/g,'$1.');
  if(language==='zh-CN')result=result.replace(/第 (\d+)(?!\d)/g,'第 $1 天');
  return text.match(/^\s*/)[0]+result+text.match(/\s*$/)[0];
}
export function formatNumber(value,options={}){return new Intl.NumberFormat(language,options).format(value);}
export function regionName(id,fallback=id){try{return new Intl.DisplayNames([language],{type:'region'}).of(id)||fallback;}catch{return fallback;}}

// Translate only text and human-readable attributes. Keep the original source on
// each node so changing languages never translates an already translated string.
// The observer covers dynamic HUD, ticker, dialogs and accessibility labels, and
// leaves markup, game data, input values and focus untouched.
export function observeTranslations(doc=document){
  const originals=new WeakMap();
  const attributes=['aria-label','title','placeholder','alt'];
  function apply(node,key,value,write){
    let record=originals.get(node);if(!record){record={};originals.set(node,record);}
    const previous=record[key],source=previous&&value===previous.output?previous.source:value;
    const output=translate(source);record[key]={source,output};
    if(output!==value)write(output);
  }
  function visit(node){
    if(node.nodeType===3){if(!node.parentElement?.closest('script,style,noscript,[data-no-translate]'))apply(node,'text',node.nodeValue,value=>{node.nodeValue=value;});return;}
    if(node.nodeType!==1&&node.nodeType!==9)return;
    if(node.nodeType===1){if(node.matches('script,style,noscript,[data-no-translate]'))return;for(const key of attributes)if(node.hasAttribute(key))apply(node,key,node.getAttribute(key),value=>node.setAttribute(key,value));}
    for(const child of node.childNodes)visit(child);
  }
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='childList')for(const node of record.addedNodes)visit(node);
      else if(record.type==='characterData')visit(record.target);
      else if(record.target.hasAttribute(record.attributeName))apply(record.target,record.attributeName,record.target.getAttribute(record.attributeName),value=>record.target.setAttribute(record.attributeName,value));
    }
  });
  observer.observe(doc.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
  function refresh(){doc.documentElement.lang=language;doc.title=translate('Culture Shock — Le choc des légendes');visit(doc.body);}
  refresh();
  return {refresh,disconnect:()=>observer.disconnect()};
}
