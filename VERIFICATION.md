# Vérification — Culture Shock, Le choc des légendes

Validation du 24 octobre 2026.

- `npm test` : 29 tests réussis. Inclut une campagne victorieuse pour chacune des sept nations, la difficulté impérialiste, les coûts et prérequis, les événements, les sauvegardes, les nouveaux bonus nationaux et les entrées de manette simulées.
- `npm run build` : export statique et fichier autonome construits avec succès.
- Vérification syntaxique des trois modules du jeu et du JavaScript intégré au HTML autonome.
- Vérification d’autonomie : aucun chemin externe vers le bundle, le CSS ou les illustrations dans le HTML autonome ; carte et Three.js intégrés.
- Navigateur : sélection de la Chine, lancement, fermeture du briefing, sélection du Japon dans l’Atlas, envoi d’un ambassadeur, événement du sommet, recherche de transmission, pause et reprise depuis le fichier exporté.
- Aucun avertissement ou erreur dans la console pendant la vérification du jeu et de l’export.
- Affichage à 390 × 844 via une fenêtre intégrée : menu et campagne examinés. Corrections du titre, du compteur mondial et des cartes de pouvoirs, désormais défilantes horizontalement et plus lisibles.
- Captures de la version exportée dans `screenshots/legends-roster.png` et `screenshots/legends-campaign.png`.

Limites : pas de manette physique ni de téléphone réel connecté. Boutons, axes, répétitions et déconnexion de la manette sont testés automatiquement ; gestes tactiles et vibrations nécessitent une validation matérielle. Le fichier autonome a été exécuté via HTTP local, et son absence de dépendances externes contrôlée statiquement ; la politique de stockage sous file:// dépend du navigateur.

Évènements illustrés et fil TV — 25 octobre 2026 :
- `npm test` : 45 tests réussis. Vérification des 336 titres, textes et cadrages distincts, des 1 008 résolutions possibles, des tirages sans répétition, de la reprise exacte des variantes et de la migration des anciennes sauvegardes.
- 28 planches originales générées avec l’outil intégré `image_gen`, chacune contenant 12 scènes. PNG sources conservés ; WebP de distribution : 17 665 970 octets au total. Prompts et référence de style dans `assets/art/events/prompts.json`.
- Les séparations réelles des cases sont mesurées dans les sources. Chaque scène conserve ses proportions et exclut les pixels de ses voisines. Aperçu des 336 cadrages dans `screenshots/events-contact-sheet.jpg` et galerie de vérification dans `scripts/qa-events.html`.
- Fil d’actualité continu à 44 pixels/seconde, indépendant de la simulation. 122 nouvelles brèves, couvrant les sept nations, mêlées au journal de campagne. Les nouvelles entrantes remplacent uniquement des éléments hors champ.
- Navigateur : défilement vérifié pendant une campagne en pause ; pause et reprise du fil ; activation au clavier sans modifier la pause du jeu ; mode réduit avec transformation désactivée et défilement horizontal manuel. Console sans erreur ni avertissement.
- Interface réelle à 1280 × 720 : récit français du Comté, puis banquet chinois. Aperçu à 390 × 844 : sixième variante virale française, illustration et trois choix accessibles. Résolution confirmée avec gain de 12 Buzz.
- `npm run build` et `node scripts/verify-build.mjs` réussis. HTML autonome : 43 355 599 octets, 28 planches WebP intégrées, syntaxe JavaScript valide et aucune référence externe aux illustrations.
- Vérification du HTML autonome via HTTP : évènement chinois et douzième variante du sommet mexicain ; illustrations chargées depuis les données intégrées, trois choix disponibles, aucune erreur de console. Les sauvegardes de vérification utilisent une origine distincte du jeu habituel.


Mise à jour des pictogrammes — 24 octobre 2026 :
- Six silhouettes SVG pour les actions ; lanterne pour l’influence chinoise. Libellés courts et descriptions complètes au survol / lecteur d’écran.
- Flamme, éclair, couronne et ampoule partagés entre HUD, coûts, Atelier, choix d’événements, aide et marqueurs Three.js.
- Les six actions sont visibles sans défilement à 390 × 844 ; cette disposition remplace la barre défilante précédente. Vérification visuelle en navigateur du HUD, de la carte et des boutons.
- Thème chinois des lanternes, dragons et kung-fu, en conservant le Panda et le portrait. Anciens titres des recherches actualisés à l’affichage des sauvegardes.
- 29 tests réussis et export autonome reconstruit. Les anciennes illustrations détaillées des pouvoirs ne sont plus embarquées.


Tutoriel et carte animée — 25 octobre 2026 :
- 37 tests réussis : incluent le parcours des 18 étapes pour les sept nations, les coûts réels et la conservation de la campagne d’origine.
- Navigateur PC : tutoriel complet, collecte, six actions, recherche et attente, événement à choix, pause/reprise, vitesse et zoom. Retour confirmé à la campagne chinoise au jour 68 avec ses ressources et sa recherche initiales. Console sans erreur ni avertissement.
- Vue mobile 390 × 844 : lancement automatique dans une nouvelle campagne française, progression jusqu’à la recherche et la défense, événement et choix accessibles. Sortie anticipée confirmée au jour 0 avec 48/36/30/12 ressources.
- Cadrage des événements corrigé pour placer les effets au-dessus du panneau mobile ; cadrage précédent restauré après le choix. Capture : screenshots/tutorial-mobile.png.
- Tutoriel : titres des branches adaptés à la nation, focus sur les vraies commandes, Atelier limité au premier niveau durant l’apprentissage, menu de pause dédié et absence de sauvegarde des essais.
- Animations : trajets, halos, particules et silhouettes pour les actions, conversions, recherches, impacts et quatre types d’événements. Maximum de 32 effets temporaires ; ressources graphiques libérées à leur expiration. Mode de mouvements réduits pris en compte.
- Export dist/Culture-Shock.html reconstruit. Tests réalisés en navigateur local, sans appareil mobile ni manette physique.

## Versions multilingues — 25 octobre 2026

- Six langues : français, anglais britannique et américain, chinois simplifié, italien, russe.
- Choix obligatoire à la première ouverture, préférence séparée de la campagne, changement depuis les menus principal et de campagne.
- `npm test` : 49 tests réussis, dont couverture des catalogues, des 336 récits par langue, des 18 leçons, du stockage bloqué et de l’intégrité des sauvegardes.
- Page `scripts/qa-locales.html` : contrôles DOM réussis pour les six langues, les attributs accessibles, les textes dynamiques et le retour au français.
- Navigateur : premier choix chinois, rechargement conservant le choix, tutoriel passant au russe sur place, reprise et import d’une campagne chinoise en conservant l’anglais américain.
- Sélecteur vérifié sur mobile à 390 × 844, capture dans `screenshots/languages-mobile.png`.
- Build autonome vérifié : 28 planches, 336 récits, aucun asset externe.
