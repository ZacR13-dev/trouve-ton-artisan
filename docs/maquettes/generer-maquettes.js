'use strict';

/**
 * Génération des maquettes de « Trouve ton artisan ».
 *
 * Produit une frame par écran et par support, conformément à
 * docs/maquettes-specification.md : cinq écrans déclinés sur téléphone
 * (390 px), tablette (768 px) et ordinateur (1440 px), soit quinze
 * frames, auxquelles s'ajoutent les deux planches d'organisation du
 * fichier Figma (styles et composants).
 *
 * Le format de sortie est le SVG : glissé dans Figma, chaque fichier
 * devient une frame dont les textes, les formes et les groupes restent
 * modifiables. Les couleurs et les libellés proviennent tous du cahier
 * des charges, via la spécification.
 *
 * Utilisation, depuis la racine du projet :
 *   node docs/maquettes/generer-maquettes.js
 */

const fs = require('fs');
const path = require('path');

const SORTIE = path.join(__dirname, 'svg');

// =====================================================================
// Charte graphique, partie 4.4 du cahier des charges
// =====================================================================

const C = {
  fondClair: '#f1f8fc',
  bleu: '#0074c7',
  bleuFonce: '#00497c',
  anthracite: '#384050',
  rouge: '#cd2c2e',
  vert: '#82b864',
  blanc: '#ffffff',
  bordure: '#d9e4ec',
  grisTexte: '#5a6472',
  // Réservé au texte posé sur le vert : l'anthracite y tombe à 4,46:1,
  // juste sous le seuil AA. Cette nuance porte le rapport à 7,2:1.
  anthraciteFonce: '#1a1d23'
};

const POLICE = "Arial, 'Helvetica Neue', Helvetica, sans-serif";

const RAYON = 8;
const OMBRE = 'rgba(56, 64, 80, 0.10)';

// =====================================================================
// Contenu, repris mot pour mot du cahier des charges et du jeu d'essai
// =====================================================================

const CATEGORIES = ['Bâtiment', 'Services', 'Fabrication', 'Alimentation'];

const ETAPES = [
  "Choisir la catégorie d'artisanat dans le menu.",
  'Choisir un artisan.',
  'Le contacter via le formulaire de contact.',
  'Une réponse sera apportée sous 48h.'
];

const ARTISANS_DU_MOIS = [
  { nom: 'Orville Salmons', note: 5.0, specialite: 'Chauffagiste', ville: 'Evian' },
  { nom: 'Chocolaterie Labbé', note: 4.9, specialite: 'Chocolatier', ville: 'Lyon' },
  { nom: 'Au pain chaud', note: 4.8, specialite: 'Boulanger', ville: 'Montélimar' }
];

const ARTISANS_BATIMENT = [
  { nom: 'Orville Salmons', note: 5.0, specialite: 'Chauffagiste', ville: 'Evian' },
  { nom: 'Boutot & fils', note: 4.7, specialite: 'Menuisier', ville: 'Bourg-en-Bresse' },
  { nom: 'Mont Blanc Eléctricité', note: 4.5, specialite: 'Electricien', ville: 'Chamonix' },
  { nom: 'Vallis Bellemare', note: 4.0, specialite: 'Plombier', ville: 'Vienne' }
];

const FICHE = {
  nom: 'Chocolaterie Labbé',
  note: 4.9,
  specialite: 'Chocolatier',
  ville: 'Lyon',
  siteWeb: 'https://chocolaterie-labbe.fr',
  aPropos:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eleifend ' +
    'ante sem, id volutpat massa fermentum nec. Praesent volutpat scelerisque ' +
    'mauris, quis sollicitudin tellus sollicitudin.'
};

const CHAMPS_CONTACT = [
  { libelle: 'Votre nom', haut: 44 },
  { libelle: 'Votre adresse e-mail', haut: 44 },
  { libelle: 'Objet', haut: 44 },
  { libelle: 'Votre message', haut: 120 }
];

const LIENS_LEGAUX = ['Mentions légales', 'Données personnelles', 'Accessibilité', 'Cookies'];

const ADRESSE = [
  '101 cours Charlemagne',
  'CS 20033',
  '69269 LYON CEDEX 02',
  'France',
  '+33 (0)4 26 73 40 00'
];

// =====================================================================
// Supports. Le cahier des charges impose les trois.
// =====================================================================

const SUPPORTS = [
  {
    cle: 'mobile',
    nom: 'Téléphone',
    largeur: 390,
    marge: 16,
    gouttiere: 16,
    padSection: 32,
    h1: 28,
    h2: 22,
    h3: 18,
    hLogo: 40,
    // Bootstrap replie le menu sous 992 px : téléphone et tablette
    // partagent donc le bouton d'ouverture.
    menuReplie: true,
    colEtapes: 1,
    colCartes: 1
  },
  {
    cle: 'tablette',
    nom: 'Tablette',
    largeur: 768,
    marge: 24,
    gouttiere: 20,
    padSection: 40,
    h1: 32,
    h2: 26,
    h3: 18,
    hLogo: 48,
    menuReplie: true,
    colEtapes: 2,
    colCartes: 2
  },
  {
    cle: 'bureau',
    nom: 'Ordinateur',
    largeur: 1440,
    marge: 72,
    gouttiere: 24,
    padSection: 56,
    h1: 36,
    h2: 28,
    h3: 18,
    hLogo: 56,
    menuReplie: false,
    colEtapes: 4,
    colCartes: 3
  }
];

const contenuLargeur = (s) => s.largeur - 2 * s.marge;

// =====================================================================
// Mesure du texte
//
// Le SVG ne sait pas replier une ligne : les retours doivent être
// calculés ici. Les chasses sont celles d'Arial, exprimées en millièmes
// de cadratin comme dans le fichier de police.
// =====================================================================

function tableChasses(paires) {
  const table = {};
  for (const [caracteres, valeur] of paires) {
    for (const caractere of caracteres) table[caractere] = valeur;
  }
  return table;
}

const CHASSES_NORMALE = tableChasses([
  [' ', 278], ['!', 278], ['"', 355], ['#', 556], ['$', 556], ['%', 889], ['&', 667],
  ["'’", 191], ['(', 333], [')', 333], ['*', 389], ['+', 584], [',', 278], ['-', 333],
  ['.', 278], ['/', 278], ['0123456789', 556], [':', 278], [';', 278], ['<', 584],
  ['=', 584], ['>', 584], ['?', 556], ['@', 1015],
  ['A', 667], ['B', 667], ['C', 722], ['D', 722], ['E', 667], ['F', 611], ['G', 778],
  ['H', 722], ['I', 278], ['J', 500], ['K', 667], ['L', 556], ['M', 833], ['N', 722],
  ['O', 778], ['P', 667], ['Q', 778], ['R', 722], ['S', 667], ['T', 611], ['U', 722],
  ['V', 667], ['W', 944], ['X', 667], ['Y', 667], ['Z', 611],
  ['[]', 278], ['^', 469], ['_', 556], ['`', 333],
  ['abdeghnopqu', 556], ['c', 500], ['f', 278], ['ij', 222], ['k', 500], ['l', 222],
  ['m', 833], ['r', 333], ['s', 500], ['t', 278], ['v', 500], ['w', 722], ['x', 500],
  ['y', 500], ['z', 500],
  ['{', 334], ['|', 260], ['}', 334], ['~', 584],
  ['«»', 500], ['–€', 556], ['—…', 1000]
]);

