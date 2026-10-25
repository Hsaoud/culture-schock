// Les sept cultures jouables. Les clichés et citations reprennent la matière
// d'origine du projet ; le gameplay (passifs, rivaux, difficulté) est propre à cette version.

// cell : case dans champions-final.png / relics-final.png (grille 4 × 2) ;
// portrait : carré [x, y, côté] du visage dans champions-final.png.
export const NATIONS = {
  US: {
    name: 'États-Unis', leader: 'Captain Extra', emblem: 'Burger XXL', color: '#ff4b55', cell: 2,
    portrait: [910, 0, 200], home: 'US', stars: 1, tutorial: true,
    passive: {icon: '🎬', name: 'Blockbuster', text: 'Bulles +1 · Tutoriel'},
    clichés: [
      ['😁', 'Sourire ultra-bright'], ['🏈', 'Terrains de football'], ['🧀', 'Fromage en spray'],
      ['🥤', 'Soda taille piscine'], ['👏', 'Applaudir à l’atterrissage'], ['🎬', 'Blockbuster permanent'],
    ],
    quotes: ['Have an AMAZING day!', 'Is there a bigger size?', 'Someone call my lawyer!', 'Freedom tastes like cheese.'],
  },
  FR: {
    name: 'France', leader: 'Monsieur Bof', emblem: 'Sainte Baguette', color: '#3d8bff', cell: 0,
    portrait: [68, 8, 200], home: 'FR', stars: 2,
    passive: {icon: '🍷', name: 'Mépris', text: 'Fort chez les riches, faible ailleurs'},
    clichés: [
      ['🤌', '« Putain » comme virgule'], ['🍷', 'Déjeuner de 2 h 30'], ['✊', 'Grève préventive'],
      ['😩', 'Le soupir universel'], ['🧀', 'Le Comté comme monnaie'], ['🗯️', 'République du râlage'],
    ],
    quotes: ['Bon. On est où, là ?', 'C’est pas mauvais. Pour ici.', 'On ne va pas se laisser faire !', 'Je râle, donc je suis.'],
  },
  IT: {
    name: 'Italie', leader: 'Nonna Suprema', emblem: 'Pizza Sacrée', color: '#33cc66', cell: 3,
    portrait: [1192, 10, 200], home: 'IT', stars: 2,
    passive: {icon: '👵', name: 'La Famiglia', text: 'Diaspora déjà installée en Amériques'},
    clichés: [
      ['🤌', 'Parler avec les mains'], ['☕', 'Expresso en 4 secondes'], ['🍝', 'Police des pâtes'],
      ['😴', 'Sieste constitutionnelle'], ['🍍', 'L’ananas hors-la-loi'], ['⚖️', 'Tribunal de la carbonara'],
    ],
    quotes: ['Ma che cosa fai ?!', 'Un espresso, per favore.', 'Nonna n’est PAS contente.', 'Al dente ou rien.'],
  },
  MX: {
    name: 'Mexique', leader: 'Doña Fiesta', emblem: 'Sombrero Solaire', color: '#ff5cc6', cell: 6,
    portrait: [858, 562, 200], home: 'MX', stars: 3,
    passive: {icon: '🎉', name: 'Fiesta', text: 'Clichés imprévus offerts · ☀️ +'},
    clichés: [
      ['🌶️', 'La salsa partout'], ['🎺', 'Rappel des mariachis'], ['👒', 'Sieste sous sombrero'],
      ['🌮', 'Tacos au petit-déj'], ['🔥', 'Piment diplomatique'], ['🪅', 'Fiesta sans fuseau'],
    ],
    quotes: ['Un peu de salsa ?', 'La fête n’a pas de frontière.', 'Ce piment ? Il est tout doux.', 'Encore une chanson !'],
  },
  GB: {
    name: 'Royaume-Uni', leader: 'Sir Obviously', emblem: 'Théière Royale', color: '#a774ff', cell: 1,
    portrait: [476, 12, 200], home: 'GB', stars: 3,
    passive: {icon: '🫖', name: 'Flegme', text: 'Très discret · ⚓ +'},
    clichés: [
      ['🙂', 'Politesse passive-agressive'], ['🛁', 'Moquette de salle de bain'], ['👑', 'Nostalgie impériale'],
      ['🚗', 'Conduite à gauche'], ['🫘', 'Haricots sur toast'], ['🫖', 'Thé de cinq heures mondial'],
    ],
    quotes: ['Lovely weather, isn’t it?', 'Avec un nuage de lait, merci.', 'This is rather concerning.', 'God save the kettle.'],
  },
  CN: {
    name: 'Chine', leader: 'Maîtresse Lanterne', emblem: 'Panda Céleste', color: '#ffcc33', cell: 4,
    portrait: [76, 524, 200], home: 'CN', stars: 4,
    passive: {icon: '🏭', name: 'Usine du monde', text: '⚓ ++ · Repérée dès le jour 1'},
    clichés: [
      ['🥋', 'Le salut du kung-fu'], ['🏮', 'Une lanterne par fenêtre'], ['🎤', 'Karaoké sans fin'],
      ['🐼', 'La sieste du panda'], ['🎋', 'Bambou patrimoine'], ['🐉', 'Danse du dragon mondiale'],
    ],
    quotes: ['Le panda exige une pause.', 'Le dragon ouvre le bal !', 'La lanterne reste allumée.', 'Une lanterne de plus. Puis mille.'],
  },
  RU: {
    name: 'Russie', leader: 'Grand Maître Chapka', emblem: 'Samovar Éternel', color: '#38e0e0', cell: 5,
    portrait: [444, 512, 200], home: 'RU', stars: 4,
    passive: {icon: '❄️', name: 'Grand froid', text: '❄️ +++ · ☀️ −− · Caricature ×1,5'},
    clichés: [
      ['🧢', 'La chapka par tous les temps'], ['🪆', 'Matriochka administrative'], ['📚', 'Roman de mille pages'],
      ['🩰', 'Ballet de la file d’attente'], ['🫖', 'Samovar permanent'], ['🌨️', 'Hiver en abonnement'],
    ],
    quotes: ['Ce n’est pas du froid. C’est de l’air frais.', 'Installe-toi, le thé arrive.', 'Le tome suivant explique tout.', 'La chapka reste.'],
  },
};

