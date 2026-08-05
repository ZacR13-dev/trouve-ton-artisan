import { createContext, useContext } from 'react';
import { recupererCategories } from '../services/api.js';
import { useRequeteApi } from '../hooks/useRequeteApi.js';

/**
 * Les libellés du menu viennent de la base. Ils sont chargés une seule
 * fois au démarrage et partagés par tous les composants qui en ont
 * besoin (menu, fil d'ariane, pages de liste), plutôt que rechargés à
 * chaque changement de page.
 */
const CategoriesContext = createContext({ categories: [], chargement: true, erreur: null });

export function FournisseurCategories({ children }) {
  const { donnees, chargement, erreur } = useRequeteApi((signal) => recupererCategories(signal), []);

  const valeur = {
    categories: donnees ?? [],
    chargement,
    erreur
  };

  return <CategoriesContext.Provider value={valeur}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  return useContext(CategoriesContext);
}
