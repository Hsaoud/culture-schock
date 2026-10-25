# Culture Shock — Le choc des légendes

Jeu de stratégie satirique multilingue, rendu **Three.js** avec caméra orthographique et direction artistique 2D : portraits encrés, emblèmes peints, cartes de pouvoirs et interface plein écran.

## Jouer

Ouvrir **dist/Culture-Shock.html** par double-clic : Three.js, simulation, géographie et illustrations sont intégrés. Aucune connexion ni installation requise pour ce fichier. Un navigateur récent avec WebGL 2 est nécessaire pour la carte. Les navigateurs qui bloquent le stockage local permettent toujours l’export/import JSON depuis le menu.

Pour le développement : Node.js 20 ou plus, `npm install`, puis `npm start`. Ouvrir http://127.0.0.1:5173. Le serveur reste local à la machine. Redémarrer `npm start` ou lancer `node scripts/build-game.mjs` après modification du JavaScript. Les fichiers CSS/images sont lus directement.

`npm test` vérifie simulation, nations, sauvegardes et commandes de manette. `npm run build` crée le dossier statique dist et le fichier autonome. Déployer le contenu de dist sur un hébergement statique pour jouer depuis un téléphone. Le serveur de développement ne s’expose pas au réseau local.

## Apprendre en jouant

La première ouverture propose six versions : français, anglais britannique, anglais américain, chinois simplifié, italien et russe. Le navigateur suggère une langue ; le joueur la confirme explicitement. Le choix est conservé sur l’appareil et se change depuis **Langue du jeu** dans le menu principal ou le menu de campagne, y compris pendant l’entraînement. La langue s’applique à toutes les nations, indépendamment du pays joué. Interface, accessibilité, tutoriel, Atlas, recherches, actions, récits et nouvelles sont localisés ; les éditions narratives adaptent les textes satiriques. Les noms de territoires et nombres suivent la langue choisie. Les langues sont intégrées au jeu autonome, sans service de traduction en ligne.

La préférence de langue est séparée des sauvegardes : importer une campagne ne la change pas, et changer de langue ne redémarre ni la campagne ni le tutoriel. Si le stockage local est bloqué, le choix fonctionne pour la session et sera redemandé à la prochaine ouverture.

Chaque nouvelle campagne commence par un entraînement guidé en 18 étapes : choix d’un pays, six actions, quatre ressources, recherche, événement, pause, vitesse et zoom. Les commandes à utiliser sont mises en évidence et chaque étape avance après l’action du joueur. La simulation d’entraînement est indépendante : ressources, attaques et essais sont abandonnés au retour à la campagne. Le bouton × permet de passer le tutoriel ; Menu → Rejouer le tutoriel permet de recommencer.

La carte anime les voyages, les conversions, les recherches, les impacts et les quatre familles d’événements. Un panneau latéral (bas de l’écran sur mobile) garde la scène visible pendant les choix. La réduction des animations est respectée.

## Sept nations

| Nation | Avatar | Emblème | Bonus |
|---|---|---|---|
| France | Monsieur Bof | Sainte Baguette | +25 % de Folklore |
| Royaume-Uni | Sir Obviously | Théière Royale | −20 % de dégâts |
| États-Unis | Captain Extra | Burger XXL | +25 % de Buzz |
| Italie | Nonna Suprema | Pizza Sacrée | +25 % de Chauvinisme |
| Chine | Maîtresse Lanterne | Panda Céleste | +25 % de Matière grise |
| Russie | Grand Maître Chapka | Samovar Éternel | −15 % de dégâts |
| Mexique | Doña Fiesta | Sombrero Solaire | +15 % de Buzz et de Folklore |

Les personnages restent les avatars. Chaque portrait inclut l’emblème et plusieurs accessoires culturels ; le russe porte sa chapka. Les avatars sont des personnages fictifs, pas des portraits de responsables politiques.

## Campagne complète

- 236 territoires sélectionnables sur la carte ou via un Atlas avec recherche.
- 126 recherches narratives : 18 par nation, réparties entre traditions, transmission et défense.
- 42 actions narratives : six par nation, avec coûts, recharge et effets réels.
- 336 récits illustrés : 12 variantes pour chacune des quatre familles d’événements des sept nations, avec trois décisions et leurs conséquences économiques et défensives.
- Échos du monde : fil TV continu mêlant la campagne et 122 nouvelles brèves satiriques. Pause dédiée, arrêt au survol / focus et lecture manuelle en mode animations réduites.
- Quatre ressources, revenus passifs, éclats à collecter, propagation géographique et internationale.
- Emblème destructible, sabotages O.N.U.C., interception, réparation et apaisement.
- Trois difficultés, pause, vitesses 1×/2×/4×, ambiance et sons synthétisés facultatifs.
- Sauvegarde locale automatique, reprise en pause, import/export JSON validé.
- Écrans de victoire et défaite avec bilan et nouvelle campagne.

L’objectif est **100 % d’influence dans chaque territoire**, en gardant l’emblème intact. Le score mondial est une moyenne des territoires, pas une part de population. Chaque seconde de simulation équivaut à un jour. Les menus bloquent le temps ; l’Atelier laisse la campagne et le laboratoire évoluer. Quitter l’onglet ou déconnecter une manette met la partie en pause.