const CHASSES_GRASSE = tableChasses([
  [' ', 278], ['!', 333], ['"', 474], ['#', 556], ['$', 556], ['%', 889], ['&', 722],
  ["'’", 238], ['(', 333], [')', 333], ['*', 389], ['+', 584], [',', 278], ['-', 333],
  ['.', 278], ['/', 278], ['0123456789', 556], [':', 333], [';', 333], ['<', 584],
  ['=', 584], ['>', 584], ['?', 611], ['@', 975],
  ['A', 722], ['B', 722], ['C', 722], ['D', 722], ['E', 667], ['F', 611], ['G', 778],
  ['H', 722], ['I', 278], ['J', 556], ['K', 722], ['L', 611], ['M', 833], ['N', 722],
  ['O', 778], ['P', 667], ['Q', 778], ['R', 722], ['S', 667], ['T', 611], ['U', 722],
  ['V', 667], ['W', 944], ['X', 667], ['Y', 667], ['Z', 611],
  ['[]', 333], ['^', 584], ['_', 556], ['`', 333],
  ['a', 556], ['bdghnopqu', 611], ['c', 556], ['f', 333], ['ij', 278], ['k', 556],
  ['l', 278], ['m', 889], ['r', 389], ['s', 556], ['t', 333], ['v', 556], ['w', 778],
  ['x', 556], ['y', 556], ['z', 500],
  ['{', 389], ['|', 280], ['}', 389], ['~', 584],
  ['«»', 500], ['–€', 556], ['—…', 1000]
]);

/** Largeur d'une chaîne, en pixels, pour une taille et une graisse données. */
function largeurTexte(chaine, taille, grasse = false) {
  const table = grasse ? CHASSES_GRASSE : CHASSES_NORMALE;
  // Une lettre accentuée a la chasse de sa lettre de base : on retire
  // les diacritiques avant de consulter la table.
  const nue = String(chaine).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let total = 0;
  for (const caractere of nue) total += table[caractere] ?? 556;
  return (total * taille) / 1000;
}

/** Découpe un texte en lignes ne dépassant pas la largeur donnée. */
function replier(chaine, largeurMax, taille, grasse = false) {
  const lignes = [];
  let courante = '';

  for (const mot of String(chaine).split(' ')) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (courante && largeurTexte(essai, taille, grasse) > largeurMax) {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = essai;
    }
  }

  if (courante) lignes.push(courante);
  return lignes;
}

// =====================================================================
// Primitives SVG
// =====================================================================

const a = (valeur) => Math.round(valeur * 100) / 100;

const echapper = (valeur) =>
  String(valeur).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function rect(x, y, largeur, hauteur, options = {}) {
  const { fond = 'none', trait = null, epaisseur = 1, rayon = 0 } = options;
  const attributs = [
    `x="${a(x)}"`,
    `y="${a(y)}"`,
    `width="${a(largeur)}"`,
    `height="${a(hauteur)}"`,
    rayon ? `rx="${a(rayon)}"` : '',
    `fill="${fond}"`,
    trait ? `stroke="${trait}" stroke-width="${epaisseur}"` : ''
  ].filter(Boolean);
  return `<rect ${attributs.join(' ')}/>`;
}

/** Texte posé sur sa ligne de base. */
function txt(contenu, x, ligneDeBase, options = {}) {
  const {
    taille = 16,
    grasse = false,
    couleur = C.anthracite,
    ancre = 'start',
    souligne = false
  } = options;

  const attributs = [
    `x="${a(x)}"`,
    `y="${a(ligneDeBase)}"`,
    `font-family="${POLICE}"`,
    `font-size="${taille}"`,
    `font-weight="${grasse ? 700 : 400}"`,
    `fill="${couleur}"`,
    ancre !== 'start' ? `text-anchor="${ancre}"` : '',
    souligne ? 'text-decoration="underline"' : ''
  ].filter(Boolean);

  return `<text ${attributs.join(' ')}>${echapper(contenu)}</text>`;
}

/** Texte dont on connaît le haut de la ligne plutôt que sa base. */
function txtHaut(contenu, x, haut, options = {}) {
  const taille = options.taille ?? 16;
  return txt(contenu, x, haut + taille * 0.9, options);
}

/** Texte centré verticalement sur une hauteur donnée. */
function txtMilieu(contenu, x, milieu, options = {}) {
  const taille = options.taille ?? 16;
  return txt(contenu, x, milieu + taille * 0.355, options);
}

/** Paragraphe replié, rendu ligne par ligne. */
function paragraphe(chaine, x, haut, largeurMax, options = {}) {
  const { taille = 16, grasse = false, interligne = null, ancre = 'start' } = options;
  const pas = interligne ?? Math.round(taille * 1.45);
  const lignes = replier(chaine, largeurMax, taille, grasse);

  const contenu = lignes
    .map((ligne, index) => txtHaut(ligne, x, haut + index * pas, { ...options, ancre }))
    .join('');

  return { contenu, hauteur: lignes.length * pas, lignes: lignes.length };
}

// =====================================================================
// Logo, embarqué en base64 pour que la frame reste autonome
// =====================================================================

const FICHIER_LOGO = path.join(__dirname, '..', 'assets', 'logo.png');
const LOGO_BASE64 = fs.readFileSync(FICHIER_LOGO).toString('base64');
const LOGO_RATIO = 1735 / 492;

function logo(x, y, hauteur) {
  const largeur = hauteur * LOGO_RATIO;
  return {
    contenu:
      `<image x="${a(x)}" y="${a(y)}" width="${a(largeur)}" height="${a(hauteur)}" ` +
      `preserveAspectRatio="xMidYMid meet" ` +
      `xlink:href="data:image/png;base64,${LOGO_BASE64}"/>`,
    largeur
  };
}

// =====================================================================
// Composants
// =====================================================================

const TRACE_ETOILE =
  'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z';

/**
 * Note en étoiles. Le dégradé arrête le bleu à la fraction exacte de la
 * note : 4,9 donne quatre étoiles pleines et une remplie à 90 %.
 */
