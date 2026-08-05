/**
 * Contexte des catégories.
 *
 * Le cahier des charges impose que les libellés du menu proviennent de
 * la base de données. Ils sont donc chargés une seule fois au démarrage
 * de l'application et partagés par tous les composants qui en ont besoin
 * (menu, fil d'ariane, pages de liste), plutôt que rechargés à chaque
 * changement de page.
 */

import { createContext, useContext } from 'react';
import { recupererCategories } from '../services/api.js';
import { useRequeteApi } from '../hooks/useRequeteApi.js';

const CategoriesContext = createContext({ categories: [], chargement: true, erreur: null });

/**
 * Fournisseur à placer au-dessus du routeur.
 * @param {{children: React.ReactNode}} props
 */
export function FournisseurCategories({ children }) {
  const { donnees, chargement, erreur } = useRequeteApi((signal) => recupererCategories(signal), []);

  const valeur = {
    categories: donnees ?? [],
    chargement,
    erreur
  };

  return <CategoriesContext.Provider value={valeur}>{children}</CategoriesContext.Provider>;
}

/**
 * Accès aux catégories depuis n'importe quel composant.
 * @returns {{categories: Array<object>, chargement: boolean, erreur: Error|null}}
 */
export function useCategories() {
  return useContext(CategoriesContext);
}