L’indignation déclenche les sabotages à partir de 23 %. Un sabotage voyage pendant 20 jours. Une interception coûte 12 Chauvinisme ; une réparation coûte 22 et rend 28 points ; un apaisement coûte 18 Buzz et réduit l’indignation de 12. Une enseigne augmente la croissance locale.

La Matière grise accélère la recherche : vitesse = 1 + √stock / 8. Elle n’est pas dépensée. Un laboratoire travaille sur un projet à la fois, et les effets n’arrivent qu’à la fin. Les coûts et prérequis sont affichés dans les cartes de l’Atelier.

## Commandes

| Action | Clavier / souris | Manette standard | Tactile |
|---|---|---|---|
| Sélection / validation | Clic, flèches, Entrée | Stick gauche / croix, A | Toucher |
| Parcourir les pays | Atlas (T), boutons précédent/suivant | LB / RB | Atlas, précédent/suivant |
| Déplacer la carte | Glisser | Stick droit | Glisser |
| Zoom | Molette, + / − de l’interface | LT / RT | Pincer, boutons + / − |
| Pouvoirs | 1 à 6, clic | Navigation puis A | Six pictogrammes |
| Atelier | R | X | Atelier |
| Collecter tous les éclats | C | Y | Récolter |
| Pause | Espace | Start | Bouton pause |
| Retour / menu | Échap | B | Fermer / menu |
| Sanctuaire / vitesse | H / V | Navigation puis A | Boutons correspondants |

Manette : Gamepad API avec mapping standard Xbox / équivalent, détection à la première pression, vibrations facultatives selon le matériel. Le matériel physique n’est pas fourni par l’environnement de test : les transitions, boutons et axes sont testés avec une manette simulée. L’affichage mobile est vérifié à 390 × 844 ; une vérification sur les appareils réels reste utile.

## Architecture

- `game/main.js` : écrans, HUD, événements, recherches, son et persistance.
- `game/i18n.js`, `game/locales/` : choix persistant, formats régionaux et catalogues de localisation. Le moteur conserve ses données et identifiants d’origine ; seules les chaînes affichées changent. Les textes source sont conservés par nœud pour permettre le retour à toute langue sans traduction cumulative.
- `game/map.js` : rendu Three.js des vrais contours, caméra, picking, gestes, éclats et trajectoires.
- `game/tutorial.js` : progression guidée et simulation d’entraînement isolée.
- `game/map-effects.js` : effets et trajets temporaires, durée et nombre limités, libération des ressources graphiques.
- `game/input.js` : navigation spatiale et manette.
- `game/game.css` : habillage 2D adaptatif et réduction des animations.
- `engine.js` : moteur déterministe indépendant du navigateur.
- `data.js`, `nation-content.js`, `extra-nations.js` : contenu des sept nations.
- `event-content.js` : variantes narratives, titres, décisions et coordonnées des 336 illustrations ; tirages sans répétition par famille dans `engine.js`, conservés dans les sauvegardes.
- `event-art-layout.js` : limites réelles des cases de chaque planche, pour préserver les proportions et éviter les débordements de scènes voisines.
- `world-news.js`, `game/news-ticker.js` : corpus du fil TV et défilement à vitesse constante, indépendant du temps de simulation.
- `assets/art/` : illustrations originales générées avec l’outil intégré image_gen ; prompts finaux dans `prompts.json`.
- `classic.html` : ancienne interface conservée, accessible via le serveur.
- `scripts/build-game.mjs` : bundle local via esbuild ; `scripts/build.mjs` : distribution et HTML autonome.
- `tests/` : tests de règles, sauvegardes, campagnes et manette.

Le build n’utilise aucun CDN. Les images retenues sont `champions-final.png`, `relics-final.png`, `sanctuary.png` et les 28 planches WebP de `assets/art/events/` (12 cases chacune). Les PNG sources des évènements et les premières versions des personnages restent dans assets/art pour comparaison mais ne sont pas embarqués dans le fichier autonome. Les prompts d’évènements sont dans `assets/art/events/prompts.json`.

Pour utiliser un autre port en développement, définir `CULTURE_SHOCK_PORT` avant `npm start`. Les sauvegardes du navigateur sont propres à chaque origine, ce qui permet de tester des imports sur un port séparé.

L’aperçu de vérification `http://127.0.0.1:5173/scripts/qa-events.html` permet de parcourir les 336 récits par nation et par famille, sans modifier de campagne.

`http://127.0.0.1:5173/scripts/qa-locales.html` vérifie dans le navigateur les six langues, les mises à jour dynamiques, les attributs d’accessibilité et le retour au français, sans toucher aux campagnes.

## Crédits

Direction visuelle développée à partir des références Hades fournies, avec des personnages et illustrations originaux. Aucun sprite commercial n’est intégré. Sons et ambiance produits par Web Audio ; pas de voix enregistrées, multijoueur ni exécutable natif.

Géographie : Natural Earth, domaine public, distribuée par datasets/geo-countries. Les contours représentent des unités de gameplay sans prise de position sur les frontières. Revenus, résistances et clichés sont fictifs ; Culture Shock est une satire, pas une simulation sociopolitique.
