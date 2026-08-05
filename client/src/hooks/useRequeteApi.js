/**
 * Hook de chargement asynchrone de données.
 *
 * Il factorise les trois états que toute page de ce site doit gérer :
 * chargement en cours, erreur, données disponibles. Il annule aussi la
 * requête si l'utilisateur quitte la page avant la réponse, ce qui évite
 * un avertissement React et une mise à jour d'état inutile.
 */

import { useEffect, useState } from 'react';

/**
 * @param {(signal: AbortSignal) => Promise<any>} requete Fonction d'appel
 *   à l'API, qui doit transmettre le signal d'annulation reçu.
 * @param {Array<any>} dependances Valeurs qui, en changeant, relancent
 *   la requête (identifiant d'artisan, terme de recherche...).
 * @returns {{donnees: any, chargement: boolean, erreur: Error|null}}
 */
export function useRequeteApi(requete, dependances = []) {
  const [etat, setEtat] = useState({ donnees: null, chargement: true, erreur: null });

  useEffect(() => {
    const controleur = new AbortController();

    setEtat({ donnees: null, chargement: true, erreur: null });

    requete(controleur.signal)
      .then((donnees) => {
        setEtat({ donnees, chargement: false, erreur: null });
      })
      .catch((erreur) => {
        // Requête annulée par le nettoyage : le composant n'est plus
        // affiché, il n'y a rien à signaler.
        if (erreur.name === 'AbortError') {
          return;
        }
        setEtat({ donnees: null, chargement: false, erreur });
      });

    return () => controleur.abort();
    // La liste des dépendances est fournie par l'appelant : elle décrit
    // ce qui doit déclencher un nouveau chargement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependances);

  return etat;
}
