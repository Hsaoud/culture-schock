import {createGame} from '../engine.js';

export const LESSONS=[
  {id:'welcome',title:'Votre première conquête',text:'Un entraînement, de vraies commandes. Essayez chaque pouvoir : votre campagne vous attend intacte.',glyph:'tourist',button:'Commencer'},
  {id:'select',title:'Visez un autre pays',text:'Touchez un pays sur la carte, ou choisissez-le dans l’Atlas. Les flèches de territoire fonctionnent aussi à la manette.',target:'.territory',glyph:'tourist',button:'Ouvrir l’Atlas',command:'atlas'},
  {id:'tourist',title:'Envoyez votre ambassadeur',text:'Appuyez sur Envoyer. Suivez son trajet : le pays gagne 12 % d’influence. Le compteur sur le bouton indique ensuite sa recharge.',target:'[data-action="tourist"]',glyph:'tourist'},
  {id:'collect',title:'Faites le plein',text:'Récoltez les quatre éclats sur la carte ou avec Récolter. Flamme : traditions. Éclair : actions. Couronne : défense. Ampoule : recherche plus rapide.',target:'#collect',glyph:'insight'},
  {id:'debate',title:'Faites parler de vous',text:'Utilisez Convaincre : +24 % d’influence, mais aussi +4 d’indignation. Regardez les deux jauges changer.',target:'[data-action="debate"]',glyph:'debate'},
  {id:'chain',title:'Installez-vous pour durer',text:'Implantez une enseigne. Elle accélère la croissance du pays, sans avoir à renvoyer un ambassadeur chaque jour.',target:'[data-action="chain"]',glyph:'chain'},
  {id:'research-open',title:'Éveillez une tradition',text:'Ouvrez l’Atelier : traditions pour l’influence, rayonnement pour la diffusion, gardiens pour la protection.',target:'[data-do="research"]',glyph:'insight'},
  {id:'research-buy',title:'Lancez le premier rayonnement',text:'Choisissez le premier niveau de Rayonnement, en surbrillance. Chaque branche se débloque dans l’ordre.',target:'[data-research="transmission"][data-tier="0"]',glyph:'buzz',button:'Ouvrir l’Atelier',command:'research'},
  {id:'research-wait',title:'Les idées prennent du temps',text:'Observez la progression. La matière grise accélère le travail sans être dépensée. Ici, le temps avance à 4×.',target:'#research-task',glyph:'insight'},
  {id:'intercept',title:'Un sabotage approche !',text:'Suivez le trajet rouge vers votre sanctuaire. Interceptez-le avant l’impact. À partir de 23 % d’indignation, la coalition prépare ses attaques.',target:'.power-card[data-action="intercept"]',glyph:'intercept'},
  {id:'repair',title:'Protégez votre emblème',text:'Un impact de démonstration l’a endommagé. Utilisez Restaurer pour récupérer 28 points. À zéro intégrité, la campagne est perdue.',target:'[data-action="repair"]',glyph:'repair'},
  {id:'calm',title:'Faites retomber la tension',text:'Utilisez Apaiser et regardez l’indignation baisser de 12 points : moins de tension, moins de sabotages.',target:'[data-action="calm"]',glyph:'calm'},
  {id:'event',title:'À vous de trancher',text:'Choisissez une réponse. Les symboles montrent les gains et les coûts ; la pureté de vos traditions peut aussi baisser temporairement.',target:'.choice',glyph:'lantern'},
  {id:'pause',title:'Prenez le temps de réfléchir',text:'Mettez la partie en pause avec Ⅱ, Espace ou Start. Vous pouvez encore choisir vos actions pendant la pause.',target:'#pause',glyph:'clock'},
  {id:'resume',title:'Relancez le temps',text:'Appuyez à nouveau sur le même bouton pour reprendre.',target:'#pause',glyph:'clock'},
  {id:'speed',title:'Accélérez votre conquête',text:'Appuyez sur 1× pour passer à 2×. Un autre appui donne 4×. L’indignation et les attaques avancent aussi plus vite !',target:'#speed',glyph:'clock'},
  {id:'zoom',title:'Explorez le monde',text:'Zoomez avec +, la molette, un pincement ou les gâchettes. Glissez ensuite la carte ; le stick droit fonctionne aussi. ◎ rétablit la vue mondiale.',target:'.zoom',glyph:'tourist'},
  {id:'finish',title:'À vous d’écrire la légende',text:'La culture se diffuse avec le temps. Atteignez 100 % dans chacun des 236 territoires en gardant votre emblème intact. Vos essais n’ont rien coûté à votre campagne.',target:'.world-score',glyph:'pride',button:'Jouer ma campagne'}
];

// A separate, disposable simulation. Neither completing nor skipping mutates the campaign.
export class Training {
  constructor(original,world){this.original=structuredClone(original);this.world=world;this.state=createGame(world,original.nation,original.difficulty,41024);this.state.resources={folklore:120,buzz:120,pride:120,insight:24};this.index=0;this.enter();}
  get lesson(){return LESSONS[this.index];}
  get running(){return this.lesson.id==='research-wait';}
  enter(){const s=this.state,id=this.lesson.id;
    if(id==='collect')s.bubbles=Object.keys(s.resources).map((resource,i)=>({id:s.nextId++,country:i%2?s.selected:s.nation,resource,value:12,expires:1000}));
    if(id==='research-wait'){s.paused=false;s.speed=4;}
    if(id==='intercept'){s.speed=1;s.cringe=32;s.planes=[{id:s.nextId++,from:s.selected,eta:20,total:20,label:'Sabotage d’entraînement',damage:28}];}
    if(id==='repair')s.integrity=72;
    if(id==='calm')s.cringe=36;
    if(id==='event'){s.event={id:'counter'};s.eventSerial++;}
    if(id==='pause'){s.paused=false;s.speed=1;}
  }
  signal(type,value){const id=this.lesson.id,s=this.state;
    const matches=(type==='next'&&id==='welcome')||(type==='select'&&id==='select'&&s.selected!==s.nation)||(type==='action'&&id===value)||(type==='collect'&&id==='collect'&&!s.bubbles.length)||(type==='research-open'&&id==='research-open')||(type==='research-buy'&&id==='research-buy'&&s.researchTask?.id==='transmission-0')||(type==='tick'&&id==='research-wait'&&s.research.includes('transmission-0'))||(type==='event'&&id==='event'&&!s.event)||(type==='pause'&&((id==='pause'&&s.paused)||(id==='resume'&&!s.paused)))||(type==='speed'&&id==='speed'&&s.speed===2)||(type==='zoom'&&id==='zoom');
    if(!matches)return false;this.index++;this.enter();return true;
  }
  allows(type,value){const id=this.lesson.id;
    if(type==='action')return id===value;
    if(type==='select')return id==='select';
    if(type==='collect')return id==='collect';
    if(type==='research-buy')return id==='research-buy'&&value==='transmission-0';
    if(type==='pause')return id==='pause'||id==='resume'||id==='research-wait';
    if(type==='research')return ['research-open','research-buy','research-wait'].includes(id);
    if(type==='atlas'||type==='prev'||type==='next')return id==='select';
    if(type==='speed')return id==='speed';
    return ['zoom-in','zoom-out','reset','sound','motion','menu','close'].includes(type);
  }
}
