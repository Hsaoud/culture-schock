import {IDENTITIES} from './nation-content.js';
import {EXTRA_NATIONS} from './extra-nations.js';
import {EVENT_VARIANT_COUNT,eventStory,eventIllustration} from './event-content.js';
export {EVENT_VARIANT_COUNT} from './event-content.js';
export const NATIONS = {
  FR: { name:'France', flag:'🇫🇷', adjective:'française', color:'#a99aff', emblem:'La Sainte Baguette', emblemFull:'La Sainte Baguette Tradition', icon:'🥖', leader:'Monsieur Bof', motto:'Liberté. Égalité. Supériorité boulangère.', advantage:'Terroir : +25 % de Folklore.', bonus:'folklore',
    symptoms:['« Putain » comme virgule','Déjeuner de 2 h 30','Grève préventive du mardi','Le soupir universel','Le Comté comme monnaie','La République du râlage'],
    descriptions:['Une ponctuation qui se prononce.','Le travail attendra le dessert.','Même sans revendication, par précaution.','Toute conversation commence par « pfff ».','La seule devise qui se bonifie.','Le mécontentement devient patrimoine mondial.'],
    sabotage:['Pain de mie sous plastique','Crise internationale du levain','Baguette au micro-ondes'], quotes:['Bon. On est où, là ?','C’est pas mauvais. Pour ici.','On ne va pas se laisser faire !','Je râle, donc je suis.'] },
  GB: { name:'Royaume-Uni', flag:'🇬🇧', adjective:'britannique', color:'#a99aff', emblem:'La Théière Royale', emblemFull:'La Théière Royale et la Couronne', icon:'🫖', leader:'Sir Obviously', motto:'Keep calm. Colonise the tea break.', advantage:'Flegme : −20 % de dégâts de sabotage.', bonus:'shield',
    symptoms:['Politesse passive-agressive','Moquette de salle de bain','Nostalgie impériale','Conduite à gauche','Les haricots sur toast','Le thé de cinq heures mondial'],
    descriptions:['« Interesting » signifie que tout est raté.','Même sous la baignoire. Surtout sous la baignoire.','Le globe a encore beaucoup de rose à recevoir.','Les ronds-points ne s’en remettront pas.','Petit-déjeuner officiellement sans frontières.','La planète s’arrête. La bouilloire commence.'],
    sabotage:['Eau réchauffée au micro-ondes','Pénurie mondiale de lait','Abolition des files d’attente'],quotes:['Lovely weather, isn’t it?','Avec un nuage de lait, merci.','This is rather concerning.','God save the kettle.'] },
  US: { name:'États-Unis', flag:'🇺🇸', adjective:'américaine', color:'#a99aff', emblem:'Le Burger XXL', emblemFull:'Le Burger XXL de la Liberté', icon:'🍔', leader:'Captain Extra', motto:'Make everything unnecessarily bigger.', advantage:'Hollywood : +25 % de Buzz.', bonus:'buzz',
    symptoms:['Sourire ultra-bright','Mesurer en terrains de football','Fromage en spray','Le soda taille piscine','Applaudir à l’atterrissage','Le blockbuster permanent'],
    descriptions:['32 dents et une confiance sans raison.','Le mètre était vraiment trop simple.','Même les monuments ont droit à leur cheddar.','Un gobelet. Trois litres. Aucun regret.','Même à la fin d’un trajet en ascenseur.','Chaque lundi devient une bande-annonce.'],
    sabotage:['Passage au système métrique','Limitation des gobelets de soda','Taxe sur le beurre de cacahuète'],quotes:['Have an AMAZING day!','Is there a bigger size?','Someone call my lawyer!','Freedom tastes like cheese.'] },
  IT: { name:'Italie', flag:'🇮🇹', adjective:'italienne', color:'#a99aff', emblem:'La Pizza Sacrée', emblemFull:'La Pizza Sacrée de la Nonna', icon:'🍕', leader:'La Nonna Suprema', motto:'Une planète. Une recette de carbonara.', advantage:'La famiglia : +25 % de Chauvinisme.', bonus:'pride',
    symptoms:['Parler avec les mains','Expresso en quatre secondes','Police internationale des pâtes','La sieste constitutionnelle','L’ananas hors-la-loi','Le tribunal de la carbonara'],
    descriptions:['Sans gestes, la connexion est perdue.','Debout. Brûlant. Déjà terminé.','Votre cuisson sera contrôlée à la frontière.','Les urgences attendront 16 heures.','Un fruit délicieux. Une pizza interdite.','La crème fraîche plaide non coupable.'],
    sabotage:['Spaghettis cassés en deux','Crème fraîche dans la carbonara','Pizza à l’ananas subventionnée'],quotes:['Ma che cosa fai?!','Un espresso, per favore.','Nonna n’est PAS contente.','Al dente ou rien.'] }
};
Object.assign(NATIONS,EXTRA_NATIONS);
export const BRANCHES = { symptoms:{ name:'Symptômes', resource:'folklore', icon:'✳', label:'Folklore', description:'Faites de vos petites habitudes un très gros problème mondial.' }, transmission:{ name:'Transmission', resource:'buzz', icon:'↗', label:'Buzz', description:'Faites voyager les clichés plus vite que les bonnes manières.' }, defense:{ name:'Résistance', resource:'pride', icon:'⬡', label:'Chauvinisme', description:'Protégez ce qui compte. Surtout si c’est comestible.' } };
export function nationIdentity(nation){return IDENTITIES[nation];}
export function nationBranch(nation,branch){const [name,description]=IDENTITIES[nation].branches[branch];return {...BRANCHES[branch],name,description};}
const RESEARCH_EFFECTS={
  transmission:['Vagues toutes les 6 s au lieu de 8 s · croissance +0,055/s','Croissance +0,115/s','+2 foyers internationaux par vague · croissance +0,055/s','Croissance +0,175/s','+3 foyers internationaux par vague · croissance +0,055/s','Vagues toutes les 4 s · croissance +0,235/s'],
  defense:['Dégâts de sabotage −15 %','Production de Chauvinisme +35 %','Contre-clichés et hausse passive d’indignation −25 %','Dégâts de sabotage −20 points de pourcentage supplémentaires','Régénération de l’Emblème +0,12/s','Dégâts −20 points supplémentaires · croissance +0,10/s']
};
export function researchNodes(nation, branch) {
  const identity=IDENTITIES[nation];
  return Array.from({length:6},(_,i) => ({ id:`${branch}-${i}`, tier:i, cost:[18,30,46,64,86,115][i], duration:[35,50,70,95,125,165][i], prerequisite:i ? `${branch}-${i-1}` : null,
    title:branch==='symptoms'?NATIONS[nation].symptoms[i]:identity[branch==='transmission'?'transmissions':'defenses'][i][0],
    description:branch==='symptoms'?NATIONS[nation].descriptions[i]:identity[branch==='transmission'?'transmissions':'defenses'][i][1],
    effect:branch==='symptoms'?`Croissance +0,095/s · indignation +${(5+i*1.2).toFixed(1).replace('.',',')}`:RESEARCH_EFFECTS[branch][i],
    icon:branch==='symptoms'?identity.icons[i]:identity[branch==='transmission'?'transmissions':'defenses'][i][2]
  }));
}
export function actionCopy(nation,type){
  const [name,description,icon,success,short]=IDENTITIES[nation].actions[type];
  const effect={tourist:'+12 % d’influence locale',debate:'+24 % d’influence · +4 indignation',chain:'+0,30 croissance/s avant résistance',repair:'+28 intégrité',intercept:'Neutralise le sabotage le plus proche',calm:'−12 indignation mondiale'}[type];
  return {name,description,icon,success,short,effect};
}
export const DIFFICULTIES = { easy:{name:'Touriste', growth:1.25, damage:.7, income:1.2}, normal:{name:'Diplomate', growth:1, damage:1, income:1}, hard:{name:'Impérialiste', growth:.82, damage:1.3, income:.9} };
export const NEWS = [
  'Un sommet international échoue après un débat sur la cuisson des pâtes.',
  'L’O.N.U.C. appelle au calme. Personne n’écoute, tout le monde a un avis.',
  'Des chercheurs découvrent une opinion gastronomique sans fondement.',
  'Le marché noir du bon goût atteint des niveaux historiques.',
  'Un influenceur confond patrimoine immatériel et placement de produit.',
  'Les claquettes-chaussettes demandent leur reconnaissance à l’UNESCO.',
  'Un pays déclare trois jours de deuil après une omelette au fromage.',
  'Le comité mondial des clichés reporte sa réunion : pause déjeuner.',
  'Le tourisme de masse promet de venir en petit comité. Ils seront 8 000.'
];
export const EVENTS = [
  {id:'food',title:'La guerre des assiettes',icon:'🍝',text:'Un chef italien vient de qualifier votre plat national d’« accident diplomatique ». Les caméras sont braquées sur vous.', choices:[{label:'Défendre l’honneur du terroir',detail:'−18 Chauvinisme · +28 Folklore · +4 indignation',cost:{pride:18},gain:{folklore:28},cringe:4},{label:'Offrir une dégustation',detail:'−12 Buzz · +14 Folklore · −4 indignation',cost:{buzz:12},gain:{folklore:14},cringe:-4},{label:'Accepter la critique (en public)',detail:'−7 indignation · −6 intégrité',cost:{},gain:{},cringe:-7,integrity:-6}]},
  {id:'viral',title:'Vous êtes un mème mondial',icon:'📱',text:'Une vidéo de votre ambassadeur dansant en costume traditionnel cumule 80 millions de vues. Le ridicule peut rapporter gros.',choices:[{label:'Sponsoriser la catastrophe',detail:'−15 Folklore · +35 Buzz · +7 indignation',cost:{folklore:15},gain:{buzz:35},cringe:7},{label:'Assumer avec dignité',detail:'+12 Buzz · +3 indignation',cost:{},gain:{buzz:12},cringe:3},{label:'Faire supprimer la vidéo',detail:'−10 Chauvinisme · −8 indignation',cost:{pride:10},gain:{},cringe:-8}]},
  {id:'counter',title:'Des touristes chez vous !',icon:'🧦',text:'Des visiteurs réclament du ketchup avec votre spécialité nationale. Le moral des puristes vacille.',choices:[{label:'Organiser un cours de bonnes manières',detail:'−16 Chauvinisme · +15 Folklore',cost:{pride:16},gain:{folklore:15},cringe:1},{label:'Transformer le scandale en publicité',detail:'+20 Buzz · pureté −20 pendant 40 s',cost:{},gain:{buzz:20},purity:20,cringe:5},{label:'Les laisser profiter des vacances',detail:'−5 indignation · pureté −12 pendant 40 s',cost:{},gain:{},purity:12,cringe:-5}]},
  {id:'summit',title:'Le sommet de la dernière chance',icon:'🕊',text:'L’O.N.U.C. propose une trêve. Tout ce qu’elle demande, c’est un petit effort de modestie. Ça va être compliqué.',choices:[{label:'Envoyer un panier garni',detail:'−22 Folklore · −15 indignation · +8 intégrité',cost:{folklore:22},gain:{},cringe:-15,integrity:8},{label:'Diffuser un discours triomphal',detail:'+22 Chauvinisme · +9 indignation',cost:{},gain:{pride:22},cringe:9},{label:'Ne pas répondre',detail:'+5 Chauvinisme',cost:{},gain:{pride:5},cringe:0}]}
];
export const flag = id => String.fromCodePoint(...[...id].map(c=>127397+c.charCodeAt(0)));

export function eventFor(nation,id,variant=0){
  const base=EVENTS.find(e=>e.id===id);if(!base)return null;
  if(!IDENTITIES[nation]||!Number.isInteger(variant)||variant<0||variant>=EVENT_VARIANT_COUNT)return null;
  const {title,text,labels}=eventStory(nation,id,variant,IDENTITIES[nation].events[id]);
  const icon=id==='food'?NATIONS[nation].icon:id==='counter'?actionCopy(nation,'tourist').icon:id==='viral'?IDENTITIES[nation].icons[5]:actionCopy(nation,'calm').icon;
  return {...base,title,text,icon,variant,illustration:{...eventIllustration(nation,id,variant),alt:title},choices:base.choices.map((choice,i)=>({...choice,label:labels[i]}))};
}
