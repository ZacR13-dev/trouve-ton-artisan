import { useEffect, useState } from 'react';

/**
 * Factorise les trois états que chaque page doit gérer : chargement en
 * cours, erreur, données disponibles. La requête est annulée si
 * l'utilisateur quitte la page avant la réponse.
 *
 * @param requete Fonction d'appel à l'API, qui doit transmettre le
 *   signal d'annulation reçu.
 * @param dependances Valeurs qui, en changeant, relancent la requête.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependances);

  return etat;
}
