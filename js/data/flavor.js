// Identité satirique de chaque nation, déclinée dans tout le jeu : ressource, bouton
// d'évolution, chaîne d'info, noms de recherches, actualités, fins de partie.
// Gabarits d'actualités : {pays} pays touché, {cliche} un de vos clichés, {cur} votre ressource,
// {leader} votre champion, {home} votre pays, {rival} un rival, {rcliche} un cliché du rival.

export const FLAVOR = {
  US: {
    currency: {icon: '🍔', name: 'Calories', one: 'calorie'},
    verb: 'SUPERSIZER', channel: 'CHEESE NEWS NETWORK', operation: 'Opération Supersize',
    win: 'Le monde en format XXL', lose: 'Et à commander en taille S.',
    traits: {
      air1: 'Spring break', air2: 'Vols en première XXL', land1: 'Road trip', land2: 'Banlieues pavillonnaires',
      sea1: 'Fast-food en conteneurs', sea2: 'Porte-avions de ketchup', tv: 'Hollywood', resto: 'Drive-in partout',
      net: 'Influenceurs', fest: 'Super Bowl mondial', world: 'Rêve américain planétaire',
      home1: 'Un drapeau par pelouse', home2: 'Mont Rushmore', home3: 'Fort Knox culturel', clash1: 'Blockbuster écrasant',
      clash2: 'Suite, prequel et reboot', anti1: 'Armée d’avocats', anti2: 'Lobby du maïs', probe: 'Procès retentissant',
      customs: 'Fouille à l’aéroport', low1: 'Parler moins fort', low2: 'Sourire moins blanc',
    },
    news: [
      '{pays} mesure désormais tout en terrains de football',
      'À {pays}, les gobelets de soda passent au format piscine',
      'Un restaurant de {pays} sert un burger plus haut que son immeuble',
      'Les passagers d’un ascenseur de {pays} applaudissent l’arrivée au rez-de-chaussée',
      'Hollywood rachète l’histoire de {pays} pour en faire une trilogie',
      '{pays} : le pourboire minimum passe à 35 %, pourboire du pourboire inclus',
      'Le fromage en spray entre au menu des cantines de {pays}',
    ],
  },
  FR: {
    currency: {icon: '🥖', name: 'Baguettes', one: 'baguette'},
    verb: 'EN RAJOUTER', channel: 'RÂLE INFO 24/24', operation: 'Opération Râlerie',
    win: 'La planète râle en français', lose: 'Personne ne râle plus. Quelle tristesse.',
    traits: {
      air1: 'Touristes en marinière', air2: 'Charters de vignerons', land1: 'Frontaliers râleurs', land2: 'Résidences secondaires',
      sea1: 'Export de fromages', sea2: 'Cargos de camembert', tv: 'Films d’auteur', resto: 'Bistrots partout',
      net: 'Râler en ligne', fest: 'Fête de la musique mondiale', world: 'Exception culturelle planétaire',
      home1: 'Fierté gauloise', home2: 'Patrimoine de l’UNESCO', home3: 'Village d’irréductibles', clash1: 'Mépris poli',
      clash2: 'Grève générale offensive', anti1: 'Mauvaise foi', anti2: 'Lobby du terroir', probe: 'Polémique au JT',
      customs: 'Douane au fromage', low1: 'Profil bas (rare)', low2: 'Faire semblant de sourire',
    },
    news: [
      'Grève des boulangers à {pays} : la population découvre le pain de mie et proteste',
      'À {pays}, le déjeuner dure désormais 2 h 30 « par respect »',
      '{pays} : « bof » remplace « bonjour » dans 40 % des commerces',
      'Un fromage de {pays} réclame une appellation d’origine, la France porte plainte',
      'Le soupir devient langue officielle à {pays}',
      '{pays} : les manifestants défilent contre tout, « par précaution »',
      'Un serveur de {pays} refuse de servir un client « pour son bien »',
    ],
  },
  IT: {
    currency: {icon: '🤌', name: 'Gestes', one: 'geste'},
    verb: 'GESTICULER', channel: 'TG NONNA', operation: 'Opération Famiglia',
    win: 'Le monde entier à la table de Nonna', lose: 'Et à mettre de la crème dans la carbonara.',
    traits: {
      air1: 'Touristes qui gesticulent', air2: 'Charters pour Rome', land1: 'Cousins de la famiglia', land2: 'Diaspora des pizzerias',
      sea1: 'Export de pâtes', sea2: 'Cargos d’huile d’olive', tv: 'Feuilletons de la Nonna', resto: 'Pizzerias partout',
      net: 'Recettes virales', fest: 'Carnaval vénitien', world: 'Dolce vita planétaire',
      home1: 'La famiglia d’abord', home2: 'Ruines millénaires', home3: 'La Nonna veille', clash1: 'Engueulade à table',
      clash2: 'Vendetta culinaire', anti1: 'Combinazione', anti2: 'Pause café de 3 heures', probe: 'Scandale au Parlement',
      customs: 'Contrôle des pâtes', low1: 'Gestes discrets', low2: 'Parler sans les mains',
    },
    news: [
      'À {pays}, la police des pâtes verbalise un spaghetti cassé en deux',
      '{pays} : l’ananas sur pizza désormais passible d’un regard de Nonna',
      'Les habitants de {pays} parlent avec les mains, la circulation est perturbée',
      'Sieste constitutionnelle à 14 h dans tout {pays}',
      'Un expresso servi en plus de quatre secondes déclenche une crise à {pays}',
      '{pays} : un repas de famille entre dans sa sixième heure, personne ne se plaint',
      'Un chef de {pays} jure n’avoir jamais vu de crème dans une carbonara',
    ],
  },
  MX: {
    currency: {icon: '🌶️', name: 'Piments', one: 'piment'},
    verb: 'PIMENTER', channel: 'TÉLÉ-FIESTA', operation: 'Opération Fiesta',
    win: 'Fiesta planétaire', lose: 'Et que le piment, ça pique.',
    traits: {
      air1: 'Touristes en sombrero', air2: 'Vols directs pour la plage', land1: 'Caravane de mariachis', land2: 'Taquerias frontalières',
      sea1: 'Export d’avocats', sea2: 'Cargos de guacamole', tv: 'Telenovelas', resto: 'Taquerias partout',
      net: 'Mèmes de piñata', fest: 'Día de Muertos mondial', world: 'Fiesta sans frontières',
      home1: 'Orgullo nacional', home2: 'Pyramides aztèques', home3: 'Fiesta imprenable', clash1: 'Lucha libre',
      clash2: 'Duel de mariachis', anti1: 'Mañana, mañana', anti2: 'Sieste administrative', probe: 'Drame de telenovela',
      customs: 'Douane au piment', low1: 'Siesta discrète', low2: 'Sombrero taille S',
    },
    news: [
      '{pays} : les mariachis jouent un rappel de six heures',
      'Salsa au petit-déjeuner : {pays} manque de piment',
      '« Il est tout doux », jure un chef de {pays} avant l’évacuation de la salle',
      '{pays} décrète la fiesta permanente, les horaires de bureau abolis',
      'Pénurie de sombreros à {pays} : l’ombre se négocie au marché noir',
      'Une piñata de {pays} résiste à 400 coups de bâton, enquête ouverte',
      'À {pays}, la telenovela du soir dépasse les 3 000 épisodes',
    ],
  },
  GB: {
    currency: {icon: '🫖', name: 'Tasses de thé', one: 'tasse'},
    verb: 'INFUSER', channel: 'BISCUIT BROADCASTING', operation: 'Opération Tea Time',
    win: 'Tea time universel', lose: 'Et à faire le thé au micro-ondes.',
    traits: {
      air1: 'Touristes polis', air2: 'Week-ends en charter', land1: 'Tunnel sous la Manche', land2: 'Expatriés au soleil',
      sea1: 'Thé en conteneurs', sea2: 'Royal Navy du thé', tv: 'Séries en costumes', resto: 'Pubs partout',
      net: 'Mèmes royaux', fest: 'Jubilé permanent', world: 'Commonwealth du thé',
      home1: 'Keep calm', home2: 'Relève de la garde', home3: 'Château hanté', clash1: 'Sarcasme',
      clash2: 'Ironie dévastatrice', anti1: 'Understatement', anti2: 'Club de gentlemen', probe: 'Tabloïds',
      customs: 'File d’attente à la douane', low1: 'Flegme', low2: 'Rester parfaitement immobile',
    },
    news: [
      '{pays} instaure la file d’attente, même quand il n’y a personne',
      '« Lovely weather » : il pleut sur {pays} depuis 40 jours, tout le monde est ravi',
      'À {pays}, la moquette s’installe jusque dans les salles de bain',
      'Thé de 17 h : {pays} met son économie en pause',
      '{pays} roule désormais à gauche, les ronds-points en panique',
      'Un habitant de {pays} trouve un plat « interesting » : le chef démissionne',
      'Haricots sur toast au petit-déjeuner : {pays} en redemande, poliment',
    ],
  },
  CN: {
    currency: {icon: '🏮', name: 'Lanternes', one: 'lanterne'},
    verb: 'MULTIPLIER', channel: 'LANTERNE TV', operation: 'Opération Lanterne',
    win: 'Le dragon danse partout', lose: 'Les lanternes s’éteignent une à une.',
    traits: {
      air1: 'Groupes de touristes à drapeau', air2: 'Vols charters géants', land1: 'Routes de la soie', land2: 'Quartiers chinois',
      sea1: 'Made in China', sea2: 'Porte-conteneurs géants', tv: 'Kung-fu à la télé', resto: 'Restaurants chinois partout',
      net: 'Applis à danser', fest: 'Nouvel An lunaire mondial', world: 'Atelier du monde',
      home1: 'Grande Muraille', home2: 'Cité interdite', home3: 'Muraille bis', clash1: 'Diplomatie du panda',
      clash2: 'Danse du lion offensive', anti1: 'Patience millénaire', anti2: 'Dossiers égarés', probe: 'Rumeur virale',
      customs: 'Muraille douanière', low1: 'Discrétion de jade', low2: 'Éventail devant le visage',
    },
    news: [
      '{pays} : une lanterne à chaque fenêtre, et la facture d’électricité aussi',
      'Karaoké : la session de {pays} entre dans sa troisième semaine',
      'Un panda en visite à {pays} : sieste diplomatique de neuf heures',
      'Toute la vaisselle de {pays} remplacée par des baguettes',
      'La danse du dragon traverse {pays} et refuse de s’arrêter',
      '{pays} produit désormais ses propres souvenirs de {pays}',
      'Salut du kung-fu obligatoire dans les ascenseurs de {pays}',
    ],
  },
  RU: {
    currency: {icon: '🪆', name: 'Matriochkas', one: 'matriochka'},
    verb: 'AJOUTER UN TOME', channel: 'TÉLÉ-SAMOVAR', operation: 'Opération Grand Hiver',
    win: 'L’hiver éternel', lose: 'Et à enlever sa chapka en été.',
    traits: {
      air1: 'Touristes en chapka', air2: 'Charters pour la datcha', land1: 'Transsibérien', land2: 'Datchas frontalières',
      sea1: 'Export de matriochkas', sea2: 'Brise-glaces de samovars', tv: 'Ballets à la télé', resto: 'Salons de thé au samovar',
      net: 'Vidéos de dashcam', fest: 'Nouvel An à −30 °C', world: 'Hiver planétaire',
      home1: 'Rideau de neige', home2: 'Coupoles dorées', home3: 'Général Hiver', clash1: 'Partie d’échecs',
      clash2: 'Échec et mat culturel', anti1: 'Visage impassible', anti2: 'Formulaire en 12 exemplaires', probe: 'Roman contradictoire',
      customs: 'Tampon, re-tampon, tampon', low1: 'Discrétion de la steppe', low2: 'Chapka rabattue',
    },
    news: [
      '{pays} : la chapka devient obligatoire, même à la plage',
      'Un formulaire de {pays} contient désormais un formulaire plus petit',
      'Le roman national de {pays} atteint son douzième tome, le prologue reste à écrire',
      'Samovar permanent : {pays} ne connaît plus le thé froid',
      '« Ce n’est pas du froid, c’est de l’air frais », assure le gouvernement de {pays}',
      'Une file d’attente de {pays} se transforme en ballet, standing ovation',
      'À {pays}, les échecs remplacent la météo au journal télévisé',
    ],
  },
};

