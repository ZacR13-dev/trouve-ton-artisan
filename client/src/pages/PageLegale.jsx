import { MetaPage } from '../components/ui/MetaPage.jsx';

/**
 * Gabarit des pages légales. Le cahier des charges les veut « vides »,
 * avec l'en-tête, le pied de page et un texte d'attente : leur contenu
 * sera rédigé plus tard par un cabinet spécialisé.
 */
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