function etoiles(note, x, milieu, taille, cle) {
  const ecart = taille * 0.22;
  const degrades = [];
  const formes = [];

  for (let rang = 1; rang <= 5; rang++) {
    const remplissage = Math.max(0, Math.min(1, note - rang + 1));
    const identifiant = `etoile-${cle}-${rang}`;
    const arret = a(remplissage * 100);

    degrades.push(
      `<linearGradient id="${identifiant}">` +
        `<stop offset="${arret}%" stop-color="${C.bleu}"/>` +
        `<stop offset="${arret}%" stop-color="${C.bordure}"/>` +
        `</linearGradient>`
    );

    const gauche = x + (rang - 1) * (taille + ecart);
    const haut = milieu - taille / 2;
    formes.push(
      `<g transform="translate(${a(gauche)},${a(haut)}) scale(${a(taille / 24)})">` +
        `<path d="${TRACE_ETOILE}" fill="url(#${identifiant})"/></g>`
    );
  }

  return {
    contenu: `<defs>${degrades.join('')}</defs>${formes.join('')}`,
    largeur: 5 * taille + 4 * ecart
  };
}

/** Note complète : les étoiles, puis la valeur écrite en chiffres. */
function note(valeur, x, milieu, cle, taille = 16) {
  const dessin = etoiles(valeur, x, milieu, taille, cle);
  const libelle = valeur.toFixed(1).replace('.', ',');

  return {
    contenu:
      dessin.contenu +
      txtMilieu(libelle, x + dessin.largeur + 10, milieu, {
        taille,
        grasse: true,
        couleur: C.anthracite
      }),
    largeur: dessin.largeur + 10 + largeurTexte(libelle, taille, true)
  };
}

/** Étiquette arrondie : spécialité de l'artisan. */
function puce(libelle, x, haut, options = {}) {
  const { taille = 14, hauteur = 28, fond = C.fondClair, couleur = C.bleuFonce } = options;
  const largeur = largeurTexte(libelle, taille, true) + 24;

  return {
    contenu:
      rect(x, haut, largeur, hauteur, { fond, trait: C.bordure, rayon: 6 }) +
      txtMilieu(libelle, x + 12, haut + hauteur / 2, { taille, grasse: true, couleur }),
    largeur,
    hauteur
  };
}

/** Badge « Artisan du mois ». */
function badge(x, haut) {
  const taille = 13;
  const hauteur = 26;
  const libelle = 'Artisan du mois';
  const largeur = largeurTexte(libelle, taille, true) + 24;

  return {
    contenu:
      rect(x, haut, largeur, hauteur, { fond: C.vert, rayon: 13 }) +
      txtMilieu(libelle, x + 12, haut + hauteur / 2, {
        taille,
        grasse: true,
        couleur: C.anthraciteFonce
      }),
    largeur,
    hauteur
  };
}

/** Bouton plein, aux couleurs de la charte. */
function bouton(libelle, x, haut, options = {}) {
  const { taille = 16, hauteur = 44, padding = 20, fond = C.bleu, couleur = C.blanc } = options;
  const largeur = options.largeur ?? largeurTexte(libelle, taille, false) + 2 * padding;

  return {
    contenu:
      rect(x, haut, largeur, hauteur, { fond, rayon: RAYON }) +
      txtMilieu(libelle, x + largeur / 2, haut + hauteur / 2, {
        taille,
        couleur,
        ancre: 'middle'
      }),
    largeur,
    hauteur
  };
}

/** Champ de saisie vide, avec son texte d'invite éventuel. */
function champ(x, haut, largeur, hauteur, invite = null) {
  let contenu = rect(x, haut, largeur, hauteur, {
    fond: C.blanc,
    trait: C.bordure,
    rayon: RAYON
  });

  if (invite) {
    contenu += txtMilieu(invite, x + 14, haut + Math.min(hauteur, 44) / 2, {
      taille: 16,
      couleur: C.grisTexte
    });
  }

  return { contenu, hauteur };
}

/** Bouton d'ouverture du menu replié. */
function boutonMenu(x, haut) {
  const cote = 40;
  const barres = [0, 1, 2]
    .map((index) =>
      rect(x + 11, haut + 13 + index * 6, 18, 2, { fond: C.anthracite, rayon: 1 })
    )
    .join('');

  return {
    contenu: rect(x, haut, cote, cote, { trait: C.bordure, rayon: RAYON }) + barres,
    largeur: cote,
    hauteur: cote
  };
}

/**
 * En-tête, identique sur les cinq écrans comme l'impose le cahier des
 * charges. Trois états : déployé sur ordinateur, replié ou déplié sur
 * les supports plus étroits.
 */
function enTete(s, options = {}) {
  const { actif = null, deplie = false, decalageX = 0, decalageY = 0 } = options;
  const parts = [];
  const largeur = s.largeur;
  let hauteur;

  if (!s.menuReplie) {
    // ---- Ordinateur : tout tient sur une ligne ----------------------
    hauteur = 84;
    const utile = hauteur - 3;

    parts.push(rect(0, 0, largeur, hauteur, { fond: C.blanc }));
    parts.push(rect(0, hauteur - 3, largeur, 3, { fond: C.bleu }));

    const marque = logo(s.marge, (utile - s.hLogo) / 2, s.hLogo);
    parts.push(marque.contenu);

    let x = s.marge + marque.largeur + 36;
    for (const categorie of CATEGORIES) {
      const large = largeurTexte(categorie, 16, true) + 28;
      const hautOnglet = (utile - 40) / 2;

      if (categorie === actif) {
        parts.push(rect(x, hautOnglet, large, 40, { fond: C.fondClair, rayon: RAYON }));
        // Le soulignement double l'information de couleur : la couleur
        // seule ne suffit pas (WCAG 1.4.1).
        parts.push(rect(x, hautOnglet + 37, large, 3, { fond: C.bleu }));
      }

      parts.push(
        txtMilieu(categorie, x + 14, utile / 2, {
          taille: 16,
          grasse: true,
          couleur: categorie === actif ? C.bleuFonce : C.anthracite
        })
      );
      x += large + 4;
    }

    const action = bouton('Rechercher', 0, 0, { hauteur: 40, padding: 18 });
    const xAction = largeur - s.marge - action.largeur;
    const largeurChamp = 280;
    const xChamp = xAction - 10 - largeurChamp;
    const hautLigne = (utile - 40) / 2;

    parts.push(champ(xChamp, hautLigne, largeurChamp, 40, 'Rechercher un artisan').contenu);
    parts.push(
      bouton('Rechercher', xAction, hautLigne, { hauteur: 40, padding: 18 }).contenu
    );
  } else {
    // ---- Téléphone et tablette : logo, bouton, puis panneau ---------
    const barre = 60;
    parts.push(rect(0, 0, largeur, barre, { fond: C.blanc }));

    const marque = logo(s.marge, (barre - s.hLogo) / 2, s.hLogo);
    parts.push(marque.contenu);
    parts.push(boutonMenu(largeur - s.marge - 40, (barre - 40) / 2).contenu);

    hauteur = barre + 3;

    if (deplie) {
      let y = barre;
      parts.push(rect(0, y, largeur, 1, { fond: C.bordure }));
      y += 9;

      for (const categorie of CATEGORIES) {
        if (categorie === actif) {
          parts.push(
            rect(s.marge, y, contenuLargeur(s), 44, { fond: C.fondClair, rayon: RAYON })
          );
          parts.push(rect(s.marge, y + 41, contenuLargeur(s), 3, { fond: C.bleu }));
        }
        parts.push(
          txtMilieu(categorie, s.marge + 14, y + 22, {
            taille: 16,
            grasse: true,
            couleur: categorie === actif ? C.bleuFonce : C.anthracite
          })
        );
        y += 44;
      }

      y += 12;
      const action = bouton('Rechercher', 0, 0, { hauteur: 44, padding: 18 });
      const xAction = largeur - s.marge - action.largeur;
      const largeurChamp = xAction - 10 - s.marge;

      parts.push(champ(s.marge, y, largeurChamp, 44, 'Rechercher un artisan').contenu);
      parts.push(bouton('Rechercher', xAction, y, { hauteur: 44, padding: 18 }).contenu);

      y += 44 + 16;
      hauteur = y + 3;
    }

    parts.push(rect(0, hauteur - 3, largeur, 3, { fond: C.bleu }));
  }

  const contenu =
    decalageX || decalageY
      ? `<g transform="translate(${a(decalageX)},${a(decalageY)})">${parts.join('')}</g>`
      : parts.join('');

  return { contenu, hauteur };
}

