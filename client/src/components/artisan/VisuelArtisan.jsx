import batiment from '../../assets/illustrations/batiment.svg';
import services from '../../assets/illustrations/services.svg';
import fabrication from '../../assets/illustrations/fabrication.svg';
import alimentation from '../../assets/illustrations/alimentation.svg';

const ILLUSTRATIONS = { batiment, services, fabrication, alimentation };

/**
 * Visuel de la fiche artisan.
 *
 * Le jeu d'essai fourni ne contient aucune photo : tant que la colonne
 * `image` est vide, on affiche l'illustration de la catégorie plutôt
 * qu'un cadre vide.
 */
export function VisuelArtisan({ artisan }) {
  const illustration = ILLUSTRATIONS[artisan.categorie?.slug] ?? services;

  return (
    <img
      src={artisan.image ?? illustration}
      alt={
        artisan.image
          ? `Visuel de ${artisan.nom}`
          : `Illustration de la catégorie ${artisan.categorie?.nom ?? 'artisanat'}`
      }
      className="fiche-artisan__visuel"
    />
  );
}
