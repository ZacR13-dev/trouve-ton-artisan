/**
 * Liste des artisans, selon la catégorie choisie dans le menu ou selon
 * la recherche saisie dans l'en-tête.
 *
 * Une seule page sert les deux cas : l'affichage est identique, seuls le
 * titre et le filtre transmis à l'API changent.
 */

import { useParams, useSearchParams } from 'react-router-dom';
import { recupererArtisans } from '../services/api.js';
import { useRequeteApi } from '../hooks/useRequeteApi.js';
import { useCategories } from '../contexts/CategoriesContext.jsx';
import { GrilleArtisans } from '../components/artisan/GrilleArtisans.jsx';
import { Chargement } from '../components/ui/Chargement.jsx';
import { MessageErreur } from '../components/ui/MessageErreur.jsx';
import { MetaPage } from '../components/ui/MetaPage.jsx';
import { NonTrouvee } from './NonTrouvee.jsx';

export function ListeArtisans() {
  const { slug } = useParams();
  const [parametresUrl] = useSearchParams();
  const { categories } = useCategories();

  const recherche = parametresUrl.get('q') ?? '';
  const enModeRecherche = !slug;

  const {
    donnees: artisans,
    chargement,
    erreur
  } = useRequeteApi(
    (signal) => recupererArtisans(enModeRecherche ? { recherche } : { categorie: slug }, signal),
    [slug, recherche]
  );

  // Le nom exact de la catégorie vient de la base : on le retrouve à
  // partir du slug de l'URL, sans jamais le reconstruire à la main.
  const categorie = categories.find((element) => element.slug === slug);

  // Une catégorie inexistante est une URL qui n'existe pas : le cahier
  // des charges demande que la page 404 s'affiche dans ce cas.
  if (erreur?.statut === 404) {
    return <NonTrouvee />;
  }

  const titre = enModeRecherche
    ? `Résultats de recherche pour « ${recherche} »`
    : (categorie?.nom ?? 'Artisans');

  const description = enModeRecherche
    ? `Artisans d'Auvergne-Rhône-Alpes correspondant à la recherche « ${recherche} ».`
    : `Trouvez un artisan de la catégorie ${categorie?.nom ?? ''} en Auvergne-Rhône-Alpes : note, spécialité, localisation et formulaire de contact.`;

  /**
   * Accord du compteur de résultats.
   * @param {number} total
   * @returns {string}
   */
  const libelleCompteur = (total) => {
    if (total === 0) return 'Aucun artisan trouvé';
    if (total === 1) return '1 artisan trouvé';
    return `${total} artisans trouvés`;
  };

  return (
    <>
      <MetaPage titre={titre} description={description} />

      <div className="container section-espacee">
        <div className="entete-liste">
          <h1>{titre}</h1>
          {artisans && <p className="entete-liste__compteur">{libelleCompteur(artisans.length)}</p>}
        </div>

        {chargement && <Chargement message="Chargement des artisans..." />}
        {erreur && <MessageErreur erreur={erreur} />}

        {/* Les cartes suivent directement le h1 de la page : leur titre
            doit donc être un h2 pour ne pas sauter de niveau. */}
        {artisans && artisans.length > 0 && (
          <GrilleArtisans artisans={artisans} niveauTitre={2} />
        )}

        {artisans && artisans.length === 0 && (
          <div className="aucun-resultat">
            <h2 className="h5">Aucun artisan ne correspond à votre demande</h2>
            <p className="mb-0">
              {enModeRecherche
                ? 'Vérifiez l’orthographe du nom recherché, ou parcourez les catégories depuis le menu.'
                : 'Aucun artisan n’est référencé dans cette catégorie pour le moment.'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