/**
 * Pied de page, lui aussi identique partout : les quatre pages légales
 * et les coordonnées de l'antenne de Lyon.
 */
function piedDePage(s, y) {
  const parts = [];
  // Deux colonnes dès la tablette : la largeur y suffit, alors que le
  // menu, lui, reste replié jusqu'à 992 px.
  const enColonnes = s.largeur >= 768;
  const largeurCol = enColonnes ? (contenuLargeur(s) - s.gouttiere) / 2 : contenuLargeur(s);

  const xGauche = s.marge;
  const xDroite = enColonnes ? s.marge + largeurCol + s.gouttiere : s.marge;

  let hautGauche = 40;
  let hautDroite = enColonnes ? 40 : 0;

  // Colonne des liens légaux.
  parts.push(
    txtHaut('Informations légales', xGauche, hautGauche, {
      taille: 18,
      grasse: true,
      couleur: C.blanc
    })
  );
  let yLien = hautGauche + 24 + 20;
  for (const lien of LIENS_LEGAUX) {
    parts.push(
      txtHaut(lien, xGauche, yLien, { taille: 16, couleur: C.blanc, souligne: true })
    );
    yLien += 33;
  }
  const basGauche = yLien - 33 + 22;

  // Colonne de l'adresse.
  if (!enColonnes) hautDroite = basGauche + 32;

  parts.push(
    txtHaut('Région Auvergne-Rhône-Alpes', xDroite, hautDroite, {
      taille: 18,
      grasse: true,
      couleur: C.blanc
    })
  );
  let yAdresse = hautDroite + 24 + 20;
  for (const ligne of ADRESSE) {
    parts.push(
      txtHaut(ligne, xDroite, yAdresse, {
        taille: 16,
        couleur: C.blanc,
        souligne: ligne.startsWith('+33')
      })
    );
    yAdresse += 25;
  }
  const basDroite = yAdresse - 25 + 22;

  const basContenu = Math.max(basGauche, basDroite);
  const ySeparateur = basContenu + 32;

  parts.push(
    rect(s.marge, ySeparateur, contenuLargeur(s), 1, { fond: 'rgba(255,255,255,0.25)' })
  );

  const mention = paragraphe(
    'Trouve ton artisan est un service de la Région Auvergne-Rhône-Alpes.',
    s.marge,
    ySeparateur + 20,
    contenuLargeur(s),
    { taille: 14, couleur: C.blanc, interligne: 20 }
  );
  parts.push(mention.contenu);

  const hauteur = ySeparateur + 20 + mention.hauteur + 24;

  return {
    contenu:
      `<g transform="translate(0,${a(y)})">` +
      rect(0, 0, s.largeur, hauteur, { fond: C.anthracite }) +
      parts.join('') +
      `</g>`,
    hauteur
  };
}

/** Carte d'un artisan : nom, note, spécialité, localisation. */
function carteArtisan(artisan, x, y, largeur, options = {}) {
  const { avecBadge = false, cle = '0', hauteurImposee = null } = options;
  const padding = 20;
  const parts = [];
  let curseur = padding;

  if (avecBadge) {
    parts.push(badge(padding, curseur).contenu);
    curseur += 26 + 14;
  }

  const nom = paragraphe(artisan.nom, padding, curseur, largeur - 2 * padding, {
    taille: 18,
    grasse: true,
    couleur: C.bleuFonce,
    interligne: 24
  });
  parts.push(nom.contenu);
  curseur += nom.hauteur + 10;

  parts.push(note(artisan.note, padding, curseur + 10, `${cle}`, 16).contenu);
  curseur += 20 + 14;

  parts.push(puce(artisan.specialite, padding, curseur).contenu);
  curseur += 28 + 12;

  parts.push(
    txtHaut(artisan.ville, padding, curseur, { taille: 16, couleur: C.grisTexte })
  );
  curseur += 20 + padding;

  const hauteur = hauteurImposee ?? curseur;

  return {
    contenu:
      `<g transform="translate(${a(x)},${a(y)})">` +
      rect(0, 3, largeur, hauteur, { fond: OMBRE, rayon: RAYON }) +
      rect(0, 0, largeur, hauteur, { fond: C.blanc, trait: C.bordure, rayon: RAYON }) +
      parts.join('') +
      `</g>`,
    hauteur
  };
}

/** Carte d'une étape : le numéro dans une pastille, puis le texte. */
function carteEtape(index, texte, x, y, largeur, hauteurImposee = null) {
  const padding = 24;
  const parts = [];
  const milieu = largeur / 2;

  parts.push(`<circle cx="${a(milieu)}" cy="${a(padding + 22)}" r="22" fill="${C.bleu}"/>`);
  parts.push(
    txtMilieu(String(index + 1), milieu, padding + 22, {
      taille: 20,
      grasse: true,
      couleur: C.blanc,
      ancre: 'middle'
    })
  );

  const corps = paragraphe(texte, milieu, padding + 44 + 20, largeur - 2 * padding, {
    taille: 16,
    couleur: C.anthracite,
    interligne: 23,
    ancre: 'middle'
  });
  parts.push(corps.contenu);

  const hauteur = hauteurImposee ?? padding + 44 + 20 + corps.hauteur + padding;

  return {
    contenu:
      `<g transform="translate(${a(x)},${a(y)})">` +
      rect(0, 0, largeur, hauteur, { fond: C.blanc, trait: C.bordure, rayon: RAYON }) +
      parts.join('') +
      `</g>`,
    hauteur
  };
}

