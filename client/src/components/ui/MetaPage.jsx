/**
 * Métadonnées de référencement d'une page.
 *
 * React 19 sait remonter des balises <title> et <meta> rendues dans un
 * composant vers l'en-tête du document, mais il les *ajoute* sans
 * supprimer celles déjà présentes dans index.html. Le document se
 * retrouvait alors avec deux <title> et deux descriptions, ce que le
 * validateur du W3C signale comme deux erreurs.
 *
 * Les métadonnées sont donc mises à jour directement dans l'en-tête :
 * une seule balise de chaque type existe à tout moment, et index.html
 * conserve ses valeurs par défaut pour le tout premier affichage.
 */

import { useEffect } from 'react';

/**
 * Crée la balise <meta> si elle n'existe pas, puis met à jour son
 * contenu.
 *
 * @param {string} attribut Attribut identifiant la balise (« name » pour
 *   les métadonnées classiques, « property » pour Open Graph).
 * @param {string} valeur Valeur de cet attribut, par exemple « description ».
 * @param {string} contenu Contenu à publier.
 */
function definirMeta(attribut, valeur, contenu) {
  let balise = document.head.querySelector(`meta[${attribut}="${valeur}"]`);

  if (!balise) {
    balise = document.createElement('meta');
    balise.setAttribute(attribut, valeur);
    document.head.appendChild(balise);
  }

  balise.setAttribute('content', contenu);
}

/**
 * @param {object} props
 * @param {string} props.titre Titre de la page, sans le nom du site.
 * @param {string} props.description Résumé affiché dans les résultats de
 *   recherche, à garder sous 160 caractères.
 */
export function MetaPage({ titre, description }) {
  const titreComplet = `${titre} | Trouve ton artisan`;

  useEffect(() => {
    document.title = titreComplet;
    definirMeta('name', 'description', description);
    // Titre et description repris par les réseaux sociaux et les
    // messageries lors du partage d'un lien.
    definirMeta('property', 'og:title', titreComplet);
    definirMeta('property', 'og:description', description);
  }, [titreComplet, description]);

  // Ce composant ne produit aucun affichage : il n'agit que sur
  // l'en-tête du document.
  return null;
}
