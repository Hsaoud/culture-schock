import {EXTRA_IDENTITIES} from './extra-nations.js';
// Narrative identities are separate from mechanical costs, durations and effects.
export const IDENTITIES = {
  FR: {
    accent:'#93b5e9', accentRGB:'147,181,233', map:[116,153,214], gold:'#e8cd93', seal:'RF', motif:'fleur',
    operation:'OPÉRATION BAGUETTE SANS FRONTIÈRES', command:'Ministère du rayonnement et du râlage',
    lab:'Académie de la mauvaise foi', labTitle:'La recherche, avec une pause déjeuner.', labIntro:'Nos experts ont un avis sur tout. Finançons-le.',
    labIdle:'Un nouveau motif de mécontentement ?', base:'Le palais du bon goût', doctrine:'TERROIR · PANACHE · CONTESTATION',
    branches:{symptoms:['Art de vivre','Élevez les petites contrariétés au rang de patrimoine.'],transmission:['Rayonnement','Exportez le terroir. Facturez le supplément d’âme.'],defense:['Exception culturelle','La baguette est une ligne rouge. Le pain de mie aussi.']},
    icons:['✳','🍷','⚑','☁','🧀','⚜'], stages:['Touriste du terroir','Apprenti râleur','Gastronome contrarié','Citoyen gréviste'],
    insight:'Les grandes idées naissent entre le fromage et le café.',
    transmissions:[
      ['La délégation en marinière','Ils trouvent que tout est mieux chez eux. Et le disent très fort.','🧳'],
      ['L’ambassade du croissant','Une viennoiserie à la fois, le petit-déjeuner capitule.','🥐'],
      ['Le hashtag #OnEnAGros','Un soupir, un fil de 47 messages et trois appels à la grève.','♯'],
      ['La Nouvelle Vague mondiale','Six heures de cinéma. Personne ne comprend. Tout le monde applaudit.','🎬'],
      ['Le Grand Tour des terroirs','Une AOC pour chaque escale, une plainte pour chaque hôtel.','🍷'],
      ['La francophonie du soupir','Le monde entier sait désormais prononcer « pfff » avec conviction.','⚜']
    ],
    defenses:[
      ['Appellation d’origine inviolable','Le terroir est délimité. Les contrevenants aussi.','◈'],
      ['Les Compagnons du levain','Une confrérie, un tablier, zéro compromis sur la croûte.','🥖'],
      ['La douane des anglicismes','Tout « sandwich » doit présenter ses papiers.','⚑'],
      ['Le coffre de la Tradition','Une chambre forte à température de boulangerie.','▣'],
      ['La fournée de la Résistance','Chaque matin, le patrimoine reprend du croustillant.','☀'],
      ['La Constitution du terroir','Article premier : on ne plaisante pas avec le fromage.','⚜']
    ],
    actions:{
      tourist:['Dépêcher un râleur','Tourisme comparatif : « Chez nous, c’est meilleur. »','🧳','Râleur envoyé. Le service local vient de perdre une étoile.','Dépêcher un râleur'],
      debate:['Défendre la vraie recette','La crème dans la carbonara ? Incident diplomatique.','🧀','La recette a été défendue. Les commentaires sont fermés.','Plaider le terroir'],
      chain:['Ouvrir une boulangerie','Une succursale de la République du croissant.','🥐','Boulangerie implantée. Le pain de mie recule.','Boulangerie installée'],
      repair:['Relancer une fournée','Un peu de levain, beaucoup de dignité retrouvée.','🥖','La Sainte Baguette retrouve sa croûte.','Relancer le four'],
      intercept:['Mobiliser les douaniers','Aucune tranche sous plastique ne passera.','⚑','Les douaniers ont saisi la cargaison de pain industriel.','Mobiliser la garde'],
      calm:['Offrir un verre de Bordeaux','On peut être en désaccord après l’apéritif.','🍷','Trêve autour d’un Bordeaux. Personne ne reconnaît ses torts.','Verser un Bordeaux']
    },
    news:['La pause déjeuner française obtient un siège permanent au Conseil de sécurité.','Le cours du Comté dépasse celui de l’or. Les caves deviennent banques centrales.','Un boulanger refuse une étoile Michelin : « Je ferme à 13 heures. »','Le ministère dément râler. Il exprime une réserve argumentée.'],
    conversion:'réclame une pause déjeuner et une vraie baguette', victory:'La planète râle en français. Enfin une victoire qui mérite quelques critiques.', defeat:'La dernière baguette a ramolli. Même le ministère n’a plus rien à redire.',
    events:{food:['Le procès du croissant mou','Une commission étrangère a certifié qu’un croissant industriel était « suffisamment français ». Les boulangers menacent de bloquer les frontières.',['Convoquer les Compagnons du levain','Organiser une dégustation à l’aveugle','Admettre qu’il était encore tiède']],viral:['Le soupir qui a fait le tour du monde','Votre ambassadeur a soupiré pendant 42 secondes face à un plateau-repas. La vidéo est devenue l’hymne officieux des salariés.',['Financer la version longue','Revendiquer un geste artistique','Invoquer le droit à l’image']],counter:['Du ketchup sur le plateau de fromages','Des visiteurs ont demandé une sauce sucrée pour leur Comté. Les puristes envisagent une cellule psychologique.',['Ouvrir un stage de savoir-vivre','Vendre des t-shirts « Pas sur le Comté »','Fermer les yeux très fort']],summit:['Les accords de l’apéritif','L’O.N.U.C. demande un geste de modestie. Le ministère propose de négocier autour de produits objectivement supérieurs.',['Expédier un panier AOC','Prononcer un discours sur l’exception','Prolonger la pause déjeuner']]}
  },
  GB: {
    accent:'#c0a0e4',accentRGB:'192,160,228',map:[168,132,202],gold:'#d7bc82',seal:'HRH',motif:'crown',
    operation:'OPÉRATION GOD SAVE THE KETTLE',command:'Royal Office of Cultural Affairs',
    lab:'Royal Institute of Awkward Science',labTitle:'Une invention. Une tasse. Une réserve.',labIntro:'Sa Majesté autorise la recherche, sous réserve de respecter l’heure du thé.',
    labIdle:'Un brevet pour la gêne polie ?',base:'Le cabinet de la Théière',doctrine:'FLEGME · ÉTIQUETTE · EARL GREY',
    branches:{symptoms:['Bonnes manières','Apprenez au monde à désapprouver avec le sourire.'],transmission:['Royal soft power','Une tasse à chaque fuseau horaire.'],defense:['Garde de la Couronne','La monarchie peut vaciller. La bouilloire doit tenir.']},
    icons:['☂','▧','♛','↶','🍞','🫖'],stages:['Visiteur du Commonwealth','Amateur de tea time','Sujet de la bouilloire','Sir du flegme mondial'],
    insight:'Une idée infuse mieux après quatre minutes, jamais au micro-ondes.',
    transmissions:[
      ['Les gentlemen en excursion','Ils font la queue devant des portes qui n’ouvrent sur rien.','☂'],
      ['Les comptoirs d’Earl Grey','Une tasse de thé. Puis une présence diplomatique permanente.','🫖'],
      ['Le sarcasme en sous-titres','« Quite good » signifie catastrophique dans 94 pays.','♯'],
      ['Les séries en costume','Six saisons pour décider qui versera le lait en premier.','♛'],
      ['Le Commonwealth des pubs','Chaque escale obtient un pub, trois tapis et une querelle de fléchettes.','🍺'],
      ['Le tea time planétaire','Le soleil ne se couche jamais sur une bouilloire allumée.','◷']
    ],
    defenses:[
      ['Le Royal Warrant du thé','Fournisseur officiel du bon goût légèrement amer.','♛'],
      ['Les gardes de la soucoupe','Immobiles sous la pluie. Inflexibles sur le lait.','⚑'],
      ['Le contrôle des files d’attente','Les modes étrangères devront patienter comme tout le monde.','☂'],
      ['Le bunker de Buckingham','Une chambre blindée, une moquette, une bouilloire de secours.','▣'],
      ['La réserve stratégique de biscuits','Un biscuit trempé à temps peut sauver la nation.','🍪'],
      ['La Magna Carta de la bouilloire','Nul ne sera privé de thé sans jugement de ses pairs.','♜']
    ],
    actions:{
      tourist:['Envoyer un gentleman','Il ne critique pas. Il dit « interesting ».','☂','Gentleman déployé. Une file d’attente s’est formée spontanément.','Envoyer un gentleman'],
      debate:['Arbitrer le thé au lait','Le lait avant ou après ? La paix n’était qu’une illusion.','🫖','Le débat infuse. Les participants ne s’adressent plus la parole.','Arbitrer le tea time'],
      chain:['Fonder un pub royal','Moquette épaisse, bière tiède, influence durable.','🍺','Pub royal inauguré. La météo est désormais le sujet principal.','Pub royal installé'],
      repair:['Repolir la Théière','Réparer l’émail sans perdre une once de dignité.','🫖','La Théière brille. La Couronne prétend n’avoir jamais douté.','Repolir la Théière'],
      intercept:['Appeler la Royal Guard','Interception parfaitement polie. Fermeté absolue.','♛','La Royal Guard a reconduit le sabotage au bout de la file.','Appeler la Garde'],
      calm:['Présenter des excuses floues','« We are sorry you feel that way. »','☂','Excuses présentées. Aucune responsabilité n’a été reconnue.','Offrir un Earl Grey']
    },
    news:['Le parlement débat depuis sept heures de la température idéale d’une bouilloire.','Le brouillard britannique est reconnu comme produit d’exportation.','Une file d’attente de 11 km attend de savoir ce qu’elle attend.','Le ministère qualifie la crise d’« un peu contrariante ». Alerte maximale.'],
    conversion:'installe de la moquette et fait infuser un Earl Grey',victory:'Le monde s’arrête à cinq heures. La bouilloire, elle, ne s’arrête jamais.',defeat:'La Théière est froide. Quelqu’un propose un café instantané. Tout est fini.',
    events:{food:['Le scandale du lait avant le thé','Un sommet international a servi le lait dans une tasse vide. Le palais refuse de commenter, ce qui est un commentaire accablant.',['Mandater le protocole royal','Servir une tasse irréprochable','Qualifier cela d’expérience intéressante']],viral:['La révérence qui ne finit plus','Votre ambassadeur est resté courbé pendant le générique. Le monde a décidé d’y voir un nouveau défi viral.',['Commander une série historique','Saluer très discrètement le public','Demander poliment le retrait']],counter:['Ils doublent dans la file','Des touristes ont traversé une file en disant « excuse me ». Le pays découvre une colère impossible à formuler.',['Former les visiteurs au protocole','Vendre des billets coupe-file ironiques','Les laisser passer en soupirant']],summit:['Le traité de la soucoupe','L’O.N.U.C. réclame un signe d’apaisement. Le cabinet prépare une lettre très courtoise dont chaque mot est une menace.',['Envoyer des biscuits diplomatiques','Lire une déclaration de Sa Majesté','Reporter la réponse après le thé']]}
  },
  US: {
    accent:'#e69c98',accentRGB:'230,156,152',map:[201,116,122],gold:'#8dbbdc',seal:'USA',motif:'star',
    operation:'OPÉRATION EXTRA LARGE FREEDOM',command:'Department of Unnecessary Greatness',
    lab:'Freedom Labs™',labTitle:'Think bigger. Brevetez le reste.',labIntro:'Des idées grand format, financées avant même de savoir à quoi elles servent.',
    labIdle:'Et si on ajoutait du fromage ?',base:'Le Freedom Command Center',doctrine:'SPECTACLE · SUPER SIZE · LIBERTÉ',
    branches:{symptoms:['American way','Plus grand, plus fort, avec supplément cheddar.'],transmission:['Global entertainment','La culture arrive avec une bande-annonce et un abonnement.'],defense:['Homeland branding','Protéger la liberté de vendre un soda de trois litres.']},
    icons:['★','⚑','🧀','🥤','✈','🎬'],stages:['Prospect international','Fan de super size','Ambassadeur du cheddar','Freedom certified™'],
    insight:'Les idées sont grandes. La clause de propriété intellectuelle aussi.',
    transmissions:[
      ['Les touristes volume maximum','Ils sont très contents. Le continent entier le sait.','📣'],
      ['La diplomatie du drive-in','Une frontière ? Ajoutez simplement un guichet pour les voitures.','🍔'],
      ['Le challenge Freedom™','Danser, partager, s’abonner. La géopolitique en quinze secondes.','★'],
      ['Hollywood sans frontières','Le héros sauve le monde, qui achète ensuite les produits dérivés.','🎬'],
      ['Le pass mondial all inclusive','Une croisière, neuf parcs à thème, zéro portion normale.','✈'],
      ['Le livestream de la liberté','La planète devient une audience. Les cookies restent obligatoires.','📡']
    ],
    defenses:[
      ['Freedom™, marque déposée','Le sabotage est poursuivi pour contrefaçon.','™'],
      ['Les sponsors patriotiques','Un drapeau sur chaque produit. Deux sur les offres premium.','★'],
      ['La douane du système métrique','Tout centimètre entrant est converti en terrain de football.','⚑'],
      ['Le coffre blindé du Burger','Le burger rentre à peine. C’est donc la bonne taille.','▣'],
      ['Le grill patriotique','Cheddar, soda, trois discours : le Burger reprend des couleurs.','⚙'],
      ['Le second amendement du cheddar','Le droit au fromage en spray ne pourra être contesté.','🦅']
    ],
    actions:{
      tourist:['Lâcher un fan XXL','Casquette, selfie et enthousiasme à 120 décibels.','📣','Fan XXL déployé. Tout le monde a été invité à avoir une AMAZING day.','Lâcher un fan XXL'],
      debate:['Défendre le double cheddar','Une démocratie se mesure à son nombre de suppléments.','🍔','Le cheddar gagne le débat. Le nutritionniste demande un droit de réponse.','Défendre le cheddar'],
      chain:['Implanter un Freedom Burger','Le drive reste ouvert jusqu’à l’assimilation totale.','🍟','Freedom Burger ouvre. Les portions locales ont pris peur.','Drive-in implanté'],
      repair:['Remettre le Burger sur le grill','Double cheddar, pain frais, patriotisme premium.','🦅','Le Burger XXL retrouve son cheddar. La liberté croustille.','Raviver le grill'],
      intercept:['Déployer Freedom Shield','Le sabotage n’avait pas lu les conditions générales.','★','Freedom Shield neutralise la menace. Séquence disponible en IMAX.','Freedom Shield'],
      calm:['Sponsoriser la paix','Une campagne positive, avec un code promotionnel.','🕊','La paix trouve enfin son sponsor officiel.','Sponsoriser la paix']
    },
    news:['Le gobelet « small » dépasse désormais la capacité d’une baignoire.','Un stade sert d’unité de mesure à un autre stade. Le système reste cohérent.','Le Burger national exige une assiette XXL et un supplément premium.','Hollywood annonce le remake américain d’un incident diplomatique encore en cours.'],
    conversion:'commande un soda XXL et applaudit à l’atterrissage',victory:'La planète est un blockbuster. Vous possédez les droits sur la suite.',defeat:'Le Burger s’est effondré. Quelqu’un propose une petite salade.',
    events:{food:['Le procès du fromage en spray','Un jury culinaire étranger refuse de considérer le cheddar en aérosol comme un légume. Freedom Labs conteste la méthodologie.',['Financer un contre-rapport patriotique','Organiser un buffet à volonté','Admettre que ce n’est pas une salade']],viral:['Le Burger défie la gravité','Votre mascotte a porté un burger de douze étages sur le tapis rouge. Les images battent tous les records du box-office.',['Acheter les droits du film','Sortir les produits dérivés','Envoyer les avocats du studio']],counter:['Des touristes commandent un petit soda','Les visiteurs réclament une portion raisonnable et une piste cyclable. Le service marketing parle de crise existentielle.',['Organiser un stage super size','Vendre le scandale en édition limitée','Tolérer une portion européenne']],summit:['Le sommet sponsorisé pour la paix','L’O.N.U.C. veut négocier. Le Department propose trois formules de partenariat et un accès VIP au buffet.',['Offrir un panier de snacks Freedom','Diffuser un discours en IMAX','Laisser répondre le service client']]}
  },
  IT: {
    accent:'#88c8a9',accentRGB:'136,200,169',map:[100,177,139],gold:'#e0b386',seal:'NONNA',motif:'laurel',
    operation:'OPERAZIONE AL DENTE',command:'Consiglio Supremo della Nonna',
    lab:'Accademia del Gusto',labTitle:'La science exacte du « comme Nonna ».',labIntro:'Chaque expérience doit être approuvée par une grand-mère qui n’utilise pas de balance.',
    labIdle:'Nonna a encore une idée.',base:'La cucina di comando',doctrine:'FAMIGLIA · GESTES · AL DENTE',
    branches:{symptoms:['La dolce vita','Apprenez au monde à vivre, surtout à table.'],transmission:['Diplomazia del gusto','Toutes les routes mènent à la cuisine de Nonna.'],defense:['La famiglia veille','La recette se transmet. Elle ne se négocie pas.']},
    icons:['🤌','☕','🍝','☀','🍍','⚖'],stages:['Invité à la table','Apprenti gesticulateur','Disciple de Nonna','Gardien de l’al dente'],
    insight:'Un secret de famille vaut bien trois articles scientifiques.',
    transmissions:[
      ['Les cousins en Vespa','Un klaxon, deux gestes et une conversation avec tout le quartier.','🛵'],
      ['Les consulats de la trattoria','On commence par dîner. On finit par appartenir à la famille.','🍝'],
      ['Le geste devenu viral','Même sans le son, le message est parfaitement clair.','🤌'],
      ['La dolce vita en pellicule','Le monde veut le même scooter, la même place et le même café.','🎬'],
      ['Le Giro des grands-mères','Une Nonna par destination. Les cuisines locales rendent les armes.','🚲'],
      ['La recette transmise à tous','« À peu près » devient une unité scientifique internationale.','🍅']
    ],
    defenses:[
      ['Denominazione Nonna Protetta','L’origine du plat est certifiée par une photo de famille.','◈'],
      ['La confrérie de la pizza','Des tabliers fleuris. Une discipline redoutable.','🍝'],
      ['La brigade anti-ananas','Les fruits sont libres. Leur accès aux pizzas est réglementé.','🍍'],
      ['Le coffre des recettes secrètes','La combinaison ? « Tu verras quand tu seras grand. »','▣'],
      ['Le dimanche chez Nonna','Trois assiettes supplémentaires et tout va déjà mieux.','🍅'],
      ['Le serment de l’al dente','La pizza devient patrimoine. La crème fraîche plaide coupable.','⚖']
    ],
    actions:{
      tourist:['Envoyer un cousin en Vespa','Il connaît quelqu’un qui connaît une très bonne adresse.','🛵','Le cousin est arrivé. Tout le quartier parle avec les mains.','Envoyer un cousin'],
      debate:['Juger la carbonara','La crème fraîche est citée à comparaître.','🍝','Le tribunal a tranché : la recette de Nonna fait jurisprudence.','Juger la carbonara'],
      chain:['Ouvrir une trattoria','Une table de plus. Et encore une. Vous avez l’air maigre.','🍅','Trattoria ouverte. Nonna surveille personnellement la cuisson.','Trattoria installée'],
      repair:['Faire revenir Nonna','Une poignée de farine et quelques remontrances.','🍝','Nonna remet la pizza au four. Le patrimoine retrouve son croustillant.','Rappeler Nonna'],
      intercept:['Appeler la brigade des pâtes','Contrôle des bagages et du temps de cuisson.','⚖','La brigade saisit l’ananas. La pizza est en sécurité.','Brigade des pâtes'],
      calm:['Inviter tout le monde à table','On se dispute moins après le quatrième plat.','🍷','Le monde reprend une assiette. La crise attendra le dessert.','Mettre la table']
    },
    news:['Nonna estime que le monde entier n’a pas assez mangé. Mobilisation générale.','Une Vespa obtient le statut de véhicule diplomatique prioritaire.','La brigade des pâtes interpelle un suspect armé d’un pot de crème.','Le ministère confirme : le café après le café reste une excellente idée.'],
    conversion:'gesticule avec conviction et surveille la cuisson des pâtes',victory:'Une planète, une grande table. Nonna trouve quand même que vous avez maigri.',defeat:'La pizza de Nonna a brûlé. Quelqu’un casse les spaghettis. Elle a besoin de s’asseoir.',
    events:{food:['L’affaire de la carbonara crémeuse','Un chef étranger a publié une recette « améliorée » avec de la crème fraîche. Nonna pose lentement son tablier.',['Saisir le tribunal des pâtes','Faire goûter la recette de famille','Dire que c’est une autre recette']],viral:['Le geste qui remplace les mots','Une vidéo de Nonna corrigeant un cuisinier sans prononcer un mot est devenue un langage international.',['Financer un dictionnaire des gestes','Repartager avec un simple 🤌','Demander le respect de la famiglia']],counter:['Ils cassent les spaghettis','Des visiteurs coupent les pâtes pour les faire entrer dans la casserole. Nonna découvre la notion de violence administrative.',['Ouvrir une école de l’al dente','Vendre des casseroles diplomatiques','Quitter la cuisine quelques minutes']],summit:['La paix autour de la grande table','L’O.N.U.C. accepte de négocier à condition que le dîner se termine un jour. Nonna n’a pas encore servi le deuxième plat.',['Envoyer un panier de la famiglia','Porter un toast au génie de Nonna','Laisser mijoter les négociations']]}
  }
};
Object.assign(IDENTITIES,EXTRA_IDENTITIES);