/**
 * Grille à N colonnes. Les cartes d'une même ligne sont alignées sur la
 * plus haute, en deux passes : mesure, puis rendu à hauteur imposée.
 */
function grille(elements, x, largeurTotale, y, colonnes, gouttiere, rendu) {
  const largeurCol = (largeurTotale - gouttiere * (colonnes - 1)) / colonnes;

  const mesures = elements.map((element, index) =>
    rendu(element, index, 0, 0, largeurCol, null).hauteur
  );

  const parts = [];
  let yLigne = y;
  let hauteurLigne = 0;

  elements.forEach((element, index) => {
    const colonne = index % colonnes;

    if (colonne === 0) {
      if (index > 0) yLigne += hauteurLigne + gouttiere;
      hauteurLigne = Math.max(
        ...mesures.slice(index, index + colonnes).filter((v) => v !== undefined)
      );
    }

    const xCol = x + colonne * (largeurCol + gouttiere);
    parts.push(rendu(element, index, xCol, yLigne, largeurCol, hauteurLigne).contenu);
  });

  return { contenu: parts.join('\n'), hauteur: yLigne + hauteurLigne - y };
}

// =====================================================================
// Assemblage d'une frame
// =====================================================================

function frame(largeur, hauteur, corps, titre) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${a(largeur)}" height="${a(hauteur)}" viewBox="0 0 ${a(largeur)} ${a(hauteur)}">\n` +
    `<title>${echapper(titre)}</title>\n` +
    rect(0, 0, largeur, hauteur, { fond: C.blanc }) +
    '\n' +
    corps +
    '\n</svg>\n'
  );
}

// =====================================================================
// Écran 1 : page d'accueil
// =====================================================================

function ecranAccueil(s) {
  const parts = [];
  const tete = enTete(s);
  parts.push(tete.contenu);
  let y = tete.hauteur;

  // ---- « Comment trouver mon artisan ? » ----------------------------
  const hautEtapes = y;
  let yInterne = y + s.padSection;

  parts.push(
    txtHaut('Comment trouver mon artisan ?', s.largeur / 2, yInterne, {
      taille: s.h2,
      grasse: true,
      couleur: C.bleuFonce,
      ancre: 'middle'
    })
  );
  yInterne += s.h2 * 1.3 + 28;

  const blocEtapes = grille(
    ETAPES,
    s.marge,
    contenuLargeur(s),
    yInterne,
    s.colEtapes,
    s.gouttiere,
    (texte, index, x, yc, largeur, hauteurImposee) =>
      carteEtape(index, texte, x, yc, largeur, hauteurImposee)
  );
  parts.push(blocEtapes.contenu);
  yInterne += blocEtapes.hauteur + s.padSection;

  parts.splice(1, 0, rect(0, hautEtapes, s.largeur, yInterne - hautEtapes, { fond: C.blanc }));
  y = yInterne;

  // ---- « Les artisans du mois » -------------------------------------
  const hautArtisans = y;
  yInterne = y + s.padSection;

  const titreArtisans = txtHaut('Les artisans du mois', s.largeur / 2, yInterne, {
    taille: s.h2,
    grasse: true,
    couleur: C.bleuFonce,
    ancre: 'middle'
  });
  yInterne += s.h2 * 1.3 + 28;

  const blocArtisans = grille(
    ARTISANS_DU_MOIS,
    s.marge,
    contenuLargeur(s),
    yInterne,
    s.colCartes,
    s.gouttiere,
    (artisan, index, x, yc, largeur, hauteurImposee) =>
      carteArtisan(artisan, x, yc, largeur, {
        avecBadge: true,
        cle: `mois-${index}`,
        hauteurImposee
      })
  );
  yInterne += blocArtisans.hauteur + s.padSection;

  parts.push(
    rect(0, hautArtisans, s.largeur, yInterne - hautArtisans, { fond: C.fondClair }),
    titreArtisans,
    blocArtisans.contenu
  );
  y = yInterne;

  const pied = piedDePage(s, y);
  parts.push(pied.contenu);

  return frame(s.largeur, y + pied.hauteur, parts.join('\n'), `Accueil, ${s.nom}`);
}

// =====================================================================
// Écran 2 : liste des artisans d'une catégorie
// =====================================================================

function ecranListe(s) {
  const parts = [];
  // La spécification exige que la catégorie consultée soit marquée dans
  // le menu. Sur les supports où celui-ci est replié, la frame le montre
  // donc déplié : c'est le seul état où le marquage est visible.
  const tete = enTete(s, { actif: 'Bâtiment', deplie: s.menuReplie });
  parts.push(tete.contenu);
  let y = tete.hauteur + s.padSection;

  parts.push(
    txtHaut('Bâtiment', s.marge, y, { taille: s.h1, grasse: true, couleur: C.bleuFonce })
  );
  y += s.h1 * 1.25 + 28;

  const bloc = grille(
    ARTISANS_BATIMENT,
    s.marge,
    contenuLargeur(s),
    y,
    s.colCartes,
    s.gouttiere,
    (artisan, index, x, yc, largeur, hauteurImposee) =>
      carteArtisan(artisan, x, yc, largeur, { cle: `bat-${index}`, hauteurImposee })
  );
  parts.push(bloc.contenu);
  y += bloc.hauteur + s.padSection;

  const pied = piedDePage(s, y);
  parts.push(pied.contenu);

  return frame(
    s.largeur,
    y + pied.hauteur,
    parts.join('\n'),
    `Liste des artisans, Bâtiment, ${s.nom}`
  );
}

// =====================================================================
// Écran 3 : fiche artisan
// =====================================================================

/** Visuel de l'artisan : le cahier des charges demande « une image ». */
function visuelArtisan(x, y, largeur, hauteur) {
  const parts = [rect(0, 0, largeur, hauteur, { fond: C.fondClair, rayon: RAYON })];

  for (let colonne = 1; colonne < 5; colonne++) {
    parts.push(rect((largeur / 5) * colonne, 0, 1, hauteur, { fond: C.bordure }));
  }
  for (let ligne = 1; ligne < 5; ligne++) {
    parts.push(rect(0, (hauteur / 5) * ligne, largeur, 1, { fond: C.bordure }));
  }

  const cx = largeur / 2;
  const cy = hauteur / 2;
  const rayon = Math.min(largeur, hauteur) * 0.29;

  parts.push(`<circle cx="${a(cx)}" cy="${a(cy)}" r="${a(rayon)}" fill="${C.rouge}"/>`);
  parts.push(
    `<ellipse cx="${a(cx)}" cy="${a(cy)}" rx="${a(rayon * 0.68)}" ry="${a(rayon * 0.38)}" fill="${C.blanc}"/>`
  );

  for (let barre = -1; barre <= 1; barre++) {
    const decalage = barre * rayon * 0.3;
    parts.push(
      `<rect x="${a(cx + decalage - rayon * 0.05)}" y="${a(cy - rayon * 0.2)}" ` +
        `width="${a(rayon * 0.1)}" height="${a(rayon * 0.4)}" rx="${a(rayon * 0.05)}" ` +
        `fill="${C.rouge}" transform="rotate(20 ${a(cx + decalage)} ${a(cy)})"/>`
    );
  }

  return {
    contenu: `<g transform="translate(${a(x)},${a(y)})">${parts.join('')}</g>`,
    hauteur
  };
}

