/**
 * Gabarit des pages légales.
 *
 * Le cahier des charges précise que ces pages doivent rester « vides »,
 * avec l'en-tête, le pied de page et un texte d'attente : leur contenu
 * sera rédigé plus tard par un cabinet spécialisé.
 *
 * @param {object} props
 * @param {string} props.titre Titre de la page légale.
 * @param {string} props.description Description pour les moteurs de recherche.
 */

import { MetaPage } from '../components/ui/MetaPage.jsx';

export function PageLegale({ titre, description }) {
  return (
    <>
      <MetaPage titre={titre} description={description} />

      <div className="container page-legale">
        <h1>{titre}</h1>
        <p>
          Page en construction. Son contenu est en cours de rédaction et sera publié
          prochainement.
        </p>
      </div>
    </>
  );
}
