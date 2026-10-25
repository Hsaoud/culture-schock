# Culture Shock — Clichés Inc.

Un « Plague Inc. des clichés » en sept langues, jouable au clavier, à la souris, à la manette et sur téléphone.
Des illustrations (`assets/art`), de la carte (`assets/world.json`) et des clichés de chaque nation, seuls sont repris de la première version du jeu, conservée dans la branche `codex-original`.

## Jouer

- **Double-clic sur `jouer.html`** : version autonome, sans serveur ni connexion (le paquet `dist/game.js` est versionné).
- Développement (Node.js 20 ou plus) : `npm install`, puis `npm start` et http://127.0.0.1:5180/
  (modules ES, rechargement direct). Après une modification du JS, `npm run build` régénère `jouer.html` + `dist/game.js`.
- `npm test` : moteur et éditions. `npm run check:locales` : clés et variables des traductions.
- `?all` débloque toutes les nations, `?debug` expose l'état dans la console (`CS`).
- En ligne : le dépôt est statique, il peut être publié tel quel (GitHub Pages, tout hébergement de fichiers). L'offre gratuite de Netlify superpose un badge « Powered by Netlify » qui cachait le coin bas droit du jeu : il est masqué (règle CSS dans `index.html` et `hideHostBadge` dans `js/main.js`, comme pour 1001-maze). Netlify présente ce badge comme faisant partie de son offre gratuite ; GitHub Pages (https://hsaoud.github.io/culture-schock/) n'en ajoute aucun.
- Sur téléphone, « Ajouter à l'écran d'accueil » installe le jeu, qui s'ouvre alors en plein écran (manifeste `site.webmanifest`, icônes dans `icons/`).

## Le jeu en une phrase

**Transformez toute l'humanité en caricatures de votre culture avant qu'elle n'apprenne la nuance, en battant les cultures rivales jouées par l'IA.**

Le jeu emprunte la mécanique de Plague Inc. mais pas son vocabulaire : tout est tiré de l'univers des clichés.