export const ORDER = ['US', 'FR', 'IT', 'MX', 'GB', 'CN', 'RU'];

// Réglages par nation : statistiques de départ, rivaux et difficulté.
// Clés de stats : inf contagion, vis visibilité, car caricature, air/sea/land vecteurs,
// hot/cold climats, rich/poor richesse, clash puissance face aux rivaux, home bonus de capitale.
export const SCENARIOS = {
  US: {base: {air: 0.4}, rivals: ['FR'], bubbleBonus: 1, start: 8},
  FR: {base: {rich: 0.45, poor: -0.3}, rivals: ['US', 'IT']},
  IT: {base: {vis: -0.15}, rivals: ['FR', 'US'], seeds: {AR: 0.02, BR: 0.002, UY: 0.02}},
  MX: {base: {hot: 0.6, cold: -0.4, inf: 0.3}, rivals: ['US', 'CN'], mutations: true},
  GB: {base: {sea: 0.5, inf: -0.2}, visMul: 0.65, rivals: ['US', 'FR', 'IT']},
  CN: {base: {sea: 1, air: 0.2}, rivals: ['US', 'RU', 'GB'], detectedAtStart: true},
  RU: {base: {cold: 1.2, hot: -0.5}, carMul: 1.5, rivals: ['CN', 'US', 'GB']},
};

// Difficulté par nombre d'étoiles.
export const DIFFICULTY = {
  1: {cure: 0.5, ai: 0.5, aiSpread: 0.8, aiStart: [], firstRaid: 160, raidEvery: 120, alert: 0.7},
  2: {cure: 0.9, ai: 0.95, aiSpread: 1.0, aiStart: ['land'], firstRaid: 130, raidEvery: 70, alert: 1},
  3: {cure: 1.0, ai: 1.1, aiSpread: 1.15, aiStart: ['land', 'air'], firstRaid: 110, raidEvery: 58, alert: 1.1},
  4: {cure: 1.25, ai: 1.4, aiSpread: 1.45, aiStart: ['land', 'air', 'sea'], firstRaid: 90, raidEvery: 45, alert: 1.25},
};