function ecranFiche(s) {
  const parts = [];
  const tete = enTete(s);
  parts.push(tete.contenu);
  let y = tete.hauteur + s.padSection;

  const deuxColonnes = !s.menuReplie;
  const largeurVisuel = deuxColonnes ? (contenuLargeur(s) - 48) * 0.42 : contenuLargeur(s);
  const xInfos = deuxColonnes ? s.marge + largeurVisuel + 48 : s.marge;
  const largeurInfos = deuxColonnes ? contenuLargeur(s) - largeurVisuel - 48 : contenuLargeur(s);

  const hauteurVisuel = deuxColonnes ? largeurVisuel * 0.75 : Math.min(largeurVisuel * 0.62, 260);
  const visuel = visuelArtisan(s.marge, y, largeurVisuel, hauteurVisuel);
  parts.push(visuel.contenu);

  let yInfos = deuxColonnes ? y : y + hauteurVisuel + 28;

  const titre = paragraphe(FICHE.nom, xInfos, yInfos, largeurInfos, {
    taille: s.h1,
    grasse: true,
    couleur: C.bleuFonce,
    interligne: s.h1 * 1.2
  });
  parts.push(titre.contenu);
  yInfos += titre.hauteur + 14;

  parts.push(note(FICHE.note, xInfos, yInfos + 10, 'fiche', 18).contenu);
  yInfos += 22 + 16;

  const specialite = puce(FICHE.specialite, xInfos, yInfos);
  parts.push(specialite.contenu);
  parts.push(
    txtMilieu(FICHE.ville, xInfos + specialite.largeur + 16, yInfos + 14, {
      taille: 16,
      couleur: C.grisTexte
    })
  );
  yInfos += 28 + 28;

  parts.push(rect(xInfos, yInfos, largeurInfos, 1, { fond: C.bordure }));
  yInfos += 28;

  parts.push(
    txtHaut('À propos', xInfos, yInfos, { taille: s.h2, grasse: true, couleur: C.bleuFonce })
  );
  yInfos += s.h2 * 1.3 + 12;

  const aPropos = paragraphe(FICHE.aPropos, xInfos, yInfos, largeurInfos, {
    taille: 16,
    couleur: C.anthracite,
    interligne: 25
  });
  parts.push(aPropos.contenu);
  yInfos += aPropos.hauteur + 22;

  // Le lien n'apparaît que pour un artisan qui possède un site.
  parts.push(
    txtHaut(`Visiter le site web de ${FICHE.nom}`, xInfos, yInfos, {
      taille: 16,
      couleur: C.bleu,
      souligne: true
    })
  );
  yInfos += 22;

  y = Math.max(deuxColonnes ? y + hauteurVisuel : yInfos, yInfos) + s.padSection;

  // ---- Formulaire de contact ---------------------------------------
  const padForm = s.menuReplie ? 20 : 32;
  const largeurForm = contenuLargeur(s);
  const largeurChamp = Math.min(largeurForm - 2 * padForm, 790);
  const formParts = [];
  let yForm = padForm;

  formParts.push(
    txtHaut(`Contacter ${FICHE.nom}`, padForm, yForm, {
      taille: s.h2,
      grasse: true,
      couleur: C.anthracite
    })
  );
  yForm += s.h2 * 1.3 + 8;

  const mention = paragraphe(
    "Les champs marqués d'un astérisque sont obligatoires. Une réponse vous sera apportée sous 48 heures.",
    padForm,
    yForm,
    largeurChamp,
    { taille: 14, couleur: C.grisTexte, interligne: 20 }
  );
  formParts.push(mention.contenu);
  yForm += mention.hauteur + 24;

  for (const { libelle, haut } of CHAMPS_CONTACT) {
    formParts.push(
      txtHaut(libelle, padForm, yForm, { taille: 16, grasse: true, couleur: C.anthracite })
    );
    // L'astérisque double la mention écrite au-dessus du formulaire :
    // l'obligation n'est jamais portée par la seule couleur.
    formParts.push(
      txtHaut('*', padForm + largeurTexte(libelle, 16, true) + 6, yForm, {
        taille: 16,
        grasse: true,
        couleur: C.rouge
      })
    );
    yForm += 22 + 8;

    formParts.push(champ(padForm, yForm, largeurChamp, haut).contenu);
    yForm += haut + 20;
  }

  formParts.push(
    txtHaut('De 10 à 2000 caractères.', padForm, yForm - 12, {
      taille: 14,
      couleur: C.grisTexte
    })
  );
  yForm += 12;

  const envoi = bouton('Envoyer le message', padForm, yForm, { taille: 18, hauteur: 52 });
  formParts.push(envoi.contenu);
  yForm += 52 + padForm;

  parts.push(
    `<g transform="translate(${a(s.marge)},${a(y)})">` +
      rect(0, 0, largeurForm, yForm, { fond: C.fondClair, rayon: RAYON }) +
      formParts.join('') +
      `</g>`
  );
  y += yForm + s.padSection;

  const pied = piedDePage(s, y);
  parts.push(pied.contenu);

  return frame(
    s.largeur,
    y + pied.hauteur,
    parts.join('\n'),
    `Fiche artisan, ${FICHE.nom}, ${s.nom}`
  );
}

// =====================================================================
// Écran 4 : page 404
// =====================================================================

function illustration404(x, y, echelle) {
  const parts = [
    rect(0, 0, 240, 160, { fond: C.fondClair, rayon: RAYON }),
    `<path d="M120 34l52 90H68l52-90z" fill="${C.rouge}"/>`,
    `<path d="M120 52l38 66H82l38-66z" fill="${C.blanc}"/>`,
    rect(116, 70, 8, 26, { fond: C.rouge, rayon: 4 }),
    `<circle cx="120" cy="106" r="5" fill="${C.rouge}"/>`,
    rect(52, 128, 136, 9, { fond: C.anthracite, rayon: 4 })
  ];

  return {
    contenu: `<g transform="translate(${a(x)},${a(y)}) scale(${a(echelle)})">${parts.join('')}</g>`,
    largeur: 240 * echelle,
    hauteur: 160 * echelle
  };
}