| Mécanique (Plague Inc.) | Clichés Inc. |
|---|---|
| Infectés | **Fans** : points de la couleur de votre culture |
| Morts | **Caricatures** : hachures, définitives (la Nuance ne les atteint pas) |
| ADN | **Idées reçues**, une ressource propre à chaque nation (🥖 Baguettes, 🍔 Calories…) : bulles à cliquer, seule monnaie |
| Évoluer | **Exagérer**, avec un verbe propre à chaque nation (EN RAJOUTER, SUPERSIZER…) : trois branches Propagation ✈️ / Clichés 🎭 / Défenses 🛡️ (35 traits en nid d'abeilles) |
| Infectiosité / Sévérité / Létalité | **Bouche-à-oreille 📣 / Lourdeur 🐘 / Caricature 🎭** |
| Remède, laboratoires, bulles bleues | **La Nuance 🧐**, produite par les **universités 🎓** ; cliquer une bulle 🎓 annule un colloque |
| Mutation | **Imprévu** (clichés offerts au Mexique) |
| Fermeture des aéroports / ports | Pointillés rouges : avions, bateaux puis frontières bloqués |
| — | **Cultures rivales IA** qui se propagent, se battent pour les mêmes pays et attaquent votre capitale |

### Ce qui crée le défi

- **Laisser tourner fait perdre.** Les idées reçues viennent surtout des bulles à cliquer ; sans achats, les rivaux grignotent vos pays puis font tomber votre capitale.
- **Deux phases, comme Plague Inc.** D'abord se répandre sans trop de lourdeur (les clichés lourds accélèrent la Nuance et ferment les frontières), puis caricaturer tout le monde avant que la Nuance n'atteigne 100 %. Caricaturer trop tôt freine la propagation.
- **Les rivaux.** Dans chaque pays partagé, la culture la plus **puissante ⚔️** convertit l'autre. Une capitale sous 50 % fait tomber toute sa culture : c'est ainsi qu'on élimine un rival (offensive ⚔️ depuis son portrait), et ainsi qu'on perd. Les rivaux lancent eux aussi des convois (🛃 Douanes permet de les intercepter d'un clic) et financent la Nuance là où ils dominent.
- **Les îles fermées.** Madagascar, le Groenland… ferment tôt. 📱 Réseaux sociaux et 🏘️ Diaspora passent outre.

### Affaires et actualités

- **Affaires illustrées** (environ tous les 50 jours, la partie se met en pause) : une scène tirée des 336 illustrations du projet (tradition 🍽️, buzz 📱, visiteurs 🧳, sommet 🕊️), une phrase, deux choix aux effets affichés en pastilles. Exemples : défendre la tradition (⚔️ +25 % pendant 30 jours, mais 🐘 +8) ou tolérer le mauvais goût (+6 de ressource, mais 🧐 +3 %). Touches `1` / `2`.
- **Bandeau d'actualités** : une chaîne d'info par nation (RÂLE INFO 24/24, CHEESE NEWS NETWORK, TG NONNA, TÉLÉ-FIESTA, BISCUIT BROADCASTING, LANTERNE TV, TÉLÉ-SAMOVAR). Le direct du jeu passe en priorité (fermetures, offensives, Nuance…), sinon des brèves satiriques composées avec vos clichés, les pays conquis et les rivaux. Survoler le bandeau le met en pause.

### L'identité de chaque nation

| Nation | Ressource | Bouton | Chaîne | Victoire |
|---|---|---|---|---|
| États-Unis | 🍔 Calories | SUPERSIZER | Cheese News Network | Le monde en format XXL |
| France | 🥖 Baguettes | EN RAJOUTER | Râle Info 24/24 | La planète râle en français |
| Italie | 🤌 Gestes | GESTICULER | TG Nonna | Le monde entier à la table de Nonna |
| Mexique | 🌶️ Piments | PIMENTER | Télé-Fiesta | Fiesta planétaire |
| Royaume-Uni | 🫖 Tasses de thé | INFUSER | Biscuit Broadcasting | Tea time universel |
| Chine | 🏮 Lanternes | MULTIPLIER | Lanterne TV | Le dragon danse partout |
| Russie | 🪆 Matriochkas | AJOUTER UN TOME | Télé-Samovar | L'hiver éternel |

S'y ajoutent : un motif d'interface (tricolore, bannière étoilée, nappe à carreaux, papel picado, tartan, lanternes, neige), une musique (musette, mandoline, blues, mariachi, carillon, pentatonique, balalaïka), 22 noms de recherches par nation (« Touristes en marinière », « Drive-in partout », « Douane au fromage », « Formulaire en 12 exemplaires »…), des brèves dédiées et une chute propre en cas de défaite. Tout est dans `js/data/flavor.js`.

### Défaite

La Nuance se répand (vos fans se mettent à nuancer), ou votre capitale tombe.

## Nations (déblocage en gagnant, dans l'ordre)

| Nation | ★ | Particularité | Rivaux |
|---|---|---|---|
| États-Unis | ★ | Tutoriel guidé, bulles +1 | France |
| France | ★★ | Forte chez les riches, faible ailleurs | États-Unis, Italie |
| Italie | ★★ | Diaspora déjà installée en Amérique du Sud | France, États-Unis |
| Mexique | ★★★ | Mutations gratuites imprévisibles, forte au chaud | États-Unis, Chine |
| Royaume-Uni | ★★★ | Très discret, fort en mer | États-Unis, France, Italie |
| Chine | ★★★★ | Fort en mer, repérée dès le jour 1 | États-Unis, Russie, Royaume-Uni |
| Russie | ★★★★ | Forte au froid, faible au chaud, caricature ×1,5 | Chine, États-Unis, Royaume-Uni |

## Équilibrage mesuré

`npm run balance -- [nations] --runs=4` fait jouer trois profils de bots (4 parties chacun) :

| Profil | Comportement | Victoires |
|---|---|---|
| Inactif | ne clique rien, n'achète rien | 0 % partout |
| Moyen | rate ~40 % des bulles, achète tous les 6 jours, sans stratégie | États-Unis 100 %, Italie ~50 %, autres 0 % |
| Bon | presque toutes les bulles, ordre d'achat réfléchi, offensives | ★★ 100 %, ★★★ 100 %, ★★★★ ~75 % (en ~220 jours) |

Une partie dure 200 à 400 jours de jeu, soit 5 à 10 minutes en vitesse ▶▶.

## Langues

Chaque nation propose sa langue : **anglais américain** (États-Unis), **français**, **italien**, **espagnol du Mexique**, **anglais britannique**, **chinois simplifié** et **russe**. À la première ouverture, un écran présente les sept langues avec le champion de chaque pays ; celle du navigateur est suggérée, et le titre comme le bouton s'affichent dans la langue survolée. Le choix se change depuis **Langue** sur l'écran titre ou dans le menu de pause, sans relancer la partie ni le tutoriel.

La préférence est propre à l'appareil (`cliches-inc:lang`) et séparée de la sauvegarde. Si le stockage est bloqué, le choix vaut pour la session et sera redemandé.

Tout est traduit : interface, accessibilité (`title`, `aria-label`), tutoriel, atelier (noms de recherches propres à chaque nation, aides), affaires illustrées (336 récits), bandeau d'actualités, brèves, fins de partie. Les éditions sont adaptées plutôt que traduites mot à mot : chaînes, ressources et verbes changent de jeu de mots (GRUMBLE NEWS 24/7, 芝士新闻网, ВОРЧ-ИНФО 24/7, ENCHILAR…). Les noms de pays viennent d'`Intl.DisplayNames`, les nombres et populations d'`Intl.NumberFormat` (« 1,4 Md », « 14亿 », « 1.4B »). L'édition américaine reprend la britannique avec l'orthographe et le vocabulaire des États-Unis. Les récits illustrés anglais, italiens, chinois et russes viennent de la première version du jeu (`js/locales/motifs.js`) ; l'espagnol est propre à cette version.

## Commandes

| Action | Clavier / souris | Manette | Tactile |
|---|---|---|---|
| Récolter une bulle, choisir un pays | clic | A (curseur au stick gauche, aimanté vers les bulles) | toucher |
| Aller à la bulle suivante | — | Y | — |
| Déplacer la carte | glisser, flèches | stick droit (ou curseur au bord de l'écran) | glisser |
| Zoomer | molette, `+` `−` | LT / RT | pincer |
| Pause / vitesses | `Espace`, `1` `2` `3` | LB / RB | boutons ❚❚ ▶ ▶▶ ▶▶▶ |
| Exagérer (onglets `1` `2` `3`) | `E` | X (onglets LB / RB, retirer Y) | EXAGÉRER |
| Recentrer sur sa capitale | `H` ou clic sur son portrait | View / Select | portrait |
| Menu, fermer | `Échap` | Start, B | ☰, ✕ |
| Plein écran | `F` | — | bouton ⛶ (titre, pause, HUD) |
| Parcourir menus, HUD, atelier, affaires | flèches, `Entrée`, `Tab` | croix (ou stick gauche dans les menus), A | toucher |

Manette : Gamepad API, disposition standard Xbox / PlayStation, détectée à la première pression. Quand elle sert, chaque bouton rappelle sa touche (A, B, X, Y, LB·RB…) et un curseur apparaît sur la carte ; la souris ou le toucher les masquent. Dans l'atelier, la croix sélectionne les hexagones et A achète le trait choisi. Vibrations selon le matériel. Débrancher la manette met la partie en pause. Au clavier, l'anneau de focus n'apparaît qu'en navigation clavier.

Téléphone : sélecteurs en liste, rangée des nations défilante, fiche pays en feuille au-dessus du HUD (bouton ✕), atelier compact, aide défilante, marges des encoches (`safe-area`) et HUD resserré à l'horizontale. Vérifié en 375 × 812 et 812 × 375 dans un navigateur, sans appareil réel ; la manette a été simulée (pas de manette physique dans l'environnement de test).

Plein écran : bouton sur l'écran titre, dans le menu pause et sous le zoom en jeu, ou touche `F` ; on en sort de la même façon ou par `Échap`. Sur iPhone, où Safari ne le propose pas aux pages, le bouton disparaît et c'est l'installation sur l'écran d'accueil qui donne le plein écran.

Sauvegarde automatique (toutes les 20 s et en quittant) ; « Continuer » sur l'écran titre.

## Architecture

- `js/sim.js` : moteur déterministe sans DOM (propagation logistique, chocs culturels, voyages, IA, alerte, Nuance, bulles). Pas variable : en jeu il avance un peu à chaque image.
- `js/data/` : nations (clichés, passifs, rivaux, difficulté), identité satirique (`flavor.js`), affaires illustrées (`events.js`, titres et incidents dans `motifs.js`, découpe des planches dans `event-art-layout.js`), arbres d'évolution, emblèmes vectoriels des branches.
- `js/ticker.js` : bandeau d'actualités défilant.
- `js/map.js` : carte canvas en calques — fond monde pré-rendu (simplement déplacé pendant les mouvements de caméra, redessiné net à l'arrêt), couche des pays en cache (~8 rafraîchissements/s), puis véhicules, capitales, bulles et effets à chaque image.
- `js/hud.js`, `js/evolve.js`, `js/screens.js`, `js/tutorial.js` : interface en jeu, atelier, écrans (dont le choix de la langue), tutoriel.
- `js/i18n.js` : langue choisie, éditions, noms de pays et formats régionaux. Le français (`js/data/` + `js/locales/fr.js`) est la source ; une clé absente d'une édition y retombe.
- `js/locales/` : éditions `en.js` (britannique + corrections américaines `US`), `es.js`, `it.js`, `zh.js`, `ru.js`, de même forme que la source. `npm run check:locales` signale les clés manquantes et les variables `{…}` différentes.
- `js/input.js` : manette (Gamepad API) et navigation spatiale clavier / croix.
- `js/fullscreen.js` : plein écran (API Fullscreen et variante WebKit).
- `js/audio.js` : sons et musique synthétisés (Web Audio).
- `js/geo-data.js` : généré par `node tools/build-geo.mjs` à partir de `assets/world.json` (population, richesse, climat, voisins, 9 000 points).
- `tools/` : serveur local, paquet autonome (esbuild), banc d'équilibrage, vérification des éditions.
- `assets/art/` : portraits (`champions-final.png`), emblèmes (`relics-final.png`), écran titre (`sanctuary.png`) et 28 planches de scènes (`events/*.webp`, 12 cases chacune).
- `tests/` : `npm test` — moteur (`sim.test.mjs`) et éditions (`i18n.test.mjs` : textes complets, 336 récits par langue, noms de pays, suggestions, stockage bloqué, formats).

## Fluidité et qualité d'image

- La carte n'est redessinée que lorsqu'elle est visible : sous les menus, l'atelier ou une affaire illustrée, elle reste figée.
- Caméra immobile : fond, terres et pays sont fusionnés en une seule image copiée d'un bloc (au lieu de trois couches plein écran), identique au pixel près ; la couche des pays n'est redessinée que si la partie a avancé. Le bandeau d'actualités ne relit plus la mise en page à chaque image.
- Qualité adaptative : si les images ralentissent durablement (très grand écran, appareil modeste), la carte est rendue un peu moins finement, par paliers ; l'interface et les illustrations ne changent pas.
- Écrans denses (4K, Retina) : côtes, hachures et emblèmes de la carte sont calculés à la définition de l'écran.
- Illustrations : toujours affichées à leurs vraies proportions, recadrées plutôt qu'étirées (affaires sur téléphone, portraits, fin de partie). En ultra-large (21:9 et plus), l'écran titre garde l'illustration entière, prolongée par sa version floutée, et l'écran de fin reste centré à taille raisonnable.

## Illustrations des onglets

Les trois onglets de l'atelier utilisent des emblèmes vectoriels (`js/data/emblems.js`). Pour des versions peintes dans le style du jeu, générer une image **1536 × 512** (trois cases carrées de 512 px) et l'enregistrer sous **`assets/art/branches.png`** : elle remplace les emblèmes automatiquement, sans reconstruction (une erreur 404 sur ce fichier dans la console est normale tant qu'il n'existe pas).

Prompt (pour l'outil image de ChatGPT ou Codex), en joignant `assets/art/relics-final.png` comme référence de style :

```text
Use case: stylized icon atlas for a 2D satirical strategy video game. Input image 1 is the STYLE reference only.
Create a NEW image, 1536x512, exactly 3 equal square cells in one row (512x512 each), no gutters, no borders,
no text, no letters, no numbers. Each cell contains ONE iconic emblem, centered, isolated on a plain flat
near-black teal background (#0a2630), filling about 70% of the cell, with a bold simple silhouette that stays
readable when shrunk to 60 pixels.
Cell 1 "spread": a vintage leather suitcase with small golden wings and colourful travel stickers, flying around
a small stylized globe, with a golden dotted flight path curving around it.
Cell 2 "clichés": a grinning carnival theatre mask wearing a black French beret and a curled black moustache,
with a small white comic speech bubble holding a red exclamation mark.
Cell 3 "defences": a heraldic golden shield bearing a small white castle tower with a red pennant, two crossed
swords behind it.
Style: exactly like image 1 — sharp angular flat graphic-novel hand-inked cel shading, bold tapered black
outlines, hard-edged angular black shadows, only 2 or 3 flat tones per material, gold drawn as ochre and
pale-yellow shapes, luminous cyan, jade and coral accents, about 35 percent pure black ink shadows.
No photographic detail, no soft airbrushed gradients, no 3D render, no tiny ornaments, nothing crossing cell
boundaries.
```

## Crédits

Satire affectueuse : les clichés ne sont pas des faits, les champions sont des personnages fictifs et non des portraits de personnalités.
Illustrations originales générées pour la première version du jeu (outil image intégré), dans une direction 2D encrée.
Géographie : Natural Earth, domaine public ; les contours sont des unités de jeu, sans prise de position sur les frontières.
Sons et musique synthétisés en direct (Web Audio), sans fichier audio.
