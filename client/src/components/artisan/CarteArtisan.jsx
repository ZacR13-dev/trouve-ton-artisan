import { Link } from 'react-router-dom';
import { NoteEtoiles } from './NoteEtoiles.jsx';

/**
 * Carte d'un artisan : nom, note sur cinq, spécialité et localisation.
 *
 * C'est un lien qui englobe la carte, et non un gestionnaire de clic sur
 * un bloc : la navigation au clavier et l'ouverture dans un nouvel
 * onglet fonctionnent normalement.
 *
 * @param niveauTitre La hiérarchie des titres ne doit pas sauter de
 *   niveau : sur l'accueil les cartes suivent un h2 de section et sont
 *   donc en h3, sur une page de liste elles suivent le h1 et passent
 *   en h2.
 */
export function CarteArtisan({ artisan, afficherBadge = false, niveauTitre = 3 }) {
  const TitreArtisan = `h${niveauTitre}`;

  return (
    <article className="carte-artisan">
      <Link
        to={`/artisan/${artisan.id}`}
        className="carte-artisan__lien"
        // Sans ce libellé, un lecteur d'écran annoncerait une liste de
        // liens indiscernables.
        aria-label={`Voir la fiche de ${artisan.nom}, ${artisan.specialite?.nom ?? 'artisan'} à ${artisan.ville}`}
      >
        {afficherBadge && artisan.artisanDuMois && (
          <span className="artisan-du-mois__badge">Artisan du mois</span>
        )}

        <TitreArtisan className="carte-artisan__nom">{artisan.nom}</TitreArtisan>

        <NoteEtoiles note={artisan.note} />

        {artisan.specialite && (
          <span className="carte-artisan__specialite">{artisan.specialite.nom}</span>
        )}

        <p className="carte-artisan__ville">
          <span className="lecteur-ecran-uniquement">Localisation : </span>
          {artisan.ville}
        </p>
      </Link>
    </article>
  );
}