function ecran404(s) {
  const parts = [];
  const tete = enTete(s);
  parts.push(tete.contenu);
  let y = tete.hauteur + s.padSection + 20;

  const milieu = s.largeur / 2;
  const echelle = s.menuReplie ? 0.95 : 1.25;
  const dessin = illustration404(milieu - (240 * echelle) / 2, y, echelle);
  parts.push(dessin.contenu);
  y += dessin.hauteur + 28;

  parts.push(
    txtHaut('404', milieu, y, {
      taille: s.menuReplie ? 44 : 56,
      grasse: true,
      couleur: C.bleu,
      ancre: 'middle'
    })
  );
  y += (s.menuReplie ? 44 : 56) * 1.1 + 12;

  parts.push(
    txtHaut('Page non trouvée', milieu, y, {
      taille: s.h1,
      grasse: true,
      couleur: C.bleuFonce,
      ancre: 'middle'
    })
  );
  y += s.h1 * 1.25 + 16;

  const explication = paragraphe(
    "La page que vous avez demandée n'existe pas, ou n'est plus disponible à cette adresse.",
    milieu,
    y,
    Math.min(contenuLargeur(s), 560),
    { taille: 16, couleur: C.anthracite, interligne: 25, ancre: 'middle' }
  );
  parts.push(explication.contenu);
  y += explication.hauteur + 28;

  const retour = bouton("Retour à l'accueil", 0, 0, { taille: 18, hauteur: 52, padding: 26 });
  parts.push(
    bouton("Retour à l'accueil", milieu - retour.largeur / 2, y, {
      taille: 18,
      hauteur: 52,
      padding: 26
    }).contenu
  );
  y += 52 + s.padSection + 20;

  const pied = piedDePage(s, y);
  parts.push(pied.contenu);

  return frame(s.largeur, y + pied.hauteur, parts.join('\n'), `Page 404, ${s.nom}`);
}

// =====================================================================
// Écran 5 : page légale
// =====================================================================

function ecranLegale(s) {
  const parts = [];
  const tete = enTete(s);
  parts.push(tete.contenu);
  let y = tete.hauteur + s.padSection + 12;

  parts.push(
    txtHaut('Mentions légales', s.marge, y, {
      taille: s.h1,
      grasse: true,
      couleur: C.bleuFonce
    })
  );
  y += s.h1 * 1.25 + 20;

  const attente = paragraphe(
    'Page en construction. Son contenu est en cours de rédaction et sera publié prochainement.',
    s.marge,
    y,
    Math.min(contenuLargeur(s), 720),
    { taille: 16, couleur: C.anthracite, interligne: 25 }
  );
  parts.push(attente.contenu);
  y += attente.hauteur + s.padSection + 40;

  const pied = piedDePage(s, y);
  parts.push(pied.contenu);

  return frame(s.largeur, y + pied.hauteur, parts.join('\n'), `Page légale, ${s.nom}`);
}

// =====================================================================
// Planche des styles
// =====================================================================

const NUANCIER = [
  ['fond/clair', C.fondClair, 'Fonds de section'],
  ['bleu/principal', C.bleu, 'Boutons, liens, éléments actifs'],
  ['bleu/fonce', C.bleuFonce, 'Titres, survols'],
  ['texte/anthracite', C.anthracite, 'Texte courant, pied de page'],
  ['alerte/rouge', C.rouge, 'Erreurs, champs obligatoires'],
  ['validation/vert', C.vert, 'Badge artisan du mois'],
  ['neutre/blanc', C.blanc, 'Fond des cartes'],
  ['neutre/bordure', C.bordure, 'Bordures, séparateurs']
];

const ECHELLE_TYPO = [
  ['Titre H1', 28, 36, true],
  ['Titre H2', 22, 28, true],
  ['Titre H3', 18, 18, true],
  ['Corps', 16, 16, false],
  ['Petit texte', 14, 14, false]
];

function plancheStyles() {
  const largeur = 1200;
  const parts = [];
  let y = 56;

  parts.push(
    txtHaut('Trouve ton artisan · Styles', 56, y, {
      taille: 32,
      grasse: true,
      couleur: C.bleuFonce
    })
  );
  y += 48;

  const marque = logo(56, y, 56);
  parts.push(marque.contenu);
  parts.push(
    txtMilieu(
      'Logo et favicon fournis par le cahier des charges · police Arial, substitut prévu par la charte pour Graphik',
      56 + marque.largeur + 32,
      y + 28,
      { taille: 15, couleur: C.grisTexte }
    )
  );
  y += 56 + 48;

  // ---- Nuancier -----------------------------------------------------
  parts.push(
    txtHaut('Couleurs', 56, y, { taille: 22, grasse: true, couleur: C.anthracite })
  );
  y += 44;

  NUANCIER.forEach(([nom, valeur, usage], index) => {
    const colonne = index % 4;
    const ligne = Math.floor(index / 4);
    const x = 56 + colonne * 272;
    const haut = y + ligne * 150;

    parts.push(
      rect(x, haut, 248, 72, { fond: valeur, trait: C.bordure, rayon: RAYON }),
      txtHaut(nom, x, haut + 84, { taille: 15, grasse: true, couleur: C.anthracite }),
      txtHaut(valeur.toUpperCase(), x, haut + 106, { taille: 14, couleur: C.bleu }),
      paragraphe(usage, x, haut + 126, 248, { taille: 13, couleur: C.grisTexte, interligne: 17 })
        .contenu
    );
  });
  y += 2 * 150 + 24;

  // ---- Typographie --------------------------------------------------
  parts.push(
    txtHaut('Typographie', 56, y, { taille: 22, grasse: true, couleur: C.anthracite })
  );
  y += 44;

  parts.push(
    txtHaut('Style', 56, y, { taille: 13, grasse: true, couleur: C.grisTexte }),
    txtHaut('Téléphone', 240, y, { taille: 13, grasse: true, couleur: C.grisTexte }),
    txtHaut('Ordinateur', 360, y, { taille: 13, grasse: true, couleur: C.grisTexte }),
    txtHaut('Aperçu', 500, y, { taille: 13, grasse: true, couleur: C.grisTexte })
  );
  y += 28;
  parts.push(rect(56, y, largeur - 112, 1, { fond: C.bordure }));
  y += 20;

  for (const [nom, tailleMobile, tailleBureau, grasse] of ECHELLE_TYPO) {
    const hauteurLigne = tailleBureau * 1.5 + 16;
    parts.push(
      txtMilieu(nom, 56, y + hauteurLigne / 2, { taille: 15, couleur: C.anthracite }),
      txtMilieu(`${tailleMobile} px`, 240, y + hauteurLigne / 2, {
        taille: 15,
        couleur: C.grisTexte
      }),
      txtMilieu(`${tailleBureau} px`, 360, y + hauteurLigne / 2, {
        taille: 15,
        couleur: C.grisTexte
      }),
      txtMilieu('Trouve ton artisan', 500, y + hauteurLigne / 2, {
        taille: tailleBureau,
        grasse,
        couleur: grasse ? C.bleuFonce : C.anthracite
      })
    );
    y += hauteurLigne;
  }

  y += 40;

  return frame(largeur, y, parts.join('\n'), 'Trouve ton artisan, styles');
}

