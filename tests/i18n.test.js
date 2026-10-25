import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LANGUAGES,LANGUAGE_KEY,readLanguage,setLanguage,getLanguage,suggestedLanguage,translate,regionName,formatNumber} from '../game/i18n.js';
import {UI_COPY} from '../game/locales/ui.js';
import {contentCopy} from '../game/locales/content.js';
import {MOTIF_COPY} from '../game/locales/motifs.js';
import {TUTORIAL_COPY} from '../game/locales/tutorial.js';
import {NATIONS,eventFor,researchNodes} from '../data.js';
import {createGame,restoreGame} from '../engine.js';
const world=JSON.parse(readFileSync(new URL('../assets/world.json',import.meta.url)));

test('Les six langues sont explicites, avec deux variantes anglaises',()=>{
 assert.deepEqual(LANGUAGES.map(l=>l.id),['fr','en-GB','en-US','zh-CN','it','ru']);
 for(const row of [...UI_COPY,...contentCopy()]){
  assert.equal(row.length,5,row[0]);
  for(const text of row)assert.ok(typeof text==='string'&&text.trim(),row[0]);
 }
 for(const versions of Object.values(MOTIF_COPY)){
  assert.equal(versions.length,4);
  for(const motifs of versions){assert.equal(motifs.length,12);for(const text of motifs)assert.equal(text.split('¦').length,2);}
 }
 for(const lessons of TUTORIAL_COPY)assert.equal(lessons.length,18);
});
test('Détection, première visite, préférence persistante et stockage indisponible',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
 assert.equal(readLanguage(storage),null);
 assert.equal(suggestedLanguage(['de-DE','en-US']),'en-US');
 assert.equal(suggestedLanguage(['en-AU']),'en-GB');
 assert.equal(suggestedLanguage(['it-IT']),'it');
 assert.equal(suggestedLanguage(['zh-Hans-CN']),'zh-CN');
 assert.equal(suggestedLanguage(['es-MX']),'fr');
 assert.equal(setLanguage('ru',storage),true);
 assert.equal(values.get(LANGUAGE_KEY),'ru');assert.equal(readLanguage(storage),'ru');
 assert.equal(setLanguage('invalid',storage),false);assert.equal(getLanguage(),'ru');
 values.set(LANGUAGE_KEY,'invalid');assert.equal(readLanguage(storage),null);
 const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 assert.equal(readLanguage(blocked),null);assert.equal(setLanguage('zh-CN',blocked),true);
 assert.equal(translate('Choisissez votre héritage'),'选择你的文化传承');
});
test('Localisation des récits, recherches, choix, HUD et accessibilité pour chaque langue',()=>{
 for(const language of LANGUAGES.filter(l=>l.id!=='fr')){
  setLanguage(language.id);
  assert.notEqual(translate('Choisissez votre héritage'),'Choisissez votre héritage');
  assert.ok(!translate('12 j').includes(' j'));
  assert.ok(!translate('+12 % d’influence locale').includes('locale')||language.id==='it');
  for(const id of Object.keys(NATIONS)){
   for(const branch of ['symptoms','transmission','defense'])for(const node of researchNodes(id,branch)){
    assert.ok(translate(node.title));assert.ok(translate(node.description));
   }
   for(const family of ['food','viral','counter','summit'])for(let variant=0;variant<12;variant++){
    const story=eventFor(id,family,variant);
    assert.notEqual(translate(story.text),story.text,`${language.id}/${id}/${family}/${variant}`);
    for(const choice of story.choices)assert.notEqual(translate(choice.label),choice.label);
   }
  }
 }
 setLanguage('en-US');assert.match(translate('L’honneur de la tradition est en jeu.'),/honor/);
 setLanguage('en-GB');assert.match(translate('L’honneur de la tradition est en jeu.'),/honour/);
 assert.equal(regionName('IT'),'Italy');assert.equal(formatNumber(1234.5),'1,234.5');
 assert.equal(translate(formatNumber(1234.5)),'1,234.5');
 assert.equal(translate('Croissance +0,095/s · indignation +5,0'),'Growth +0.095/s · outrage +5.0');
 setLanguage('ru');assert.equal(regionName('IT'),'Италия');
 setLanguage('fr');assert.equal(translate('Choisissez votre héritage'),'Choisissez votre héritage');
});
test('Changer de langue ne modifie ni la campagne, ni le format des sauvegardes',()=>{
 const campaign=createGame(world,'CN','hard',123);campaign.day=91;campaign.resources.buzz=78;
 const before=JSON.stringify(campaign);
 for(const language of LANGUAGES){setLanguage(language.id);translate(campaign.log[0].text);assert.equal(JSON.stringify(campaign),before);}
 const restored=restoreGame(before,world);assert.equal(restored.day,91);assert.equal(restored.nation,'CN');assert.equal(restored.resources.buzz,78);
 setLanguage('fr');
});
