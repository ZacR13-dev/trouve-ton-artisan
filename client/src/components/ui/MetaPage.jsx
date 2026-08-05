import { useEffect } from 'react';

/**
 * Titre et description de la page, à destination des moteurs de
 * recherche.
 *
 * React 19 sait remonter des balises <title> et <meta> vers l'en-tête du
 * document, mais il les ajoute sans supprimer celles d'index.html : le
 * document se retrouvait avec deux titres et deux descriptions, ce que
 * le validateur du W3C refuse. On met donc l'en-tête à jour
 * directement.
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

export function MetaPage({ titre, description }) {
  const titreComplet = `${titre} | Trouve ton artisan`;

  useEffect(() => {
    document.title = titreComplet;
    definirMeta('name', 'description', description);
    definirMeta('property', 'og:title', titreComplet);
    definirMeta('property', 'og:description', description);
  }, [titreComplet, description]);

  return null;
}