// Actualités communes, déclinées avec les clichés et la ressource de chaque nation.
export const COMMON_NEWS = [
  '{pays} : « {cliche} » enseigné dès la maternelle',
  'Sondage : 58 % des habitants de {pays} pratiquent « {cliche} » sans le savoir',
  'Les universités de {pays} publient 300 pages pour nuancer « {cliche} »',
  '{leader} en visite à {pays} : la foule réclame « {cliche} »',
  'Pénurie de {cur} à {pays} : les autorités appellent au calme',
  'Record : {pays} consomme plus de {cur} que {home}',
  'Débat télévisé à {pays} : « {cliche} », génie ou catastrophe ? Les deux, tranchent les experts',
  'Les douaniers de {pays} saisissent une cargaison de {cur} non déclarée',
  'Météo : averses de clichés sur {pays}, risque de caricature en fin de journée',
  'Un musée de {pays} consacre une aile entière à « {cliche} »',
];
export const RIVAL_NEWS = [
  '{rival} : « {rcliche} » gagne du terrain à {pays}',
  '{rival} dénonce « {cliche} » puis l’adopte en privé',
  'Sommet raté : {rival} et {home} se disputent {pays}',
  '{pays} hésite entre « {cliche} » et « {rcliche} », le pays coupe la poire en deux',
];

// Un nom de recherche propre à la nation, sinon le nom générique.
export function traitName(nationId, id, fallback) { return FLAVOR[nationId]?.traits?.[id] || fallback; }
