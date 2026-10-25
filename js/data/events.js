// Événements aléatoires illustrés : 4 familles × 12 scènes par nation, deux choix chacun.
// Les scènes reprennent les illustrations de assets/art/events ; leurs titres et phrases sont
// dans motifs.js (français) et les éditions de js/i18n.js.

// fx : pts (ressource), alert (lourdeur perçue), cure (Nuance, en points de %),
// grow [×, jours] bouche-à-oreille, pow [×, jours] puissance, seed (nouveaux pays conquis).
export const FAMILIES = {
  food: {icon: '🍽️', label: 'Tradition', lead: 'Scandale culinaire',
    options: [
      {icon: '🛡️', label: 'Défendre la tradition', fx: {pow: [1.25, 30], alert: 8}},
      {icon: '🤷', label: 'Tolérer le mauvais goût', fx: {pts: 6, cure: 3}},
    ]},
  viral: {icon: '📱', label: 'Buzz', lead: 'Ça tourne en boucle',
    options: [
      {icon: '📣', label: 'Surfer sur le buzz', fx: {grow: [1.35, 25], alert: 10}},
      {icon: '🙈', label: 'Faire retirer la vidéo', fx: {pts: -4, alert: -12}},
    ]},
  counter: {icon: '🧳', label: 'Visiteurs', lead: 'Des touristes s’en mêlent',
    options: [
      {icon: '🛍️', label: 'Vendre des souvenirs', fx: {pts: 9}},
      {icon: '✈️', label: 'Les renvoyer convertis', fx: {seed: 3}},
    ]},
  summit: {icon: '🕊️', label: 'Sommet', lead: 'Au sommet mondial',
    options: [
      {icon: '🕊️', label: 'Signer le traité', fx: {cure: -5, pow: [0.85, 20]}},
      {icon: '🏆', label: 'Proclamer sa supériorité', fx: {pow: [1.2, 30], cure: 4}},
    ]},
};
export const FAMILY_IDS = Object.keys(FAMILIES);
export const VARIANTS = 12;
