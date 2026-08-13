'use strict';

/**
 * Génération du schéma d'enchaînement des écrans.
 *
 * Le cahier des charges décrit un parcours en quatre étapes, annoncées
 * sur la page d'accueil. Ce schéma le représente, ainsi que les liens
 * transversaux portés par l'en-tête et le pied de page, présents à
 * l'identique sur toutes les pages.
 *
 * Il reprend la palette, la police et les arrondis des maquettes, pour
 * que le dossier garde une seule écriture visuelle.
 *
 * Utilisation, depuis la racine du projet :
 *   node docs/maquettes/generer-schema-enchainement.js
 */

const fs = require('fs');
const path = require('path');

const C = {
  fondClair: '#f1f8fc',
  bleu: '#0074c7',
  bleuFonce: '#00497c',
  anthracite: '#384050',
  blanc: '#ffffff',
  bordure: '#d9e4ec',
  grisTexte: '#5a6472'
};

const POLICE = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
const RAYON = 8;

const LARGEUR = 1040;
// Le contenu s'arrête à 596 : la hauteur le suit, sinon le schéma
// s'imprime avec une bande blanche qui déséquilibre la page du dossier.
const HAUTEUR = 626;

const BLOC_L = 250;
const BLOC_H = 76;

const echapper = (valeur) =>
  String(valeur).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Bloc d'écran : un titre, et une ligne de contenu en dessous. */
function bloc(x, y, titre, contenu, options = {}) {
  const fond = options.fond ?? C.blanc;
  const trait = options.trait ?? C.bordure;
  const couleurTitre = options.couleurTitre ?? C.bleuFonce;

  return [
    `<rect x="${x}" y="${y}" width="${BLOC_L}" height="${BLOC_H}" rx="${RAYON}"`,
    ` fill="${fond}" stroke="${trait}" stroke-width="1.5" />`,
    `<text x="${x + BLOC_L / 2}" y="${y + 31}" text-anchor="middle"`,
    ` font-family="${POLICE}" font-size="15" font-weight="bold" fill="${couleurTitre}">`,
    `${echapper(titre)}</text>`,
    `<text x="${x + BLOC_L / 2}" y="${y + 53}" text-anchor="middle"`,
    ` font-family="${POLICE}" font-size="13" fill="${C.grisTexte}">`,
    `${echapper(contenu)}</text>`
  ].join('');
}

/** Flèche orientée, avec son libellé posé à côté. */
function fleche(points, libelle, ancre) {
  const trace = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const morceaux = [
    `<path d="${trace}" fill="none" stroke="${C.bleu}" stroke-width="2"`,
    ` stroke-linejoin="round" marker-end="url(#pointe)" />`
  ];

  if (libelle) {
    morceaux.push(
      `<text x="${ancre.x}" y="${ancre.y}" text-anchor="${ancre.alignement ?? 'middle'}"`,
      ` font-family="${POLICE}" font-size="12" fill="${C.grisTexte}">${echapper(libelle)}</text>`
    );
  }
  return morceaux.join('');
}

// ---------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------

const colonneGauche = 60;
const colonneDroite = 730;
const centre = (LARGEUR - BLOC_L) / 2;

const parts = [];

parts.push(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${HAUTEUR}"`,
  ` width="${LARGEUR}" height="${HAUTEUR}" role="img"`,
  ` aria-label="Schéma de l'enchaînement des écrans du site">`,
  `<defs><marker id="pointe" viewBox="0 0 10 10" refX="9" refY="5"`,
  ` markerWidth="7" markerHeight="7" orient="auto-start-reverse">`,
  `<path d="M 0 0 L 10 5 L 0 10 z" fill="${C.bleu}" /></marker></defs>`,
  `<rect width="${LARGEUR}" height="${HAUTEUR}" fill="${C.blanc}" />`
);

// Parcours principal
parts.push(bloc(centre, 20, 'ACCUEIL', 'Les 4 étapes et les artisans du mois', { fond: C.fondClair }));

parts.push(bloc(colonneGauche, 190, 'LISTE PAR CATÉGORIE', 'Une carte par artisan'));
parts.push(bloc(colonneDroite, 190, 'RÉSULTATS DE RECHERCHE', 'Une carte par artisan'));

parts.push(bloc(centre, 360, 'FICHE ARTISAN', 'Visuel, note, à propos, site web'));
parts.push(bloc(centre, 520, 'FORMULAIRE DE CONTACT', 'Réponse annoncée sous 48 heures'));

// Accueil vers les deux listes
parts.push(
  fleche(
    [[centre + 40, 96], [centre - 130, 140], [colonneGauche + BLOC_L / 2, 186]],
    'menu de catégorie',
    { x: centre - 145, y: 126 }
  )
);
parts.push(
  fleche(
    [[centre + BLOC_L - 40, 96], [centre + BLOC_L + 130, 140], [colonneDroite + BLOC_L / 2, 186]],
    'barre de recherche',
    { x: centre + BLOC_L + 145, y: 126 }
  )
);

// Les deux listes vers la fiche
parts.push(
  fleche(
    [[colonneGauche + BLOC_L / 2, 266], [colonneGauche + BLOC_L / 2, 310], [centre + 40, 356]],
    'clic sur une carte',
    { x: colonneGauche + BLOC_L / 2 + 6, y: 303, alignement: 'start' }
  )
);
parts.push(
  fleche(
    [
      [colonneDroite + BLOC_L / 2, 266],
      [colonneDroite + BLOC_L / 2, 310],
      [centre + BLOC_L - 40, 356]
    ],
    'clic sur une carte',
    { x: colonneDroite + BLOC_L / 2 - 6, y: 303, alignement: 'end' }
  )
);

// Fiche vers formulaire
parts.push(
  fleche([[centre + BLOC_L / 2, 436], [centre + BLOC_L / 2, 516]], 'envoi du message', {
    x: centre + BLOC_L / 2 + 10,
    y: 480,
    alignement: 'start'
  })
);

// Encadré des liens transversaux
const encY = 380;
parts.push(
  `<rect x="${colonneDroite - 40}" y="${encY}" width="${BLOC_L + 80}" height="216" rx="${RAYON}"`,
  ` fill="${C.fondClair}" stroke="${C.bordure}" stroke-width="1.5" stroke-dasharray="5 4" />`,
  `<text x="${colonneDroite - 20}" y="${encY + 30}" font-family="${POLICE}" font-size="13"`,
  ` font-weight="bold" fill="${C.bleuFonce}">Depuis n'importe quel écran</text>`
);

const transversaux = [
  ['En-tête', 'logo vers l’accueil, menu, recherche'],
  ['Pied de page', 'les 4 pages légales'],
  ['Adresse inconnue', 'page 404']
];

transversaux.forEach(([source, cible], i) => {
  const y = encY + 62 + i * 50;
  parts.push(
    `<text x="${colonneDroite - 20}" y="${y}" font-family="${POLICE}" font-size="13"`,
    ` font-weight="bold" fill="${C.anthracite}">${echapper(source)}</text>`,
    `<text x="${colonneDroite - 20}" y="${y + 18}" font-family="${POLICE}" font-size="12"`,
    ` fill="${C.grisTexte}">${echapper(cible)}</text>`
  );
});

parts.push('</svg>');

const sortie = path.join(__dirname, 'svg', 'enchainement-ecrans.svg');
fs.writeFileSync(sortie, parts.join('') + '\n', 'utf8');

console.log('Schéma écrit :', sortie);
console.log('Taille       :', fs.statSync(sortie).size, 'octets');