// =====================================================================
// Planche des composants
// =====================================================================

function plancheComposants() {
  const largeur = 1700;
  const parts = [];
  let y = 56;

  const sousTitre = (libelle, x, haut) =>
    txtHaut(libelle, x, haut, { taille: 15, grasse: true, couleur: C.grisTexte });

  parts.push(
    txtHaut('Trouve ton artisan · Composants', 56, y, {
      taille: 32,
      grasse: true,
      couleur: C.bleuFonce
    })
  );
  y += 40;

  parts.push(
    paragraphe(
      "L'en-tête, le pied de page et la carte d'artisan sont des composants : le cahier des charges les veut identiques sur toutes les pages, un composant garantit cette identité.",
      56,
      y,
      largeur - 112,
      { taille: 15, couleur: C.grisTexte, interligne: 22 }
    ).contenu
  );
  y += 48;

  const bureau = SUPPORTS.find((s) => s.cle === 'bureau');
  const mobile = SUPPORTS.find((s) => s.cle === 'mobile');

  // ---- En-tête ordinateur -------------------------------------------
  parts.push(sousTitre('En-tête · ordinateur, 1440 px', 56, y));
  y += 28;

  const teteBureau = enTete(bureau, { actif: 'Bâtiment' });
  parts.push(
    `<g transform="translate(56,${a(y)})">` +
      rect(-1, -1, bureau.largeur + 2, teteBureau.hauteur + 2, { trait: C.bordure }) +
      teteBureau.contenu +
      `</g>`
  );
  y += teteBureau.hauteur + 48;

  // ---- En-tête téléphone, les deux états ----------------------------
  parts.push(sousTitre('En-tête · téléphone, menu fermé puis déplié', 56, y));
  y += 28;

  const teteFermee = enTete(mobile);
  const teteDepliee = enTete(mobile, { deplie: true, actif: 'Bâtiment' });

  parts.push(
    `<g transform="translate(56,${a(y)})">` +
      rect(-1, -1, mobile.largeur + 2, teteFermee.hauteur + 2, { trait: C.bordure }) +
      teteFermee.contenu +
      `</g>`,
    `<g transform="translate(${56 + mobile.largeur + 48},${a(y)})">` +
      rect(-1, -1, mobile.largeur + 2, teteDepliee.hauteur + 2, { trait: C.bordure }) +
      teteDepliee.contenu +
      `</g>`
  );

  // ---- Carte artisan, à côté ----------------------------------------
  const xCartes = 56 + 2 * mobile.largeur + 2 * 48;
  parts.push(sousTitre("Carte d'artisan · avec et sans badge", xCartes, y - 28));

  const carteBadge = carteArtisan(ARTISANS_DU_MOIS[1], xCartes, y, 300, {
    avecBadge: true,
    cle: 'comp-a'
  });
  parts.push(carteBadge.contenu);

  const carteSimple = carteArtisan(ARTISANS_BATIMENT[3], xCartes + 332, y, 300, {
    cle: 'comp-b'
  });
  parts.push(carteSimple.contenu);

  y += Math.max(teteDepliee.hauteur, carteBadge.hauteur) + 48;

  // ---- Étoiles, boutons, champs -------------------------------------
  parts.push(sousTitre('Note en étoiles · la valeur est toujours écrite à côté', 56, y));
  let yBloc = y + 30;

  [5.0, 4.5, 4.0].forEach((valeur, index) => {
    parts.push(note(valeur, 56, yBloc + 12, `comp-note-${index}`, 18).contenu);
    yBloc += 40;
  });

  parts.push(sousTitre('Boutons', 480, y));
  parts.push(bouton('Rechercher', 480, y + 30, { hauteur: 44, padding: 20 }).contenu);
  parts.push(bouton('Envoyer le message', 480, y + 90, { taille: 18, hauteur: 52 }).contenu);

  parts.push(sousTitre('Champ de formulaire', 800, y));
  parts.push(
    txtHaut('Votre nom', 800, y + 30, { taille: 16, grasse: true, couleur: C.anthracite }),
    txtHaut('*', 800 + largeurTexte('Votre nom', 16, true) + 6, y + 30, {
      taille: 16,
      grasse: true,
      couleur: C.rouge
    }),
    champ(800, y + 60, 360, 44).contenu,
    txtHaut('Étiquette, astérisque rouge et mention écrite : jamais la seule couleur.', 800, y + 116, {
      taille: 13,
      couleur: C.grisTexte
    })
  );

  parts.push(sousTitre('Étiquette de spécialité et badge', 1220, y));
  parts.push(puce('Chocolatier', 1220, y + 30).contenu);
  parts.push(badge(1220, y + 74).contenu);

  y = Math.max(yBloc, y + 150) + 48;

  // ---- Pied de page --------------------------------------------------
  parts.push(sousTitre('Pied de page · ordinateur', 56, y));
  y += 28;

  const pied = piedDePage(bureau, 0);
  parts.push(`<g transform="translate(56,${a(y)})">${pied.contenu}</g>`);
  y += pied.hauteur + 56;

  return frame(largeur, y, parts.join('\n'), 'Trouve ton artisan, composants');
}

// =====================================================================
// Production des fichiers
// =====================================================================

const ECRANS = [
  { cle: 'accueil', construire: ecranAccueil },
  { cle: 'liste', construire: ecranListe },
  { cle: 'fiche-artisan', construire: ecranFiche },
  { cle: 'erreur-404', construire: ecran404 },
  { cle: 'page-legale', construire: ecranLegale }
];

function main() {
  fs.mkdirSync(SORTIE, { recursive: true });

  const produits = [];

  for (const ecran of ECRANS) {
    for (const support of SUPPORTS) {
      const nom = `${ecran.cle}-${support.cle}.svg`;
      fs.writeFileSync(path.join(SORTIE, nom), ecran.construire(support), 'utf8');
      produits.push(nom);
    }
  }

  fs.writeFileSync(path.join(SORTIE, 'planche-styles.svg'), plancheStyles(), 'utf8');
  produits.push('planche-styles.svg');

  fs.writeFileSync(path.join(SORTIE, 'planche-composants.svg'), plancheComposants(), 'utf8');
  produits.push('planche-composants.svg');

  console.log(`${produits.length} fichiers écrits dans ${SORTIE}`);
  for (const nom of produits) {
    const octets = fs.statSync(path.join(SORTIE, nom)).size;
    console.log(`  ${nom.padEnd(30)} ${String(Math.round(octets / 1024)).padStart(4)} Ko`);
  }
}

main();
