import { CarteArtisan } from './CarteArtisan.jsx';

/**
 * Grille de cartes : une colonne sur téléphone, deux sur tablette, trois
 * sur ordinateur. Balisée en liste pour que les lecteurs d'écran
 * annoncent le nombre d'éléments.
 */
export function GrilleArtisans({ artisans, afficherBadge = false, niveauTitre = 3 }) {
  return (
    <ul className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 list-unstyled">
      {artisans.map((artisan) => (
        <li key={artisan.id} className="col">
          <CarteArtisan artisan={artisan} afficherBadge={afficherBadge} niveauTitre={niveauTitre} />
        </li>
      ))}
    </ul>
  );
}
